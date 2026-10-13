# ALIS Frontend

ALIS (Automated Legal Intelligence System) is a South African legal-preparation experience. It helps people organise situations, documents and questions before making decisions or speaking to a qualified legal professional.

This repository contains the Next.js App Router frontend. The presentation layer is one deployable application, with distinct domain modules behind shared contracts.

## Product direction

- Individuals work through an ALIS account and can organise matters, situation notes and evidence.
- Legal practices use a professional workspace with client, matter, document and membership boundaries.
- The interface prioritises plain language, explainable information, source visibility and human review.
- Legal concern labels should be qualitative and grounded. The product must not invent numeric risk scores or imply guaranteed legal outcomes.
- A client account is not an organisation. Workspace context represents the professional organisation, and the backend must enforce access rules on every protected request.

## Technology

- Next.js App Router, React and TypeScript.
- Material UI icons for functional interface iconography.
- Shared CSS design tokens with Manrope headings and DM Sans body text.
- Java Spring Boot API for authentication, membership, client, matter and legal workflow records.
- Python FastAPI AI/RAG API for extraction, retrieval, analysis and report generation.
- WebSocket realtime status through the configured realtime endpoint.

## Run locally

1. Copy .env.example to .env.local.
2. Install dependencies with npm install.
3. Start the development server with npm run dev.
4. Run npm run typecheck before committing.
5. Build the production bundle with npm run build.

The root route is the public landing page. Workspace routes include /dashboard, /scanner, /matters, /matter/MAT-1042, /documents, /profile and /workspace.

## Environment

- NEXT_PUBLIC_JAVA_API_URL: Java service base URL.
- NEXT_PUBLIC_AI_API_URL: Python AI/RAG service base URL.
- NEXT_PUBLIC_REALTIME_URL: WebSocket endpoint for analysis status updates.

Do not put private credentials in NEXT_PUBLIC variables. These values are exposed to the browser.

## Integration status

The current situation intake and evidence selection screens deliberately show local draft/selection state. They do not send documents, create a real matter or produce a legal analysis yet. Connect them to authenticated API workflows before using real client data. Matter list and detail records are marked as example data.

Before production, wire uploads to authenticated storage, validate file types and sizes on the server, enforce account and organisation permissions, add explicit consent and retention controls, and ensure legal findings carry source references and uncertainty.

## Design reference

The redesign uses the document-first workflow idea from [Legal AI SaaS Platform MVP UI/UX Redesign on Dribbble](https://dribbble.com/shots/26620919-Legal-AI-SaaS-Platform-MVP-UI-UX-Redesign): keeping the document, extracted facts and review questions connected instead of spreading them across unrelated screens.

The dashboard also takes broad structural cues from [Zavri Legal, an AI-powered legal dashboard concept on Dribbble](https://dribbble.com/shots/27798424-Zavri-Legal-AI-Powered-Legal-Dashboard-UI-UX-Design). The implementation here has its own layout, wording and design tokens rather than copying either shot.

## Legal safety

ALIS is an information and preparation tool, not a replacement for qualified legal advice. The interface should make uncertainty visible, expose sources where possible and direct high-stakes questions to a qualified professional.
