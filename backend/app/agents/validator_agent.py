import time
import re
from typing import Tuple, Dict, List, Optional, Any
from app.core.circuit_breaker import get_circuit_breaker, CircuitState

_UNSAFE_PATTERNS = [
    "you should take",
    "i recommend taking",
    "take this medication",
    "the diagnosis is",
    "you have",
    "you are suffering from",
    "this means you have",
    "you definitely have",
    "guaranteed to work",
    "100% effective",
    "cure for sure",
    "stop taking your prescribed",
]

# Clinical Contraindication Rules
CONTRAINDICATION_RULES: List[Dict[str, Any]] = [
    {
        "id": "contra-001",
        "description": "NSAIDs / Aspirin with active peptic ulcer or GI bleeding",
        "drug_pattern": r"\b(aspirin|ibuprofen|advil|motrin|naproxen|diclofenac)\b",
        "condition_pattern": r"\b(ulcer|gi bleed|stomach bleeding|gastric ulcer|peptic ulcer)\b",
        "severity": "HIGH",
        "warning": "CRITICAL CONTRAINDICATION: NSAIDs/Aspirin are contraindicated in patients with active peptic ulcer or gastrointestinal bleeding.",
    },
    {
        "id": "contra-002",
        "description": "PDE5 inhibitors (Sildenafil/Tadalafil) with organic nitrates (Nitroglycerin)",
        "drug_pattern": r"\b(sildenafil|viagra|tadalafil|cialis)\b",
        "condition_pattern": r"\b(nitrate|nitroglycerin|nitrostat|isosorbide)\b",
        "severity": "CRITICAL",
        "warning": "LETHAL CONTRAINDICATION: Co-administration of PDE5 inhibitors with organic nitrates causes severe, potentially fatal refractory hypotension.",
    },
    {
        "id": "contra-003",
        "description": "ACE Inhibitors in Pregnancy",
        "drug_pattern": r"\b(lisinopril|enalapril|ramipril|captopril|benazepril)\b",
        "condition_pattern": r"\b(pregnant|pregnancy|trimester)\b",
        "severity": "HIGH",
        "warning": "FETOTOXIC CONTRAINDICATION: ACE inhibitors are contraindicated in pregnancy due to severe fetal renal dysgenesis.",
    },
    {
        "id": "contra-004",
        "description": "High-dose Acetaminophen in acute liver failure",
        "drug_pattern": r"\b(acetaminophen|paracetamol|tylenol)\b",
        "condition_pattern": r"\b(cirrhosis|liver failure|acute hepatitis|hepatic impairment)\b",
        "severity": "HIGH",
        "warning": "HEPATOTOXIC RISK: High-dose acetaminophen is contraindicated in severe hepatic impairment or acute liver failure.",
    },
]

_DISCLAIMER = (
    "\n\n> ⚕️ **Medical Disclaimer**: This clinical guidance is generated for educational "
    "and triage assistance only and does not substitute professional medical judgment. "
    "A licensed physician must verify all treatment recommendations."
)

_EMERGENCY_DISCLAIMER = (
    "\n\n🚨 **EMERGENCY MEDICAL ALERT**: If the patient is experiencing acute chest pain, "
    "shortness of breath, severe allergic reaction (anaphylaxis), or stroke symptoms (FAST), "
    "call **112 / 911** immediately or transfer to the nearest Emergency Department. "
    "Do not delay for asynchronous triage."
)

def check_contraindications(text: str, context_text: str = "") -> List[Dict]:
    """Detects dangerous drug-condition contraindications across input text and context."""
    combined = f"{text} {context_text}".lower()
    flagged = []
    for rule in CONTRAINDICATION_RULES:
        drug_match = re.search(rule["drug_pattern"], combined, re.IGNORECASE)
        condition_match = re.search(rule["condition_pattern"], combined, re.IGNORECASE)
        if drug_match and condition_match:
            flagged.append({
                "rule_id": rule["id"],
                "severity": rule["severity"],
                "warning": rule["warning"],
                "matched_drug": drug_match.group(0),
                "matched_condition": condition_match.group(0),
            })
    return flagged

def _check_safety(
    response_draft: str,
    intent: str,
    risk_level: str,
    patient_query: str = "",
) -> Dict:
    breaker = get_circuit_breaker()
    issues = []
    contraindications = check_contraindications(response_draft, patient_query)

    # If circuit breaker is tripped (OPEN), provide fail-safe response
    if not breaker.can_execute():
        return {
            "passed": False,
            "confidence": 0.50,
            "issues": ["Circuit breaker OPEN: upstream LLM safety threshold exceeded. Fallback response active."],
            "modified_response": (
                "⚠️ **Automated Clinical Guardrail Active**: The clinical intelligence service has "
                "routed this request directly to on-call clinical oversight due to safety thresholds. "
                "A clinician will review this chart shortly." + _DISCLAIMER
            ),
            "disclaimer_added": True,
            "contraindications": contraindications,
            "circuit_breaker_tripped": True,
        }

    modified_response = response_draft
    add_disclaimer = False
    confidence = 0.95

    lower = response_draft.lower()
    for pattern in _UNSAFE_PATTERNS:
        if pattern in lower:
            issues.append(f"Potentially unsafe phrasing: '{pattern}'")
            confidence -= 0.10
            add_disclaimer = True

    # Check for severe contraindications
    if contraindications:
        for c in contraindications:
            issues.append(c["warning"])
            confidence -= 0.25
        add_disclaimer = True
        # If lethal or critical contraindication is detected, trip circuit breaker
        if any(c["severity"] == "CRITICAL" for c in contraindications):
            breaker.record_failure("Critical drug-drug/condition contraindication detected in draft")

    if risk_level == "HIGH" or intent == "emergency_symptom":
        if _EMERGENCY_DISCLAIMER not in modified_response:
            modified_response = _EMERGENCY_DISCLAIMER + "\n\n" + modified_response
        confidence = max(confidence, 0.90)

    if add_disclaimer or intent in {"prescription_question", "follow_up_request", "general_inquiry"}:
        if _DISCLAIMER not in modified_response:
            modified_response += _DISCLAIMER

    confidence = max(round(confidence, 2), 0.50)
    passed = confidence >= 0.75 and not any(c.get("severity") == "CRITICAL" for c in contraindications)

    if passed:
        breaker.record_success()
    else:
        breaker.record_failure(f"Validation failed (confidence: {confidence})")

    return {
        "passed": passed,
        "confidence": confidence,
        "issues": issues,
        "modified_response": modified_response,
        "disclaimer_added": add_disclaimer or risk_level == "HIGH",
        "contraindications": contraindications,
        "circuit_breaker_tripped": not breaker.can_execute(),
    }

def run_validator_agent(
    response_draft: str,
    intent: str,
    risk_level: str,
    rag_context_used: bool,
    patient_query: str = "",
) -> Tuple[Dict, int]:
    start = time.perf_counter()
    result = _check_safety(response_draft, intent, risk_level, patient_query)
    duration = int((time.perf_counter() - start) * 1000)
    return result, max(duration, 1)
