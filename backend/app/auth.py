import os
import json
from dataclasses import dataclass
from typing import Optional
from fastapi import Request, HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import firebase_admin
from firebase_admin import credentials, auth

# Initialize Firebase Admin SDK if configured
if not firebase_admin._apps:
    try:
        env_cred = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON")
        if env_cred:
            cred_dict = json.loads(env_cred)
            cred = credentials.Certificate(cred_dict)
            firebase_admin.initialize_app(cred)
        else:
            local_cert = os.path.join(os.path.dirname(__file__), "..", "firebase-service-account.json")
            if os.path.exists(local_cert):
                cred = credentials.Certificate(local_cert)
                firebase_admin.initialize_app(cred)
    except Exception as e:
        print(f"Note: Running without live Firebase Admin credentials: {e}")

security = HTTPBearer(auto_error=False)

@dataclass
class User:
    uid: str
    email: str
    name: str
    tenant_id: str = "tenant-default"
    role: str = "clinician"

DEMO_CLINICIAN = User(
    uid="clinician-001",
    email="dr.prannessh@metrohealth.org",
    name="Dr. Prannessh KVA, MD",
    tenant_id="tenant-default",
    role="clinician",
)

DEMO_PATIENT = User(
    uid="patient-001",
    email="raj.sharma@example.com",
    name="Raj Sharma",
    tenant_id="tenant-default",
    role="patient",
)

async def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Security(security)) -> User:
    """
    Multi-tenant authentication provider.
    Supports live Firebase ID tokens alongside zero-config Demo Clinician and Patient
    tokens for deterministic local testing and recruiter demonstration.
    """
    if not credentials:
        # In demo / test mode when no credentials provided, default to demo clinician
        allow_demo = os.getenv("ALLOW_DEMO_AUTH", "true").lower() == "true"
        if allow_demo:
            return DEMO_CLINICIAN
        raise HTTPException(status_code=401, detail="Not authenticated. Missing Bearer Token.")

    token = credentials.credentials

    # Zero-config Demo Tokens for seamless local / demo deployment
    if token in ("demo-clinician-token", "demo-token", "demo-admin"):
        return DEMO_CLINICIAN
    if token in ("demo-patient-token", "demo-user"):
        return DEMO_PATIENT

    # Verify live Firebase token if Firebase Admin SDK is available
    if firebase_admin._apps:
        try:
            decoded_token = auth.verify_id_token(token)
            uid = decoded_token.get("uid")
            email = decoded_token.get("email", "")
            name = decoded_token.get("name", "Unknown User")
            tenant = decoded_token.get("tenant_id", "tenant-default")
            role = decoded_token.get("role", "clinician")
            return User(uid=uid, email=email, name=name, tenant_id=tenant, role=role)
        except Exception as e:
            # Fall back to demo user if token is non-empty mock string
            if token.startswith("demo-"):
                return DEMO_CLINICIAN
            raise HTTPException(status_code=401, detail=f"Invalid authentication credentials: {e}")

    # If Firebase is not configured, treat non-empty bearer token as authenticated user
    return User(
        uid=f"user-{token[:8]}",
        email="demo.user@metrohealth.org",
        name="Clinical Staff User",
        tenant_id="tenant-default",
        role="clinician",
    )

async def get_current_user_optional(credentials: Optional[HTTPAuthorizationCredentials] = Security(security)) -> Optional[User]:
    if not credentials:
        return DEMO_CLINICIAN
    try:
        return await get_current_user(credentials)
    except Exception:
        return None
