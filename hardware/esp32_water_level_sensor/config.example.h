/**
 * @file config.example.h
 * @brief Configuration template for BHARATOS ESP32 + HC-SR04 Water Level Sensor
 * 
 * INSTRUCTIONS:
 * 1. Copy this file to "config.h" in the same directory:
 *    cp config.example.h config.h
 * 2. Fill in your Wi-Fi credentials, backend URL, and IOT_INGESTION_KEY.
 * 3. Never commit "config.h" with real credentials to version control.
 */

#ifndef CONFIG_H
#define CONFIG_H

// ==========================================
// 1. Wi-Fi Configuration
// ==========================================
const char* WIFI_SSID     = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// ==========================================
// 2. BHARATOS Backend API Configuration
// ==========================================
// NOTE: "localhost" or "127.0.0.1" cannot be reached from the ESP32.
// For local testing: Use your development machine's LAN IP (e.g., "http://192.168.1.100:8000")
// For cloud/production: Use your deployed HTTPS URL (e.g., "https://bharatos-backend.onrender.com")
const char* BHARATOS_BASE_URL = "http://192.168.1.100:8000";

// Pre-seeded Beach Road Storm Drain Gauge Node ID
const char* TARGET_NODE_ID    = "847ac10b-58cc-4372-a567-0e02b2c3d486";

// Secret Ingestion API Key (Must match IOT_INGESTION_KEY in backend .env)
const char* IOT_INGESTION_KEY = "YOUR_IOT_INGESTION_KEY_HERE";

// ==========================================
// 3. Hardware Pin Configuration (Safe GPIOs)
// ==========================================
// HC-SR04 Trigger pin (Output from ESP32 to sensor)
#define PIN_TRIG 5

// HC-SR04 Echo pin (Input to ESP32 via Voltage Divider!)
// WARNING: HC-SR04 outputs 5V. Use 1k/2k resistor divider to step down to ~3.3V
#define PIN_ECHO 18

// Built-in status LED (GPIO 2 on most ESP32 DevKit boards)
#define PIN_STATUS_LED 2

// ==========================================
// 4. Physical Container Calibration & Sensor Parameters
// ==========================================
// Physical internal height of the demonstration container (in cm)
// Sensor is mounted at the top looking downwards at the water surface.
// Distance = Reference Height when container is completely dry (0 cm water level).
const float REFERENCE_HEIGHT_CM = 25.0f;

// Calibration offset (in cm) to fine-tune physical measurement errors
const float CALIBRATION_OFFSET_CM = 0.0f;

// Scale Factor for SIH Tabletop Demonstration:
// In physical tests, a 20 cm tabletop container can represent a 5.0m storm drain gauge.
// - Set to 1.0f for true physical 1:1 scale (container height in cm / 100 = metres).
// - Set to (TARGET_FULL_SCALE_M / CONTAINER_HEIGHT_M), e.g., (5.0 / 0.25) = 20.0f
//   to map a 0-25cm water rise to 0-5.0m in the Urban Digital Twin!
const float DEMO_SCALE_MULTIPLIER = 20.0f;

// Telemetry transmission interval in milliseconds (e.g. 5000ms = 5 seconds)
const unsigned long TELEMETRY_INTERVAL_MS = 5000;

#endif // CONFIG_H
