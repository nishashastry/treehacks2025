# MedMentor 🤝
## Overview
This project is a Health Companion Assistant built for TreeHacks 🌳💡. Our goal is to empower patients during and after their consultations by providing an intelligent companion that records, transcribes, and summarizes their doctor visits. In its beta development phase, the app focuses on diabetes 🍬, while future iterations will expand support to broader chronic disease management and personalized symptom tracking.

## What It Does
- **Consultation Recording & Transcription** 🎤➡️📝: The app records doctor visits and automatically transcribes the audio using advanced AI-powered speech-to-text technology. This ensures that every detail of the consultation is captured for future reference.
- **Actionable Insights** 💡✅: After transcription, the app processes the transcript to generate a clear summary and a list of recommended action items. This helps patients understand their treatment plan and know the next steps to take.
- **Context-Aware Chatbot Support** 🤖💬: Our chatbot is truly context aware! It uses the transcripts, past consultation notes, and additional patient data as a dynamic knowledge base to provide personalized, empathetic, and medically informed advice. Whether you’re asking about blood sugar management, insulin, or lifestyle changes, the assistant tailors its responses to your unique context.
- **Patient Management** 🔐👤: Patients can register and log in securely. Their details—such as name, email, date of birth, gender, and information about diabetes—are stored securely. This helps provide personalized insights and improves the overall experience.

## Future Development 🚀
- **Extended Chronic Disease Support**: While our beta version focuses on diabetes, future updates will expand support to other chronic diseases. The app will offer detailed symptom tracking, personalized treatment recommendations, and more comprehensive health management features.
- **Advanced Symptom Analysis**: We plan to integrate tools for real-time symptom analysis and more dynamic insights based on a wider range of health data.

## Technologies Used
- **Frontend**: To-add
- **Backend**:
    - Flask for the web server and API endpoints.
    - Firebase (Firestore & Storage) for real-time data storage and scalable file storage.
    - Celery for asynchronous processing.
- **AI & Speech Processing**:
    - ElevenLabs API for high-quality text-to-speech conversion.
    - OpenAI API for speech-to-text transcription and for generating context-aware chatbot responses.
    - Perplexity API as part of our chatbot backend to ensure responses are tailored and reliable.

## Why It Matters ❤️
Our Health Companion Assistant is designed to bridge the gap between patients and their healthcare providers by ensuring no detail is missed during consultations. By automating transcription and generating actionable insights, the app empowers patients to take control of their health and follow up effectively on doctor visits. With a context-aware chatbot that leverages transcripts and patient data as a knowledge base, users receive personalized advice tailored to their individual needs. While initially focused on diabetes in beta, our roadmap includes broader support for chronic diseases, paving the way for a healthier future.
