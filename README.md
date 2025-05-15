# CryCare - Smart Infant Monitoring System


## Overview

CryCare is an intelligent IoT system that decodes baby cries for modern parenting. It uses advanced voice recognition technology to identify different types of baby cries and provides real-time feedback and recommendations to parents.

## Features

### Real-Time Cry Classification
- Identifies hunger, sleepiness, burping, and pain cries with impressive accuracy
- Machine learning model processes sounds locally for high accuracy and privacy
- Instant alerts sent to caregivers on their smartphones

### Audio Feedback & Remote Monitoring
- Small speaker plays clear alerts that match the baby's cries
- Parents can monitor their baby remotely from anywhere
- Peace of mind for caregivers who are not in the same room

### AI-Powered Parental Guidance
- AI reads cry sounds and offers quick, helpful care tips
- Enhanced responsiveness with specific advice for each cry type
- Accessible anytime through the mobile app or web interface

## Technology Stack

### Hardware
- **Microcontroller**: NodeMCU ESP8266
- **Voice Recognition**: DFRobot DF2301Q Voice Recognition Module
- **Actuator**: 8Ω Speaker for audio responses

### Software
- **Backend**: Flask (Python)
- **Frontend**: HTML, CSS, JavaScript
- **Real-time Communication**: Socket.IO
- **AI Integration**: Google Gemini API

### Cloud & Connectivity
- **IoT Platform**: Blynk
- **Optional Cloud Services**: Firebase/AWS/Google Cloud

## Getting Started

### Prerequisites
- Python 3.8 or higher
- NodeMCU ESP8266 with Arduino IDE configured
- [DFRobot DF2301Q](https://www.dfrobot.com/) Voice Recognition Module
- Google Gemini API key

### Installation

#### Backend Setup
1. Clone the repository:
   ```
   git clone https://github.com/yourusername/crycare.git
   cd crycare
   ```

2. Install required Python packages:
   ```
   pip install -r requirements.txt
   ```

3. Configure your Google Gemini API key in app.py:
   ```python
   genai.configure(api_key="YOUR_API_KEY")
   ```

4. Run the Flask application:
   ```
   python app.py
   ```

#### Hardware Setup
1. Connect the DFRobot DF2301Q Voice Recognition Module to the NodeMCU ESP8266 using I2C:
   - SDA → D2 (GPIO4)
   - SCL → D1 (GPIO5)

2. Connect a small 8Ω speaker to the NodeMCU output pin.

3. Upload the hardware.ino sketch to your NodeMCU using Arduino IDE.

4. Configure WiFi credentials in the Arduino sketch:
   ```cpp
   char ssid[] = "YOUR_WIFI_SSID";
   char pass[] = "YOUR_WIFI_PASSWORD";
   ```

5. Update the Flask server IP address in the Arduino sketch.

## Project Structure

```
baby-cry-flask/
├── app.py                 # Main Flask application
├── hardware.ino           # Arduino code for NodeMCU
├── list_models.py         # Utility to list available models
├── static/                # Static files
│   ├── css/               # CSS stylesheets
│   │   ├── chat.css
│   │   ├── dashboard.css
│   │   ├── history.css
│   │   ├── home.css
│   │   ├── response.css
│   │   └── settings.css
│   └── js/                # JavaScript files
│       ├── chat.js
│       ├── dashboard.js
│       ├── history.js
│       ├── home.js
│       ├── response.js
│       └── typing-animation.js
└── templates/             # HTML templates
    ├── chat.html
    ├── dashboard.html
    ├── history.html
    ├── home.html
    ├── response.html
    └── settings.html
```

## Usage

### Web Interface

The web interface provides several pages:

1. **Home**: Landing page with overview of the project
2. **Dashboard**: Main control panel showing baby status and recommendations
3. **Response**: Real-time hardware data monitoring page
4. **Chat**: AI chatbot for parenting advice
5. **History**: Historical data of baby cries and patterns
6. **Settings**: Configure user preferences and device settings

### Testing

Use the "Test Update" button on the Dashboard to simulate hardware updates and test the system without actual hardware.

## How It Works

1. The DFRobot voice recognition module detects and classifies baby cries
2. The NodeMCU sends the classification to the Flask server
3. The Flask server processes the data using the Google Gemini AI model
4. The AI generates appropriate recommendations based on the cry type
5. Results are displayed on the dashboard and sent to connected devices
6. The system logs all events for historical analysis

## Roadmap

- [ ] Develop full prototype with enhanced accuracy
- [ ] Conduct user trials with parents and caregivers
- [ ] Refine the system based on feedback
- [ ] Add multi-language support
- [ ] Mobile app development
- [ ] Integration with smart home systems

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [DFRobot](https://www.dfrobot.com/) for the voice recognition module
- [Google Gemini API](https://ai.google.dev/models/gemini) for AI capabilities
- [Flask](https://flask.palletsprojects.com/) for the web framework
- [Socket.IO](https://socket.io/) for real-time communications
- [Blynk](https://blynk.io/) for IoT connectivity

