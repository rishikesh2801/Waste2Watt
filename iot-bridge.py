import sys
import time
import json

# Check dependencies
try:
    import serial
    import serial.tools.list_ports
    import requests
except ImportError:
    print("\n[!] Missing dependencies! Please install them using pip:")
    print("    pip install pyserial requests")
    print("\nPress Enter to exit...")
    input()
    sys.exit(1)

BACKEND_URL = "http://localhost:5000/api/iot/update"

def get_ports():
    ports = list(serial.tools.list_ports.comports())
    return ports

def main():
    print("=" * 60)
    print("   MUNICIPAL CORPORATION ROORKEE - SMART DUSTBIN SERIAL BRIDGE")
    print("=" * 60)
    print("This script reads data from your Arduino (USB or paired HC-05 Bluetooth)")
    print("and sends it live to your local IoT Waste Management Dashboard.")
    print("-" * 60)

    # 1. List Available COM Ports
    ports = get_ports()
    if not ports:
        print("[!] No active COM Ports found! Make sure Arduino is connected via USB")
        print("    or HC-05 is paired and connected.")
        print("\nPress Enter to exit...")
        input()
        return

    print("Available Ports:")
    for i, port in enumerate(ports):
        print(f" [{i+1}] {port.device} - {port.description}")
    
    # 2. Select Port
    try:
        choice = int(input(f"\nSelect Port (1-{len(ports)}): ")) - 1
        if choice < 0 or choice >= len(ports):
            print("Invalid selection.")
            return
        selected_port = ports[choice].device
    except ValueError:
        print("Please enter a valid number.")
        return

    # 3. Choose Baud Rate
    baud = input("Baud Rate (default 9600): ")
    if not baud:
        baud = 9600
    else:
        baud = int(baud)

    # 4. Choose Dustbin ID to update
    bin_id = input("Dustbin ID to update (default: IOT-BN-01): ").strip()
    if not bin_id:
        bin_id = "IOT-BN-01"

    location = f"Sector 4, Main Market ({selected_port} Live)"

    print(f"\n[*] Connecting to {selected_port} at {baud} baud...")
    
    try:
        ser = serial.Serial(selected_port, baud, timeout=2)
        time.sleep(2) # Allow Arduino reset time
        print(f"[+] Connected successfully! Monitoring data...")
        print("[*] Arduino should write just the numeric percentage (0 to 100) to Serial.")
        print("-" * 60)
    except Exception as e:
        print(f"[!] Connection failed: {e}")
        input("\nPress Enter to exit...")
        return

    last_check_time = 0
    while True:
        try:
            if ser.in_waiting > 0:
                line = ser.readline().decode('utf-8', errors='ignore').strip()
                if line:
                    line_upper = line.upper()
                    
                    # 1. Identify which dustbin sent the data
                    current_bin_id = bin_id # Default from input
                    location_mapped = location
                    
                    if "DUSTBIN 1" in line_upper:
                        current_bin_id = "IOT-BN-01"
                        location_mapped = "Sector 4, Main Market (HC-05)"
                    elif "DUSTBIN 2" in line_upper:
                        current_bin_id = "IOT-BN-02"
                        location_mapped = "Station Road, Lane 2 (HC-05)"
                    elif "DUSTBIN 3" in line_upper:
                        current_bin_id = "IOT-BN-03"
                        location_mapped = "Civil Lines, Park Avenue (HC-05)"
                    elif "DUSTBIN 4" in line_upper:
                        current_bin_id = "IOT-BN-04"
                        location_mapped = "IIT Roorkee Main Gate (HC-05)"

                    # 2. Parse fill level - supports multiple Arduino output formats:
                    # Format A: Plain number "75" or "100"
                    # Format B: "DUSTBIN 1: 85%" or "DUSTBIN 1: 85"
                    # Format C: Legacy "FULL" or "EMPTY" keywords
                    fill_level = None
                    
                    if "FULL" in line_upper:
                        fill_level = 100
                    elif "EMPTY" in line_upper:
                        fill_level = 0
                    else:
                        # Try to extract a numeric value from the line
                        import re
                        numbers = re.findall(r'\b(\d{1,3})\b', line)
                        for num_str in numbers:
                            num = int(num_str)
                            if 0 <= num <= 100:
                                fill_level = num
                                break
                            
                    if fill_level is not None:
                        print(f"[LIVE] Reading from Arduino: '{line}' -> {current_bin_id} is {fill_level}%")
                        
                        # Prepare Payload
                        payload = {
                            "dustbinId": current_bin_id,
                            "location": location_mapped,
                            "fillLevel": fill_level,
                            "batteryStatus": 98,
                            "signalStrength": "Strong"
                        }
                        
                        # Push to local backend
                        try:
                            response = requests.post(BACKEND_URL, json=payload, timeout=3)
                            if response.status_code == 200:
                                print(f"   └─ [OK] Dashboard updated! Fill={fill_level}%")
                            else:
                                print(f"   └─ [ERROR] Backend returned code: {response.status_code} - {response.text}")
                        except requests.exceptions.ConnectionError:
                            print(f"   └─ [ERROR] Cannot reach backend! Kya backend chal raha hai? (node server.js)")
                        except requests.exceptions.Timeout:
                            print(f"   └─ [WARN] Backend response timeout - data may still be saved")
                    else:
                        print(f"[DEBUG] Could not parse fill level from: '{line}'")
            
            # --- TWO WAY COMMUNICATION: CHECK BACKEND FOR UNLOCKS ---
            current_time = time.time()
            if current_time - last_check_time > 3:
                last_check_time = current_time
                try:
                    resp = requests.get(BACKEND_URL.replace("/update", ""), timeout=2)
                    if resp.status_code == 200:
                        db_bins = resp.json()
                        for b in db_bins:
                            # If backend says it is empty/normal, we tell Arduino to UNLOCK its LCD
                            if b.get('fillLevel', 100) < 90:
                                if b['dustbinId'] == 'IOT-BN-01': ser.write(b"U1\n")
                                elif b['dustbinId'] == 'IOT-BN-02': ser.write(b"U2\n")
                                elif b['dustbinId'] == 'IOT-BN-03': ser.write(b"U3\n")
                                elif b['dustbinId'] == 'IOT-BN-04': ser.write(b"U4\n")
                except Exception as e:
                    pass # Silently ignore network errors for background polling
            # --------------------------------------------------------

            time.sleep(0.1)
        except KeyboardInterrupt:
            print("\n[-] Bridge stopped by user.")
            break
        except Exception as e:
            print(f"\n[!] Error during reading: {e}")
            break

    try:
        ser.close()
        print("[*] Serial Port closed safely.")
    except:
        pass

if __name__ == "__main__":
    main()
