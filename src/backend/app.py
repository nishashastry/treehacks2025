from flask import Flask, request, jsonify, session
from werkzeug.security import generate_password_hash
from datetime import datetime
import requests
import os 
from dotenv import load_dotenv
from flask_cors import CORS
from textblob import TextBlob
from openai import OpenAI 

app = Flask(__name__)
app.secret_key = "treehackyhacks"
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


@app.route("/chat", methods=["POST"])
def chat():
    client = OpenAI(api_key="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", base_url="https://api.perplexity.ai")
    try:
        # Retrieve user registration info stored during login/registration
        user_info = session.get("user_info", {
            "full_name": "Patient",
            "gender": "N/A",
            "diabetes_type": "N/A",
            "years_since_diagnosis": "N/A"
        })

        data = request.json
        user_input = data.get("message", "")

        if "chat_history" not in session:
            session["chat_history"] = []


        chat_history = session["chat_history"]
        chat_history.append({"role": "user", "content": user_input})

        # Construct the personalized context
        personalized_context = (
            f"Patient Name: {user_info.get('full_name')}. "
            f"Gender: {user_info.get('gender')}. "
            f"Diabetes Type: {user_info.get('diabetes_type')}. "
            f"Years Since Diagnosis: {user_info.get('years_since_diagnosis')}."
        )

        messages = [
            {"role": "system", "content": ("You are an AI assistant for diabetes management."
                                           "Provide personalized, empathetic, and medically accurate advice."
                                           "Consider past messages and any doctor visit notes when responding."
                                           "The patient may ask about blood sugar levels, insulin, diet, exercise, and emotional well-being."
                                           f"Patient context: {personalized_context} "
                                           "Do not make up things or say anything that is not backed by evidence"
                                           "You are an assistant, not a doctor.")},
        ] + chat_history[-5:]

        response = client.chat.completions.create(
            model="sonar-pro",
            messages=messages
        )

        chatbot_reply = response.choices[0].message.content if response.choices else "Sorry, I couldn't process that request."
        processed_reply = refine_response(chatbot_reply)
        
        chat_history.append({"role": "assistant", "content": processed_reply})
        session["chat_history"] = chat_history  # Update session

        return jsonify({"response": processed_reply})

    except Exception as e:
        return jsonify({"error": f"API request failed: {str(e)}"}), 500
    

def refine_response(raw_response):
    """Filter unsafe responses"""
    if any(word in raw_response.lower() for word in ["cure", "miracle", "unproven", "unsafe"]):
        return "Please consult a licensed healthcare provider for medical guidance."
    return raw_response


if __name__ == "__main__":
    app.run(debug=True)
