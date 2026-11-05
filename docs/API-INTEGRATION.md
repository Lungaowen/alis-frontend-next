# ALIS frontend/backend integration contract

Canonical repositories: `alis-frontend-next`, `ALIS_BACKEND` (Spring Boot), `ALIS-BACKEND-PY` (FastAPI AI/RAG), and `ALIS_GATEWAY` (Cloudflare Worker).

## Public routing
The browser uses one origin configured by `NEXT_PUBLIC_API_BASE_URL`. `/api/*` is routed to Spring Boot. `/ai/*` is routed to FastAPI, with `/ai` stripped unless `AI_KEEP_PREFIX=true`.

- `POST /api/v1/auth/register` and `POST /api/v1/auth/login` are Java endpoints.
- `POST /ai/api/process` is forwarded to FastAPI `/api/process` and accepts multipart fields `document_id` (optional), `client_id`, `document_title`, `document_type`, `jurisdiction`, and `file`.
- `POST /ai/api/analysis/run/{documentId}`, `GET /ai/api/analysis/status/{documentId}`, `GET /ai/api/analysis/report/{documentId}`, and `GET /ai/api/analysis/report/{documentId}/clauses` are FastAPI endpoints.
- Matter/document metadata is owned by Java: `/api/v1/matters` and `/api/v1/matters/{matterId}/documents`.
- Client profile is Java `/api/v1/client/profile`.

Do not expose raw Render/IP origins in browser configuration.

## Authentication
Spring login returns `userId`, `displayName`, `role`, `token`, and `expiresIn`. The UI maps `userId` to its legacy `clientId`, `displayName` to `fullName`, and backend `CLIENT` to UI `USER`. Requests send `Authorization: Bearer <token>`. A `403` must not clear the session; only an invalid/expired `401` may do so.

## Document lifecycle
Java owns matters and document metadata. Python accepts multipart document uploads and owns AI processing, analysis status, reports and clause extraction. The frontend uses the gateway for all Java and Python requests.

## Known backend gaps
- Java does not currently expose document DELETE.
- Java does not currently expose `/api/v1/admin/dashboard` aggregate, generic `/api/clients` listing/creation, rules, audit, or client report-list routes.
- The Java repository has no tenant entity, membership, or tenant-scoped authorization endpoints. The modular frontend's demo tenant switcher and `X-Tenant-*` headers do not provide real tenant isolation. Do not treat the demo tenant context as a security boundary.
- Document upload is handled by Python while document metadata/matter ownership is handled by Java. Production orchestration must preserve the matter association and storage metadata.
- Browser Supabase access must use only the public anon key with correctly configured Row Level Security. A service-role key must never be shipped to the browser.

## Local development
Run the Cloudflare Worker at `http://localhost:8787` and set `NEXT_PUBLIC_API_BASE_URL=http://localhost:8787`; configure the Worker Java/Python upstream origins separately.
