import requests
from config import API_KEY

API_URL = "https://router.huggingface.co/hf-inference/models/facebook/bart-large-mnli"

headers = {
    "Authorization": f"Bearer {API_KEY}"
}

def extract_keywords(transcript):
    if not transcript or not transcript.strip():
        return {
            "Success": False,
            "Error": "Empty transcript, nothing to extract keywords from."
        }

    candidate_labels = [
        "collision", "penalty", "tire issue", "communication breakdown",
        "overtaking", "pit strategy", "frustration", "car damage"
    ]

    response = requests.post(
        API_URL,
        headers=headers,
        json={
            "inputs": transcript[:1500],
            "parameters": {"candidate_labels": candidate_labels}
        }
    )

    print("Keyword status:", response.status_code)
    print("Keyword response:", response.text)
    result = response.json()

    if isinstance(result, dict) and "error" in result:
        return {
            "Success": False,
            "Error": result["error"]
        }

    try:
        paired = sorted(zip(result["labels"], result["scores"]), key=lambda x: x[1], reverse=True)
        top_labels = [label for label, score in paired[:3]]
    except (KeyError, TypeError):
        return {
        "Success": False,
        "Error": "Unexpected response format from keyword model."
    }
    return {
        "Success": True,
        "Text": top_labels
    }