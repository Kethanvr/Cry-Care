from flask import Flask, request, jsonify, render_template
import google.generativeai as genai
import json
from flask_cors import CORS  # Importing CORS
from flask_socketio import SocketIO  # Import SocketIO for real-time communication
import random  # Add this for test data

app = Flask(__name__)

# Enable CORS to allow requests from frontend
CORS(app)

# Initialize Socket.IO
socketio = SocketIO(app, cors_allowed_origins="*")

# Configure Gemini API
genai.configure(api_key="AIzaSyCp4BG3Rrt7LpVqCCUIJD8fkKv_9S10V1M")
model = genai.GenerativeModel("gemini-1.5-flash")

# Keep track of the latest status
latest_status = {
    "status": "",
    "situation": "",
    "recommendation": ""
}

@app.route('/.well-known/appspecific/com.chrome.devtools.json')
def chrome_devtools():
    return jsonify({})

# Route for dashboard page
@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html')

# Route for home page
@app.route('/')
def home():
    return render_template('home.html')

# Route for chat page
@app.route('/chat')
def chat_page():
    return render_template('chat.html')

# Store conversation history for each session
conversation_history = {}

@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    message = data.get("message", "").strip()
    conversation_id = data.get("conversationId", "default")
    
    # Initialize or retrieve conversation history
    if conversation_id not in conversation_history:
        conversation_history[conversation_id] = []
    
    # Add the user message to history
    conversation_history[conversation_id].append({"role": "user", "message": message})
    
    # Keep only the last 10 messages in history to avoid token limits
    if len(conversation_history[conversation_id]) > 10:
        conversation_history[conversation_id] = conversation_history[conversation_id][-10:]
    
    try:
        # Build conversation context from history
        context = "\n".join([
            f"{'Assistant' if msg['role'] == 'assistant' else 'User'}: {msg['message']}"
            for msg in conversation_history[conversation_id]
        ])
        
        # Use Gemini to generate a response with context
        prompt = (
            f"You are an AI baby care assistant named CryCare. Your job is to provide helpful, friendly, and nurturing advice to parents.\n"
            f"Current date: May 15, 2025\n"
            f"Previous conversation:\n{context}\n\n"
            f"Respond to the user's latest message in a warm, supportive tone as if you're an experienced caregiver.\n"
            f"Keep your response concise (1-3 sentences) but informative. If the user asks about baby cries or developmental milestones, provide specific, age-appropriate guidance."
        )
        
        response = model.generate_content(prompt)
        
        # Add the assistant response to history
        conversation_history[conversation_id].append({"role": "assistant", "message": response.text})
        
        return jsonify({
            "response": response.text,
            "conversationId": conversation_id
        })
    except Exception as e:
        print(f"Error in chat endpoint: {str(e)}")
        return jsonify({"response": "I'm sorry, I couldn't process your request. Please try again."}), 500

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

@app.route('/test-update', methods=['GET'])
def test_update():
    """Test endpoint to simulate hardware updates"""
    test_statuses = [
        "The baby is hungry",
        "The baby is crying",
        "The baby is scared",
        "Baby is burping"
    ]
    
    # Pick a random status
    status = random.choice(test_statuses)
    
    # Use the existing baby_status logic
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
        response = model.generate_content(prompt)
        advice_json = json.loads(response.text)
        
        response_data = {
            "status": status,
            "situation": advice_json.get("situation", ""),
            "recommendation": advice_json.get("recommendations", [])[0] if advice_json.get("recommendations") else ""
        }
        
        # Update latest status
        global latest_status
        latest_status = response_data
        
        # Emit through Socket.IO
        socketio.emit('status_update', response_data)
        
        return jsonify({"message": "Test update sent successfully", "data": response_data})
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=3000, debug=True, allow_unsafe_werkzeug=True)
