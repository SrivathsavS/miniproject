#include <WiFi.h>
#include <WebSocketsClient.h>
#include <ArduinoJson.h>
#include <LiquidCrystal_I2C.h>

const char* ssid = "Wokwi-GUEST";
const char* password = "";

const char* websocket_server = "titanium-grizzled-texture.glitch.me";
const uint16_t websocket_port = 443; // glitch runs our app at this port

WebSocketsClient webSocket;
LiquidCrystal_I2C lcd(0x27, 16, 2); // Adjust address and size as needed

unsigned long lastReconnectAttempt = 0;

void setup() {
  Serial.begin(115200);

  // Initialize LCD
  //lcd.begin(16, 2); // Initialize the LCD with 16 columns and 2 rows
  lcd.init();
  lcd.backlight();
  lcd.clear();

  // Connect to Wi-Fi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  Serial.println("Connected to WiFi");

  // Connect to WebSocket server
  connectWebSocket();
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi connection lost. Reconnecting...");
    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED) {
      delay(1000);
      Serial.println("Connecting to WiFi...");
    }
    Serial.println("Connected to WiFi");
  }

  if (!webSocket.isConnected()) {
    unsigned long now = millis();
    if (now - lastReconnectAttempt > 5000) { // Try to reconnect every 5 seconds
      lastReconnectAttempt = now;
      Serial.println("Attempting WebSocket reconnection...");
      connectWebSocket();
    }
  }

  webSocket.loop();
}

void connectWebSocket() {
  Serial.println("Connecting to WebSocket server...");
  webSocket.beginSSL(websocket_server, websocket_port, "/");
  webSocket.onEvent(webSocketEvent);
}

void webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {
  switch (type) {
    case WStype_DISCONNECTED:
      Serial.println("Disconnected from WebSocket server");
      break;
    case WStype_CONNECTED:
      Serial.println("Connected to WebSocket server");
      break;
    case WStype_TEXT:
      Serial.printf("Received: %s\n", payload);
      handleIncomingMessage((char*)payload);
      break;
  }
}

void handleIncomingMessage(char* payload) {
  StaticJsonDocument<200> doc;
  DeserializationError error = deserializeJson(doc, payload);

  if (error) {
    Serial.print(F("deserializeJson() failed: "));
    Serial.println(error.c_str());
    return;
  }

  const char* name = doc["name"];
  const char* data = doc["data"];

  displayMessage(name, data);
}

void displayMessage(const char* name, const char* data) {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print(name);
  lcd.setCursor(0, 1);
  lcd.print(data);
}
