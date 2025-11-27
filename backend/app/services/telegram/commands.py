"""
Command handlers for Telegram bot
"""
from telegram import Update
from telegram.ext import ContextTypes
from sqlalchemy import func
from app.database import SessionLocal
from app.models import Credential, Device, Upload, CreditCard
from .config import logger, is_user_allowed, UPLOAD_DIR
from .utils import get_back_button


async def start_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle /start command with comprehensive statistics"""
    user_id = update.effective_user.id
    
    if not is_user_allowed(user_id):
        await update.message.reply_text("⛔ Unauthorized access denied.")
        logger.warning(f"Unauthorized access attempt from user {user_id}")
        return
    
    # Get database statistics
    db = SessionLocal()
    try:
        # Get total counts
        total_credentials = db.query(func.count(Credential.id)).scalar() or 0
        total_systems = db.query(func.count(Device.device_id)).scalar() or 0
        total_uploads = db.query(func.count(Upload.upload_id)).scalar() or 0
        
        # Get unique domains count
        unique_domains = db.query(func.count(func.distinct(Credential.domain))).scalar() or 0
        
        # Count pending ZIP files
        zip_files = list(UPLOAD_DIR.glob("*.zip"))
        
        # Build comprehensive message
        message = (
            "🤖 *Snatchbase Log Processor Bot*\n"
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n"
            
            "📊 *DATABASE STATISTICS*\n"
            f"🔑 Total Credentials: {total_credentials:,}\n"
            f"🖥️ Total Systems: {total_systems:,}\n"
            f"📦 Total Uploads: {total_uploads:,}\n"
            f"🌐 Unique Domains: {unique_domains:,}\n"
            f"📁 Pending Files: {len(zip_files)}\n\n"
            
            "⚙️ *COMMANDS*\n"
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
            "/start - Show statistics\n"
            "/status - Check bot status\n"
            "/stats - Database analytics\n"
            "/recent - Recent activity (24h/7d/30d)\n"
            "/search - Search credentials\n"
            "/creditcards - View credit cards\n"
            "/ccstats - Credit card statistics\n"
            "/wallets - Wallet statistics\n"
            "/checkwallets - Check wallet balances\n"
            "/highvalue - High value wallets\n"
            "/topdomains - View top domains\n"
            "/extractdomains - Extract credentials from target domains\n\n"
            
            "📤 *SEND FILES*\n"
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
            "Send me ZIP files or Mega.nz links with logs:\n"
            "✅ Upload ZIP files directly\n"
            "✅ Paste Mega.nz download links\n"
            "✅ Auto-process and extract credentials\n"
            "✅ Auto-delete ZIP files after processing\n"
        )
        
        await update.message.reply_text(message, parse_mode='Markdown')
        
    except Exception as e:
        logger.error(f"Error getting statistics: {str(e)}", exc_info=True)
        await update.message.reply_text(
            "🤖 *Snatchbase Log Processor Bot*\n\n"
            "Send me ZIP files containing stealer logs and I'll:\n"
            "✅ Save them to the upload directory\n"
            "✅ Process and extract credentials\n"
            "✅ Delete the ZIP files after processing\n\n"
            "Commands:\n"
            "/start - Show this message\n"
            "/status - Check bot status",
            parse_mode='Markdown'
        )
    finally:
        db.close()


async def status_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle /status command"""
    user_id = update.effective_user.id
    
    if not is_user_allowed(user_id):
        await update.message.reply_text("⛔ Unauthorized access denied.")
        return
    
    # Count files in upload directory
    zip_files = list(UPLOAD_DIR.glob("*.zip"))
    
    await update.message.reply_text(
        f"✅ *Bot Status*\n\n"
        f"📁 Upload Directory: `{UPLOAD_DIR}`\n"
        f"📦 ZIP Files Pending: {len(zip_files)}\n"
        f"🤖 Status: Active",
        parse_mode='Markdown',
        reply_markup=get_back_button()
    )


async def top100_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle /top100 and /topdomains command to show top 100 domains"""
    user_id = update.effective_user.id
    
    if not is_user_allowed(user_id):
        await update.message.reply_text("⛔ Unauthorized access denied.")
        return
    
    db = SessionLocal()
    try:
        # Get top 100 domains
        top_domains = db.query(
            Credential.domain,
            func.count(Credential.id).label('count')
        ).group_by(
            Credential.domain
        ).order_by(
            func.count(Credential.id).desc()
        ).limit(100).all()
        
        if not top_domains:
            await update.message.reply_text("No domains found in database.")
            return
        
        # Split into multiple messages (Telegram has message length limit)
        message_parts = []
        current_message = "📊 *TOP 100 DOMAINS*\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n"
        
        for i, (domain, count) in enumerate(top_domains, 1):
            line = f"{i}. {domain} - {count:,}\n"
            
            # If message gets too long, start a new one
            if len(current_message + line) > 4000:
                message_parts.append(current_message)
                current_message = f"*TOP 100 DOMAINS (continued)*\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n{line}"
            else:
                current_message += line
        
        # Add the last part
        if current_message:
            message_parts.append(current_message)
        
        # Send all message parts
        for i, part in enumerate(message_parts):
            # Add back button only to the last message
            if i == len(message_parts) - 1:
                await update.message.reply_text(part, parse_mode='Markdown', reply_markup=get_back_button())
            else:
                await update.message.reply_text(part, parse_mode='Markdown')
            
    except Exception as e:
        logger.error(f"Error getting top domains: {str(e)}", exc_info=True)
        await update.message.reply_text(f"❌ Error retrieving top domains: {str(e)}", reply_markup=get_back_button())
    finally:
        db.close()


async def creditcards_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle /creditcards command to show credit card information"""
    user_id = update.effective_user.id
    
    if not is_user_allowed(user_id):
        await update.message.reply_text("⛔ Unauthorized access denied.")
        return
    
    db = SessionLocal()
    try:
        # Parse arguments for filtering
        args = context.args
        limit = 20
        brand_filter = None
        
        if args:
            # Check if first arg is a brand name
            potential_brand = ' '.join(args).strip()
            if potential_brand.lower() in ['visa', 'mastercard', 'american express', 'discover', 'jcb', 'diners club']:
                brand_filter = potential_brand.title()
        
        # Build query
        query = db.query(CreditCard).join(Device)
        
        if brand_filter:
            query = query.filter(CreditCard.card_brand == brand_filter)
        
        # Get credit cards
        credit_cards = query.order_by(CreditCard.created_at.desc()).limit(limit).all()
        
        if not credit_cards:
            message = "💳 No credit cards found in database."
            if brand_filter:
                message = f"💳 No {brand_filter} cards found in database."
            await update.message.reply_text(message, reply_markup=get_back_button())
            return
        
        # Build message
        total_count = db.query(func.count(CreditCard.id)).scalar() or 0
        
        message = f"💳 *CREDIT CARDS* ({len(credit_cards)}/{total_count:,})\n"
        if brand_filter:
            message = f"💳 *{brand_filter.upper()} CARDS* ({len(credit_cards)})\n"
        message += "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n"
        
        for i, card in enumerate(credit_cards, 1):
            # Get device info
            device = db.query(Device).filter(Device.id == card.device_id).first()
            device_name = device.device_name if device else "Unknown"
            
            # Get brand emoji
            brand_emoji = {
                'Visa': '💳',
                'Mastercard': '💳',
                'American Express': '💳',
                'Discover': '💳',
                'JCB': '💳',
                'Diners Club': '💳'
            }.get(card.card_brand, '💳')
            
            message += (
                f"{i}. {brand_emoji} *{card.card_brand or 'Unknown'}*\n"
                f"   Card: `{card.card_number_masked}`\n"
            )
            
            if card.cardholder_name:
                message += f"   Name: {card.cardholder_name}\n"
            if card.expiration:
                message += f"   Exp: {card.expiration}\n"
            
            message += f"   Device: {device_name[:30]}\n"
            message += f"   Found: {card.created_at.strftime('%Y-%m-%d %H:%M')}\n\n"
        
        # Add usage instructions
        if not brand_filter:
            message += "\n💡 Filter by brand: `/creditcards Visa`"
        
        await update.message.reply_text(message, parse_mode='Markdown', reply_markup=get_back_button())
        
    except Exception as e:
        logger.error(f"Error getting credit cards: {str(e)}", exc_info=True)
        await update.message.reply_text(f"❌ Error retrieving credit cards: {str(e)}", reply_markup=get_back_button())
    finally:
        db.close()


async def ccstats_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle /ccstats command to show credit card statistics"""
    user_id = update.effective_user.id
    
    if not is_user_allowed(user_id):
        await update.message.reply_text("⛔ Unauthorized access denied.")
        return
    
    db = SessionLocal()
    try:
        # Get total count
        total_cards = db.query(func.count(CreditCard.id)).scalar() or 0
        
        if total_cards == 0:
            await update.message.reply_text("💳 No credit cards found in database.", reply_markup=get_back_button())
            return
        
        # Get unique devices with cards
        unique_devices = db.query(func.count(func.distinct(CreditCard.device_id))).scalar() or 0
        
        # Get brand distribution
        brand_stats = db.query(
            CreditCard.card_brand,
            func.count(CreditCard.id).label('count')
        ).group_by(
            CreditCard.card_brand
        ).order_by(
            func.count(CreditCard.id).desc()
        ).all()
        
        # Build message
        message = (
            "💳 *CREDIT CARD STATISTICS*\n"
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n"
            f"📊 Total Cards: {total_cards:,}\n"
            f"🖥️ Unique Devices: {unique_devices:,}\n"
            f"📈 Avg Cards/Device: {total_cards/unique_devices:.1f}\n\n"
            "🏦 *BRAND DISTRIBUTION*\n"
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
        )
        
        for brand, count in brand_stats:
            percentage = (count / total_cards) * 100
            brand_name = brand or "Unknown"
            
            # Brand emoji
            brand_emoji = {
                'Visa': '💳',
                'Mastercard': '💳',
                'American Express': '💳',
                'Discover': '💳',
                'JCB': '💳',
                'Diners Club': '💳'
            }.get(brand_name, '💳')
            
            # Progress bar
            bar_length = int(percentage / 5)  # 20 chars max
            bar = '▓' * bar_length + '░' * (20 - bar_length)
            
            message += f"{brand_emoji} {brand_name}:\n"
            message += f"{bar} {percentage:.1f}% ({count:,})\n\n"
        
        message += "\n💡 View cards: `/creditcards [brand]`"
        
        await update.message.reply_text(message, parse_mode='Markdown', reply_markup=get_back_button())
        
    except Exception as e:
        logger.error(f"Error getting credit card stats: {str(e)}", exc_info=True)
        await update.message.reply_text(f"❌ Error retrieving statistics: {str(e)}", reply_markup=get_back_button())
    finally:
        db.close()

