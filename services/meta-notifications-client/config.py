"""Configuration management"""
import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from the .env file in the same directory as this config file
env_path = Path(__file__).parent / '.env'
load_dotenv(dotenv_path=env_path)


class Config:
    """Application configuration"""
    
    # Webhook configuration
    VERIFY_TOKEN = os.getenv('WEBHOOK_VERIFY_TOKEN', 'meta_notifications_verify_token_2025')
    WEBHOOK_URL = os.getenv('WEBHOOK_URL')
    
    # Meta App configuration
    APP_SECRET = os.getenv('META_APP_SECRET')
    APP_ID = os.getenv('META_APP_ID')
    
    # Server configuration
    PORT = int(os.getenv('PORT', 8080))
    DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'
    
    @classmethod
    def validate(cls) -> bool:
        """Validate required configuration"""
        required = ['APP_SECRET', 'APP_ID']
        missing = [key for key in required if not getattr(cls, key)]
        
        if missing:
            raise ValueError(f'Missing required configuration: {", ".join(missing)}')
        
        return True
