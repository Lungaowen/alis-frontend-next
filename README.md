# ALIS Frontend

ALIS is the legal early-warning and preparation layer between ordinary life and the legal system.

## UI rebuild

The active Next.js surface now follows a restrained enterprise legal-tech direction inspired by current Dribbble work for legal dashboards and AI-assisted matter management. The goal is **professional software**, not a generic AI landing page: strong information hierarchy, compact data tables, clear qualitative concern states, document intelligence, deadlines and embedded assistance.

The rebuild keeps:

- Next.js App Router
- modular-monolith domain boundaries
- tenant-aware professional workspace concepts
- Java Spring Boot as the system of record
- Python FastAPI for AI/RAG
- Cloudflare realtime boundary
- source-linked legal findings
- qualitative concern states instead of fabricated numeric legal risk scores

The visual system uses a deep green foundation, quiet neutral surfaces, compact enterprise typography, subtle borders and inline SVG icons. There is no decorative emoji dependency.

## Product surfaces

- Situation Scanner
- Matters
- Matter detail
- Documents & Evidence
- Legal Safety Profile
- Professional Workspace
- ALIS briefing / embedded assistant

## Safety

Findings should expose source, explanation and uncertainty when available. High-consequence matters should recommend qualified professional review. ALIS does not replace qualified legal advice.

## Development

```bash
npm install
npm run dev
npm run build
npm run start
```

## Environment

```env
NEXT_PUBLIC_JAVA_API_URL=http://localhost:8080
NEXT_PUBLIC_AI_API_URL=http://localhost:8000
NEXT_PUBLIC_REALTIME_URL=ws://localhost:8787
```
