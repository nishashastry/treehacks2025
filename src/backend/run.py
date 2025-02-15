# run.py
from app import create_app

# Create an instance of the Flask application using our factory function.
app = create_app()

if __name__ == '__main__':
    # Start the Flask development server
    app.run(debug=True)
