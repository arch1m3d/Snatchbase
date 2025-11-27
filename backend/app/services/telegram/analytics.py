"""
Analytics and statistics commands for Telegram bot
Provides quick access to database insights without opening web UI
"""
from telegram import Update
from telegram.ext import ContextTypes
from sqlalchemy import func, desc, distinct
from datetime import datetime, timedelta
from app.database import SessionLocal
from app.models import Credential, Device, Upload
from .config import logger, is_user_allowed
from .utils import get_back_button


async def stats_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """
    Handle /stats command - comprehensive database statistics
    Shows overview, top domains, countries, stealers, and recent activity
    """
    user_id = update.effective_user.id
    
    if not is_user_allowed(user_id):
        await update.message.reply_text("⛔ Unauthorized access denied.")
        return
    
    await update.message.reply_text("📊 Generating statistics...\n⏳ Please wait...")
    
    db = SessionLocal()
    try:
        # === OVERALL STATISTICS ===
        total_credentials = db.query(func.count(Credential.id)).scalar() or 0
        total_devices = db.query(func.count(Device.id)).scalar() or 0
        total_uploads = db.query(func.count(Upload.upload_id)).scalar() or 0
        unique_domains = db.query(func.count(distinct(Credential.domain))).scalar() or 0
        unique_countries = db.query(func.count(distinct(Device.country))).filter(Device.country.isnot(None)).scalar() or 0
        unique_stealers = db.query(func.count(distinct(Credential.stealer_name))).filter(Credential.stealer_name.isnot(None)).scalar() or 0
        
        # === TOP 5 DOMAINS ===
        top_domains = db.query(
            Credential.domain,
            func.count(Credential.id).label('count')
        ).filter(
            Credential.domain.isnot(None)
        ).group_by(
            Credential.domain
        ).order_by(
            desc('count')
        ).limit(5).all()
        
        # === TOP 5 COUNTRIES ===
        top_countries = db.query(
            Device.country,
            func.count(Device.id).label('count')
        ).filter(
            Device.country.isnot(None)
        ).group_by(
            Device.country
        ).order_by(
            desc('count')
        ).limit(5).all()
        
        # === TOP 5 STEALERS ===
        top_stealers = db.query(
            Credential.stealer_name,
            func.count(Credential.id).label('count')
        ).filter(
            Credential.stealer_name.isnot(None)
        ).group_by(
            Credential.stealer_name
        ).order_by(
            desc('count')
        ).limit(5).all()
        
        # === RECENT ACTIVITY (Last 24h, 7d, 30d) ===
        now = datetime.now()
        
        creds_24h = db.query(func.count(Credential.id)).filter(
            Credential.created_at >= now - timedelta(hours=24)
        ).scalar() or 0
        
        creds_7d = db.query(func.count(Credential.id)).filter(
            Credential.created_at >= now - timedelta(days=7)
        ).scalar() or 0
        
        creds_30d = db.query(func.count(Credential.id)).filter(
            Credential.created_at >= now - timedelta(days=30)
        ).scalar() or 0
        
        devices_24h = db.query(func.count(Device.id)).filter(
            Device.created_at >= now - timedelta(hours=24)
        ).scalar() or 0
        
        # === BUILD MESSAGE ===
        message = "📊 *SNATCHBASE STATISTICS*\n"
        message += "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n"
        
        # Overall Stats
        message += "📈 *OVERALL DATABASE*\n"
        message += f"🔑 Total Credentials: `{total_credentials:,}`\n"
        message += f"🖥️ Total Devices: `{total_devices:,}`\n"
        message += f"📦 Total Uploads: `{total_uploads:,}`\n"
        message += f"🌐 Unique Domains: `{unique_domains:,}`\n"
        message += f"🌍 Countries: `{unique_countries}`\n"
        message += f"🦠 Stealer Types: `{unique_stealers}`\n\n"
        
        # Recent Activity
        message += "⚡ *RECENT ACTIVITY*\n"
        message += f"📅 Last 24h: `{creds_24h:,}` creds | `{devices_24h}` devices\n"
        message += f"📅 Last 7d: `{creds_7d:,}` credentials\n"
        message += f"📅 Last 30d: `{creds_30d:,}` credentials\n\n"
        
        # Top Domains
        message += "🔝 *TOP 5 DOMAINS*\n"
        if top_domains:
            for i, (domain, count) in enumerate(top_domains, 1):
                message += f"{i}. `{domain}`: {count:,}\n"
        else:
            message += "_No data available_\n"
        
        message += "\n"
        
        # Top Countries
        message += "🌍 *TOP 5 COUNTRIES*\n"
        if top_countries:
            for i, (country, count) in enumerate(top_countries, 1):
                flag = get_country_flag(country)
                message += f"{i}. {flag} `{country}`: {count:,}\n"
        else:
            message += "_No data available_\n"
        
        message += "\n"
        
        # Top Stealers
        message += "🦠 *TOP 5 STEALERS*\n"
        if top_stealers:
            for i, (stealer, count) in enumerate(top_stealers, 1):
                message += f"{i}. `{stealer}`: {count:,}\n"
        else:
            message += "_No data available_\n"
        
        message += "\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
        message += f"🕐 Updated: {now.strftime('%Y-%m-%d %H:%M:%S')}"
        
        await update.message.reply_text(
            message,
            parse_mode='Markdown',
            reply_markup=get_back_button()
        )
        
        logger.info(f"Stats command executed by user {user_id}")
        
    except Exception as e:
        logger.error(f"Error generating statistics: {str(e)}", exc_info=True)
        await update.message.reply_text(
            f"❌ Error generating statistics: {str(e)}",
            reply_markup=get_back_button()
        )
    finally:
        db.close()


async def recent_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """
    Handle /recent command - show recent credentials with time filter
    Usage: /recent [24h|7d|30d] (default: 24h)
    """
    user_id = update.effective_user.id
    
    if not is_user_allowed(user_id):
        await update.message.reply_text("⛔ Unauthorized access denied.")
        return
    
    # Parse time period from arguments
    time_period = '24h'
    if context.args and len(context.args) > 0:
        arg = context.args[0].lower()
        if arg in ['24h', '7d', '30d', '1h', '6h', '12h']:
            time_period = arg
    
    # Calculate time delta
    now = datetime.now()
    time_deltas = {
        '1h': timedelta(hours=1),
        '6h': timedelta(hours=6),
        '12h': timedelta(hours=12),
        '24h': timedelta(hours=24),
        '7d': timedelta(days=7),
        '30d': timedelta(days=30)
    }
    
    delta = time_deltas.get(time_period, timedelta(hours=24))
    since = now - delta
    
    await update.message.reply_text(
        f"🕐 Fetching credentials from last *{time_period}*...\n⏳ Please wait...",
        parse_mode='Markdown'
    )
    
    db = SessionLocal()
    try:
        # Get recent credentials
        recent_creds = db.query(Credential).filter(
            Credential.created_at >= since
        ).order_by(
            Credential.created_at.desc()
        ).limit(50).all()
        
        # Get recent devices
        recent_devices = db.query(Device).filter(
            Device.created_at >= since
        ).order_by(
            Device.created_at.desc()
        ).limit(10).all()
        
        # Count totals
        total_creds = db.query(func.count(Credential.id)).filter(
            Credential.created_at >= since
        ).scalar() or 0
        
        total_devices = db.query(func.count(Device.id)).filter(
            Device.created_at >= since
        ).scalar() or 0
        
        # Get domain breakdown
        domain_stats = db.query(
            Credential.domain,
            func.count(Credential.id).label('count')
        ).filter(
            Credential.created_at >= since,
            Credential.domain.isnot(None)
        ).group_by(
            Credential.domain
        ).order_by(
            desc('count')
        ).limit(10).all()
        
        # Get stealer breakdown
        stealer_stats = db.query(
            Credential.stealer_name,
            func.count(Credential.id).label('count')
        ).filter(
            Credential.created_at >= since,
            Credential.stealer_name.isnot(None)
        ).group_by(
            Credential.stealer_name
        ).order_by(
            desc('count')
        ).limit(5).all()
        
        # === BUILD MESSAGE ===
        message = f"🕐 *RECENT ACTIVITY ({time_period.upper()})*\n"
        message += "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n"
        
        # Summary
        message += "📊 *SUMMARY*\n"
        message += f"🔑 New Credentials: `{total_creds:,}`\n"
        message += f"🖥️ New Devices: `{total_devices}`\n"
        message += f"🕐 Period: {since.strftime('%Y-%m-%d %H:%M')} → Now\n\n"
        
        if total_creds == 0:
            message += "✨ No new credentials in this period.\n"
            await update.message.reply_text(
                message,
                parse_mode='Markdown',
                reply_markup=get_back_button()
            )
            return
        
        # Domain Breakdown
        message += "🌐 *TOP DOMAINS*\n"
        if domain_stats:
            for i, (domain, count) in enumerate(domain_stats[:5], 1):
                message += f"{i}. `{domain}`: {count:,}\n"
        
        message += "\n"
        
        # Stealer Breakdown
        message += "🦠 *STEALER TYPES*\n"
        if stealer_stats:
            for stealer, count in stealer_stats:
                message += f"• `{stealer}`: {count:,}\n"
        
        message += "\n"
        
        # Recent Devices
        message += "🖥️ *RECENT DEVICES*\n"
        if recent_devices:
            for device in recent_devices[:5]:
                country_flag = get_country_flag(device.country)
                device_name = device.device_name[:40] if device.device_name else "Unknown"
                message += f"{country_flag} `{device_name}` ({device.total_credentials} creds)\n"
        
        message += "\n"
        
        # Sample credentials (top 5)
        message += "🔑 *SAMPLE CREDENTIALS* (Latest 5)\n"
        for i, cred in enumerate(recent_creds[:5], 1):
            domain = cred.domain or "Unknown"
            username = cred.username[:30] if cred.username else "N/A"
            time_ago = format_time_ago(cred.created_at)
            message += f"{i}. `{domain}` - {username[:20]}... ({time_ago})\n"
        
        if total_creds > 5:
            message += f"\n_... and {total_creds - 5:,} more credentials_\n"
        
        message += "\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
        message += "💡 *TIP:* Use `/recent 1h`, `/recent 7d`, or `/recent 30d`"
        
        await update.message.reply_text(
            message,
            parse_mode='Markdown',
            reply_markup=get_back_button()
        )
        
        logger.info(f"Recent command executed by user {user_id} for period {time_period}")
        
    except Exception as e:
        logger.error(f"Error fetching recent data: {str(e)}", exc_info=True)
        await update.message.reply_text(
            f"❌ Error fetching recent data: {str(e)}",
            reply_markup=get_back_button()
        )
    finally:
        db.close()


def get_country_flag(country_code: str) -> str:
    """Convert country code to emoji flag"""
    if not country_code or len(country_code) != 2:
        return "🌍"
    
    # Convert country code to flag emoji
    # Each letter maps to regional indicator symbol
    country_code = country_code.upper()
    return ''.join(chr(127397 + ord(char)) for char in country_code)


def format_time_ago(dt: datetime) -> str:
    """Format datetime as 'X minutes/hours/days ago'"""
    if not dt:
        return "Unknown"
    
    now = datetime.now()
    diff = now - dt.replace(tzinfo=None) if dt.tzinfo else now - dt
    
    seconds = diff.total_seconds()
    
    if seconds < 60:
        return f"{int(seconds)}s ago"
    elif seconds < 3600:
        return f"{int(seconds / 60)}m ago"
    elif seconds < 86400:
        return f"{int(seconds / 3600)}h ago"
    elif seconds < 604800:
        return f"{int(seconds / 86400)}d ago"
    else:
        return dt.strftime('%Y-%m-%d')
