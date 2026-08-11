from dotenv import load_dotenv
import os

# Load variables from .env
load_dotenv()

# Read the API key
API_KEY = os.getenv("API_KEY")

# Fail fast if it's missing, instead of letting a later API call fail with a
# confusing error deep in the request cycle.
if not API_KEY:
    raise RuntimeError(
        "API_KEY not set. Create a .env file in the project root with:\n"
        "API_KEY=your_key_here"
    )
