"""
CAT Operator Copilot - Multi-Scenario Batch Stress Testing Engine
==================================================================
Runs automated parameter sweeps and counterfactual what-if simulations against
the backend ML models (ETA Predictor, Anomaly Detector, and Risk Engine).

Usage:
    python run_batch_scenarios.py [--url http://127.0.0.1:8000]
"""

import argparse
import json
import sys
import requests

SCENARIOS = [
    {
        "name": "Standard Nominal Operation (Dry Clay, Clear Weather)",
        "input": {
            "operatorFatigueIndex": 0.15,
            "weatherSeverity": "clear",
            "soilDensityTonsM3": 1.6,
            "targetGradeSlopePct": 4.0,
            "targetCycleCount": 50,
            "haulDistanceMeters": 150.0,
            "trafficCongestionLevel": "low"
        }
    },
    {
        "name": "Extreme Adverse Weather (Heavy Rain + Wet Clay)",
        "input": {
            "operatorFatigueIndex": 0.25,
            "weatherSeverity": "heavy_rain",
            "soilDensityTonsM3": 2.2,
            "targetGradeSlopePct": 12.0,
            "targetCycleCount": 50,
            "haulDistanceMeters": 150.0,
            "trafficCongestionLevel": "moderate"
        }
    },
    {
        "name": "Sub-Zero Freezing Frost + High Site Congestion",
        "input": {
            "operatorFatigueIndex": 0.35,
            "weatherSeverity": "subzero_frost",
            "soilDensityTonsM3": 2.4,
            "targetGradeSlopePct": 8.0,
            "targetCycleCount": 50,
            "haulDistanceMeters": 280.0,
            "trafficCongestionLevel": "high"
        }
    },
    {
        "name": "High Operator Fatigue (Shift Overtime, PERCLOS Spike)",
        "input": {
            "operatorFatigueIndex": 0.88,
            "weatherSeverity": "clear",
            "soilDensityTonsM3": 1.7,
            "targetGradeSlopePct": 5.0,
            "targetCycleCount": 50,
            "haulDistanceMeters": 150.0,
            "trafficCongestionLevel": "low"
        }
    },
    {
        "name": "Compound Worst-Case (Storm + High Fatigue + Steep Incline)",
        "input": {
            "operatorFatigueIndex": 0.92,
            "weatherSeverity": "storm_winds",
            "soilDensityTonsM3": 2.6,
            "targetGradeSlopePct": 18.5,
            "targetCycleCount": 60,
            "haulDistanceMeters": 400.0,
            "trafficCongestionLevel": "high"
        }
    }
]

def main():
    parser = argparse.ArgumentParser(description="CAT Batch Counterfactual Scenario Simulator")
    parser.add_argument("--url", default="http://127.0.0.1:8000", help="FastAPI backend host URL")
    args = parser.parse_args()

    api_endpoint = f"{args.url.rstrip('/')}/api/simulator"
    print("=" * 80)
    print("  CAT OPERATOR COPILOT - BATCH COUNTERFACTUAL SCENARIO TEST ENGINE")
    print(f"  Target Endpoint: {api_endpoint}")
    print(f"  Scenarios to evaluate: {len(SCENARIOS)}")
    print("=" * 80)

    results = []
    for i, scenario in enumerate(SCENARIOS, 1):
        print(f"\n[Test {i}/{len(SCENARIOS)}] Executing: {scenario['name']}...")
        try:
            resp = requests.post(api_endpoint, json=scenario["input"], timeout=5.0)
            if resp.status_code == 200:
                data = resp.json()
                results.append((scenario["name"], data))
                print(f"  ✓ Predicted ETA      : {data.get('predictedEtaMinutes', 'N/A')} min (Baseline: {data.get('baselineEtaMinutes', 'N/A')} min)")
                print(f"  ✓ Delay Delta        : {data.get('etaDeltaMinutes', 0.0):+0.1f} min")
                print(f"  ✓ Risk Score         : {data.get('projectedRiskScore', 0.0):.1f} / 100 ({data.get('riskLevel', 'N/A').upper()})")
                print(f"  ✓ Fuel Consumption   : {data.get('fuelConsumptionLiters', 0.0):.1f} L (Delta: {data.get('fuelDeltaLiters', 0.0):+0.1f} L)")
                print(f"  ✓ Interventions Exp. : {data.get('predictedInterventionCount', 0)}")
                print(f"  ✓ Recommendations    : {', '.join(data.get('mitigationRecommendations', [])[:2])}")
            else:
                print(f"  ✗ Failed ({resp.status_code}): {resp.text}")
        except requests.exceptions.RequestException as e:
            print(f"  ✗ Connection Error: {e}")

    print("\n" + "=" * 80)
    print("  SUMMARY MATRIX OF COUNTERFACTUAL IMPACTS")
    print("=" * 80)
    print(f"{'Scenario':<40} | {'Risk':<10} | {'ETA (min)':<10} | {'Delta':<8} | {'Fuel (L)':<8}")
    print("-" * 80)
    for name, res in results:
        short_name = name[:38] + ".." if len(name) > 40 else name
        print(f"{short_name:<40} | {res.get('riskLevel','N/A'):<10} | {res.get('predictedEtaMinutes',0):<10.1f} | {res.get('etaDeltaMinutes',0):<+8.1f} | {res.get('fuelConsumptionLiters',0):<8.1f}")
    print("=" * 80)

if __name__ == "__main__":
    main()
