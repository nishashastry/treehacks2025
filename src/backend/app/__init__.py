# app/__init__.py
from flask import Flask
from config import Config
from .routes import main_blueprint
from .patients import patients_blueprint  # if you have a patients module
from .firebase_client import db, bucket  # Import the shared Firebase resources

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Optionally, store Firebase resources in the app config for easier access in blueprints.
    app.config["FIRESTORE_DB"] = db
    app.config["FIREBASE_BUCKET"] = bucket

    # Register blueprints.
    app.register_blueprint(main_blueprint)
    app.register_blueprint(patients_blueprint)  # Register patients endpoints if available

    return app
