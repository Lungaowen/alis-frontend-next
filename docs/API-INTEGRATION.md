# ALIS frontend/backend integration contract

Canonical repositories: `alis-frontend-next`, `ALIS_BACKEND` (Spring Boot), `ALIS-BACKEND-PY` (FastAPI AI/RAG), and `ALIS_GATEWAY` (Cloudflare Worker).

## Public routing
The browser uses one origin configured by `NEXT_PUBLIC_API_BASE_URL`. `/api/*` is routed to Spring Boot. `/ai/*` is routed to FastAPI, with `/ai` stripped unless `AI_KEEP_PREFIX=true`.

- `POST /api/v1/auth/register` and `POST /api/v1/auth/login` are Java endpoints.
- `POST /ai/api/process` is forwarded to FastAPI `/api/process` and accepts multipart fields `document_id` (optional), `client_id`, `document_title`, `document_type`, `jurisdiction`, and `file`.
- `POST /ai/api/analysis/run/{documentId}`, `GET /ai/api/analysis/status/{documentId}`, and `GET /ai/api/analysis/report/{documentId}` are FastAPI endpoints.
- Matter/document metadata is owned by Java: `/api/v1/matters` and `/api/v1/matters/{matterId}/documents`.

Do not expose raw Render/IP origins in browser configuration.

## Authentication
Spring login returns `userId`, `displayName`, `role`, `token`, and `expiresIn`. The UI maps `userId` to its legacy `clientId`, `displayName` to `fullName`, and backend `CLIENT` to UI `USER`. Requests send `Authorization: Bearer <token>`. A `403` must not clear the session; only an invalid/expired `401` may do so.

## Known backend gaps
- Java does not currently expose document DELETE.
- Java does not currently expose `/api/v1/admin/dashboard` aggregate.
- Legacy rules, audit and client-report routes in `src/lib/alis.ts` are not all present in the current Java API. They need corresponding backend endpoints or a separately agreed replacement contract.
- Document upload is handled by Python while document metadata/matter ownership is handled by Java. Production orchestration must preserve the matter association and storage metadata.

## Local development
Run the Cloudflare Worker at `http://localhost:8787` and set `NEXT_PUBLIC_API_BASE_URL=http://localhost:8787`; configure the Worker Java/Python upstream origins separately.
