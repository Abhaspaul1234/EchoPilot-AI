import requests
from config import API_KEY

API_URL = "https://api-inference.huggingface.co/models/facebook/bart-large-cnn"

headers = {
    "Authorization": f"Bearer {API_KEY}"
}

def summarize_text(transcript):
    if not transcript or not transcript.strip():
        return {
            "Success": False,
            "Error": "Empty transcript, nothing to summarize."
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
        summary = result[0]["summary_text"]
    except (KeyError, IndexError, TypeError):
        return {
            "Success": False,
            "Error": "Unexpected response format from summarization model."
        }

    return {
        "Success": True,
        "Text": summary
    }