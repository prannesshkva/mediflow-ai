

import os
import time
import random
from typing import Tuple, List, Dict

CLINIC_KB = {
    "clinic_policy": [
        "MediFlow Clinic is open Monday to Saturday, 8:00 AM to 8:00 PM. Sundays are closed except for emergency triage.",
        "For appointments, patients should arrive 15 minutes early with their ID proof and insurance card.",
        "Cancellations must be made at least 24 hours in advance to avoid a no-show fee of ₹200.",
        "MediFlow Clinic accepts all major health insurance providers and Third-Party Administrators (TPAs).",
        "Consultation fees: General Consultation ₹500, Specialist Consultation ₹1000, Emergency Triage ₹1500.",
        "Patients should bring all previous medical records, prescriptions, and test reports for consultation.",
    ],
    "appointment_booking": [
        "Appointments can be booked directly online through the MediFlow AI portal or by visiting the clinic front desk.",
        "Clinical departments available: General Medicine, Cardiology, Dermatology, Orthopedics, Pediatrics, and Gynecology & Women's Health.",
        "Morning slots available: 9:00 AM, 9:30 AM, 10:00 AM, 10:30 AM, 11:00 AM, 11:30 AM.",
        "Evening slots available: 4:00 PM, 4:30 PM, 5:00 PM, 5:30 PM, 6:00 PM, 6:30 PM.",
        "For urgent same-day consultations, please report directly to the clinic triage desk.",
    ],
    "prescription_question": [
        "Prescription refills require an active consultation record within the last 30 days.",
        "Controlled substances and Schedule H/H1 medications require an in-person clinical evaluation.",
        "Always take medications strictly as prescribed. Do not alter dosage without clinical consultation.",
        "If you experience side effects or adverse drug reactions, visit the clinic triage desk immediately.",
        "Prescription pickup is available Monday to Saturday from 9 AM to 7 PM at our pharmacy counter.",
    ],
    "follow_up_request": [
        "Diagnostic laboratory test results are typically available within 24-48 hours for routine tests and 3-5 days for specialized panels.",
        "Follow-up consultations should be scheduled within 2 weeks of completing prescribed therapy.",
        "You will receive an automated email notification when your diagnostic results are finalized.",
        "For post-operative follow-ups, please book an appointment in the Appointments section.",
        "Diagnostic reports can be reviewed directly in the Reports tab of your patient portal.",
    ],
    "general_inquiry": [
        "MediFlow Clinic is located at 12, Healthcare Avenue, Koramangala, Bangalore - 560034.",
        "Emergency clinical triage is available 24/7 at the clinic acute care wing.",
        "We offer home visit services for elderly and differently-abled patients upon prior clinical booking.",
        "The clinic features an accredited on-site laboratory, pharmacy, and diagnostic radiology facility.",
        "Patient parking is available in the facility basement free of charge.",
    ],
    "emergency_symptom": [
        "⚠️ EMERGENCY: If you are experiencing an acute medical emergency, proceed to the nearest hospital emergency room immediately.",
        "For acute chest pain, respiratory distress, or loss of consciousness, seek immediate emergency medical care.",
        "Do not drive yourself if you are experiencing severe or debilitating symptoms.",
        "MediFlow Acute Care Wing is staffed 24/7 for walk-in emergency clinical stabilization.",
    ],
}

def _mock_rag_retrieve(query: str, intent: str) -> List[str]:

    time.sleep(random.uniform(0.08, 0.20))
    kb_entries = CLINIC_KB.get(intent, CLINIC_KB["general_inquiry"])

    return kb_entries[:3]

def _pinecone_retrieve(query: str, intent: str) -> List[str]:

    try:
        import google.generativeai as genai
        from pinecone import Pinecone

        genai.configure(api_key=os.environ["GEMINI_API_KEY"])
        pc = Pinecone(api_key=os.environ["PINECONE_API_KEY"])
        index = pc.Index(os.environ.get("PINECONE_INDEX", "mediflow"))

        result = genai.embed_content(
            model="models/text-embedding-004",
            content=query,
            task_type="retrieval_query",
        )
        query_embedding = result["embedding"]

        response = index.query(
            vector=query_embedding,
            top_k=5,
            include_metadata=True,
        )
        return [match["metadata"]["text"] for match in response["matches"]]
    except Exception:
        return _mock_rag_retrieve(query, intent)

def run_rag_agent(query: str, intent: str) -> Tuple[List[str], bool, int]:

    start = time.time()
    has_pinecone = bool(os.getenv("PINECONE_API_KEY", ""))
    has_gemini = bool(os.getenv("GEMINI_API_KEY", ""))

    if has_pinecone and has_gemini:
        chunks = _pinecone_retrieve(query, intent)
        used_real = True
    else:
        chunks = _mock_rag_retrieve(query, intent)
        used_real = False

    duration = int((time.time() - start) * 1000)
    return chunks, used_real, duration
