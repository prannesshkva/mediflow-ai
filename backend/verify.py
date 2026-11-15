from app.graph.workflow import run_workflow, resume_workflow_after_hitl

tests = [
    ("What are your clinic timings?", "clinic_policy", "LOW", False),
    ("I want to book an appointment tomorrow", "appointment_booking", "LOW", False),
    ("I have severe chest pain", "emergency_symptom", "HIGH", True),
    ("Can I reschedule my appointment?", "appointment_reschedule", "LOW", False),
    ("Tell me about my prescription", "prescription_question", "LOW", False),
]

print("=== MEDIFLOW AI VERIFICATION ===\n")
all_pass = True
for query, exp_intent, exp_risk, exp_hitl in tests:
    r = run_workflow(query, "Test Patient", "verify-sess")
    intent_ok = r["intent"] == exp_intent
    risk_ok = r["risk_level"] == exp_risk
    hitl_ok = r["hitl_required"] == exp_hitl

    # For auto-approved paths, 7 agents execute; for HITL-suspended paths, 3 agents execute up to suspension
    if exp_hitl:
        trace_ok = len(r["agent_trace"]) == 3 and r["hitl_status"] == "pending_clinician_review"
    else:
        trace_ok = len(r["agent_trace"]) == 7 and r["hitl_status"] == "auto_approved"

    ok = intent_ok and risk_ok and hitl_ok and trace_ok
    if not ok:
        all_pass = False
    label = "PASS" if ok else "FAIL"
    print(f"[{label}] intent={r['intent']} risk={r['risk_level']} hitl_required={r['hitl_required']} hitl_status={r['hitl_status']} agents={len(r['agent_trace'])}")
    print(f"       query: {query[:60]}")
    if exp_hitl and r.get("hitl_review_id"):
        resumed = resume_workflow_after_hitl(r["hitl_review_id"], action="approve", clinician_id="clinician-director")
        print(f"       -> HITL Review Approved: {resumed['status']} (clinician: {resumed['clinician_id']})")
    print()

print("RESULT:", "ALL 5 TESTS PASSED" if all_pass else "SOME FAILED")
