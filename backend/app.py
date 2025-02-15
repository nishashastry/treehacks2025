from flask import Flask, request, jsonify, session
from werkzeug.security import generate_password_hash
import requests
import os 
from dotenv import load_dotenv
from flask_cors import CORS
from textblob import TextBlob

load_dotenv()  # Load variables from .env

PERPLEXITY_API_KEY = os.getenv("PERPLEXITY_API_KEY")
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
PORT = int(os.getenv("PORT", 5000))  # Default port 5000 if not set

app = Flask(__name__)
CORS(app)

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
    

# Fetch Medical Facts (Perplexity)
@app.route("/medical-info", methods=["GET", "POST"])
def medical_info():
    data = request.json
    query = data.get("query")

    response = requests.get(
        "https://api.perplexity.ai/sonar/search",
        headers={"Authorization": f"Bearer {PERPLEXITY_API_KEY}"},
        params={"query": query}
    )

    search_results = response.json()
    return jsonify({"response": search_results})

DATA_FILE = "users.json"

# Load existing users from JSON file
def load_users():
    try:
        with open(DATA_FILE, "r") as file:
            return json.load(file)
    except (FileNotFoundError, json.JSONDecodeError):
        return []

# Save users to JSON file
def save_users(users):
    with open(DATA_FILE, "w") as file:
        json.dump(users, file, indent=4)

# User Registration Endpoint
@app.route("/register", methods=["POST"])
def register():
    data = request.json
    users = load_users()

    # Add new user
    users.append({
        "name": data.get("name"),
        "age": data.get("age"),
        "gender": data.get("gender"),
        "contact": data.get("contact"),
        "diagnosis": data.get("diagnosis"),
        "diabetes_type": data.get("diabetes_type"),
        "diagnosis_date": data.get("diagnosis_date"),
        "family_history": data.get("family_history", False),
        "fasting_blood_sugar": data.get("fasting_blood_sugar"),
        "hba1c": data.get("hba1c"),
        "medications": data.get("medications"),
        "insulin_dosage": data.get("insulin_dosage")
    })

    save_users(users)

    return jsonify({"message": "User registered successfully"}), 201

if __name__ == "__main__":
    app.run(debug=True)
