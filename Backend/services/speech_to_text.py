import requests #Makes python communicate with the Hugging Face API
from config import API_KEY #Brings api key from config.py

# URL of the Whisper model on Hugging Face
API_URL = "https://api-inference.huggingface.co/models/openai/whisper-medium.en"

headers = {
    "Authorization": f"Bearer {API_KEY}" #dictionary used to store the authorization header with the API key for authentication    
}

def transcribe_audio(audio_path): #new function
    with open(audio_path, "rb") as audio_file: #opens the path as audio_file in read binary mode
        #sending api request to the Hugging Face API with the audio file and headers
        response = requests.post(
        API_URL,
        headers=headers,
        data=audio_file
)