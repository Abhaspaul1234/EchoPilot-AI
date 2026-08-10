from flask import Blueprint, request, jsonify
import os

from database.db import db
from database.models import Session
from services.speech_to_text import transcribe_audio
from services.summarize import summarize_text
from services.sentiment import analyze_sentiment
from services.keyword import extract_keywords

upload_bp = Blueprint("upload", __name__)


@upload_bp.route("/upload", methods=["POST"])
def upload_file():
    audio_file = request.files.get("audio")
    csv_file = request.files.get("csv")

    if not audio_file:
        return jsonify({"error": "No audio file uploaded"}), 400

    os.makedirs("uploads", exist_ok=True)

    audio_path = os.path.join("uploads", audio_file.filename)
    audio_file.save(audio_path)

    csv_filename = None
    if csv_file:
        csv_path = os.path.join("uploads", csv_file.filename)
        csv_file.save(csv_path)
        csv_filename = csv_file.filename

    # Transcribe
    stt_result = transcribe_audio(audio_path)
    if not stt_result:
        return jsonify({"error": "Transcription service returned no response"}), 500
    if not stt_result.get("Success"):
        return jsonify({"error": stt_result.get("Error", "Transcription failed")}), 500
    transcript = stt_result.get("Text", "")

    # Summarize
    summary_result = summarize_text(transcript)
    summary = summary_result.get("Text") if summary_result.get("Success") else "Summary unavailable"

    # Sentiment
    sentiment_result = analyze_sentiment(transcript)
    sentiment = sentiment_result.get("Text") if sentiment_result.get("Success") else "Unavailable"

    # Keywords
    keyword_result = extract_keywords(transcript)
    keywords = ", ".join(keyword_result.get("Text", [])) if keyword_result.get("Success") else "Unavailable"

    new_session = Session(
        audio_file=audio_file.filename,
        csv_file=csv_filename,
        transcript=transcript,
        summary=summary,
        sentiment=sentiment,
        keywords=keywords
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

    return jsonify({
        "session_id": new_session.id,
        "transcript": transcript,
        "summary": summary,
        "sentiment": sentiment,
        "keywords": keywords,
        "audio_file": audio_file.filename,
        "csv_file": csv_filename
    }), 200