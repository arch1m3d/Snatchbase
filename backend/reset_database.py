"""Reset the database - drops all tables and recreates them"""
import sys
sys.path.insert(0, '/home/user/Snatchbase/backend')

from app.database import engine, Base
from app.models import Device, Credential, File, Upload, System, Software, Wallet, CreditCard, PasswordStat

def reset_database():
    """Drop all tables and recreate them"""
    print("⚠️  WARNING: This will delete ALL data in the database!")
    response = input("Are you sure? Type 'yes' to continue: ")

    if response.lower() != 'yes':
        print("❌ Aborted")
        return

    print("\n🗑️  Dropping all tables...")
    Base.metadata.drop_all(bind=engine)
    print("✅ All tables dropped")

    print("\n📊 Creating tables...")
    Base.metadata.create_all(bind=engine)
    print("✅ All tables created")

    print("\n✨ Database reset complete!")

if __name__ == "__main__":
    reset_database()
