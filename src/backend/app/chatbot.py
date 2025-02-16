import os
from flask import Blueprint, request, jsonify, session
from openai import OpenAI
from flask_cors import CORS

chatbot_blueprint = Blueprint('chatbot', __name__)

# Create a Perplexity client using the custom base URL and API key.
perplexity_api_key = os.getenv("PERPLEXITY_API_KEY")
client = OpenAI(api_key=perplexity_api_key, base_url="https://api.perplexity.ai")

@chatbot_blueprint.route("/chat", methods=["POST"])
def chat():
    """
    Chat endpoint that uses Perplexity to generate chatbot responses.
    Expects a JSON payload with:
      - message: the user’s message.

    Uses session to store recent chat history and constructs a personalized context.
    """
    try:
        user_info = session.get("user_info", {
            "full_name": "Patient",
            "gender": "N/A",
            "diabetes_type": "N/A",
            "years_since_diagnosis": "N/A"
        })

        data = request.get_json()
        user_input = data.get("message", "")

        if "chat_history" not in session:
            session["chat_history"] = []
        chat_history = session["chat_history"]
        chat_history.append({"role": "user", "content": user_input})

        # Construct personalized context from user_info.
        personalized_context = (
            f"Patient Name: {user_info.get('full_name')}. "
            f"Gender: {user_info.get('gender')}. "
            f"Diabetes Type: {user_info.get('diabetes_type')}. "
            f"Years Since Diagnosis: {user_info.get('years_since_diagnosis')}."
        )

        messages = [
            {
                "role": "system",
                "content": (
                    "You are an AI assistant for diabetes management. Provide personalized, empathetic, "
                    "and medically accurate advice. Consider past messages and any doctor visit notes when responding. "
                    "The patient may ask about blood sugar levels, insulin, diet, exercise, and emotional well-being. "
                    f"Patient context: {personalized_context} "
                    "Do not fabricate information and remain evidence-based."
                )
            }
        ] + chat_history[-5:]

        response = client.chat.completions.create(
            model="sonar-pro",  # Using Sonar Pro model for its advances reasoning abilities
            messages=messages
        )

        chatbot_reply = response.choices[0].message.content if response.choices else "I am sorry, I understand you need clear answers but I am currently unable to process that. You should seek professional medical advice."
        chat_history.append({"role": "assistant", "content": chatbot_reply})
        session["chat_history"] = chat_history

        return jsonify({"response": chatbot_reply})
    except Exception as e:
        return jsonify({"error": f"API request failed: {str(e)}"}), 500