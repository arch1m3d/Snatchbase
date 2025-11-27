"""
Database reset utility - drops and recreates all tables
Run this script to reset the database and match current model definitions
"""
from app.database import engine, Base
from app.models import (
    Device,
    File,
    Credential,
    PasswordStat,
    Software,
    Upload,
    System,
    Wallet,
    CreditCard,
    BrowserHistory
)

def reset_database():
    """Drop all tables and recreate them from models"""
    print("⚠️  WARNING: This will DELETE ALL DATA in the database!")
    print("⚠️  Make sure you have backups or can re-ingest your data.")

    confirmation = input("\nType 'YES' to confirm database reset: ")

    if confirmation != "YES":
        print("❌ Database reset cancelled.")
        return

    print("\n🗑️  Dropping all tables...")
    Base.metadata.drop_all(bind=engine)
    print("✅ All tables dropped successfully!")

    print("\n🏗️  Creating tables from current models...")
    Base.metadata.create_all(bind=engine)
    print("✅ All tables created successfully!")

    print("\n✨ Database reset complete!")
    print("\n📝 Next steps:")
    print("   1. Re-ingest your stealer logs")
    print("   2. The browser_history table is now ready for data")
    print("   3. All schema mismatches have been fixed")

if __name__ == "__main__":
    reset_database()
