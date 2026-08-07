from dotenv import load_dotenv 
import os

# Load variables from .env
load_dotenv()

# Read the API key
HF_API_KEY = os.getenv("API_KEY")