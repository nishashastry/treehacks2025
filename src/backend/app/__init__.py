# app/__init__.py
from flask import Flask
from config import Config
from .firebase_client import db, bucket
from .routes import main_blueprint
from .patients import patients_blueprint
from .chatbot import chatbot_blueprint  # New chatbot endpoints
from flask_cors import CORS
from .transcription import transcription_blueprint

def create_app():
    app = Flask(__name__)
    # Update CORS to support credentials (cookies)
    CORS(app, supports_credentials=True)
    app.config.from_object(Config)

    # Optionally store Firebase references in the app config.
    app.config["FIRESTORE_DB"] = db
    app.config["FIREBASE_BUCKET"] = bucket

    # Register blueprints.
    app.register_blueprint(main_blueprint)
    app.register_blueprint(patients_blueprint)
    app.register_blueprint(chatbot_blueprint)
    app.register_blueprint(transcription_blueprint)

    return app