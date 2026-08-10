import requests
from config import API_KEY

API_URL = "https://router.huggingface.co/hf-inference/models/openai/whisper-medium.en"

headers = {
    "Authorization": f"Bearer {API_KEY}"
}

def analyze_sentiment(transcript):
    if not transcript or not transcript.strip():
        return {
            "Success": False,
            "Error": "Empty transcript, nothing to analyze."
        }

    response = requests.post(
        API_URL,
        headers=headers,
        json={"inputs": transcript}
    )
    result = response.json()

    if isinstance(result, dict) and "error" in result:
        return {
            "Success": False,
            "Error": result["error"]
        }

    try:
        # Model returns a nested list: [[{"label": "...", "score": ...}, ...]]
        scores = result[0] if isinstance(result[0], list) else result
        top = max(scores, key=lambda x: x["score"])
        label = top["label"]
    except (KeyError, IndexError, TypeError):
        return {
            "Success": False,
            "Error": "Unexpected response format from sentiment model."
        }

    return {
        "Success": True,
        "Text": label
    }