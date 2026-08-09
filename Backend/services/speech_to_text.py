import requests #Makes python communicate with the Hugging Face API
from config import API_KEY #Brings api key from config.py

# URL of the Whisper model on Hugging Face
API_URL = "https://api-inference.huggingface.co/models/openai/whisper-medium.en"

headers = {
    "Authorization": f"Bearer {API_KEY}" #dictionary used to store the authorization header with the API key for authentication    
}

def transcribe_audio(audio_path): #new function
    with open(audio_path, "rb") as audio_file: #opens the path as audio_file in read binary mode
        response = requests.post( #sending api request to the Hugging Face API with the audio file and headers
        API_URL,
        headers=headers,
        data=audio_file
)
        if response.status_code != 200: #Checks if response code is not 200, if its true then we have an error.
            print("Request failed with status:", response.status_code)
            return None

        
        result = response.json() #takes only the response data and turns it into a dictionary

        
        if "error" in result: #checks for api level errors, if there is an error then it will print the error and return None   
            print("API Error:", result["error"])
            return None

        return result["text"] #returns the transcribed text from the result dictionary