import requests
from config import API_KEY

API_URL = "https://router.huggingface.co/hf-inference/models/openai/whisper-large-v3"
headers = {
    "Authorization": f"Bearer {API_KEY}"
}

def extract_keywords(transcript):
    if not transcript or not transcript.strip():
        return {
            "Success": False,
            "Error": "Empty transcript, nothing to extract keywords from."
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
        keywords = list({item["word"] for item in result})
    except (KeyError, TypeError):
        return {
            "Success": False,
            "Error": "Unexpected response format from keyword model."
        }

    return {
        "Success": True,
        "Text": keywords
    }