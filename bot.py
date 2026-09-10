import os
import asyncio
from aiogram import Bot, Dispatcher
from aiogram.filters import Command
from aiogram.types import Message

# পরিবেশ চলক (Environment Variable) থেকে টোকেন নেওয়া
API_TOKEN = os.getenv("BOT_TOKEN")

bot = Bot(token=API_TOKEN)
dp = Dispatcher()

@dp.message(Command("start"))
async def start_cmd(message: Message):
    await message.answer(f"হ্যালো {message.from_user.first_name}! আমি Render-এ ২৪/৭ চালু আছি।")

@dp.message()
async def echo_cmd(message: Message):
    await message.answer(f"তুমি বললে: {message.text}")

async def main():
    print("বট চালু হচ্ছে...")
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())
