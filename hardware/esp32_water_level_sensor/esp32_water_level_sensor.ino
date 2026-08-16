/**
 * @file esp32_water_level_sensor.ino
 * @brief BHARATOS Physical Urban IoT Telemetry Transmitter
 * 
 * Hardware:
 * - ESP32 DevKit V1 (38-pin or 30-pin)
 * - HC-SR04 Ultrasonic Distance Sensor
 * - 1k ohm & 2k ohm resistors (Voltage Divider for Echo Pin)
 * - Breadboard & Jumper wires
 * 
 * Compatibility:
 * - Standard Arduino IDE 2.x with ESP32 Board Package installed
 * - Uses native WiFi.h, HTTPClient.h, and WiFiClientSecure.h
 */

#if __has_include("config.h")
  #include "config.h"
#else
  #include "config.example.h"
  #warning "Using config.example.h. Copy to config.h and customize your credentials."
#endif

#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>

// Speed of sound in air at 20°C: ~0.0343 cm/microsecond
const float SPEED_OF_SOUND_CM_PER_US = 0.0343f;

// Maximum valid distance reading from HC-SR04 (400 cm)
const float MAX_VALID_DISTANCE_CM = 400.0f;
const float MIN_VALID_DISTANCE_CM = 2.0f;

// Timestamp tracking for non-blocking telemetry loop
unsigned long lastTelemetryMillis = 0;
unsigned long transmissionCount = 0;

/**
 * @brief Connects or reconnects to the configured Wi-Fi Access Point
 */
void connectToWiFi() {
  if (WiFi.status() == WL_CONNECTED) return;

  Serial.println("\n[WiFi] Connecting to SSID: " + String(WIFI_SSID));
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    digitalWrite(PIN_STATUS_LED, !digitalRead(PIN_STATUS_LED)); // Toggle LED
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    digitalWrite(PIN_STATUS_LED, HIGH);
    Serial.println("\n[WiFi] Connected successfully!");
    Serial.println("[WiFi] IP Address: " + WiFi.localIP().toString());
    Serial.println("[WiFi] RSSI: " + String(WiFi.RSSI()) + " dBm");
  } else {
    digitalWrite(PIN_STATUS_LED, LOW);
    Serial.println("\n[WiFi] Connection failed. Will retry on next cycle.");
  }
}

/**
 * @brief Measures raw distance from HC-SR04 in centimetres
 * @return Raw distance in cm, or -1.0f on timeout / error
 */
float readSingleDistanceCM() {
  // Clear trigger pin
  digitalWrite(PIN_TRIG, LOW);
  delayMicroseconds(2);

  // Send 10 microsecond HIGH pulse to trigger
  digitalWrite(PIN_TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(PIN_TRIG, LOW);

  // Read the echo pin pulse duration in microseconds (Timeout: ~30ms = 5 metres max)
  unsigned long durationUs = pulseIn(PIN_ECHO, HIGH, 30000);

  if (durationUs == 0) {
    return -1.0f; // Timeout or sensor disconnected
  }

  // Distance = (Duration * Speed of Sound) / 2 (round trip)
  float distanceCm = (durationUs * SPEED_OF_SOUND_CM_PER_US) / 2.0f;

  if (distanceCm < MIN_VALID_DISTANCE_CM || distanceCm > MAX_VALID_DISTANCE_CM) {
    return -1.0f; // Out of plausible sensor physical bounds
  }

  return distanceCm;
}

/**
 * @brief Takes multiple samples and returns a median filtered distance
 * @param samples Number of ultrasonic samples to collect (e.g. 5)
 * @return Filtered distance in cm, or -1.0f if all readings failed
 */
float readFilteredDistanceCM(int samples = 5) {
  float readings[7];
  int validCount = 0;

  if (samples > 7) samples = 7;

  for (int i = 0; i < samples; i++) {
    float d = readSingleDistanceCM();
    if (d > 0.0f) {
      readings[validCount++] = d;
    }
    delay(15); // Sensor recovery interval
  }

  if (validCount == 0) return -1.0f;

  // Simple bubble sort to find median
  for (int i = 0; i < validCount - 1; i++) {
    for (int j = 0; j < validCount - i - 1; j++) {
      if (readings[j] > readings[j + 1]) {
        float temp = readings[j];
        readings[j] = readings[j + 1];
        readings[j + 1] = temp;
      }
    }
  }

  return readings[validCount / 2];
}

/**
 * @brief Converts measured distance to calibrated water level in metres
 * @param distanceCm Measured distance from sensor to water surface
 * @return Calculated water level in metres
 */
float calculateWaterLevelM(float distanceCm) {
  if (distanceCm < 0.0f) return -1.0f;

  // Formula: water_level_cm = REFERENCE_HEIGHT_CM - distance_cm + CALIBRATION_OFFSET_CM
  float waterLevelCm = REFERENCE_HEIGHT_CM - distanceCm + CALIBRATION_OFFSET_CM;

  // Physical constraint: Water level cannot be negative (dry container)
  if (waterLevelCm < 0.0f) {
    waterLevelCm = 0.0f;
  }

  // Scale from tabletop demo to Digital Twin scale
  // Standard conversion: cm to m = / 100.0f
  float baseWaterLevelM = waterLevelCm / 100.0f;
  float scaledWaterLevelM = baseWaterLevelM * DEMO_SCALE_MULTIPLIER;

  return scaledWaterLevelM;
}

/**
 * @brief Transmits water level telemetry to BHARATOS backend via HTTP/HTTPS POST
 * @param waterLevelM Calculated water level in metres
 * @return true if HTTP 201 Created was returned by backend, false otherwise
 */
bool transmitTelemetry(float waterLevelM) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[HTTP] Cannot transmit: Wi-Fi is disconnected.");
    return false;
  }

  HTTPClient http;
  WiFiClientSecure secureClient;
  WiFiClient plainClient;

  // Build target URL
  String url = String(BHARATOS_BASE_URL) + "/api/v1/digital-twin/nodes/" + String(TARGET_NODE_ID) + "/telemetry";
  Serial.println("[HTTP] POST URL: " + url);

  bool isHttps = url.startsWith("https://");
  if (isHttps) {
    secureClient.setInsecure(); // Allow connection to server without embedding hardcoded root CA
    http.begin(secureClient, url);
  } else {
    http.begin(plainClient, url);
  }

  // Set standard BHARATOS headers
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-IOT-KEY", IOT_INGESTION_KEY);
  http.setTimeout(8000); // 8 second timeout

  // Build JSON payload adhering strictly to IoTTelemetryIn schema
  // { "metric_type": "water_level", "value": 4.15, "unit": "m" }
  String payload = "{\"metric_type\":\"water_level\",\"value\":" + String(waterLevelM, 3) + ",\"unit\":\"m\"}";
  Serial.println("[HTTP] Payload: " + payload);

  int httpCode = http.POST(payload);
  transmissionCount++;

  Serial.println("[HTTP] Response Code: " + String(httpCode));

  bool success = false;
  if (httpCode > 0) {
    String response = http.getString();
    Serial.println("[HTTP] Response Body: " + response);

    if (httpCode == HTTP_CODE_CREATED || httpCode == HTTP_CODE_OK) {
      Serial.println("[HTTP] >>> SUCCESS: Telemetry ingested into BHARATOS as REAL_IOT! (Tx #" + String(transmissionCount) + ")");
      success = true;
    } else if (httpCode == HTTP_CODE_UNAUTHORIZED) {
      Serial.println("[HTTP] >>> ERROR: Unauthorized. Check that IOT_INGESTION_KEY matches backend .env!");
    } else if (httpCode == HTTP_CODE_NOT_FOUND) {
      Serial.println("[HTTP] >>> ERROR: Node ID not found. Verify TARGET_NODE_ID in config.h!");
    }
  } else {
    Serial.printf("[HTTP] >>> Connection error: %s\n", http.errorToString(httpCode).c_str());
  }

  http.end();
  return success;
}

void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("\n==================================================");
  Serial.println("   BHARATOS URBAN FLOOD INTELLIGENCE — IoT NODE   ");
  Serial.println("==================================================");
  Serial.println("[INIT] Target Node: Beach Road Storm Drain Gauge");
  Serial.println("[INIT] Target Node ID: " + String(TARGET_NODE_ID));
  Serial.printf("[INIT] Physical Ref Height: %.1f cm | Scale Multiplier: %.1fx\n", REFERENCE_HEIGHT_CM, DEMO_SCALE_MULTIPLIER);
  Serial.printf("[INIT] Trigger Pin: GPIO %d | Echo Pin: GPIO %d\n", PIN_TRIG, PIN_ECHO);

  // Configure hardware pins
  pinMode(PIN_TRIG, OUTPUT);
  pinMode(PIN_ECHO, INPUT);
  pinMode(PIN_STATUS_LED, OUTPUT);

  digitalWrite(PIN_TRIG, LOW);
  digitalWrite(PIN_STATUS_LED, LOW);

  // Connect to network
  connectToWiFi();

  Serial.println("[INIT] Sensor node initialization complete. Starting telemetry loop...\n");
}

void loop() {
  // Ensure network connection remains active
  if (WiFi.status() != WL_CONNECTED) {
    connectToWiFi();
  }

  unsigned long currentMillis = millis();
  if (currentMillis - lastTelemetryMillis >= TELEMETRY_INTERVAL_MS) {
    lastTelemetryMillis = currentMillis;

    Serial.println("--------------------------------------------------");
    Serial.printf("[SENSOR] Reading ultrasonic distance (Samples=5)...\n");

    float distanceCm = readFilteredDistanceCM(5);

    if (distanceCm < 0.0f) {
      Serial.println("[SENSOR] WARNING: Ultrasonic reading failed or out of range. Skipping transmission.");
    } else {
      float waterLevelM = calculateWaterLevelM(distanceCm);

      Serial.printf("[SENSOR] Measured Distance: %.2f cm\n", distanceCm);
      Serial.printf("[CALC] Calculated Water Level: %.3f m (Equivalent to %.2f cm rise)\n", 
                    waterLevelM, 
                    (REFERENCE_HEIGHT_CM - distanceCm + CALIBRATION_OFFSET_CM));

      // Visual classification feedback on Serial
      if (waterLevelM >= 4.5f) {
        Serial.println("[STATUS] >>> CRITICAL FLOOD THRESHOLD BREACHED (>= 4.5m)");
      } else if (waterLevelM >= 4.0f) {
        Serial.println("[STATUS] >>> HIGH WATER LEVEL WARNING (>= 4.0m)");
      } else {
        Serial.println("[STATUS] >>> NORMAL WATER LEVEL (< 4.0m)");
      }

      // Transmit to BHARATOS
      transmitTelemetry(waterLevelM);
    }
  }

  delay(50); // Small cooperative multitasking yield
}
