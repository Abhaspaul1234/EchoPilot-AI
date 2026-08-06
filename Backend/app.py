from flask import Flask #required to create a Flask app instance
from flask_cors import CORS #to enable Cross-Origin Resource Sharing (CORS) for the Flask app
from routes.history import history_bp # import the history blueprint from the history.py file
from routes.results import results_bp # import the results blueprint from the results.py file
from routes.upload import upload_bp # import the upload blueprint from the upload.py file

app = Flask(__name__) # Create a Flask app instance    
CORS(app) # Enable CORS for all routes
#divides the backend into separate modules, each handling a specific set of routes and functionality. This helps in organizing the code and making it more maintainable.
app.register_blueprint(history_bp)#flasks builtin object to register the blueprint with the main Flask app instance
app.register_blueprint(results_bp)
app.register_blueprint(upload_bp)
@app.route("/") #decorator that defines a route for the root URL ("/") of the application the function execute when a request is made to this URL
def home(): #function that handles requests to the root URL
   return {
        "status": "running", 
        "message": "EchoPilot Backend is running successfully!"
    }
# Run server
if __name__ == "__main__":
    app.run(debug=True)





