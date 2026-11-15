

import os
import time
import random
from typing import List, Optional, Dict, Tuple
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv

for candidate in [
    Path.cwd() / "backend" / ".env",
    Path.cwd() / ".env",
    Path(__file__).resolve().parent.parent.parent / ".env",
    Path(__file__).resolve().parent.parent / ".env",
]:
    if candidate.exists():
        load_dotenv(dotenv_path=candidate)
        break

def _format_appointment_response(appointment_data: Dict) -> str:
    if not appointment_data:
        return ""
    action = appointment_data.get("action", "")
    if action == "booked":
        date_str = appointment_data.get("date", "")
        try:
            dt = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
            formatted_date = dt.strftime("%A, %B %d, %Y at %I:%M %p")
        except Exception:
            formatted_date = date_str
        return f"""### 📅 Appointment Confirmed

| Detail | Information |
| :--- | :--- |
| **Doctor** | {appointment_data.get('doctor', 'TBD')} |
| **Date & Time** | {formatted_date} |
| **Status** | Pending Confirmation |
| **Reference ID** | `{appointment_data.get('appointment_id', 'N/A')}` |

**Important Instructions:**
* Arrive **15 minutes early** for registration.
* Bring valid photo ID and insurance card.
* Bring previous medical records and current medications list.
"""
    elif action == "cancel_requested":
        return "\n📋 **Cancellation Request Received**\n\nPlease visit the clinic reception desk or manage your booking directly in the Appointments section. Cancellations must be made 24 hours in advance.\n"
    elif action == "reschedule_requested":
        return "\n📅 **Reschedule Request Received**\n\nPlease visit the clinic reception desk or select a new date in the Appointments section. Our team will find the next available slot for you.\n"
    return ""

_TEMPLATE_RESPONSES = {
    "clinic_policy": lambda ctx, q: f"""Here's the information you need about our clinic:

{chr(10).join(f'• {c}' for c in ctx[:3])}

Is there anything specific you'd like to know more about? I'm happy to help!""",

    "appointment_booking": lambda ctx, q: f"""I'd be happy to help you book an appointment at MediFlow Clinic!

{chr(10).join(f'• {c}' for c in ctx[:2])}

**Clinical Departments & Available Specialties:**
- General Medicine
- Cardiology
- Dermatology
- Orthopedics
- Pediatrics
- Gynecology & Women's Health

Please let me know your preferred department or specialty and date, and I'll get that scheduled for you!""",

    "prescription_question": lambda ctx, q: f"""Regarding your prescription query:

{chr(10).join(f'• {c}' for c in ctx[:3])}

For specific medication advice, please consult with your healthcare provider directly.""",

    "follow_up_request": lambda ctx, q: f"""Here's information about your follow-up:

{chr(10).join(f'• {c}' for c in ctx[:3])}

If you need to schedule a follow-up consultation, you can book one in the Appointments section!""",

    "general_inquiry": lambda ctx, q: f"""Thank you for reaching out to MediFlow AI! Here's what I can help you with:

{chr(10).join(f'• {c}' for c in ctx[:3])}

Feel free to ask about appointments, clinic hours, diagnostic reports, or clinical departments!""",

    "emergency_symptom": lambda ctx, q: """**Please seek immediate emergency medical care.**

Please proceed directly to the nearest hospital emergency room or acute care facility.

Do not wait — acute or life-threatening symptoms require urgent in-person medical evaluation.""",

    "report_upload": lambda ctx, q: """Your report has been received and is being processed by our AI system.

**What happens next:**
1. Our AI analyzes and extracts structured clinical metrics and findings
2. You can view the extracted summary in the Reports section
3. The clinical payload is staged for healthcare provider review

Please note that AI summaries are for informational purposes only and should be reviewed by your clinician.""",

    "appointment_cancellation": lambda ctx, q: """I understand you'd like to cancel your appointment.

To complete the cancellation:
- **Online**: Use the Appointments section in your portal
- **In-person**: Visit the clinic reception desk

Please note that cancellations must be made **24 hours in advance** to avoid a ₹200 no-show fee.""",

    "appointment_reschedule": lambda ctx, q: """I'd be happy to help you reschedule your appointment.

**Options to reschedule:**
- **Online**: Select a new date and time in the Appointments section
- **In-person**: Stop by the clinic reception desk

Would you like me to find available slots for a specific clinical department or date?""",
}

def _template_response(query: str, intent: str, context: List[str], appointment_data: Optional[Dict]) -> str:
    appt_block = _format_appointment_response(appointment_data) if appointment_data else ""
    if appt_block:
        return appt_block.strip()
    template_fn = _TEMPLATE_RESPONSES.get(intent, _TEMPLATE_RESPONSES["general_inquiry"])
    base = template_fn(context, query)
    return base.strip()

def _groq_response(
    query: str,
    intent: str,
    context: List[str],
    risk_level: str,
    appointment_data: Optional[Dict],
    history: Optional[List[Dict[str, str]]] = None,
) -> str:
    try:
        from groq import Groq
        api_key = os.environ.get("GROQ_API_KEY", "")
        model_name = os.environ.get("GROQ_MODEL", "openai/gpt-oss-120b")
        client = Groq(api_key=api_key)

        appt_info = ""
        if appointment_data:
            appt_info = f"\nAppointment Action Taken: {appointment_data}\n"

        prompt = f"""You are MediFlow AI, a clinical operations and patient triage assistant.

Patient Query: "{query}"
Intent: {intent}
Risk Level: {risk_level}
{appt_info}

Relevant Clinic & Medical Information:
{chr(10).join(f'- {c}' for c in context)}

Generate a helpful, empathetic, patient-friendly response in clean markdown.
- Be warm and professional
- Use bullet points and clear formatting where helpful
- Do NOT give ungrounded medical diagnoses
- Keep response concise but medically complete
- If appointment was booked or referenced, include key confirmation details
- Never output phone numbers or dummy doctor names; refer to clinical departments (e.g. Department of General Medicine, Cardiology) or the online portal."""

        messages: List[Dict[str, str]] = [
            {
                "role": "system",
                "content": (
                    "You are MediFlow AI, an evidence-grounded clinical operations assistant. "
                    "You maintain context across follow-up queries within the consultation session. "
                    "Reference previous discussion details, requested dates, doctor specialties, or symptoms when appropriate, "
                    "and provide clear, structured markdown responses."
                ),
            }
        ]

        if history:
            for turn in history[-8:]:
                r = turn.get("role", "user")
                c = turn.get("content", "")
                if r in ("user", "assistant") and c:
                    messages.append({"role": r, "content": c})

        messages.append({"role": "user", "content": prompt})

        completion = client.chat.completions.create(
            model=model_name,
            messages=messages,
            temperature=0.2,
            max_tokens=600,
        )
        return completion.choices[0].message.content.strip()
    except Exception as e:
        if os.getenv("GEMINI_API_KEY"):
            return _gemini_response(query, intent, context, risk_level, appointment_data, history)
        return _template_response(query, intent, context, appointment_data)

def _gemini_response(
    query: str,
    intent: str,
    context: List[str],
    risk_level: str,
    appointment_data: Optional[Dict],
    history: Optional[List[Dict[str, str]]] = None,
) -> str:
    try:
        import google.generativeai as genai
        genai.configure(api_key=os.environ["GEMINI_API_KEY"])
        model = genai.GenerativeModel("gemini-1.5-flash")

        appt_info = ""
        if appointment_data:
            appt_info = f"\nAppointment Action Taken: {appointment_data}\n"

        history_context = ""
        if history:
            h_lines = []
            for h in history[-8:]:
                role_label = "Patient" if h.get("role") == "user" else "MediFlow Assistant"
                c = h.get("content", "").strip()
                if c:
                    h_lines.append(f"{role_label}: {c}")
            if h_lines:
                history_context = "\nPrevious Conversation Context in this Session:\n" + "\n".join(h_lines) + "\n"

        prompt = f"""You are MediFlow AI, a friendly and professional healthcare operations assistant for a clinic.
{history_context}
Patient Query: "{query}"
Intent: {intent}
Risk Level: {risk_level}
{appt_info}

Relevant Clinic Information:
{chr(10).join(f'- {c}' for c in context)}

Generate a helpful, empathetic, patient-friendly response in markdown format.
- Be warm and professional
- Use bullet points and formatting where helpful
- Do NOT give specific medical diagnoses
- Keep response concise but complete
- If appointment was booked, include confirmation details
- Never output phone numbers or dummy doctor names; refer to clinical departments or the online portal"""

        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception:
        return _template_response(query, intent, context, appointment_data)

def run_response_agent(
    query: str,
    intent: str,
    context: List[str],
    risk_level: str,
    appointment_data: Optional[Dict],
    history: Optional[List[Dict[str, str]]] = None,
) -> Tuple[str, int]:

    start = time.time()

    if os.getenv("GROQ_API_KEY"):
        response = _groq_response(query, intent, context, risk_level, appointment_data, history)
    elif os.getenv("GEMINI_API_KEY"):
        response = _gemini_response(query, intent, context, risk_level, appointment_data, history)
    else:
        time.sleep(random.uniform(0.10, 0.25))
        response = _template_response(query, intent, context, appointment_data)

    duration = int((time.time() - start) * 1000)
    return response, duration
