import uuid
from flask import Blueprint, request, jsonify
from datetime import datetime
from firebase_admin import firestore
from werkzeug.security import generate_password_hash, check_password_hash
from .firebase_client import db  # Use shared Firestore client

# Create a blueprint for patient-related endpoints.
patients_blueprint = Blueprint('patients', __name__)

@patients_blueprint.route('/patients/register', methods=['POST'])
def register_patient():
    """
    Registers a new patient.
    Expects a JSON payload with:
      - name
      - age
      - gender
      - email
      - password
    """
    data = request.get_json()
    required_fields = ['name', 'age', 'gender', 'email', 'password']
    missing_fields = [field for field in required_fields if field not in data]
    if missing_fields:
        return jsonify({"error": f"Missing fields: {', '.join(missing_fields)}"}), 400

    # Check if a patient with the given email already exists.
    patients_ref = db.collection("patients")
    existing = patients_ref.where("email", "==", data["email"]).limit(1).get()
    if existing:
        return jsonify({"error": "Patient with this email already exists."}), 400

    # Generate a unique patient ID.
    patient_id = str(uuid.uuid4())

    # Hash the password for secure storage.
    hashed_password = generate_password_hash(data["password"])

    # Prepare the patient data document.
    patient_data = {
        "patient_id": patient_id,
        "name": data["name"],
        "age": data["age"],
        "gender": data["gender"],  # Consider values like "Male", "Female", or additional options as needed.
        "email": data["email"],
        "password": hashed_password,
        "created_at": datetime.utcnow()
    }

    # Save the patient record to Firestore.
    patients_ref.document(patient_id).set(patient_data)

    return jsonify({"message": "Patient registered successfully.", "patient_id": patient_id}), 201

@patients_blueprint.route('/patients/login', methods=['POST'])
def login_patient():
    """
    Authenticates a patient.
    Expects a JSON payload with:
      - email
      - password
    """
    data = request.get_json()
    if not data.get("email") or not data.get("password"):
        return jsonify({"error": "Email and password are required."}), 400

    # Query Firestore for a patient with the provided email.
    patients_ref = db.collection("patients")
    query = patients_ref.where("email", "==", data["email"]).limit(1).get()
    if not query:
        return jsonify({"error": "Patient not found."}), 404

    patient_doc = query[0]
    patient_data = patient_doc.to_dict()

    # Verify the provided password against the stored hashed password.
    if not check_password_hash(patient_data["password"], data["password"]):
        return jsonify({"error": "Incorrect password."}), 400

    # In a full production system, you would generate a session token or JWT here.
    return jsonify({"message": "Login successful.", "patient_id": patient_data["patient_id"]}), 200
