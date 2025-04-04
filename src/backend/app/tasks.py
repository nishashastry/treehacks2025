# app/tasks.py
import os
from celery import Celery
from dotenv import load_dotenv
from elevenlabs.client import ElevenLabs
from app.firebase_client import send_notification

# Load environment variables from .env file
load_dotenv()

# Set up the Celery application using the Redis broker URL from environment variables.
CELERY_BROKER_URL = os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0")
celery_app = Celery('tasks', broker=CELERY_BROKER_URL)

# Initialize the ElevenLabs client using the API key from environment variables.
api_key = os.getenv("ELEVENLABS_API_KEY")
client = ElevenLabs(api_key=api_key)

@celery_app.task
def generate_tts_notification(text):
    """
    Celery task that converts the provided text to speech.
    Saves the generated audio as an MP3 file and returns the file path.
    """
    # Use the ElevenLabs API to convert text to speech.
    # This returns a generator yielding chunks of audio data.
    audio = client.text_to_speech.convert(
        text=text,
        voice_id="JBFqnCBsd6RMkjVDRZzb",      # Can be replaced with any other desired voice ID.
        model_id="eleven_multilingual_v2",    # Can be replaced with any desired model.
        output_format="mp3_44100_128",
    )

    # Define the file path where the audio file will be saved.
    audio_path = os.path.join("app", "static", "audio", "notification.mp3")

    # Ensure the directory exists; if not, create it.
    os.makedirs(os.path.dirname(audio_path), exist_ok=True)

    # Open the file in binary write mode.
    with open(audio_path, "wb") as f:
        # Since 'audio' is a generator, write each chunk to the file.
        for chunk in audio:
            f.write(chunk)

    # Return a status message and the path to the saved audio file.
    return {"status": "complete", "audio_file": audio_path}

@celery_app.task
def send_glucose_notification(firebase_token, predicted_glucose, action):
    """
    Celery task that:
    1. Sends a Firebase push notification.
    2. Streams the speech audio directly to the client.
    
    :param firebase_token: User's Firebase token to receive the notification.
    :param predicted_glucose: The predicted glucose level.
    :param action: Recommended action for the user.
    :return: Audio stream.
    """
    message = f"Predicted Glucose Level: {predicted_glucose}. {action}"
    send_notification("Glucose Prediction Alert", message, firebase_token)

    # Convert text to speech using ElevenLabs
    audio = client.text_to_speech.convert(
        text=message,
        voice_id="JBFqnCBsd6RMkjVDRZzb",      # Replace with your preferred voice ID.
        model_id="eleven_multilingual_v2",    # Replace with your preferred model.
        output_format="mp3_44100_128",
    )


    return list(audio)