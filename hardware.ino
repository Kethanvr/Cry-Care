#define BLYNK_TEMPLATE_ID "TMPL3slnetD_N"
#define BLYNK_TEMPLATE_NAME "Voice Recognition"
#define BLYNK_AUTH_TOKEN "u1mAT5J-hH49HCe1DWRQNSo5j7axqBJJ"

#define BLYNK_PRINT Serial

#include <SoftwareSerial.h>
#include <ESP8266WiFi.h>
#include <Wire.h>
#include <BlynkSimpleEsp8266.h>
#include <ESP8266HTTPClient.h>  // ✅ This is the missing include
#include "DFRobot_DF2301Q.h"

// I2C instance for DF2301Q
DFRobot_DF2301Q_I2C asr;

// WiFi & Blynk credentials
char auth[] = "u1mAT5J-hH49HCe1DWRQNSo5j7axqBJJ";
char ssid[] = "CMRIT CAMPUS WIFI";
char pass[] = "password";

void setup() {
  Serial.begin(115200);
  Wire.begin(D2, D1);  // SDA = D2 (GPIO4), SCL = D1 (GPIO5)

  // Initialize voice module
  while (!asr.begin()) {
    Serial.println("Failed to initialize DF2301Q. Check connections.");
    delay(3000);
  }

  Serial.println("DF2301Q Initialized Successfully");

  asr.setVolume(7);
  asr.setMuteMode(0);
  asr.setWakeTime(20);
  asr.playByCMDID(1);  // Optional wake command
  delay(10);

  Blynk.begin(auth, ssid, pass);
  Serial.println("Connected to Blynk");
}

void loop() {
  Blynk.run();

  uint8_t CMDID = asr.getCMDID();

  if (CMDID != 0) {
    Serial.print("Voice CMDID received: ");
    Serial.println(CMDID);

    String message;

    switch (CMDID) {
      case 5:
        message = "The baby is hungry";
        break;
      case 6:
        message = "The baby is scared";
        break;
      case 7:
        message = "Baby is burping";
        break;
      case 8:
        message = "The baby is crying.";
        break;
      default:
        message = "Unknown command: " + String(CMDID);
        break;
    }

    // Send message to Blynk
    Blynk.virtualWrite(V0, message);
    Serial.println("Sent to Blynk: " + message);

    // Send message to Flask server
    WiFiClient client;
    HTTPClient http;

    // ⚠️ Replace IP with your actual PC IP address where Flask is running    http.begin(client, "http://10.201.8.33:5000/baby-status");

    http.addHeader("Content-Type", "application/json");

    String payload = "{\"status\":\"" + message + "\"}";
    int httpResponseCode = http.POST(payload);

    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.println("Flask Response: " + response);
      
      // Parse the JSON response and display recommendation if needed
      // You can add code here to display the recommendation on an LCD or other display
      // This would require ArduinoJson library
    } else {
      Serial.print("Error sending to Flask. Error code: ");
      Serial.println(httpResponseCode);
    }

    http.end();

    delay(5000);  // Prevent spamming
  }

  delay(100);  // Small loop delay
}