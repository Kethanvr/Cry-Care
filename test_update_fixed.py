# Modified test_update function with proper indentation
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
