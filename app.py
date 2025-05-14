from flask import Flask, request, jsonify, render_template
import google.generativeai as genai
import json
from flask_cors import CORS  # Importing CORS
from flask_socketio import SocketIO  # Import SocketIO for real-time communication

app = Flask(__name__)

# Enable CORS to allow requests from frontend
CORS(app)

# Initialize Socket.IO
socketio = SocketIO(app, cors_allowed_origins="*")

# Configure Gemini API
genai.configure(api_key="AIzaSyCp4BG3Rrt7LpVqCCUIJD8fkKv_9S10V1M")
model = genai.GenerativeModel("gemini-1.5-flash")

@app.route('/')
def home():
    return render_template('index.html')

# Keep track of the latest status
latest_status = {
    "status": "",
    "situation": "",
    "recommendation": ""
}

@app.route('/baby-status', methods=['POST'])
def baby_status():
    data = request.get_json()
    status = data.get("status", "").strip()

    print(f"📥 Status received: {status}")

    # Check if the status is unknown
    if status.lower().startswith("unknown"):
        return jsonify({"error": "Status is unknown"}), 400  # Return error if status is unknown

    # Improved prompt for Gemini
    prompt = (
        f"The baby is currently: '{status}'.\n"
        "Reply ONLY with a JSON object in this format:\n"
        "{\n"
        '  \"situation\": \"Brief explanation of the baby\'s status\",\n'
        '  \"recommendations\": [\n'
        '    \"Advice with a short message like an old grandmother.\",\n'
        
        "  ]\n"
        "}\n"
        "Do not include any text before or after the JSON. Just return the raw JSON only."
    )

    try:
        # Get response from Gemini
        response = model.generate_content(prompt)

        # Print raw response for debugging
        print("🧠 Raw Gemini response:")
        print(response.text)

        # Attempt to parse the response as JSON
        advice_json = json.loads(response.text)
        
        # Log the parsed response for debugging
        print("✅ Parsed JSON:", advice_json)

        # Prepare the response
        response_data = {
            "status": status,
            "situation": advice_json.get("situation", ""),
            "recommendation": advice_json.get("recommendations", [])[0] if advice_json.get("recommendations") else ""
        }
        
        # Store the latest status
        global latest_status
        latest_status = response_data
        
        # Emit the data to all connected clients via Socket.IO
        socketio.emit('status_update', response_data)
        
        return jsonify(response_data)

    except json.JSONDecodeError as e:
        print(f"❌ JSON Decode Error: {e}")
        return jsonify({
            "error": "Invalid JSON from Gemini",
            "raw_response": response.text
        }), 500

@app.route('/get-latest-status')
def get_latest_status():
    return jsonify(latest_status)

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, debug=True, allow_unsafe_werkzeug=True)
