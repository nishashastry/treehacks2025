# app/routes.py
import os
import uuid
from flask import Blueprint, request, jsonify, Response, stream_with_context
from datetime import datetime
from werkzeug.utils import secure_filename
from firebase_admin import credentials, initialize_app, storage, firestore
from .firebase_client import db, bucket  # Use shared Firebase resources
from .transcription import transcription, action_items

from app.tasks import generate_tts_notification
from app.predictive_analytics import GlucosePredictor
from app.tasks import send_glucose_notification

# Create a blueprint for our routes
main_blueprint = Blueprint('main', __name__)

@main_blueprint.route('/notify', methods=['POST'])
def notify():
    """
    Endpoint to receive a notification request.
    Expects a JSON payload with a 'text' key.
    """
    data = request.get_json()
    text = data.get('text', '')

    if not text:
        return jsonify({"error": "No text provided"}), 400

    task = generate_tts_notification.delay(text)
    return jsonify({"task_id": task.id, "status": "processing"}), 202

@main_blueprint.route('/consultation/announcement', methods=['POST'])
def consultation_announcement():
    """
    Endpoint to generate the consultation announcement audio.
    Expects a JSON payload with:
      - assistant_name: Name of the virtual assistant.
      - app_name: Name of the app.
      - patient_name: Patient's full name.
      - patient_age: Patient's age.
      - last_consultation: Date/Time of the last consultation.
    """
    data = request.get_json()
    required_fields = ['assistant_name', 'app_name', 'patient_name', 'patient_age', 'last_consultation']
    missing_fields = [field for field in required_fields if field not in data]
    if missing_fields:
        return jsonify({"error": f"Missing fields: {', '.join(missing_fields)}"}), 400

    try:
        dt = datetime.strptime(data['last_consultation'], "%Y-%m-%d %H:%M")
        last_consultation_str = dt.strftime("%A, %B %d, %Y at %I:%M %p")
    except Exception:
        last_consultation_str = data['last_consultation']

    message = (
        f"Hello Doctor, I am {data['assistant_name']}, a dedicated health web assistant from {data['app_name']}. "
        f"Please note that this consultation will be recorded for the patient's future reference. "
        f"The patient, {data['patient_name']}, aged {data['patient_age']}, last consulted on {last_consultation_str}. "
        "Thank you for your cooperation and for ensuring that all discussions are accurately captured for optimal follow-up care."
    )

    task = generate_tts_notification.delay(message)
    return jsonify({"task_id": task.id, "status": "processing"}), 202

@main_blueprint.route('/consultation/record', methods=['POST'])
def record_consultation():
    """
    Endpoint to save a consultation:
      - Expects a file upload for the audio (field name: 'audio')
      - Expects metadata (form-data):
            * patient_id (unique patient identifier)
            * consultation_time (e.g., "2025-02-14 15:30")

      After saving the audio file, it will be transcribed and analyzed for action items.
    """
    # Retrieve required fields from the form data.
    patient_id = request.form.get('patient_id')
    consultation_time = request.form.get('consultation_time')  # e.g., "2025-02-14 15:30"

    if not all([patient_id, consultation_time]):
        return jsonify({"error": "Missing required fields: patient_id and consultation_time are required."}), 400

    # Retrieve patient details from Firestore (assuming they are stored in a 'patients' collection)
    patient_ref = db.collection("patients").document(patient_id)
    patient_doc = patient_ref.get()
    if not patient_doc.exists:
        return jsonify({"error": "Patient not found."}), 404

    patient_data = patient_doc.to_dict()
    patient_name = patient_data.get("name")
    patient_age = patient_data.get("age")
    patient_gender = patient_data.get("gender")

    # Validate and secure the audio file.
    if 'audio' not in request.files:
        return jsonify({"error": "No audio file provided."}), 400

    audio_file = request.files['audio']
    original_filename = secure_filename(audio_file.filename)
    unique_filename = f"{uuid.uuid4()}_{original_filename}"
    local_path = os.path.join("temp", unique_filename)

    os.makedirs("temp", exist_ok=True)
    audio_file.save(local_path)

    # Upload the file to Firebase Storage using the unique filename.
    blob = bucket.blob(f"consultations/{unique_filename}")
    blob.upload_from_filename(local_path)
    audio_url = blob.public_url

    # --- Speech-to-Text and Action Items ---
    try:
        transcript_text = transcription(local_path)
        actions = action_items(transcript_text)
    except Exception as e:
        transcript_text = ""
        actions = ""
        # Optionally, log the error for debugging.
        print(f"Error during transcription: {e}")

    # Remove the local temporary file.
    os.remove(local_path)

    # Convert consultation_time to a readable string.
    try:
        dt = datetime.strptime(consultation_time, "%Y-%m-%d %H:%M")
        consultation_time_str = dt.strftime("%A, %B %d, %Y at %I:%M %p")
    except Exception:
        consultation_time_str = consultation_time

    # Save consultation metadata to Firestore, including transcript and action items.
    consultation_data = {
        "patient_id": patient_id,
        "patient_name": patient_name,
        "patient_age": patient_age,
        "patient_gender": patient_gender,
        "consultation_time": consultation_time_str,
        "audio_url": audio_url,
        "transcript": transcript_text,
        "action_items": actions,
        "created_at": datetime.utcnow(),
        "status": "recorded"  # You might update this later after further processing.
    }

    db.collection("consultations").add(consultation_data)

    return jsonify({
        "message": "Consultation saved.",
        "audio_url": audio_url,
        "transcript": transcript_text,
        "action_items": actions
    }), 201


@main_blueprint.route('/predict_glucose', methods=['POST'])
def predict_glucose():
    """
    Endpoint to predict glucose levels 2 hours ahead based on past glucose readings.
    Expects a JSON payload with a 'readings' key containing a list of glucose readings and optional firebase
    token.
    """
    data = request.get_json()
    readings = data.get('readings', [])
    firebase_token = data.get("firebase_token") # For Push Notification

    if not readings:
        return jsonify({"error": "No glucose readings provided."}), 400

    predictor = GlucosePredictor()
    prediction = predictor.predict_next_2h(readings)
    action = predictor.generate_action_suggestion(prediction)

    def generate_audio():
        for chunk in task.get():
            yield chunk

    if firebase_token:
        task = send_glucose_notification.delay(prediction, action)

        # Send a notification with the prediction and action suggestion.
        task = send_glucose_notification.delay(firebase_token, prediction["predicted_glucose"], prediction["action"])
    
    return Response(stream_with_context(generate_audio()), content_type="audio/mpeg")