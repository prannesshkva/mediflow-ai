

import os
import re
import time
import random
from typing import Tuple, Optional, Dict
from datetime import datetime, timezone

from app.database.supabase import db

DEPARTMENTS = [
    "Department of General Medicine",
    "Department of Cardiology",
    "Department of Dermatology",
    "Department of Orthopedics",
    "Department of Gynecology & Women's Health",
    "Department of Pediatrics",
]

def _extract_appointment_info(query: str, intent: str, patient_name: str) -> Dict:

    q = query.lower()

    action = "book"
    if intent == "appointment_cancellation" or "cancel" in q:
        action = "cancel"
    elif intent == "appointment_reschedule" or any(w in q for w in ["reschedule", "change", "move", "postpone"]):
        action = "reschedule"

    # Extract any physician name explicitly requested in query
    doctor = None
    dr_match = re.search(r"(?:dr\.?|doctor)\s+([A-Za-z]+(?:\s+[A-Za-z]+)?)", query, re.IGNORECASE)
    if dr_match:
        doctor = f"Dr. {dr_match.group(1).title()}"

    if not doctor:
        if any(w in q for w in ["heart", "cardiac", "cardio"]):
            doctor = "Department of Cardiology"
        elif any(w in q for w in ["skin", "derma", "acne", "rash"]):
            doctor = "Department of Dermatology"
        elif any(w in q for w in ["bone", "joint", "ortho", "fracture"]):
            doctor = "Department of Orthopedics"
        elif any(w in q for w in ["child", "baby", "pediatric", "kid"]):
            doctor = "Department of Pediatrics"
        elif any(w in q for w in ["gynec", "women", "pregnancy", "period"]):
            doctor = "Department of Gynecology & Women's Health"
        else:
            doctor = "Department of General Medicine"

    date_str = None
    from datetime import timedelta
    today = datetime.now(timezone.utc)
    if "tomorrow" in q:
        date_str = (today + timedelta(days=1)).strftime("%Y-%m-%dT10:30:00Z")
    elif "today" in q:
        date_str = today.strftime("%Y-%m-%dT14:00:00Z")
    elif "monday" in q:
        date_str = (today + timedelta(days=(0 - today.weekday()) % 7 or 7)).strftime("%Y-%m-%dT10:00:00Z")
    elif "tuesday" in q:
        date_str = (today + timedelta(days=(1 - today.weekday()) % 7 or 7)).strftime("%Y-%m-%dT10:00:00Z")
    elif "wednesday" in q:
        date_str = (today + timedelta(days=(2 - today.weekday()) % 7 or 7)).strftime("%Y-%m-%dT10:00:00Z")
    elif "thursday" in q:
        date_str = (today + timedelta(days=(3 - today.weekday()) % 7 or 7)).strftime("%Y-%m-%dT10:00:00Z")
    elif "friday" in q:
        date_str = (today + timedelta(days=(4 - today.weekday()) % 7 or 7)).strftime("%Y-%m-%dT10:00:00Z")
    else:

        date_str = (today + timedelta(days=2)).strftime("%Y-%m-%dT10:30:00Z")

    return {
        "action": action,
        "doctor": doctor,
        "date_str": date_str,
        "patient_name": patient_name,
    }

def run_appointment_agent(
    query: str,
    intent: str,
    patient_name: str,
    user_id: str,
) -> Tuple[Optional[Dict], int]:

    start = time.time()

    appointment_intents = {
        "appointment_booking",
        "appointment_cancellation",
        "appointment_reschedule",
        "appointment_inquiry",
    }

    if intent not in appointment_intents:
        time.sleep(random.uniform(0.02, 0.05))
        return None, int((time.time() - start) * 1000)

    info = _extract_appointment_info(query, intent, patient_name)

    if info["action"] == "book":
        record = db.create_appointment({
            "patient_name": patient_name,
            "user_id": user_id,
            "doctor_name": info["doctor"],
            "appointment_date": info["date_str"],
            "notes": f"Booked via MediFlow AI: {query[:100]}",
        })
        result = {
            "action": "booked",
            "appointment_id": record["id"],
            "doctor": info["doctor"],
            "date": info["date_str"],
            "status": "pending",
        }
    elif intent == "appointment_inquiry":
        appts = db.get_user_appointments(user_id)
        if appts:
            result = {
                "action": "inquiry_results",
                "appointments": appts
            }
        else:
            result = {
                "action": "inquiry_results",
                "appointments": []
            }
    elif info["action"] == "cancel":
        result = {
            "action": "cancel_requested",
            "message": "Please visit the clinic reception desk or manage your booking directly in the Appointments section.",
        }
    else:
        result = {
            "action": "reschedule_requested",
            "message": "Please visit the clinic reception desk or select a new date in the Appointments section.",
        }

    duration = int((time.time() - start) * 1000)
    return result, duration
