import os
import logging
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import Application, CommandHandler, ContextTypes

# Logging setup
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)

# Configuration
# আপনার Telegram Admin ID (সংখ্যায়, যেমন: 123456789)
ADMIN_ID = int(os.getenv("ADMIN_ID", "YOUR_TELEGRAM_ADMIN_ID")) 
# Render Environment Variable থেকে Token নেওয়া হবে
BOT_TOKEN = os.getenv("BOT_TOKEN") 
# আপনার Mini App-এর URL
MINI_APP_URL = os.getenv("MINI_APP_URL", "https://your-mini-app-url.com") 

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.effective_user.id

    # Admin Check: ইউজার যদি Admin হয়
    if user_id == ADMIN_ID:
        # Admin-এর জন্য Mini App-এর Button তৈরি
        keyboard = [
            [
                InlineKeyboardButton(
                    text="🚀 Open Admin Mini App", 
                    web_app=WebAppInfo(url=MINI_APP_URL)
                )
            ]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        await update.message.reply_text(
            "Welcome Admin! Click below to access your Mini App:", 
            reply_markup=reply_markup
        )
    else:
        # সাধারণ ইউজারদের জন্য
        await update.message.reply_text(
            "Hello! Welcome to our Bot. Mini App is only accessible by Admins."
        )

def main():
    if not BOT_TOKEN:
        print("Error: BOT_TOKEN Environment Variable is missing!")
        return

    app = Application.builder().token(BOT_TOKEN).build()
    app.add_handler(CommandHandler("start", start))
    
    print("Bot is running...")
    app.run_polling()

if __name__ == '__main__':
    main()
