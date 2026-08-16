# BHARATOS Physical Urban IoT Sensor — ESP32 + HC-SR04 Integration Guide

This guide details the hardware assembly, voltage protection, calibration, firmware flashing, and live demonstration workflow for connecting a physical **ESP32 + HC-SR04 Ultrasonic Sensor** to the **BHARATOS Urban Visakhapatnam Flood Intelligence** platform.

---

## 1. Hardware Bill of Materials (BOM)

| Component | Quantity | Purpose |
| :--- | :--- | :--- |
| **ESP32 DevKit V1** (30/38 pin) | 1 | Microcontroller with Wi-Fi & HTTPS capabilities |
| **HC-SR04 Ultrasonic Sensor** | 1 | Distance measurement to water surface (2cm – 400cm range) |
| **1 kΩ Resistor (R1)** | 1 | Voltage divider top resistor (5V Echo line protection) |
| **2 kΩ Resistor (R2)** *(or two 1kΩ in series)* | 1 | Voltage divider bottom resistor to ground |
| **Half-Size Breadboard & Jumpers** | 1 | Prototyping and wiring connections |
| **Tabletop Transparent Container / Beaker** | 1 | Physical demonstration container (e.g. 20–30 cm tall) |
| **Micro-USB / USB-C Cable** | 1 | Power and serial diagnostics connection to computer |

---

## 2. Voltage Safety & Wiring Schematic

> [!CAUTION]
> **HC-SR04 Echo Pin Voltage Hazard:**
> The HC-SR04 requires **5V VCC** to operate reliably, which causes its **ECHO** pin to output **5V logic pulses**. ESP32 GPIO pins are rated for **3.3V maximum**. Connecting 5V directly to an ESP32 GPIO will permanently damage the microcontroller.
>
> You **MUST** use a 2-resistor voltage divider on the ECHO line as shown below.

### Voltage Divider Formula
$$V_{\text{ESP32\_IN}} = V_{\text{ECHO}} \times \frac{R_2}{R_1 + R_2} = 5.0\text{V} \times \frac{2000\,\Omega}{1000\,\Omega + 2000\,\Omega} = 3.33\text{V}$$

```
                +5V (VIN / VUSB)
                     |
               +-------------+
               |   HC-SR04   |
               |  ULTRASONIC |
               +-------------+
                |    |   |  |
     +----------+    |   |  +----------+
     | (VCC)         |   |      (GND)  |
     |               |   |             |
+---------+          |   |        +---------+
| ESP32   |          |   |        | ESP32   |
| VIN/5V  |          |   |        | GND     |
+---------+          |   |        +---------+
                     |   |
  GPIO 5 ------------+   | (TRIG)
                         |
  GPIO 18 <---+          | (ECHO - 5V)
              |          |
            [1kΩ R1] <---+
              |
              +---[2kΩ R2]---+
                             |
                            GND
```

### Pin Assignment Table

| HC-SR04 Pin | ESP32 Connection | Resistor Network | Rationale |
| :--- | :--- | :--- | :--- |
| **VCC** | `VIN` or `5V` | Direct connection | Supplies required 5V to ultrasonic transducer |
| **GND** | `GND` | Common ground | Shared ground reference |
| **TRIG** | `GPIO 5` | Direct connection | Safe general-purpose output (avoiding strapping pins) |
| **ECHO** | `GPIO 18` | Via $1\text{k}\Omega / 2\text{k}\Omega$ Divider | Safe general-purpose input stepped down to 3.3V |

*(Note: Strapping pins like GPIO 0, 2, 12, 15 and integrated flash pins 6–11 are intentionally avoided).*

---

## 3. Physical Mounting & Calibration

### Measurement Principle
The HC-SR04 measures **distance from the sensor face to the top water surface** ($d$).
BHARATOS requires **water level** ($h$).

$$\text{Water Level } (h) = \text{Reference Height } (H_{\text{ref}}) - \text{Measured Distance } (d) + \text{Calibration Offset}$$

```
   [ HC-SR04 SENSOR FACE ]  --- Top of container / sensor mount
   |                     |
   |   Measured          |
   |   Distance (d)      |
   |                     |
   v~~~~~~~~~~~~~~~~~~~~~v  --- Water Surface
   |                     |
   |   Water Level (h)   |
   |                     |
   +=====================+  --- Container Bottom (Reference Datum: 0 cm)
              ^
              |---- Reference Height (H_ref)
```

### Step-by-Step Calibration Procedure:
1. **Measure Empty Container ($H_{\text{ref}}$)**:
   - Mount sensor at top of empty container.
   - Measure distance from sensor face to container bottom in centimetres.
   - Set `REFERENCE_HEIGHT_CM` in `config.h` (e.g. `25.0f`).
2. **Dry Test ($0\text{ cm}$ water)**:
   - Boot ESP32 with empty container.
   - Serial monitor should output: `Measured Distance: ~25.0 cm | Calculated Water Level: 0.000 m`.
3. **Multi-point Validation**:
   - Pour $5\text{ cm}$ of water $\rightarrow$ Serial should read: `Calculated Water Level: 5.0 cm`.
   - Pour $10\text{ cm}$ of water $\rightarrow$ Serial should read: `Calculated Water Level: 10.0 cm`.
   - Pour $15\text{ cm}$ of water $\rightarrow$ Serial should read: `Calculated Water Level: 15.0 cm`.
4. **Offset Correction**:
   - If readings are consistently off by e.g. $+0.5\text{ cm}$, adjust `CALIBRATION_OFFSET_CM = -0.5f`.
5. **Scale Factor (`DEMO_SCALE_MULTIPLIER`)**:
   - In a tabletop demonstration, a $20\text{ cm}$ water column can represent a $5.0\text{m}$ urban storm drain.
   - `DEMO_SCALE_MULTIPLIER = 20.0f` maps $20\text{ cm}$ rise $\rightarrow$ $4.0\text{m}$ (warning) and $22.5\text{ cm}$ rise $\rightarrow$ $4.5\text{m}$ (critical).

---

## 4. Software Setup & Flashing

### Step 1: Install Arduino IDE & ESP32 Board Core
1. Install [Arduino IDE 2.x](https://www.arduino.cc/en/software).
2. Go to **File $\rightarrow$ Preferences** and add the ESP32 Board URL to **Additional Board Manager URLs**:
   ```
   https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
   ```
3. Go to **Tools $\rightarrow$ Board $\rightarrow$ Boards Manager**, search for `esp32` by Espressif Systems, and click **Install**.

### Step 2: Configure Credentials
1. Navigate to [`hardware/esp32_water_level_sensor/`](file:///c:/Users/surya/Desktop/BharatOS/hardware/esp32_water_level_sensor/).
2. Copy `config.example.h` to `config.h`:
   ```bash
   cp config.example.h config.h
   ```
3. Open `config.h` in your editor and update:
   - `WIFI_SSID` & `WIFI_PASSWORD`
   - `BHARATOS_BASE_URL` (Use your machine's LAN IP, e.g., `http://192.168.1.100:8000`, or deployed Render URL `https://your-app.onrender.com`).
   - `IOT_INGESTION_KEY` (Must match the value configured in backend `.env`).
   - `REFERENCE_HEIGHT_CM` (Your measured container height).

> [!IMPORTANT]
> `localhost` or `127.0.0.1` refers to the ESP32 chip itself and **will not work**. Always use your computer's local IP address on your Wi-Fi network or a publicly reachable URL.

### Step 3: Flash to ESP32
1. Connect ESP32 to PC via USB.
2. In Arduino IDE, select **Tools $\rightarrow$ Board $\rightarrow$ ESP32 Dev Module**.
3. Select the correct COM port (**Tools $\rightarrow$ Port**).
4. Click **Upload** ($\rightarrow$).
5. Open **Serial Monitor** at **115200 baud** to view live diagnostics.

---

## 5. End-to-End Demonstration Workflow

```
[ Tabletop Water Container ]
             │ (Pour water)
             ▼
[ HC-SR04 Ultrasonic Distance Sensor ]
             │ (Echo pulse duration)
             ▼
[ ESP32 Firmware ]
             │ (Distance -> Water Level Conversion & Scale)
             ▼
[ HTTP/HTTPS POST: /api/v1/digital-twin/nodes/{node_id}/telemetry ]
             │ (X-IOT-KEY Authentication Header)
             ▼
[ BHARATOS Ingestion Engine ] ──► (Classified as REAL_IOT)
             │
             ├──► [ Live Digital Twin Telemetry Gauge ]
             ├──► [ Telemetry Record Stored in PostgreSQL ]
             └──► [ AlertRuleService ]
                       │
                       ├── Normal (< 4.0m): Standard Green Live Status
                       ├── Warning (>= 4.0m): High Water Level Alert Generated
                       └── Critical (>= 4.5m): Critical Flood Alert Generated
                                 │
                                 ▼
                     [ LangGraph AI Ops Triage ]
                                 │ (Evaluates available ambulances/fire engines)
                                 ▼
                     [ Proposed Resource Dispatch Plan ]
                                 │
                      [ Human-in-the-Loop Safety Gate ]
                                 │ (Operator clicks 'Approve / Dispatch')
                                 ▼
                     [ Incident Dispatch Executed ]
```

---

## 6. Offline Sensor Verification Test

To verify the system's fault-tolerant offline detection:
1. Allow the ESP32 to run for 30 seconds.
2. Confirm the Beach Road Storm Drain gauge on the Urban Digital Twin dashboard displays **LIVE / REAL_IOT** with real-time updates.
3. Unplug the ESP32 USB power.
4. Observe the dashboard: after the backend timeout window without fresh telemetry, the node status transitions to **OFFLINE** while cleanly preserving its last-known water level and timestamp.
