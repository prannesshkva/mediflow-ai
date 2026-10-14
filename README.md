# Mediflow AI

<p align="center">
  <strong>Intelligent Clinical Workflow Automation & Medical Document Intelligence Platform</strong>
</p>

<p align="center">
  <a href="https://mediflow-ai-rho.vercel.app"><img src="https://img.shields.io/badge/Live_Demo-mediflow--ai.vercel.app-18181B?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo" /></a>
  <img src="https://img.shields.io/badge/Frontend-Next.js_14_/_TypeScript-18181B?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/Backend-FastAPI_/_Python-18181B?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/License-MIT-18181B?style=for-the-badge" alt="License" />
</p>

---

## Overview

**Mediflow AI** is a modern full-stack healthcare intelligence platform designed to eliminate clinical administrative overhead. It automates medical document ingestion, extracts vital patient telemetry from unstructured medical records and discharge summaries, verifies clinical facts against validated knowledge bases, and provides an intuitive, HIPAA-aligned interface for healthcare practitioners.

---

## Tech Stack

### Frontend
<p align="center">
  <img src="https://img.shields.io/badge/Next.js_14-18181B?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-18181B?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/React_18-18181B?style=for-the-badge&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-18181B?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Vercel-18181B?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" />
</p>

### Backend & AI
<p align="center">
  <img src="https://img.shields.io/badge/Python_3.10+-18181B?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/FastAPI-18181B?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/LangChain-18181B?style=for-the-badge&logo=chainlink&logoColor=white" alt="LangChain" />
  <img src="https://img.shields.io/badge/Uvicorn-18181B?style=for-the-badge&logo=gunicorn&logoColor=white" alt="Uvicorn" />
</p>

---

## Architecture

```
Healthcare Provider UI (Next.js 14 App Router)
                    │
                    ▼
          [Secure REST API Layer]
                    │
                    ▼
         [FastAPI Application Gateway]
                    │
    ┌───────────────┴───────────────┐
    ▼                               ▼
[Clinical Document Parser]     [Verification Engine]
(PDF / EHR Record Extraction)  (verify.py - Cross-Check Validation)
    └───────────────┬───────────────┘
                    │
                    ▼
       [Grounded Medical Summary]
```

---

## Key Features

- **Automated Clinical Ingestion**: Parses multi-page clinical notes, pathology reports, and prescriptions.
- **Verification & Consistency Engine**: Cross-references dosages, contraindications, and medical findings using dedicated verification logic (`verify.py`).
- **Responsive Clinical Dashboard**: Built with Next.js 14, Tailwind CSS, and optimized for tablet and desktop clinical environments.
- **Microservices Architecture**: Clean decoupling between frontend presentation and backend Python inference services.

---

## Repository Structure

```
mediflow-ai/
├── backend/
│   ├── app/                # FastAPI application routes and business logic
│   ├── documents/          # Sample EHR and medical document corpus
│   ├── verify.py           # Clinical fact-checking and rule evaluation
│   ├── requirements.txt    # Python backend dependencies
│   └── .env.example        # Environment variable templates
├── frontend/
│   ├── app/                # Next.js 14 App Router pages
│   ├── components/         # Reusable UI component library (cards, modals, badges)
│   ├── lib/                # Client utilities and API fetch abstractions
│   ├── next.config.ts      # Next.js compilation settings
│   ├── package.json        # Frontend NPM dependencies
│   └── tailwind.config.ts  # Tailwind CSS theme configuration
└── README.md
```

---

## Getting Started

### 1. Frontend Setup
```bash
cd frontend
npm install
npm run dev
# Running on http://localhost:3000
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
# Running on http://localhost:8000
```

---

## Deployment

* **Frontend**: Deployed continuously on [Vercel](https://mediflow-ai-rho.vercel.app).
* **Backend**: Containerizable with Docker for cloud deployment (AWS ECS, Google Cloud Run, or Render).

---

## Author

* **Architect**: [Prannessh KVA](https://github.com/prannesshkva)
* **Focus**: Healthcare AI Systems, Full-Stack Architecture, and Clinical NLP

---

## License

This project is licensed under the MIT License.
