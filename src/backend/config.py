# config.py
import os

class Config:
    # Secret key used for session security. Should be a long, random string.
    SECRET_KEY = os.getenv("SECRET_KEY", "defaultsecret")

    # URL for the Celery broker (Redis in this case)
    CELERY_BROKER_URL = os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0")

    # Additional configuration variables can be added here.
