import os
import re
import requests
import geopy.distance
from aiogram import Bot, Dispatcher, F
from aiogram.filters import Command
from aiogram.types import Message, ReplyKeyboardMarkup, KeyboardButton

API_TOKEN = os.getenv("BOT_TOKEN")
# যদি Google Maps API ব্যবহার করতে চাও তবে এখানে API Key বসাবে (ঐচ্ছিক)
GOOGLE_MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY", "")

bot = Bot(token=API_TOKEN)
dp = Dispatcher()

# লোকেশন শেয়ার করার বাটন
location_keyboard = ReplyKeyboardMarkup(
    keyboard=[[KeyboardButton(text="📍 শেয়ার করো বর্তমান লোকেশন", request_location=True)]],
    resize_keyboard=True
)

user_locations = {}

@dp.message(Command("start"))
async def start_cmd(message: Message):
    await message.answer(
        f"হ্যালো {message.from_user.first_name}!\n"
        "প্রথমে নিচের বাটনে চাপ দিয়ে তোমার বর্তমান লোকেশন পাঠাও। "
        "এরপর গুগল ম্যাপের লিংক পাঠালে দূরত্ব হিসাব করে দেব।",
        reply_markup=location_keyboard
    )

# ১. ব্যবহারকারীর বর্তমান লোকেশন রিসিভ করা
@dp.message(F.location)
async def handle_location(message: Message):
    user_id = message.from_user.id
    lat = message.location.latitude
    lon = message.location.longitude
    
    # ইউজার লোকেশন সেভ করে রাখা
    user_locations[user_id] = (lat, lon)
    
    await message.answer("✅ তোমার বর্তমান লোকেশন পেয়েছি! এবার আমাকে গুগল ম্যাপের কোনো পিন পয়েন্টের লিংক পাঠাও।")

# ২. গুগল ম্যাপের পিন পয়েন্ট বা লিংক রিসিভ করা ও দূরত্ব বের করা
@dp.message(F.text)
async def handle_map_link(message: Message):
    user_id = message.from_user.id
    
    if user_id not in user_locations:
        await message.answer("⚠️ আগে তোমার বর্তমান লোকেশন শেয়ার করো!", reply_markup=location_keyboard)
        return

    text = message.text
    dest_lat, dest_lon = None, None

    # গুগল ম্যাপের লিংক থেকে Latitude & Longitude খুঁজে বের করা
    try:
        # যদি সর্ট লিংক হয় (e.g., https://maps.app.goo.gl/...)
        if "maps.app.goo.gl" in text or "goo.gl" in text:
            response = requests.get(text, allow_redirects=True)
            text = response.url

        # URL থেকে কোঅর্ডিনেট বের করা (e.g. @22.3569,91.7832)
        match = re.search(r'@(-?\d+\.\d+),(-?\d+\.\d+)', text)
        if not match:
            # অন্য ফরম্যাটের লিংক সার্চ করা (e.g. q=22.3569,91.7832)
            match = re.search(r'q=(-?\d+\.\d+),(-?\d+\.\d+)', text)
            
        if match:
            dest_lat = float(match.group(1))
            dest_lon = float(match.group(2))
    except Exception as e:
        print("URL resolve error:", e)

    if dest_lat is None or dest_lon is None:
        await message.answer("❌ গুগল ম্যাপের সঠিক লিংক খুঁজে পাওয়া যায়নি। দয়া করে সম্পূর্ণ ম্যাপ বা পিন পয়েন্ট লিংক পাঠাও।")
        return

    # ২ পয়েন্টের স্থানাংক
    origin = user_locations[user_id]
    destination = (dest_lat, dest_lon)

    # গুগল API থাকলে রাস্তার দূরত্বের হিসাব
    if GOOGLE_MAPS_API_KEY:
        url = f"https://maps.googleapis.com/maps/api/distancematrix/json?origins={origin[0]},{origin[1]}&destinations={dest_lat},{dest_lon}&key={GOOGLE_MAPS_API_KEY}"
        res = requests.get(url).json()
        try:
            distance_text = res["rows"][0]["elements"][0]["distance"]["text"]
            duration_text = res["rows"][0]["elements"][0]["duration"]["text"]
            await message.answer(f"🚗 **রাস্তার দূরত্ব:** {distance_text}\n⏱️ **আনুমানিক সময়:** {duration_text}")
            return
        except Exception:
            pass

    # বিকল্প: Geopy ব্যবহার করে সোজা লাইনের দূরত্ব হিসাব (বিনামূল্যে)
    distance_km = geopy.distance.geodesic(origin, destination).km
    await message.answer(f"📏 **সোজা লাইনের দূরত্ব (Straight Distance):** {distance_km:.2f} কি.মি.")

async def main():
    print("বট চালু হচ্ছে...")
    await dp.start_polling(bot)

if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
