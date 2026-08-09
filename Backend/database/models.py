from datetime import datetime

from database.db import db
class Session(db.Model):
    __tablename__ = "sessions"

    # Unique ID for every session
    id = db.Column(db.Integer, primary_key=True)

    # Uploaded audio filename
    audio_file = db.Column(db.String(255), nullable=False)

    # Uploaded CSV filename (optional)
    csv_file = db.Column(db.String(255), nullable=True)

    # Speech-to-text transcript
    transcript = db.Column(db.Text, nullable=False)

    # Summary of the transcript     
    summary = db.Column(db.Text, nullable=True)

    # Sentiment analysis result     
    sentiment = db.Column(db.Text, nullable=True)

    # Keywords extracted from the transcript    
    keywords = db.Column(db.Text, nullable=True)

    # Automatically stores upload date and time
    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,#utcnow is responsible for automating the storage of the current date and time when a new session is created 
        nullable=False
    )