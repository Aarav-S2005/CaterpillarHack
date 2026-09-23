"""
CAT Operator Copilot - High-Fidelity Telemetry Simulation Engine
================================================================
Streams continuous CAN-bus telemetry updates to the FastAPI backend
(/api/telemetry) with realistic physical excavator dynamics and scenario injections.

Usage:
    python run_telemetry_stream.py [--url http://127.0.0.1:8000] [--rate 2.0] [--scenario normal|rollover|worker|hydraulic|fatigue]
"""

import argparse
import math
import sys
import time
import requests

def generate_telemetry_step(t: float, scenario: str, base_state: dict) -> dict:
    """Generate physically grounded machine telemetry for time step t."""
    # Excavator excavation cycle phase (period ~ 18 seconds: Dig -> Swing -> Dump -> Return)
    cycle_phase = (t % 18.0) / 18.0
    
    # Engine dynamics
    base_rpm = 1750.0 + 350.0 * math.sin(cycle_phase * 2 * math.pi)
    base_hydraulic = 260.0 + 55.0 * math.sin(cycle_phase * 2 * math.pi + 1.2)
    base_fuel_rate = 22.0 + 8.0 * (base_rpm / 2100.0)
    
    # Pitch and roll terrain oscillation
    pitch = 3.2 * math.sin(t * 0.4)
    roll = 2.1 * math.cos(t * 0.3)
    
    # Proximity sensors (default safe distance > 5m)
    proximity_front = 8.5 + 2.0 * math.sin(t * 0.1)
    proximity_rear = 12.0 + 1.5 * math.cos(t * 0.1)
    proximity_left = 6.2
    proximity_right = 5.8
    
    # Operator alertness
    eye_closure = 0.08 + 0.04 * math.sin(t * 0.05)
    heart_rate = 74 + int(6 * math.sin(t * 0.2))
    
    # Machine positions
    lat = 40.7128 + 0.00015 * math.sin(t * 0.02)
    lng = -74.0060 + 0.00018 * math.cos(t * 0.02)
    
    # Inject deliberate scenario hazards
    if scenario == "rollover":
        roll = 19.5 + 3.0 * math.sin(t * 0.8) # Exceeds 15 deg threshold
        pitch = 14.2
    elif scenario == "worker":
        proximity_front = 1.6 # Severe incursion (< 2.0m threshold)
    elif scenario == "hydraulic":
        base_hydraulic = 365.0 + 15.0 * math.sin(t * 1.5) # Exceeds 350 bar threshold
        base_rpm = 2300.0
    elif scenario == "fatigue":
        eye_closure = 0.48 # Micro-sleep condition (> 0.35 threshold)
        heart_rate = 52
        
    return {
        "engineRpm": round(base_rpm, 1),
        "hydraulicPressure": round(base_hydraulic, 1),
        "fuelLevel": max(5.0, round(78.5 - (t * 0.005), 1)),
        "fuelRate": round(base_fuel_rate, 2),
        "oilTemperature": round(84.0 + 4.0 * math.sin(t * 0.05), 1),
        "coolantTemperature": round(88.0 + 3.0 * math.cos(t * 0.05), 1),
        "batteryVoltage": 27.8,
        "loadWeight": round(max(0.0, 14.5 * math.sin(cycle_phase * math.pi)), 1),
        "maxLoadCapacity": 22.0,
        "groundSpeed": round(abs(1.8 * math.sin(cycle_phase * 2 * math.pi)), 1),
        "articulationAngle": round(15.0 * math.sin(t * 0.3), 1),
        "pitchAngle": round(pitch, 1),
        "rollAngle": round(roll, 1),
        "vibrationLevel": round(1.2 + 0.6 * math.sin(t * 2.0), 2),
        "proximityFront": round(max(0.5, proximity_front), 1),
        "proximityRear": round(max(0.5, proximity_rear), 1),
        "proximityLeft": round(max(0.5, proximity_left), 1),
        "proximityRight": round(max(0.5, proximity_right), 1),
        "eyeClosurePerclos": round(min(1.0, max(0.0, eye_closure)), 2),
        "heartRateBpm": heart_rate,
        "seatbeltFastened": True,
        "latitude": lat,
        "longitude": lng,
        "elevation": round(142.5 + pitch * 0.1, 1),
    }

def main():
    parser = argparse.ArgumentParser(description="CAT Operator Copilot Telemetry Stream Simulator")
    parser.add_argument("--url", default="http://127.0.0.1:8000", help="FastAPI backend host URL")
    parser.add_argument("--rate", type=float, default=2.0, help="Updates per second (Hz)")
    parser.add_argument("--scenario", choices=["normal", "rollover", "worker", "hydraulic", "fatigue"], default="normal", help="Simulation hazard scenario")
    parser.add_argument("--duration", type=int, default=0, help="Simulation run duration in seconds (0 = infinite)")
    args = parser.parse_args()

    api_endpoint = f"{args.url.rstrip('/')}/api/telemetry"
    interval = 1.0 / max(0.1, args.rate)
    
    print("=" * 70)
    print("  CAT OPERATOR COPILOT - CAN-BUS TELEMETRY STREAM SIMULATOR")
    print(f"  Target URL : {api_endpoint}")
    print(f"  Frequency  : {args.rate} Hz ({interval:.2f}s interval)")
    print(f"  Scenario   : {args.scenario.upper()}")
    print("=" * 70)
    
    t_start = time.time()
    step_count = 0
    
    try:
        while True:
            elapsed = time.time() - t_start
            if args.duration > 0 and elapsed >= args.duration:
                print(f"\n[INFO] Simulation duration of {args.duration}s reached. Exiting cleanly.")
                break
                
            payload = generate_telemetry_step(elapsed, args.scenario, {})
            try:
                resp = requests.post(api_endpoint, json=payload, timeout=2.0)
                if resp.status_code == 200:
                    step_count += 1
                    print(
                        f"[{elapsed:06.1f}s | Step {step_count:04d}] "
                        f"RPM: {payload['engineRpm']:04.0f} | "
                        f"Hyd: {payload['hydraulicPressure']:05.1f} bar | "
                        f"Roll: {payload['rollAngle']:+04.1f}° | "
                        f"Prox: {payload['proximityFront']:04.1f}m | "
                        f"PERCLOS: {payload['eyeClosurePerclos']:.2f} -> POST 200 OK"
                    )
                else:
                    print(f"[{elapsed:06.1f}s] Error {resp.status_code}: {resp.text}")
            except requests.exceptions.RequestException as e:
                print(f"[{elapsed:06.1f}s] Connection Failed to {api_endpoint}: {e}")
                
            time.sleep(interval)
            
    except KeyboardInterrupt:
        print(f"\n[INFO] Telemetry stream stopped by user after {step_count} telemetry packets.")

if __name__ == "__main__":
    main()
