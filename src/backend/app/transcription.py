# app/transcription.py
import os
import openai
from dotenv import load_dotenv

load_dotenv()  # Make sure OPENAI_API_KEY is loaded

# Set the API key for OpenAI
openai.api_key = os.getenv("OPENAI_API_KEY")

def transcription(audio_path):
    """
    Transcribe the audio file at audio_path using OpenAI's Whisper model.

    :param audio_path: Path to the audio file.
    :return: The transcription text.
    """
    with open(audio_path, "rb") as audio_file:
        # Call OpenAI's transcription endpoint.
        transcription_response = openai.Audio.transcriptions.create(
            model="whisper-1",
            file=audio_file
        )
    return transcription_response["text"]

def action_items(transcript):
    """
    Generate action items and a summary based on the audio transcript.

    :param transcript: The transcribed text of the consultation.
    :return: A string with the recommended action items.
    """
    prompt = (
        "You are going to get an audio transcript of a doctor's visit for diabetes. "
        "In the audio transcript, both the doctor and patient speak. You are a medically educated "
        "scribe assistant for the doctor. The patient wants a summary and a list of action items based on the visit."
    )

    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": prompt},
            {"role": "user", "content": "Recommend action items for this visit: " + transcript}
        ]
    )
    return response.choices[0].message.content
