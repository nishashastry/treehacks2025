import uuid
from flask import Blueprint, request, jsonify
from datetime import datetime
from firebase_admin import firestore
from werkzeug.security import generate_password_hash, check_password_hash
from .firebase_client import db  # Use shared Firebase client

# Create a blueprint for patient-related endpoints.
patients_blueprint = Blueprint('patients', __name__)

@patients_blueprint.route('/patients/register', methods=['POST'])
def register_patient():
    """
    Registers a new patient.
    Expects a JSON payload with the following required fields:
      - name: Full name of the patient.
      - email: Patient's email address.
      - password: Plain-text password (will be hashed).
      - dob: Date of birth in "YYYY-MM-DD" format.
      - chronic_disease: For this app, must be "Diabetes".
    Optional fields:
      - gender: Defaults to "Not Specified" if missing.
      - years_since_diagnosis: Defaults to 0 if missing or invalid.
    """
    data = request.get_json()

    # Define required fields.
    required_fields = ['name', 'email', 'password', 'dob', 'chronic_disease']
    missing_fields = [field for field in required_fields if not data.get(field)]
    if missing_fields:
        return jsonify({"error": f"Missing required fields: {', '.join(missing_fields)}"}), 400

    # Enforce that chronic_disease is "Diabetes" (case-insensitive).
    if data.get("chronic_disease", "").lower() != "diabetes":
        return jsonify({"error": "Chronic disease must be 'Diabetes' for this registration."}), 400

    # Check if a patient with the given email already exists.
    patients_ref = db.collection("patients")
    existing = patients_ref.where("email", "==", data["email"]).limit(1).get()
    if existing:
        return jsonify({"error": "Patient with this email already exists."}), 400

    # Generate a unique patient ID.
    patient_id = str(uuid.uuid4())
    hashed_password = generate_password_hash(data["password"])

    # Parse the date of birth.
    try:
        dob_date = datetime.strptime(data["dob"], "%Y-%m-%d").date()
    except Exception:
        return jsonify({"error": "Invalid date format for dob. Expected YYYY-MM-DD."}), 400

    # Set optional fields with defaults.
    gender = data.get("gender", "Not Specified")
    try:
        years_since_diagnosis = int(data.get("years_since_diagnosis", 0))
    except ValueError:
        years_since_diagnosis = 0

    # Prepare the patient data document.
    patient_data = {
        "patient_id": patient_id,
        "name": data["name"],
        "email": data["email"],
        "password": hashed_password,
        "dob": data["dob"],
        "gender": gender,
        "chronic_disease": data["chronic_disease"],
        "years_since_diagnosis": years_since_diagnosis,
        "created_at": datetime.utcnow().isoformat()
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
    Returns a success message and the patient_id on successful authentication.
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
    if not check_password_hash(patient_data["password"], data.get("password")):
        return jsonify({"error": "Incorrect password."}), 400

    # In a full production system, you would generate a session token or JWT here.
    return jsonify({"message": "Login successful.", "patient_id": patient_data["patient_id"]}), 200
