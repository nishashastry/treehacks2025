from flask import Flask, request, jsonify, session
from werkzeug.security import generate_password_hash
from datetime import datetime
import requests
import os 
from dotenv import load_dotenv
from flask_cors import CORS
from textblob import TextBlob
from flask_sqlalchemy import SQLAlchemy

load_dotenv()  # Load variables from .env

PERPLEXITY_API_KEY = os.getenv("PERPLEXITY_API_KEY")
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
PORT = int(os.getenv("PORT", 5000))  # Default port 5000 if not set

app = Flask(__name__)
CORS(app)

# Configure the SQLAlchemy database URI
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///diabetes.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(100), nullable=False)
    dob = db.Column(db.DateTime, nullable=False)
    gender = db.Column(db.String(10), nullable=False)
    chronic_disease = db.Column(db.String(100), nullable=False)
    diabetes_type = db
    years_since_diagnosis = db.Column(db.Integer, nullable=False)

with app.app_context():
    db.create_all()

@app.route("/register", methods=["GET","POST"])
def register():
    if request.method == "GET":
        registration_form = {
            "fields": [
                {"name": "full_name", "type": "text", "label": "Full Name", "placeholder": "John Doe"},
                {"name": "email", "type": "email", "label": "Email", "placeholder": "john@example.com"},
                {"name": "password", "type": "password", "label": "Password", "placeholder": "Choose a secure password"},
                {"name": "dob", "type": "date", "label": "Date of Birth", "placeholder": "YYYY-MM-DD"},
                {"name": "gender", "type": "select", "label": "Gender", "options": ["Male", "Female", "Other"]},
                {
                    "name": "chronic_disease",
                    "type": "select",
                    "label": "Chronic Disease",
                    "options": ["Diabetes"]  
                },
                {
                    "name": "diabetes_type",
                    "type": "select",
                    "label": "Diabetes Type",
                    "options": ["Type 1", "Type 2", "Gestational"],
                    "note": "Select your type if applicable."
                },
                {
                    "name": "years_since_diagnosis",
                    "type": "number",
                    "label": "Years Since Diagnosis",
                    "min": 0,
                    "note": "Optional: How many years have you been managing diabetes?"
                }
            ]
        }
        return jsonify(registration_form)
    
    elif request.method == "POST":
        data = request.json

        # Validate required fields
        required_fields = ["full_name", "email", "password", "dob", "chronic_disease"]
        missing_fields = [field for field in required_fields if not data.get(field)]
        if missing_fields:
            return jsonify({"error": f"Missing fields: {', '.join(missing_fields)}"}), 400

        # Ensure chronic_disease is "Diabetes"
        if data.get("chronic_disease") != "Diabetes":
            return jsonify({"error": "Chronic disease must be 'Diabetes' for this registration."}), 400

        # Check for existing email
        if User.query.filter_by(email=data.get("email")).first():
            return jsonify({"error": "Email already registered."}), 400

        # Hash the password using Werkzeug
        hashed_password = generate_password_hash(data.get("password"))

        # Parse the date of birth (expecting YYYY-MM-DD format)
        try:
            dob_date = datetime.strptime(data.get("dob"), "%Y-%m-%d").date()
        except Exception:
            return jsonify({"error": "Invalid date format. Expected YYYY-MM-DD."}), 400

        # Create a new User record
        new_user = User(
            full_name=data.get("full_name"),
            email=data.get("email"),
            password=hashed_password,
            dob=dob_date,
            gender=data.get("gender"),
            chronic_disease=data.get("chronic_disease"),
            diabetes_type=data.get("diabetes_type"),
            years_since_diagnosis=data.get("years_since_diagnosis")
        )

        # Add the new user to the session and commit to the database
        db.session.add(new_user)
        db.session.commit()

        return jsonify({"message": "Registration successful", "user_id": new_user.id}), 201


def analyze_sentiment(text):
    """Detects sentiment polarity and returns a sentiment score."""
    return TextBlob(text).sentiment.polarity

def adjust_response_for_sentiment(response, sentiment_score):
    """Modifies the chatbot's response based on sentiment polarity."""
    if sentiment_score < -0.3:  # Strong negative sentiment
        return (
            "I sense you're feeling a bit down. You're not alone, and managing diabetes can be tough. "
            f"But you're doing your best! {response} Let me know how I can support you."
        )
    elif sentiment_score < 0:  # Slightly negative sentiment
        return (
            "I understand this can be frustrating. " 
            f"{response} If you need encouragement or more guidance, I'm here for you."
        )
    elif sentiment_score > 0.3:  # Strong positive sentiment
        return (
            f"That's great to hear! {response} Keep up the good work, and let me know if you need any help."
        )
    else:  # Neutral sentiment
        return response

# Home Route
@app.route("/")
def home():
    return "This is your chronic disease management buddy!"

# Chatbot for Answering FAQs (Perplexity)
@app.route("/chat", methods=["GET","POST"])
def chat():
    data = request.json
    user_input = data.get("message")
    # Retrieve chat history from session
    if "chat_history" not in session:
        session["chat_history"] = []
    
    chat_history = session["chat_history"]
    chat_history.append(user_input)
    
    # Keep the last 5 messages for context
    context = " ".join(chat_history[-5:])

    # Enhance query with diabetes-specific context
    diabetes_context = (
        "You are an AI assistant for diabetes management"
        "Consider past messages when responding"
        "Provide answers suitable for a patient with diabetes. "
        "Ensure medical accuracy and offer empathetic responses. "
        "The user may ask about blood sugar levels, insulin, diet, exercise, and emotional well-being. "
        "If necessary, suggest seeking medical consultation."
    )

    response = requests.get(
        "https://api.perplexity.ai/sonar/search",
        headers={"Authorization": f"Bearer {PERPLEXITY_API_KEY}"},
        params={"query": f"{diabetes_context} Previous chat: {context}. User: {user_input}"}
    )

    chatbot_reply = response.json().get("answer", "I understand you need coorect and clear answers. While I am here for you, I couldn't find an answer to this particularquery. Please consult a medical professional.")
   
    session["chat_history"].append(chatbot_reply)

    return jsonify({"response": chatbot_reply})
    
def refine_response(raw_response):
    if any(word in raw_response.lower() for word in ["cure", "miracle", "unproven", "unsafe"]):
        return "Please consult a licensed healthcare provider for medical guidance."
    
    return raw_response
    
if __name__ == "__main__":
    app.run(debug=True)
