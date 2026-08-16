import os
import csv
import uuid
import math
from datetime import datetime
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.models import HistoricalRainfall
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage
from app.ai.config import get_ai_config

def ingest_historical_rainfall(db: Session):
    """
    Cleans and ingests the raw daily rainfall CSV into the database.
    Deduplicates raw rows, normalizes negative values, maps district spelling,
    validates dates, and records counts.
    """
    csv_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data_sources", "ap_rainfall.csv")
    if not os.path.exists(csv_path):
        print(f"Historical rainfall CSV not found at {csv_path}")
        return
        
    print("Ingesting historical rainfall dataset...")
    unique_rows = []
    seen = set()
    
    with open(csv_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            # Create a tuple of all fields to verify exact duplicates
            row_tuple = (
                row["State"].strip(),
                row["District"].strip(),
                row["Date"].strip(),
                row["Year"].strip(),
                row["Month"].strip(),
                row["Avg_rainfall"].strip(),
                row["Agency_name"].strip()
            )
            if row_tuple not in seen:
                seen.add(row_tuple)
                unique_rows.append(row)
                
    total_raw_rows = reader.line_num - 1
    total_unique_rows = len(unique_rows)
    print(f"CSV Ingestion Audit: Total raw rows = {total_raw_rows}, Deduplicated rows = {total_unique_rows}")
    
    # Empty existing records to avoid duplicate keys if any
    db.query(HistoricalRainfall).delete()
    
    db_records = []
    for row in unique_rows:
        raw_rain = float(row["Avg_rainfall"])
        # Normalize negative rainfall values to 0.0
        normalized_rain = max(0.0, raw_rain)
        
        raw_dist = row["District"].strip()
        # Normalize spelling Visakhapatanam -> Visakhapatnam
        normalized_dist = "Visakhapatnam" if raw_dist == "Visakhapatanam" else raw_dist
        
        # Parse date (format YYYY-MM-DD)
        date_obj = datetime.strptime(row["Date"].strip(), "%Y-%m-%d")
        
        rec = HistoricalRainfall(
            id=uuid.uuid4(),
            state=row["State"].strip(),
            district=normalized_dist,
            original_district=raw_dist,
            date=date_obj,
            year=int(row["Year"]),
            month=int(row["Month"]),
            avg_rainfall=normalized_rain,
            agency_name=row["Agency_name"].strip(),
            source_type="HISTORICAL_DATASET"
        )
        db_records.append(rec)
        
    db.bulk_save_objects(db_records)
    db.commit()
    print(f"Seeded database with {len(db_records)} cleaned historical rainfall records.")


class RuralFloodService:
    @staticmethod
    def get_dataset_summary(db: Session) -> Dict[str, Any]:
        """
        Returns summary statistics about the historical rainfall dataset.
        """
        total = db.query(func.count(HistoricalRainfall.id)).scalar() or 0
        districts = [d[0] for d in db.query(HistoricalRainfall.district).distinct().all()]
        
        min_date = db.query(func.min(HistoricalRainfall.date)).scalar()
        max_date = db.query(func.max(HistoricalRainfall.date)).scalar()
        
        min_date_str = min_date.strftime("%Y-%m-%d") if min_date else None
        max_date_str = max_date.strftime("%Y-%m-%d") if max_date else None
        
        return {
            "total_records": total,
            "districts": districts,
            "date_range": {
                "start": min_date_str,
                "end": max_date_str
            },
            "agency_name": "NRSC VIC MODEL",
            "source_type": "HISTORICAL_DATASET"
        }

    @classmethod
    def get_district_baseline(cls, db: Session, district: str = "Visakhapatnam") -> Dict[str, Any]:
        """
        Retrieves baseline statistics and monthly averages for the specified district.
        """
        records = db.query(HistoricalRainfall).filter(HistoricalRainfall.district == district).all()
        if not records:
            return {}

        total_records = len(records)
        dates = [r.date for r in records]
        min_date_str = min(dates).strftime("%Y-%m-%d") if dates else None
        max_date_str = max(dates).strftime("%Y-%m-%d") if dates else None
        
        # Extracted years and months
        available_months = sorted(list(set(r.month for r in records)))
        
        # Calculate percentiles dynamically
        rain_values = sorted([r.avg_rainfall for r in records])
        
        def get_percentile(p):
            if not rain_values:
                return 0.0
            k = (len(rain_values) - 1) * (p / 100.0)
            f = math.floor(k)
            c = math.ceil(k)
            if f == c:
                return rain_values[int(k)]
            return rain_values[f] * (c - k) + rain_values[c] * (k - f)

        percentiles = {
            "p50": get_percentile(50),
            "p75": get_percentile(75),
            "p90": get_percentile(90),
            "p95": get_percentile(95),
            "p99": get_percentile(99)
        }

        # Calculate monthly statistics
        monthly_stats = []
        for m in available_months:
            m_records = [r for r in records if r.month == m]
            m_rain = [r.avg_rainfall for r in m_records]
            
            m_mean = sum(m_rain) / len(m_rain) if m_rain else 0.0
            m_max = max(m_rain) if m_rain else 0.0
            
            # Standard deviation in Python
            m_variance = sum((x - m_mean) ** 2 for x in m_rain) / len(m_rain) if len(m_rain) > 0 else 0.0
            m_std = math.sqrt(m_variance)
            
            monthly_stats.append({
                "month": m,
                "record_count": len(m_records),
                "avg_rainfall": m_mean,
                "max_rainfall": m_max,
                "std_rainfall": m_std
            })

        return {
            "district": district,
            "total_records": total_records,
            "date_range": {
                "start": min_date_str,
                "end": max_date_str
            },
            "percentiles": percentiles,
            "monthly_stats": monthly_stats,
            "agency_name": "NRSC VIC MODEL",
            "source_type": "HISTORICAL_DATASET"
        }

    @classmethod
    def calculate_scenario_risk(
        cls, 
        db: Session, 
        month: int, 
        scenario_rainfall_mm: float, 
        district: str = "Visakhapatnam"
    ) -> Dict[str, Any]:
        """
        Executes a deterministic risk calculation for a scenario rainfall in a given month.
        Compares the scenario against overall percentiles and monthly averages.
        """
        baseline = cls.get_district_baseline(db, district)
        if not baseline:
            raise ValueError(f"No historical records found for district: {district}")

        # Check if the requested month is within our baseline
        m_stat = next((m for m in baseline["monthly_stats"] if m["month"] == month), None)
        if not m_stat:
            raise ValueError(f"Month {month} is outside the available historical records range.")

        # Overall distribution percentiles (Data-Derived Baselines)
        p75 = baseline["percentiles"]["p75"]
        p90 = baseline["percentiles"]["p90"]
        p99 = baseline["percentiles"]["p99"]

        # Determine Absolute Risk Level (data-derived boundaries)
        if scenario_rainfall_mm <= p75:
            risk_level = "LOW"
        elif scenario_rainfall_mm <= p90:
            risk_level = "MEDIUM"
        elif scenario_rainfall_mm <= p99:
            risk_level = "HIGH"
        else:
            risk_level = "CRITICAL"

        # Monthly relative comparison
        m_mean = m_stat["avg_rainfall"]
        m_max = m_stat["max_rainfall"]
        m_std = m_stat["std_rainfall"]

        # Calculate z-score
        z_score = 0.0
        if m_std > 0:
            z_score = (scenario_rainfall_mm - m_mean) / m_std

        # Percentage deviation
        pct_deviation = 0.0
        if m_mean > 0:
            pct_deviation = ((scenario_rainfall_mm - m_mean) / m_mean) * 100.0

        # Anomaly status
        is_anomaly = scenario_rainfall_mm > (m_mean + m_std)

        # Risk drivers & Evidence assembly
        risk_drivers = []
        evidence = []

        evidence.append(f"Scenario rainfall: {scenario_rainfall_mm:.2f} mm/day vs. Monthly average: {m_mean:.2f} mm/day.")
        evidence.append(f"Z-score: {z_score:.2f} standard deviations from the monthly mean.")
        evidence.append(f"Percentile thresholds: P75={p75:.2f}mm, P90={p90:.2f}mm, P99={p99:.2f}mm.")

        if scenario_rainfall_mm > p99:
            risk_drivers.append("Extreme rainfall event exceeding the 99th percentile of historical records.")
        elif scenario_rainfall_mm > p90:
            risk_drivers.append("Heavy rainfall event exceeding the 90th percentile of historical records.")
        
        if scenario_rainfall_mm > m_max:
            risk_drivers.append(f"Scenario rainfall exceeds the historical maximum observed for Month {month} ({m_max:.2f} mm/day).")
        
        if z_score > 3.0:
            risk_drivers.append("Severe precipitation anomaly detected (Z-score > 3.0).")
        elif z_score > 1.5:
            risk_drivers.append("Moderate precipitation anomaly detected (Z-score > 1.5).")

        if not risk_drivers:
            risk_drivers.append("Rainfall is within normal historical baseline fluctuations.")

        # Map qualitative agricultural impact
        if risk_level == "LOW":
            ag_impact = [
                "Potential agricultural impact: Minimal.",
                "Sufficient crop watering under normal absorption conditions.",
                "No precautions required. Standard agricultural monitoring remains sufficient."
            ]
        elif risk_level == "MEDIUM":
            ag_impact = [
                "Potential agricultural impact: Minor waterlogging risk in low-lying fields.",
                "Increased soil moisture may affect recently sown crops.",
                "Precautions: Monitor crop roots for water congestion. Ensure secondary drainage trenches are clear."
            ]
        elif risk_level == "HIGH":
            ag_impact = [
                "Potential agricultural impact: Moderate to severe waterlogging across field zones.",
                "High moisture levels risk spoiling pesticide/fertilizer applications and rotting crop roots.",
                "Precautions: Clear all main field drainage outlets. Postpone chemical sprays. Move harvested crops to elevated storage."
            ]
        else:  # CRITICAL
            ag_impact = [
                "Potential agricultural impact: Extensive waterlogging and localized agricultural field flooding.",
                "High risk of crop root rot, topsoil erosion, and crop washing.",
                "Precautions: Execute emergency field drainage. Protect harvested seedbeds immediately. Postpone all planting activities."
            ]

        return {
            "location": "Visakhapatnam Rural",
            "risk_level": risk_level,
            "scenario": {
                "month": month,
                "rainfall_mm": scenario_rainfall_mm
            },
            "historical_baseline": {
                "monthly_avg_mm": m_mean,
                "monthly_max_mm": m_max,
                "monthly_std_mm": m_std,
                "percentiles": baseline["percentiles"]
            },
            "metrics": {
                "z_score": z_score,
                "pct_deviation": pct_deviation,
                "is_anomaly": is_anomaly
            },
            "risk_drivers": risk_drivers,
            "evidence": evidence,
            "agricultural_impact": ag_impact,
            "agency_name": "NRSC VIC MODEL",
            "source_type": "HISTORICAL_DATASET"
        }

    @classmethod
    def get_ai_recommendation(cls, db: Session, risk_data: Dict[str, Any]) -> str:
        """
        Coordinates with Gemini to generate qualitative rural flood advisories.
        Strictly consumes deterministic risk data without inventing telemetry values or crop statistics.
        """
        config = get_ai_config()
        api_key = config.get("api_key")
        
        # Check API key config
        if not api_key or api_key == "mock_key":
            # Fallback mock recommendation if Gemini is not configured
            return (
                "### AI-DERIVED RECOMMENDATION\n\n"
                "**Risk Explanation:** The simulated scenario is evaluated at **" + risk_data["risk_level"] + "** risk. "
                "The z-score is " + f"{risk_data['metrics']['z_score']:.2f}" + " std devs from the monthly baseline.\n\n"
                "**Agricultural Precautions:**\n"
                "- Farmers should monitor field drainage channels immediately.\n"
                "- Postpone pesticide or fertilizer applications.\n\n"
                "**Authority Recommendations:**\n"
                "- Mobilize agricultural officers to advise panchayats.\n"
                "- Prepare temporary storage centers for harvested crops."
            )

        model = ChatGoogleGenerativeAI(
            model=config.get("model", "gemini-3.6-flash"),
            google_api_key=api_key,
            temperature=0.2,
            timeout=30.0
        )

        evidence_str = (
            f"Location: {risk_data['location']}\n"
            f"Scenario Rainfall: {risk_data['scenario']['rainfall_mm']:.2f} mm/day in Month {risk_data['scenario']['month']}\n"
            f"Deterministic Risk Level: {risk_data['risk_level']}\n"
            f"Historical Monthly Mean: {risk_data['historical_baseline']['monthly_avg_mm']:.2f} mm/day\n"
            f"Historical Monthly Max: {risk_data['historical_baseline']['monthly_max_mm']:.2f} mm/day\n"
            f"Z-Score: {risk_data['metrics']['z_score']:.2f}\n"
            f"Risk Drivers: {', '.join(risk_data['risk_drivers'])}\n"
            f"Data Provenance Source: NRSC VIC MODEL"
        )

        system_prompt = (
            "You are the BHARATOS Rural Intelligence Agent.\n"
            "Your job is to read the deterministic rainfall analysis and output a concise, expert qualitative advisory for rural Visakhapatnam.\n"
            "CRITICAL: Do NOT invent, hallucinate, or assume any statistics. Do NOT claim crop damage in exact hectares, percentages, or financial terms (e.g. do not say '120 hectares of paddy will be lost' or '$40,000 damage'). Use strictly qualitative terms like 'potential agricultural field waterlogging' or 'risk of standing crop root rot'.\n"
            "Do NOT reference any live sensor IDs, IOT devices, or dispatch numbers. Keep it strictly advisory.\n\n"
            "Format your response with the following headers in Markdown:\n"
            "### AI-DERIVED RECOMMENDATION\n\n"
            "**Risk Explanation:** [Brief explanation of the risk, explaining how the scenario compares to the historical baseline for that month]\n\n"
            "**Agricultural Precautions:** [Precautionary suggestions for rural farmers regarding soil erosion, waterlogging, protective actions]\n\n"
            "**Authority Recommendations:** [Recommendations for district administration and extension officers to prepare, distribute advice, or monitor storage]\n\n"
            "**Communication Guidelines:** [A simple advisory message template authorities can send to panchayats]"
        )

        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=f"SCENARIO METRICS AND EVIDENCE:\n{evidence_str}\n\nGenerate advisory now.")
        ]

        try:
            res = model.invoke(messages)
            content = res.content
            if "AI-DERIVED RECOMMENDATION" not in content:
                content = f"### AI-DERIVED RECOMMENDATION\n\n{content}"
            return content
        except Exception as e:
            return (
                "### AI-DERIVED RECOMMENDATION\n\n"
                f"Error generating AI advisory: {str(e)}\n"
                f"Risk Assessment: {risk_data['risk_level']} Risk Level. "
                "Monitor drainage channels and standing crops."
            )
