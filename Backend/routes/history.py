from flask import jsonify,Blueprint
from database.models import Session
import os
import json
history_bp= Blueprint("history", __name__) #history blueprint for the history route, allowing for modular organization of the application
@history_bp.route("/history",methods=["GET"])
def get_history():
    sessions=Session.query.order_by(Session.created_at.desc()).all() # returns all the data in a sorted manner newest first
    history=[]
    for session in sessions:
        history.append({
    "id": session.id,
    "audio_file": session.audio_file,
    "csv_file": session.csv_file,
    "transcript": session.transcript,
    "summary": session.summary,
    "sentiment": session.sentiment,
    "keywords": session.keywords,
    "created_at": session.created_at.isoformat()
})
    return jsonify(history),200