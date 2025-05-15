# Modified baby_status function with proper indentation
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
        print(response.text)

        # Attempt to parse the response as JSON
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
