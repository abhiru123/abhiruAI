from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

app = Flask(__name__)
CORS(app)

# Configure the generative AI model
try:
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
except AttributeError as e:
    print(f"Error: The GEMINI_API_KEY environment variable is not set. {e}")
    # exit(1) # Consider exiting if the key is essential for the app to run

@app.route('/')
def hello():
    return 'Hello, World! The backend is running.'

@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    if not data or 'contents' not in data:
        return jsonify({"error": "Invalid request body, 'contents' is required."}), 400

    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(data['contents'])
        return jsonify(response.to_dict())
    except Exception as e:
        print(f"Error generating content: {e}")
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5001)
