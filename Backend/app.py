from flask import Flask  # required to create a Flask app instance
from flask_cors import CORS  # to enable Cross-Origin Resource Sharing (CORS) for the Flask app
import os  # used to create folders automatically if they don't exist

from database.db import db  # import the db object from the db.py file to initialize the database connection

from routes.history import history_bp  # import the history blueprint from the history.py file
from routes.results import results_bp  # import the results blueprint from the results.py file
from routes.upload import upload_bp  # import the upload blueprint from the upload.py file

app = Flask(__name__)  # Create a Flask app instance

# Configure the SQLite database location
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///echopilot.db"

# Disable modification tracking to reduce memory usage and remove warning messages
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# Connect the SQLAlchemy database object with the Flask application
db.init_app(app)

# Automatically create uploads and outputs folders if they do not already exist
os.makedirs("uploads", exist_ok=True)
os.makedirs("outputs", exist_ok=True)

CORS(app)  # Enable CORS for all routes

# Divides the backend into separate modules, each handling a specific set of routes and functionality.
# This helps in organizing the code and making it more maintainable.
app.register_blueprint(history_bp)  # Flask's built-in method to register the history blueprint with the main app
app.register_blueprint(results_bp)  # Register the results blueprint
app.register_blueprint(upload_bp)  # Register the upload blueprint


@app.route("/")  # decorator that defines a route for the root URL ("/") of the application
def home():  # function that handles requests to the root URL
    return {
        "status": "running",
        "message": "EchoPilot Backend is running successfully!"
    }


# Creates all database tables defined in models.py if they don't already exist
# The application context is required because SQLAlchemy needs access to the Flask app configuration
with app.app_context():
    db.create_all()


# Run server
if __name__ == "__main__":
    app.run(debug=True)