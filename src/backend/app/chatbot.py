# app/chatbot.py
import os
from flask import Blueprint, request, jsonify, session
from openai import OpenAI
from flask_cors import CORS
from .firebase_client import db  # if needed for user info, etc.

chatbot_blueprint = Blueprint('chatbot', __name__)
# Optionally, apply CORS to this blueprint if needed.

# Create a Perplexity client using the custom base URL and API key.
perplexity_api_key = os.getenv("PERPLEXITY_API_KEY")
client = OpenAI(api_key=perplexity_api_key, base_url="https://api.perplexity.ai")

@chatbot_blueprint.route("/chat", methods=["POST"])
def chat():
    """
    Chat endpoint that uses a session-stored conversation history as short-term memory.
    Expects a JSON payload with:
      - message: the user's message.

    The endpoint appends the new message to the session-based chat history, sends the last several messages as context,
    and returns the chatbot's response.
    """
    data = request.get_json()
    user_input = data.get("message", "").strip()
    if not user_input:
        return jsonify({"error": "No message provided."}), 400

    # Initialize chat history in session if it doesn't exist.
    if "chat_history" not in session:
        session["chat_history"] = []

    chat_history = session["chat_history"]

    # Append the new user message to chat history.
    chat_history.append({"role": "user", "content": user_input})

    # Build the conversation context.
    # Optionally, you could include a system prompt for general instructions.
    messages = [
        {
            "role": "system",
            "content": (
                "You are an AI assistant for general health consultation. Provide personalized, empathetic, "
                "and evidence-based advice. Use the conversation context provided to inform your responses."
            )
        }
    ] + chat_history[-10:]  # Use the last 10 messages as context.

    try:
        response = client.chat.completions.create(
            model="sonar-pro",  # Replace with the appropriate model name if needed.
            messages=messages
        )
        chatbot_reply = response.choices[0].message.content if response.choices else "I'm sorry, I couldn't process that."
    except Exception as e:
        return jsonify({"error": f"API request failed: {str(e)}"}), 500

    # Append the chatbot's response to the conversation history.
    chat_history.append({"role": "assistant", "content": chatbot_reply})
    session["chat_history"] = chat_history

    return jsonify({"response": chatbot_reply})