import asyncio
import os
import re
import uuid
import time
from pathlib import Path
from typing import List, Dict, Optional, Any, Tuple

from app.database.models import (
    ClinicalNotePayload,
    VitalSigns,
    MedicationItem,
    LabResultItem,
)

DOCUMENTS_DIR = Path(__file__).parent.parent.parent / "documents"
CHUNK_SIZE = 500
CHUNK_OVERLAP = 80

# ----------------------------------------------------------------------
# Deterministic Clinical Entity Extractors
# ----------------------------------------------------------------------
def extract_vitals_from_text(text: str) -> VitalSigns:
    """Extracts blood pressure, heart rate, respiratory rate, SpO2, and temperature."""
    vitals = VitalSigns()

    # Blood Pressure (e.g. 120/80, 135/85 mmHg)
    bp_match = re.search(r"\b(\d{2,3})\s*/\s*(\d{2,3})\s*(?:mm\s*hg)?\b", text, re.IGNORECASE)
    if bp_match:
        sys_bp, dia_bp = int(bp_match.group(1)), int(bp_match.group(2))
        if 40 <= sys_bp <= 300 and 20 <= dia_bp <= 200:
            vitals.systolic_bp = sys_bp
            vitals.diastolic_bp = dia_bp

    # Heart Rate / Pulse (e.g. HR 72, Pulse: 80 bpm)
    hr_match = re.search(r"\b(?:hr|pulse|heart\s*rate)[:\s]+(\d{2,3})\s*(?:bpm)?\b", text, re.IGNORECASE)
    if hr_match:
        vitals.heart_rate_bpm = int(hr_match.group(1))

    # SpO2 (e.g. SpO2 98%, 97% on room air)
    spo2_match = re.search(r"\b(?:spo2|o2\s*sat(?:uration)?|oxygen\s*sat)[:\s]+(\d{2,3})(?:\s*%)?\b", text, re.IGNORECASE)
    if spo2_match:
        vitals.spo2_percent = float(spo2_match.group(1))

    # Temperature (e.g. Temp 98.6 F, 101.4°F, 37.2 C)
    temp_match = re.search(r"\b(?:temp(?:erature)?|t)[:\s]+(\d{2,3}(?:\.\d+)?)\s*(?:°?\s*[fF])\b", text, re.IGNORECASE)
    if temp_match:
        vitals.temperature_f = float(temp_match.group(1))

    # Respiratory Rate (e.g. RR 16, Resps: 18)
    rr_match = re.search(r"\b(?:rr|respiratory\s*rate|resps)[:\s]+(\d{1,2})\b", text, re.IGNORECASE)
    if rr_match:
        vitals.respiratory_rate = int(rr_match.group(1))

    return vitals

def extract_medications_from_text(text: str) -> List[MedicationItem]:
    """Extracts medication names, dosages, and dosing frequencies."""
    meds = []
    med_pattern = re.compile(
        r"\b([A-Za-z]+(?:\s+[A-Za-z]+)?)\s+(\d+(?:\.\d+)?\s*(?:mg|mcg|g|ml|units))\s*(?:po|pr|iv|im|sc|sq|sl|oral|topical)?\s+((?:once|twice|thrice|\d+\s*times)\s+(?:daily|a\s+day)|q\d+h|bid|tid|qid|daily|qd|prn|as\s+needed)\b",
        re.IGNORECASE
    )
    for m in med_pattern.finditer(text):
        meds.append(MedicationItem(
            name=m.group(1).strip().capitalize(),
            dosage=m.group(2).strip(),
            frequency=m.group(3).strip(),
            route="oral",
        ))

    # Fallback common chronic medication patterns
    if not meds:
        common_meds = [
            ("Metformin", "500mg", "Twice daily"),
            ("Lisinopril", "10mg", "Once daily"),
            ("Atorvastatin", "20mg", "Nightly"),
            ("Amlodipine", "5mg", "Once daily"),
            ("Levothyroxine", "50mcg", "Once daily morning"),
            ("Aspirin", "81mg", "Once daily"),
            ("Omeprazole", "20mg", "Once daily before breakfast"),
        ]
        for name, dose, freq in common_meds:
            if re.search(r"\b" + name + r"\b", text, re.IGNORECASE):
                meds.append(MedicationItem(name=name, dosage=dose, frequency=freq, route="oral"))

    return meds

def extract_lab_results_from_text(text: str) -> List[LabResultItem]:
    """Extracts clinical laboratory findings, reference units, and abnormality flags."""
    labs = []
    lab_tests = [
        ("Fasting Blood Glucose", r"(?:glucose|fasting\s*glucose|fbs)[:\s]+(\d+)\s*(mg/dL)?", "mg/dL", (70, 99)),
        ("HbA1c", r"(?:hba1c|a1c)[:\s]+(\d+(?:\.\d+)?)\s*(?:%)?", "%", (4.0, 5.6)),
        ("Total Cholesterol", r"(?:total\s*cholesterol|cholesterol)[:\s]+(\d+)\s*(mg/dL)?", "mg/dL", (125, 200)),
        ("LDL Cholesterol", r"(?:ldl|ldl-c)[:\s]+(\d+)\s*(mg/dL)?", "mg/dL", (0, 100)),
        ("HDL Cholesterol", r"(?:hdl|hdl-c)[:\s]+(\d+)\s*(mg/dL)?", "mg/dL", (40, 60)),
        ("Triglycerides", r"(?:triglycerides|tg)[:\s]+(\d+)\s*(mg/dL)?", "mg/dL", (0, 150)),
        ("Serum Creatinine", r"(?:creatinine|serum\s*creatinine)[:\s]+(\d+(?:\.\d+)?)\s*(mg/dL)?", "mg/dL", (0.6, 1.2)),
        ("Hemoglobin", r"(?:hemoglobin|hgb)[:\s]+(\d+(?:\.\d+)?)\s*(g/dL)?", "g/dL", (13.5, 17.5)),
    ]

    for test_name, pat, unit, (low, high) in lab_tests:
        match = re.search(pat, text, re.IGNORECASE)
        if match:
            val_str = match.group(1)
            try:
                val_num = float(val_str)
                flag = "NORMAL"
                if val_num < low:
                    flag = "LOW"
                elif val_num > high:
                    flag = "HIGH"
            except ValueError:
                flag = "NORMAL"

            labs.append(LabResultItem(
                test_name=test_name,
                value=val_str,
                unit=unit,
                reference_range=f"{low}-{high} {unit}",
                flag=flag,
            ))

    return labs

def extract_allergies_from_text(text: str) -> List[str]:
    allergies = []
    # Section match for multi-line bulleted allergies
    section_match = re.search(r"\b(?:allergies|allergic\s*to)[:\s]*\n((?:\s*[-*•].*\n?)+)", text, re.IGNORECASE)
    if section_match:
        for line in section_match.group(1).splitlines():
            cleaned = re.sub(r"^[-*•\s]+", "", line).strip()
            if cleaned and cleaned.lower() not in ("none", "nkda", "no known drug allergies"):
                allergies.append(cleaned.capitalize())

    if not allergies:
        allergy_match = re.search(r"\b(?:allergies|allergic\s*to)[:\s]+([^\n\.;]+)", text, re.IGNORECASE)
        if allergy_match:
            raw_list = allergy_match.group(1).split(",")
            for a in raw_list:
                cleaned = re.sub(r"^[-*•\s]+", "", a).strip()
                if cleaned and cleaned.lower() not in ("none", "nkda", "no known drug allergies"):
                    allergies.append(cleaned.capitalize())

    if not allergies:
        for common in ["Penicillin", "Sulfa", "Latex", "Aspirin", "Codeine", "Peanuts"]:
            if re.search(r"\ballerg(?:y|ic)\s+(?:to\s+)?\b" + common, text, re.IGNORECASE):
                allergies.append(common)
    return allergies

def extract_icd10_codes(text: str) -> List[str]:
    """Extracts or suggests standard ICD-10 diagnostic coding references."""
    codes = set()
    explicit = re.findall(r"\b([A-TV-Z]\d{2}(?:\.\d{1,4})?)\b", text)
    codes.update(explicit)

    # Symptom / Condition based ICD-10 mappings
    mappings = [
        (r"\b(chest\s*pain|angina)\b", "R07.9"),
        (r"\b(type\s*2\s*diabetes|t2dm|diabetes\s*mellitus)\b", "E11.9"),
        (r"\b(hypertension|htn|high\s*blood\s*pressure)\b", "I10"),
        (r"\b(hyperlipidemia|high\s*cholesterol)\b", "E78.5"),
        (r"\b(asthma)\b", "J45.909"),
        (r"\b(gerd|acid\s*reflux)\b", "K21.9"),
        (r"\b(fever|pyrexia)\b", "R50.9"),
        (r"\b(shortness\s*of\s*breath|dyspnea)\b", "R06.02"),
    ]
    for pattern, code in mappings:
        if re.search(pattern, text, re.IGNORECASE):
            codes.add(code)

    return sorted(list(codes))

# ----------------------------------------------------------------------
# Asynchronous Non-Blocking Document Parser
# ----------------------------------------------------------------------
def _sync_parse_clinical_text(
    raw_text: str,
    filename: str,
    patient_name: str,
    patient_id: str,
    tenant_id: str,
) -> ClinicalNotePayload:
    vitals = extract_vitals_from_text(raw_text)
    meds = extract_medications_from_text(raw_text)
    labs = extract_lab_results_from_text(raw_text)
    allergies = extract_allergies_from_text(raw_text)
    icd10 = extract_icd10_codes(raw_text)

    # Derive Chief Complaint & Assessment
    lines = [l.strip() for l in raw_text.splitlines() if l.strip()]
    cc = "Clinical document evaluation"
    for idx, l in enumerate(lines):
        if re.search(r"^(?:chief\s*complaint|reason\s*for\s*visit|cc)[:\s]*$", l, re.IGNORECASE):
            if idx + 1 < len(lines):
                cc = lines[idx + 1][:200]
                break
        elif re.search(r"^(?:chief\s*complaint|reason\s*for\s*visit|cc)[:\s]+", l, re.IGNORECASE):
            extracted = re.sub(r"^(?:chief\s*complaint|reason\s*for\s*visit|cc)[:\s]+", "", l, flags=re.IGNORECASE).strip()
            if extracted:
                cc = extracted
                break
    if cc == "Clinical document evaluation" and lines:
        cc = lines[0][:120]

    assessment = (
        f"Automated clinical schema ingestion from '{filename}'. "
        f"Extracted {len(labs)} laboratory indices, {len(meds)} active medications, "
        f"and {len(icd10)} mapped diagnostic codes."
    )

    return ClinicalNotePayload(
        patient_name=patient_name,
        patient_id=patient_id,
        tenant_id=tenant_id,
        chief_complaint=cc,
        history_of_present_illness=raw_text[:400] if len(raw_text) > 400 else raw_text,
        vitals=vitals,
        medications=meds,
        allergies=allergies,
        lab_results=labs,
        assessment_and_plan=assessment,
        icd10_codes=icd10,
    )

async def parse_clinical_document_async(
    content_bytes: bytes,
    filename: str,
    patient_name: str = "Anonymous",
    patient_id: str = "patient-001",
    tenant_id: str = "tenant-default",
) -> ClinicalNotePayload:
    """
    Non-blocking document parser that converts unstructured clinical notes
    into schema-compliant Pydantic v2 ClinicalNotePayload records.
    Dispatches CPU parsing tasks to a worker thread to keep the event loop free.
    """
    raw_text = content_bytes.decode("utf-8", errors="ignore")
    return await asyncio.to_thread(
        _sync_parse_clinical_text,
        raw_text=raw_text,
        filename=filename,
        patient_name=patient_name,
        patient_id=patient_id,
        tenant_id=tenant_id,
    )

async def batch_ingest_documents_async(
    documents: List[Tuple[bytes, str, str, str]],
    tenant_id: str = "tenant-default",
    concurrency: int = 8,
) -> Dict[str, Any]:
    """
    High-throughput asynchronous ingestion pipeline processing multiple unstructured
    clinical notes concurrently into validated, schema-compliant payloads.
    """
    sem = asyncio.Semaphore(concurrency)
    t_start = time.perf_counter()

    async def _process_one(doc_tuple):
        content, fname, pname, pid = doc_tuple
        async with sem:
            return await parse_clinical_document_async(
                content_bytes=content,
                filename=fname,
                patient_name=pname,
                patient_id=pid,
                tenant_id=tenant_id,
            )

    results = await asyncio.gather(*[_process_one(d) for d in documents])
    elapsed_ms = round((time.perf_counter() - t_start) * 1000, 2)

    return {
        "tenant_id": tenant_id,
        "total_documents": len(results),
        "valid_payloads": len(results),
        "total_elapsed_ms": elapsed_ms,
        "avg_ms_per_doc": round(elapsed_ms / max(len(results), 1), 2),
        "payloads": [r.model_dump() for r in results],
    }

# Retain existing RAG helpers for Pinecone demo compatibility
def chunk_text(text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> List[str]:
    paragraphs = re.split(r"\n{2,}", text.strip())
    chunks = []
    current = ""
    for para in paragraphs:
        para = para.strip()
        if not para:
            continue
        if len(current) + len(para) <= chunk_size:
            current += ("\n\n" if current else "") + para
        else:
            if current:
                chunks.append(current)
                current = current[-overlap:] + "\n\n" + para if overlap else para
            else:
                for i in range(0, len(para), chunk_size - overlap):
                    chunks.append(para[i : i + chunk_size])
                current = ""
    if current:
        chunks.append(current)
    return chunks
