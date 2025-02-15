# app/routes.py
import os
import uuid
from flask import Blueprint, request, jsonify
from datetime import datetime
from werkzeug.utils import secure_filename
from firebase_admin import credentials, initialize_app, storage, firestore

from app.tasks import generate_tts_notification

# --- Firebase Initialization ---
# Load the environment variable for the service account key path.
firebase_key_relative = os.getenv("FIREBASE_KEY_PATH")
base_dir = os.path.dirname(os.path.abspath(__file__))
firebase_key_path = os.path.join(base_dir, firebase_key_relative)

# Initialize Firebase Admin SDK
cred = credentials.Certificate(firebase_key_path)
initialize_app(cred, {
    'storageBucket': os.getenv("FIREBASE_BUCKET_NAME")  # e.g., "your-project-id.appspot.com"
})
db = firestore.client()
bucket = storage.bucket()

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
      - Expects metadata in form-data: 
          * patient_id (unique identifier for the patient)
          * consultation_time (e.g., "2025-02-14 15:30")
    """
    # We now require only the patient_id and consultation_time in addition to the file.
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
    # Expect patient_data to have at least: name, age, and gender.
    patient_name = patient_data.get("name")
    patient_age = patient_data.get("age")
    patient_gender = patient_data.get("gender")

    # Validate and secure the audio file
    if 'audio' not in request.files:
        return jsonify({"error": "No audio file provided."}), 400

    audio_file = request.files['audio']
    original_filename = secure_filename(audio_file.filename)
    unique_filename = f"{uuid.uuid4()}_{original_filename}"
    local_path = os.path.join("temp", unique_filename)

    os.makedirs("temp", exist_ok=True)
    audio_file.save(local_path)

    # Upload the file to Firebase Storage using the unique filename
    blob = bucket.blob(f"consultations/{unique_filename}")
    blob.upload_from_filename(local_path)
    audio_url = blob.public_url

    os.remove(local_path)

    try:
        dt = datetime.strptime(consultation_time, "%Y-%m-%d %H:%M")
        consultation_time_str = dt.strftime("%A, %B %d, %Y at %I:%M %p")
    except Exception:
        consultation_time_str = consultation_time

    # Save the consultation metadata in Firestore.
    consultation_data = {
        "patient_id": patient_id,
        "patient_name": patient_name,
        "patient_age": patient_age,
        "patient_gender": patient_gender,
        "consultation_time": consultation_time_str,
        "audio_url": audio_url,
        "created_at": datetime.utcnow(),
        "status": "recorded"
    }

    db.collection("consultations").add(consultation_data)

    return jsonify({"message": "Consultation saved.", "audio_url": audio_url}), 201
