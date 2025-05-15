from flask import Flask, request, jsonify, render_template
import google.generativeai as genai
import json
from flask_cors import CORS  # Importing CORS
from flask_socketio import SocketIO  # Import SocketIO for real-time communication
import random  # Add this for test data
from datetime import datetime  # Import datetime for timestamps

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

# Route for response page
@app.route('/response')
def response_page():
    return render_template('response.html', current_time=datetime.now().strftime('%Y-%m-%d %H:%M:%S'))

# Route for history page
@app.route('/history')
def history():
    return render_template('history.html')

# Route for settings page
@app.route('/settings')
def settings():
    return render_template('settings.html')

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
    
    # Add the device IP to the data (for display in Response page)
    data['ip'] = request.remote_addr
    data['timestamp'] = datetime.now().isoformat()

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
        print(response.text)        # Attempt to parse the response as JSON
        advice_json = json.loads(response.text)
        
        # Log the parsed response for debugging
        print("✅ Parsed JSON:", advice_json)
        
        # Prepare the response
        response_data = {
            "status": status,
            "situation": advice_json.get("situation", ""),
            "recommendation": advice_json.get("recommendations", [])[0] if advice_json.get("recommendations") else "",
            "ip": request.remote_addr,
            "timestamp": datetime.now().isoformat()
        }
        
        # Store the latest status
        global latest_status, hardware_data_log
        latest_status = response_data
        
        # Add to hardware data log
        hardware_data_log.append(response_data)
        # Keep log at a reasonable size
        if len(hardware_data_log) > 100:
            hardware_data_log = hardware_data_log[-100:]
        
        # Emit the data to all connected clients via Socket.IO
        socketio.emit('status_update', response_data)
        socketio.emit('hardware_data', response_data)  # Send to Response page
        
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

# Store cry history records
cry_history = []

@app.route('/record-cry', methods=['POST'])
def record_cry():
    """Record a cry event in the history"""
    try:
        data = request.get_json()
        timestamp = data.get('timestamp', None) or datetime.now().isoformat()
        
        # Create history record
        record = {
            'id': len(cry_history) + 1,
            'status': data.get('status', ''),
            'situation': data.get('situation', ''),
            'recommendation': data.get('recommendation', ''),
            'timestamp': timestamp,
            'viewed': False
        }
        
        cry_history.append(record)
        
        return jsonify({
            'success': True,
            'message': 'Cry event recorded',
            'record': record
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/get-history', methods=['GET'])
def get_history():
    """Get cry history with optional date filtering"""
    try:
        # Get query parameters for filtering
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        limit = int(request.args.get('limit', 10))
        
        filtered_history = cry_history
        
        # Apply date filtering if provided
        if start_date and end_date:
            filtered_history = [
                record for record in cry_history
                if start_date <= record['timestamp'].split('T')[0] <= end_date
            ]
        
        # Sort by timestamp (newest first)
        sorted_history = sorted(
            filtered_history, 
            key=lambda x: x['timestamp'], 
            reverse=True
        )
        
        # Apply limit
        limited_history = sorted_history[:limit]
        
        # Calculate summary stats
        cry_types = {}
        for record in filtered_history:
            status = record['status'].lower()
            
            if 'hungry' in status or 'hunger' in status:
                category = 'hunger'
            elif 'sleep' in status or 'tired' in status:
                category = 'sleepiness'
            elif 'discomfort' in status or 'pain' in status or 'diaper' in status:
                category = 'discomfort'
            else:
                category = 'other'
                
            cry_types[category] = cry_types.get(category, 0) + 1
        
        return jsonify({
            'success': True,
            'history': limited_history,
            'total': len(filtered_history),
            'summary': {
                'total': len(filtered_history),
                'byType': cry_types
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/get-history-stats', methods=['GET'])
def get_history_stats():
    """Get statistical breakdown of cry history by month and week"""
    try:
        # Get query parameters
        month = request.args.get('month', datetime.now().strftime('%Y-%m'))
        
        # Filter records for the requested month
        month_start = f"{month}-01"
        if month.split('-')[1] == '12':
            next_year = str(int(month.split('-')[0]) + 1)
            next_month = f"{next_year}-01-01"
        else:
            next_month_num = str(int(month.split('-')[1]) + 1).zfill(2)
            next_month = f"{month.split('-')[0]}-{next_month_num}-01"
        
        month_records = [
            record for record in cry_history
            if month_start <= record['timestamp'].split('T')[0] < next_month
        ]
        
        # Group by week within the month
        weeks_data = {
            'week1': [],
            'week2': [],
            'week3': [],
            'week4': []
        }
        
        for record in month_records:
            day = int(record['timestamp'].split('T')[0].split('-')[2])
            
            if day <= 7:
                weeks_data['week1'].append(record)
            elif day <= 14:
                weeks_data['week2'].append(record)
            elif day <= 21:
                weeks_data['week3'].append(record)
            else:
                weeks_data['week4'].append(record)
        
        # Calculate stats for each week
        stats = {
            'total': len(month_records),
            'weeks': {}
        }
        
        for week, records in weeks_data.items():
            week_stats = {'total': len(records), 'byType': {}}
            
            for record in records:
                status = record['status'].lower()
                
                if 'hungry' in status or 'hunger' in status:
                    category = 'hunger'
                elif 'sleep' in status or 'tired' in status:
                    category = 'sleepiness'
                elif 'discomfort' in status or 'pain' in status or 'diaper' in status:
                    category = 'discomfort'
                else:
                    category = 'other'
                    
                week_stats['byType'][category] = week_stats['byType'].get(category, 0) + 1
            
            stats['weeks'][week] = week_stats
        
        return jsonify({
            'success': True,
            'month': month,
            'stats': stats
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# User settings
user_settings = {
    'profile': {
        'name': 'Alex Johnson',
        'email': 'alex@example.com',
        'phone': '+1 (555) 123-4567',
        'babyName': 'Sam',
        'babyAge': '6 months'
    },
    'notifications': {
        'push': True,
        'email': False,
        'sound': True,
        'alertTypes': {
            'hunger': True,
            'sleepiness': True,
            'discomfort': True,
            'unknown': True
        },
        'quietHours': {
            'enabled': False,
            'start': '22:00',
            'end': '06:00'
        }
    },
    'device': {
        'name': 'CryCare-83A4',
        'lastConnected': '2025-05-15T15:42:00',
        'firmwareVersion': 'v1.2.5',
        'wifiNetwork': 'Home_Network',
        'macAddress': '5C:CF:7F:83:A4:B2'
    }
}

@app.route('/get-user-settings', methods=['GET'])
def get_user_settings():
    """Get user settings"""
    return jsonify(user_settings)

@app.route('/update-user-settings', methods=['POST'])
def update_user_settings():
    """Update user settings"""
    try:
        data = request.get_json()
        
        # Update profile if provided
        if 'profile' in data:
            user_settings['profile'].update(data['profile'])
            
        # Update notifications if provided
        if 'notifications' in data:
            # Handle nested objects
            if 'alertTypes' in data['notifications']:
                user_settings['notifications']['alertTypes'].update(data['notifications']['alertTypes'])
                del data['notifications']['alertTypes']
                
            if 'quietHours' in data['notifications']:
                user_settings['notifications']['quietHours'].update(data['notifications']['quietHours'])
                del data['notifications']['quietHours']
                
            user_settings['notifications'].update(data['notifications'])
            
        # Update device if provided
        if 'device' in data:
            user_settings['device'].update(data['device'])
        
        return jsonify({
            'success': True,
            'message': 'Settings updated successfully',
            'settings': user_settings
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

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
            "recommendation": advice_json.get("recommendations", [])[0] if advice_json.get("recommendations") else "",
            "ip": request.remote_addr,
            "timestamp": datetime.now().isoformat()
        }
        
        # Update latest status
        global latest_status, hardware_data_log
        latest_status = response_data
        
        # Add to hardware data log
        hardware_data_log.append(response_data)
        # Keep log at a reasonable size
        if len(hardware_data_log) > 100:
            hardware_data_log = hardware_data_log[-100:]
        
        # Emit through Socket.IO
        socketio.emit('status_update', response_data)
        socketio.emit('hardware_data', response_data)  # Send to Response page
        
        return jsonify({"message": "Test update sent successfully", "data": response_data})
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Keep track of hardware data
hardware_data_log = []

# Socket.IO event handlers
@socketio.on('connect')
def handle_connect():
    print(f"Client connected: {request.sid}")
    socketio.emit('connection_status', {'status': 'connected'}, room=request.sid)

@socketio.on('disconnect')
def handle_disconnect():
    print(f"Client disconnected: {request.sid}")

@socketio.on('get_hardware_status')
def handle_get_hardware_status():
    # Send the latest status to the client
    socketio.emit('hardware_data', latest_status, room=request.sid)
    
    # Send recent hardware data logs if available
    if hardware_data_log:
        for log_entry in hardware_data_log[-10:]:  # Send last 10 entries
            socketio.emit('hardware_data', log_entry, room=request.sid)

@app.route('/get-hardware-logs', methods=['GET'])
def get_hardware_logs():
    """Get hardware data logs"""
    try:
        limit = int(request.args.get('limit', 50))  # Default to last 50 entries
        
        # Return hardware logs (newest first)
        logs = list(reversed(hardware_data_log[-limit:]))
        
        return jsonify({
            'success': True,
            'logs': logs,
            'total': len(hardware_data_log)
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=3000, debug=True, allow_unsafe_werkzeug=True)
