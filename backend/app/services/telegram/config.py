"""
Configuration and constants for Telegram bot
"""
import os
import logging
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Setup logging
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# Configuration from environment
TELEGRAM_BOT_TOKEN = os.getenv('TELEGRAM_BOT_TOKEN')

# Parse allowed user IDs
_allowed_users_str = os.getenv('TELEGRAM_ALLOWED_USER_ID', '0').strip()
ALLOWED_USER_IDS = []
ALLOW_ALL_USERS = False

if _allowed_users_str == '*':
    ALLOW_ALL_USERS = True
else:
    try:
        ALLOWED_USER_IDS = [int(uid.strip()) for uid in _allowed_users_str.split(',') if uid.strip()]
    except ValueError:
        logger.error(f"Invalid TELEGRAM_ALLOWED_USER_ID format: {_allowed_users_str}. Must be integer(s) or '*'.")
        ALLOWED_USER_IDS = []

UPLOAD_DIR = Path(os.getenv('UPLOAD_DIR', 'data/incoming/uploads'))

# Ensure upload directory exists
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

def is_user_allowed(user_id: int) -> bool:
    """Check if a user is allowed to use the bot"""
    if ALLOW_ALL_USERS:
        return True
    return user_id in ALLOWED_USER_IDS
