# ALIS Frontend

ALIS is the legal early-warning and preparation layer between ordinary life and the legal system.

The frontend is structured as a **modular monolith**: one deployable Next.js application containing independently owned business modules that share a small domain kernel. Modules communicate through application services and shared contracts rather than importing each other's internals.

## Architecture

```text
Next.js App Router
        |
        +---------------- Composition / UI ----------------+
        |                                                    |
        |  shared UI + routes + layouts                       |
        |                                                    |
        +---------------- Modular Monolith -----------------+
        |                                                    |
        |  auth     tenant     client     matter             |
        |  document evidence  legal      realtime            |
        |                                                    |
        +---------------- Shared Domain Kernel --------------+
        |                                                    |
        |  User Tenant Client Matter Document Evidence       |
        |  TimelineEvent LegalIssue Membership RealtimeEvent |
        |                                                    |
        +---------------- Infrastructure -------------------+
        |                                                    |
        |  HTTP client   tenant context   WebSocket          |
        +-------------------+----------------+---------------+
                            |                |
                      Java Spring Boot   Python FastAPI
                      domain + auth      AI/RAG + analysis
                            |
                    Cloudflare realtime edge
```

The important boundary is that the frontend is **one application, not one module per deployment**. A module owns its domain behavior, application services, repositories/contracts and presentation adapters. Shared entities live in `src/modules/shared/domain` and are reused by all modules.

## Module structure

```text
src/modules/
├── shared/
│   ├── domain/           # shared entities and domain types
│   ├── application/      # tenant context + cross-cutting errors
│   └── infrastructure/   # shared HTTP transport
│
├── auth/
│   ├── domain/           # AuthSession
│   └── application/      # session lifecycle
│
├── tenant/
│   ├── application/      # tenant selection and membership boundary
│   └── presentation/     # workspace switcher
│
├── client/
│   ├── domain/           # ClientRepository contract
│   └── application/      # client use cases/API adapter
│
├── matter/
│   ├── domain/           # MatterRepository contract
│   └── application/      # matter use cases/API adapter
│
├── document/
│   ├── domain/           # DocumentRepository contract
│   └── application/      # document intelligence boundary
│
├── evidence/
│   ├── domain/           # EvidenceRepository contract
│   └── application/      # evidence access
│
├── legal/
│   ├── domain/           # LegalIssueRepository contract
│   └── application/      # legal intelligence/RAG boundary
│
└── realtime/
    └── application/      # tenant/matter scoped realtime transport
```

### Shared entities

The shared kernel contains the canonical frontend representations of:

- `User`
- `Tenant`
- `ProfessionalMembership`
- `Client`
- `Matter`
- `Document`
- `Evidence`
- `TimelineEvent`
- `LegalIssue`
- `RealtimeEvent`

This prevents the common problem where the Matter screen, Evidence screen and realtime layer each invent slightly different Matter or tenant shapes.

## Dependency rule

Modules may depend on `shared`. A module should not reach directly into another module's repository, UI or internal implementation.

```text
module -> shared
module -> its own domain/application/infrastructure/presentation

avoid:
module A -> module B internal files
```

Cross-module workflows should use explicit application contracts or shared events. For example:

```text
Document uploaded
      |
      v
Document module
      |
      +--> shared Document entity
      |
      +--> AI/RAG API
              |
              v
       analysis completed
              |
              v
       Legal module
              |
              v
       shared LegalIssue
```

## Multi-tenancy

A client is an ALIS account, not a tenant. A law firm, legal practice or professional organization is a tenant. Professional modules therefore operate with tenant context.

Every tenant-sensitive request carries `X-Tenant-Id` and `X-Tenant-Slug`. The browser is not trusted for authorization. Java must validate membership and enforce isolation, Python/RAG must scope retrieval and private documents, and Cloudflare realtime must scope connections to tenant/matter rooms.

```text
ALIS
├── Consumer account
│   ├── Situation Scanner
│   ├── Matters
│   └── Personal evidence
│
└── Professional workspace
    ├── Tenant A
    │   ├── Team
    │   ├── Clients
    │   ├── Matters
    │   └── Documents / Evidence
    │
    └── Tenant B
        ├── Team
        ├── Clients
        ├── Matters
        └── Documents / Evidence
```

## Backend boundaries

- **Java Spring Boot**: authentication, tenant membership/authorization, clients, matters, legal/professional workflows and system-of-record data.
- **Python FastAPI**: OCR, extraction, retrieval, RAG, analysis, LLM orchestration and reports. Its own backend remains an N-layered modular monolith with Celery as the internal event/task bus.
- **Cloudflare Worker + Durable Objects**: browser/mobile realtime connection management and tenant/matter room fan-out.
- **Next.js**: user experience, route composition, evidence capture, module presentation and transport adapters.

## Design system

The visual direction remains intentionally restrained:

- Manrope for headings and display text
- DM Sans for interface and body text
- Deep green brand foundation with warm neutral surfaces
- Minimal Lucide usage, only for navigation and functional affordances
- No decorative emoji dependency
- Generous whitespace, subtle borders and restrained shadows

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
- `Lungaowen/alis-frontend-next` = Next.js modular monolith and client experience
