# ALIS Frontend

ALIS is the legal early-warning and preparation layer between ordinary life and the legal system.

This Next.js App Router client now supports the **multi-tenant professional workspace model**. Consumers use ALIS as a platform account; legal practices and professionals operate isolated workspaces (tenants).

## Multi-tenancy

A client is an ALIS user, not a tenant. A law firm, legal practice or professional organization can be a tenant. Each tenant has its own workspace, members, clients, matters, documents, evidence, configuration and professional workflows.

The frontend carries tenant context through the application boundary using `X-Tenant-Id` and `X-Tenant-Slug`. Production authorization and isolation must be enforced by the Java backend and AI/RAG service, never trusted from browser values alone.

```text
                         ALIS PLATFORM
                              |
              +---------------+---------------+
              |                               |
        ALIS consumer                    Professional
           account                         tenants
              |                     +---------+---------+
            Matters                 |                   |
            Evidence          Tenant A             Tenant B
                                 |                   |
                              Clients             Clients
                              Matters             Matters
                              Docs                Docs
```

## Tenant-aware architecture

```text
Next.js
  |
  +-- active tenant context
  |      +-- tenant switcher
  |      +-- workspace
  |      +-- tenant-scoped requests
  |
  +-- Java API --------------------> tenant authorization + domain data
  |
  +-- Python AI/RAG ---------------> tenant-scoped retrieval and analysis
  |
  +-- WebSocket -> Cloudflare ------> tenant/matter realtime rooms
```

Tenant context must propagate through API requests, AI/RAG retrieval, documents/evidence and real-time events. A tenant must never receive another tenant's data or events.

## Architecture

Java Spring Boot owns authentication, clients, matters, legal and professional workflows.

Python FastAPI owns document intelligence, retrieval, RAG, analysis, LLM orchestration and reports. Its internal architecture is N-layered modular monolith with a Celery event bus and Redis infrastructure.

Cloudflare Worker plus Durable Objects provide the real-time edge connection for browser and mobile WebSockets.

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
- Professional Workspace
- Tenant switcher

## Real-time

Long-running AI processing belongs to Celery workers. The browser receives tenant-scoped progress and result events through the Cloudflare Worker/Durable Object real-time layer.

Expected events include `document.uploaded`, `document.extracted`, `document.indexed`, `analysis.progress`, `risk.detected`, `report.ready` and `analysis.failed`.

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

## Current status

The frontend now has the foundation for a multi-tenant ALIS product: tenant context, tenant switching, professional workspace, tenant-aware API headers, tenant-aware realtime design and the consumer-facing legal intelligence surfaces. The next implementation step is replacing demo tenant state with authenticated tenant membership from the Java backend and enforcing the same tenant identity server-side across Java, Python/RAG and Cloudflare realtime.
