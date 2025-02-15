from flask import Flask, request, jsonify
import requests
import os 
from dotenv import load_dotenv
from flask_cors import CORS
CORS(app)

load_dotenv()  # Load variables from .env

PERPLEXITY_API_KEY = os.getenv("PERPLEXITY_API_KEY")
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
PORT = int(os.getenv("PORT", 5000))  # Default port 5000 if not set

app = Flask(__name__)

# Home Route
@app.route("/")
def home():
    return "This is your chronic disease management buddy!"

# Chatbot for Answering FAQs (Perplexity)
@app.route("/chat", methods=["POST"])
def chat():
    data = request.json
    user_input = data.get("message")

    response = requests.get(
        "https://api.perplexity.ai/sonar/search",
        headers={"Authorization": f"Bearer {PERPLEXITY_API_KEY}"},
        params={"query": user_input}
    )

    chatbot_reply = response.json()["answer"]
    return jsonify({"response": chatbot_reply})

# Fetch Medical Facts (Perplexity)
@app.route("/medical-info", methods=["POST"])
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


if __name__ == "__main__":
    app.run(debug=True)