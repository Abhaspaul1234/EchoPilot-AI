import requests
import os
from config import API_KEY

API_URL = "https://router.huggingface.co/hf-inference/models/openai/whisper-large-v3"

headers_base = {
    "Authorization": f"Bearer {API_KEY}"
}

def transcribe_audio(audio_path):
    ext = os.path.splitext(audio_path)[1].lower()
    content_type = "audio/mpeg" if ext == ".mp3" else "audio/wav"

    headers = {
        **headers_base,
        "Content-Type": content_type
    }

    with open(audio_path, "rb") as audio_file:
        response = requests.post(
            API_URL,
            headers=headers,
            data=audio_file
        )

        if response.status_code != 200:
            print("Request failed with status:", response.status_code)
            print("Response body:", response.text)
            return {
                "Success": False,
                "Error": f"HTTP {response.status_code}: {response.text}"
            }

        result = response.json()

        if "error" in result:
            print("API Error:", result["error"])
            return {
                "Success": False,
                "Error": result["error"]
            }

        return {
            "Success": True,
            "Text": result["text"]
        }