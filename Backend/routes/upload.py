from flask import Blueprint, request, jsonify
import os
from database.db import db
from database.models import Session
from services.speech_to_text import transcribe_audio

upload_bp = Blueprint("upload", __name__)
@upload_bp.route("/upload", methods=["POST"])
def upload_file():

    # Get uploaded files
    audio_file = request.files.get("file")
    csv_file = request.files.get("csv")

    # Check if audio exists
    if not audio_file:
        return jsonify({
            "error": "No audio file uploaded."
        }), 400

    # Save uploaded file
    audio_path = os.path.join("uploads", audio_file.filename)
    audio_file.save(audio_path)

    # Speech-to-text
    transcript = transcribe_audio(audio_path)

    # Check transcription
    if transcript is None:
        return jsonify({
            "error": "Transcription failed."
        }), 500

    # Database operations
    try:# this block attempts to create a new session in the database with the uploaded audio file, optional CSV file, and the transcript. If any error occurs during this process, it will rollback the transaction and return an error response.

        new_session = Session(
            audio_file=audio_file.filename,
            csv_file=csv_file.filename if csv_file else None,
            transcript=transcript
        )

        db.session.add(new_session)
        db.session.commit()

    except Exception as e:

        # Undo unfinished transaction
        db.session.rollback()

        return jsonify({
            "error": "Database error.",
            "details": str(e)
        }), 500

    return jsonify({
        "session_id": new_session.id,
        "transcript": transcript,
        "audio_file": audio_file.filename,
        "csv_file": csv_file.filename if csv_file else None
    }), 200