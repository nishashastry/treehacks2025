import os
from firebase_admin import credentials, initialize_app, firestore, storage
from dotenv import load_dotenv
import os

load_dotenv()

# Build the absolute path relative to this file's directory
base_dir = os.path.dirname(os.path.abspath(__file__))
firebase_key_relative = os.getenv("FIREBASE_KEY_PATH", "serviceAccountKey.json")
firebase_key_path = os.path.join(base_dir, firebase_key_relative)

# Initialize Firebase Admin SDK
cred = credentials.Certificate(firebase_key_path)
initialize_app(cred, {
    'storageBucket': os.getenv("FIREBASE_BUCKET_NAME")
})

# Create Firestore and Storage instances
db = firestore.client()
bucket = storage.bucket()
