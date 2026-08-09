from flask import Blueprint, request, jsonify
import os

from database.db import db
from database.models import Session
from services.speech_to_text import transcribe_audio

# Create blueprint
upload_bp = Blueprint("upload", __name__)


@upload_bp.route("/upload", methods=["POST"])
def upload_file():
    # =============================
    # Get files from request
    # =============================
    audio_file = request.files.get("audio")
    csv_file = request.files.get("csv")

    if not audio_file:
        return jsonify({"error": "No audio file uploaded"}), 400

    # =============================
    # Ensure upload folder exists
    # =============================
    os.makedirs("uploads", exist_ok=True)

    # Save files
    audio_path = os.path.join("uploads", audio_file.filename)
    audio_file.save(audio_path)

    csv_filename = None
    if csv_file:
        csv_path = os.path.join("uploads", csv_file.filename)
        csv_file.save(csv_path)
        csv_filename = csv_file.filename

    # =============================
    # Transcribe audio
    # =============================
    result = transcribe_audio(audio_path)

    if not result or not result.get("Success"):
        return jsonify({
            "error": result.get("Error", "Transcription failed")
        }), 500

    transcript = result.get("Text", "")

    # =============================
    # Create DB session entry
    # =============================
    new_session = Session(
        audio_file=audio_file.filename,
        csv_file=csv_filename,
        transcript=transcript,

        # Placeholder fields (you will upgrade later)
        summary="Not generated yet",
        sentiment="Not analyzed",
        keywords="N/A"
    )

    try:
        db.session.add(new_session)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "error": "Database error",
            "details": str(e)
        }), 500

    # =============================
    # Return clean response
    # =============================
    return jsonify({
        "session_id": new_session.id,
        "transcript": transcript,
        "audio_file": audio_file.filename,
        "csv_file": csv_filename
    }), 200