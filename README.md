# ALIS Frontend

ALIS is the legal early-warning and preparation layer between ordinary life and the legal system.

This repository is now being recreated as a Next.js App Router client for the current ALIS architecture.

## Architecture

Next.js owns the user experience, routing, evidence capture and presentation.

Java Spring Boot owns authentication, clients, matters, legal and professional workflows.

Python FastAPI owns document intelligence, retrieval, RAG, analysis, LLM orchestration and reports. Its internal architecture is N-layered modular monolith with a Celery event bus and Redis infrastructure.

Cloudflare Worker plus Durable Objects provide the real-time edge connection for browser and mobile WebSockets.

Flow:

Browser -> Cloudflare Worker -> Durable Object -> real-time room

AI processing:

Browser -> Java/Python API -> Celery -> OCR/extraction -> retrieval -> legal RAG -> analysis -> report

The frontend receives events such as document.uploaded, document.extracted, document.indexed, analysis.progress, risk.detected, report.ready and analysis.failed.

## Product experience

Users start from ordinary situations rather than legal terminology:

- I am about to do something
- Something already happened
- I am about to sign something
- I received something
- I want to start something

Core surfaces:

- Situation Scanner
- Matters
- Conversation
- Documents
- Evidence Locker
- Timeline
- Legal Issues
- Professional Help
- Legal Safety Profile

The Matter is the persistent workspace that connects context, evidence and legal intelligence.

## Legal AI safety

Do not show fake numerical legal risk scores.

Use:

- No obvious issue identified
- Potential legal concern
- Significant legal concern
- Urgent professional review recommended

Findings should expose legal sources, explanation and uncertainty when available. ALIS does not replace qualified legal professionals.

## Real-time

The browser uses a WebSocket client boundary through lib/realtime.ts. The production endpoint is controlled by NEXT_PUBLIC_REALTIME_URL.

Long-running AI processing belongs to Celery workers, not the browser. The frontend only displays progress and status.

## Environment

NEXT_PUBLIC_JAVA_API_URL=http://localhost:8080
NEXT_PUBLIC_AI_API_URL=http://localhost:8000
NEXT_PUBLIC_REALTIME_URL=ws://localhost:8787

## Development

npm install
npm run dev

Build:

npm run build

Start:

npm run start

## Repository relationship

Lungaowen/ALIS_BACKEND = Java application and domain backend

Lungaowen/ALIS-BACKEND-PY = Python AI and RAG layer

Lungaowen/alis-frontend-next = Next.js client application

## Current status

The recreated foundation includes:

- Next.js App Router
- Situation Scanner
- Matter workspace
- Evidence Locker
- Legal Safety Profile
- Java and Python API boundaries
- Cloudflare WebSocket boundary
- Real-time analysis progress presentation
- ALIS legal-safety language

The next phase is wiring the screens to the live Java API, Python AI/RAG endpoints and Cloudflare Worker/Durable Object events.
