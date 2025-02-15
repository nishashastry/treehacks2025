# app/__init__.py
from flask import Flask
from config import Config
from .routes import main_blueprint

def create_app():
    # Create a new Flask application
    app = Flask(__name__)

    # Load configuration from the Config class
    app.config.from_object(Config)

    # Register blueprints (modular route grouping)
    app.register_blueprint(main_blueprint)

    return app
