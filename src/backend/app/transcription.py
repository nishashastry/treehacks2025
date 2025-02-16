import os
from openai import OpenAI
from dotenv import load_dotenv
from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename

load_dotenv()  # Make sure OPENAI_API_KEY is loaded

# Set the API key for OpenAI
openai_key = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=openai_key)

# Create blueprint for transcription
transcription_blueprint = Blueprint('transcription', __name__)

@transcription_blueprint.route('/transcription', methods=['POST'])
def handle_transcription():
    """
    Handles the transcription of an uploaded audio file.
    Expects a multipart/form-data request with an audio file.
    """
    # if 'file' not in request.files:
    #     return jsonify({"error": "No file part"}), 400

    # file = request.files['file']

    # if file.filename == '':
    #     return jsonify({"error": "No selected file"}), 400
    file = request.data
    file_path = 'uploaded_file.mp3'
    with open(file_path, 'wb') as f:
        f.write(file)

    if file:
        # Save the file temporarily
        # filename = secure_filename(file.filename)
        # file_path = os.path.join('uploads', filename)  # Ensure you have a 'uploads' directory
        # file.save(file_path)

        try:
            # Perform the transcription using the audio file path
            transcript = transcription(file_path)

            # Generate action items based on the transcription
            action_items_list = action_items(transcript)

            # Generate suggested questions
            text = f"{transcript}\n\nAfter this conversation, the doctor recommended the following action items:\n" + "\n".join(action_items_list)
            suggested_questions_list = suggested_questions(text)

            # Clean up the saved file after processing (optional)
            os.remove(file_path)

            return jsonify({
                "transcription": transcript,
                "action_items": action_items_list,
                "suggested_questions": suggested_questions_list
            }), 200

        except Exception as e:
            return jsonify({"error": f"Error processing the file: {str(e)}"}), 500

    return jsonify({"error": "Invalid file type. Only wav, mp3, flac, and ogg are allowed."}), 400


def transcription(audio_path):
    """
    Transcribe an audio file using OpenAI's Whisper model.

    :param audio_path: Path to the audio file.
    :return: Transcribed text from the audio.
    """
    with open(audio_path, "rb") as audio_file:
        # Create a transcription using the specified model.
        transcription_response = client.audio.transcriptions.create(
            model="whisper-1",
            file=audio_file
        )
    return transcription_response.text


def action_items(transcript):
    """
    Generate a summary and a list of action items for a doctor's visit transcript.

    :param transcript: The transcript text of the consultation.
    :return: Action items generated by the chat model.
    """
    prompt = (
        "You are going to get an audio transcript of a doctor's visit for diabetes. "
        "In the audio transcript, there is audio of both the doctor and patient. "
        "You are basically a medically educated scribe assistant for the doctor. "
        "The patient wants a summary and a list of action items based on the doctor's visits."
    )
    completion = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "developer", "content": prompt},
            {"role": "user", "content": "Recommend action items for this visit: " + str(transcript)}
        ]
    )
    return completion.choices[0].message.content


def suggested_questions(transcript):
    """
    Generate a list of suggested questions based on doctor's visit and doctor's recommended action items

    :param transcript: The transcript text of the consultation and action items
    :return: Four follow-up questions that patient can ask
    """
    prompt = (
        "You are going to get an audio transcript of a doctor's visit for diabetes followed by the action items recommended by the doctor. "
        "In the audio transcript, there is audio of both the doctor and patient. "
        "You are basically a medically educated scribe assistant to help the patient understand their situation. "
        "The patient wants a four follow up questions given the conversation and the action items to get a better understanding of what they need to do."
    )
    completion = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "developer", "content": prompt},
            {"role": "user", "content": "Suggested questions " + str(transcript)}
        ]
    )
    return completion.choices[0].message.content
