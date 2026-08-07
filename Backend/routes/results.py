from flask import Blueprint, jsonify

from database.models import Session

# Blueprint for results-related routes
results_bp = Blueprint("results", __name__)


# Route to retrieve a single session by its ID
@results_bp.route("/results/<int:session_id>", methods=["GET"])
def get_result(session_id):

    # Search for the requested session in the database
    session = Session.query.get(session_id)

    # Check if the session exists
    if session is None:
        return jsonify({
            "error": "Session not found."
        }), 404

    # Return the session details
    return jsonify({
        "id": session.id,
        "audio_file": session.audio_file,
        "csv_file": session.csv_file,
        "transcript": session.transcript,
        "summary": session.summary,
        "sentiment": session.sentiment,
        "keywords": session.keywords,
        "created_at": session.created_at.isoformat()
    }), 200