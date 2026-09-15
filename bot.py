import os
import asyncio
from aiogram import Bot, Dispatcher, F
from aiogram.types import Message, CallbackQuery, InlineKeyboardMarkup, InlineKeyboardButton

TOKEN = os.getenv("BOT_TOKEN")

bot = Bot(token=TOKEN)
dp = Dispatcher()

keyboard = InlineKeyboardMarkup(
    inline_keyboard=[
        [InlineKeyboardButton(text="Start", callback_data="click_start")]
    ]
)

@dp.message(F.text == "/start")
async def start_command(message: Message):
    await message.answer("Nicher button-e click korun:", reply_markup=keyboard)

@dp.callback_query(F.data == "click_start")
async def button_click(callback: CallbackQuery):
    await callback.message.edit_text(text="Welcome! Bot-e apnake shagotom janai! 🎉")
    await callback.answer()

async def main():
    await dp.start_polling(bot)

if __name__ == '__main__':
    asyncio.run(main())
