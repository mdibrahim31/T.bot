import os
import re
import asyncio
import requests
import geopy.distance
from aiogram import Bot, Dispatcher, F
from aiogram.filters import Command
from aiogram.types import Message, ReplyKeyboardMarkup, KeyboardButton

# ১. পরিবেশ চলক (Environment Variable) থেকে টোকেন নেওয়া
API_TOKEN = os.getenv("BOT_TOKEN")

bot = Bot(token=API_TOKEN)
dp = Dispatcher()

# লোকেশন শেয়ার করার বাটন
location_keyboard = ReplyKeyboardMarkup(
    keyboard=[[KeyboardButton(text="📍 শেয়ার করো বর্তমান লোকেশন", request_location=True)]],
    resize_keyboard=True
)

# ইউজারদের লোকেশন জমা রাখার ডিকশনারি
user_locations = {}

@dp.message(Command("start"))
async def start_cmd(message: Message):
    await message.answer(
        f"হ্যালো {message.from_user.first_name}!\n"
        "প্রথমে নিচের বাটনে চাপ দিয়ে তোমার বর্তমান লোকেশন পাঠাও। "
        "এরপর গুগল ম্যাপের লিংক পাঠালে দূরত্ব হিসাব করে দেব।",
        reply_markup=location_keyboard
    )

# ২. ব্যবহারকারীর বর্তমান লোকেশন রিসিভ করা
@dp.message(F.location)
async def handle_location(message: Message):
    user_id = message.from_user.id
    lat = message.location.latitude
    lon = message.location.longitude
    
    # ইউজার লোকেশন সেভ করা
    user_locations[user_id] = (lat, lon)
    
    await message.answer("✅ তোমার বর্তমান লোকেশন পেয়েছি! এবার আমাকে গুগল ম্যাপের কোনো পিন পয়েন্টের লিংক পাঠাও।")

# ৩. গুগল ম্যাপের পিন পয়েন্ট বা লিংক রিসিভ করা ও দূরত্ব বের করা
@dp.message(F.text)
async def handle_map_link(message: Message):
    user_id = message.from_user.id
    
    if user_id not in user_locations:
        await message.answer("⚠️ আগে তোমার বর্তমান লোকেশন শেয়ার করো!", reply_markup=location_keyboard)
        return

    text = message.text
    dest_lat, dest_lon = None, None

    try:
        # গুগল ম্যাপের শর্ট লিংক হলে মূল লিংক বের করা
        if "maps.app.goo.gl" in text or "goo.gl" in text or "google.com/maps" in text:
            urls = re.findall(r'(https?://[^\s]+)', text)
            if urls:
                target_url = urls[0]
                session = requests.Session()
                headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
                response = session.get(target_url, headers=headers, allow_redirects=True)
                text = response.url

        # ১. প্যাটার্ন: @22.3569,91.7832
        match = re.search(r'@(-?\d+\.\d+),(-?\d+\.\d+)', text)
        
        # ২. প্যাটার্ন: q=22.3569,91.7832
        if not match:
            match = re.search(r'[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)', text)
            
        # ৩. প্যাটার্ন: ll=22.3569,91.7832
        if not match:
            match = re.search(r'[?&]ll=(-?\d+\.\d+),(-?\d+\.\d+)', text)

        # ৪. প্যাটার্ন: !3d22.3569!4d91.7832 (Google Maps Desktop/App format)
        if not match:
            match_3d_4d = re.search(r'!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)', text)
            if match_3d_4d:
                dest_lat = float(match_3d_4d.group(1))
                dest_lon = float(match_3d_4d.group(2))

        if match and dest_lat is None:
            dest_lat = float(match.group(1))
            dest_lon = float(match.group(2))

    except Exception as e:
        print("URL Extract Error:", e)

    if dest_lat is None or dest_lon is None:
        await message.answer("❌ গুগল ম্যাপের পিন পয়েন্ট থেকে লোকেশন বের করা যায়নি। ম্যাপ থেকে পিন ড্রপ করে বা অন্য গুগল ম্যাপ লিংক শেয়ার করো।")
        return

    # দুই পয়েন্টের স্থানাংক
    origin = user_locations[user_id]
    destination = (dest_lat, dest_lon)

    # geopy দিয়ে দূরত্ব হিসাব
    distance_km = geopy.distance.geodesic(origin, destination).km
    
    await message.answer(
        f"📍 **গন্তব্য পাওয়া গেছে!**\n"
        f"📏 **সরাসরি দূরত্ব (Straight Distance):** {distance_km:.2f} কি.মি."
    )

async def main():
    print("বট চালু হচ্ছে...")
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())
