# app/routes.py
from flask import Blueprint, request, jsonify
from app.tasks import generate_tts_notification

# Create a blueprint for our main routes
main_blueprint = Blueprint('main', __name__)

@main_blueprint.route('/notify', methods=['POST'])
def notify():
    """
    Endpoint to receive a notification request.
    Expects a JSON payload with a 'text' key.
    """
    data = request.get_json()
    text = data.get('text', '')

    # Check if text was provided in the payload
    if not text:
        return jsonify({"error": "No text provided"}), 400

    # Enqueue the Celery task to process the text-to-speech conversion
    task = generate_tts_notification.delay(text)

    # Return the task id and a processing status
    return jsonify({"task_id": task.id, "status": "processing"}), 202
