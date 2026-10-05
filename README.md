# ALIS Frontend

ALIS is the legal early-warning and preparation layer between ordinary life and the legal system.

The frontend uses a restrained professional visual system: **Manrope** for display/headings and **DM Sans** for interface/body copy. Lucide is used selectively for navigation and functional affordances rather than decorative illustration. The product intentionally avoids emoji-heavy UI.

## Multi-tenancy

A client is an ALIS user, not a tenant. A law firm, legal practice or professional organization can be a tenant. Each tenant has its own workspace, members, clients, matters, documents, evidence, configuration and professional workflows.

The frontend carries tenant context through the application boundary using `X-Tenant-Id` and `X-Tenant-Slug`. Production authorization and isolation must be enforced by the Java backend and AI/RAG service, never trusted from browser values alone.

## Design direction

- Professional legal-tech interface
- Deep green brand foundation with warm neutral surfaces
- Manrope headings, DM Sans interface text
- Minimal iconography with Lucide used only where it improves navigation or comprehension
- No decorative emoji dependency
- Generous spacing, subtle borders and restrained shadows
- Information hierarchy takes priority over visual noise

## Architecture

```text
Next.js
  |
  +-- active tenant context
  |      +-- tenant switcher
  |      +-- professional workspace
  |      +-- tenant-scoped requests
  |
  +-- Java API --------------------> tenant authorization + domain data
  |
  +-- Python AI/RAG ---------------> tenant-scoped retrieval and analysis
  |
  +-- WebSocket -> Cloudflare ------> tenant/matter realtime rooms
```

Java Spring Boot owns authentication, clients, matters, legal and professional workflows. Python FastAPI owns document intelligence, retrieval, RAG, analysis, LLM orchestration and reports. Its internal architecture is an N-layered modular monolith with a Celery event bus and Redis infrastructure. Cloudflare Worker plus Durable Objects provide the real-time edge connection.

## Product surfaces

- Situation Scanner
- Matters
- Conversation
- Documents
- Evidence Locker
- Timeline
- Legal Issues
- Professional Help
- Legal Safety Profile
- Professional Workspace
- Tenant switcher

## Legal AI safety

Do not show fake numerical legal risk scores. Use qualitative states such as Potential legal concern, Significant legal concern and Urgent professional review recommended. Findings should expose sources, explanation and uncertainty when available. ALIS does not replace qualified legal professionals.

## Environment

```env
NEXT_PUBLIC_JAVA_API_URL=http://localhost:8080
NEXT_PUBLIC_AI_API_URL=http://localhost:8000
NEXT_PUBLIC_REALTIME_URL=ws://localhost:8787
```

## Development

```bash
npm install
npm run dev
npm run build
npm run start
```

## Repository relationship

- `Lungaowen/ALIS_BACKEND` = Java application/domain backend and tenant authorization
- `Lungaowen/ALIS-BACKEND-PY` = Python AI and RAG layer
- `Lungaowen/alis-frontend-next` = Next.js client application and tenant-aware professional workspace
