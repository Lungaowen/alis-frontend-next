# Client-Side PDF Report Generator

Build a self-contained PDF generator that turns an ALIS compliance report into a professionally styled, multi-page PDF entirely in the browser — no backend PDF endpoint required.

## What gets built

### 1. `src/components/reports/ReportPDFDocument.tsx` (new)
A pure `@react-pdf/renderer` `<Document>` component. Props: the parsed `ReportInfo` plus the parsed `reportSummaryJson` payload (clauses, analysis, riskProfile, topRulesUsed, reportMeta, keywords).

Pages & sections:
- **Cover page** — ALIS wordmark, "Compliance Analysis Report" title, document title, report ID, generation date (`date-fns` `format`), large risk badge (color-coded LOW=green / MEDIUM=amber / HIGH=red), compliance score ring (numeric + bar), client ID, jurisdiction, model version.
- **Executive Summary** — `analysis.executiveSummary`, `analysis.keyFindings`, applicable laws as chips, AI overall recommendation block (left blue border).
- **Risk Breakdown table** — counts of High / Medium / Low clauses from `riskProfile`, plus totals, flaggedForReview, similarCasesUsed.
- **Detailed Clause Analysis** — iterate `clauses` where `highlight === true` OR `finalRiskLevel ∈ {HIGH, MEDIUM}`. Each: clause number, truncated text (first ~400 chars), risk badge, explanation, recommendation, detected keywords, law reference if present. `wrap` enabled so clauses paginate cleanly; `break` before each clause that would orphan.
- **Top Rules Used** — list from `topRulesUsed`: keyword, act name + year + number, risk level, requirements (truncated), suggestion.
- **Footer** (fixed) — "ALIS — Automated Legal Intelligence System · Generated {date} · Page X of Y · This report is AI-assisted and does not constitute legal advice."

Styling: navy header band (`#0F2A4A`), accent gold rule lines, Helvetica family, 10–11pt body, 18–22pt headings, generous 36pt margins, table rows with alternating tint.

### 2. `src/lib/downloadReport.ts` (new)
```ts
export async function downloadReportPdf(reportId: number): Promise<void>
```
Flow:
1. Try Supabase first: `supabase.from('report').select('*').eq('report_id', reportId).single()`.
2. On error/null, fall back to Java: `httpGet<ReportInfo>(\`/api/reports/${reportId}\`)` (helper `getReportFromJava`).
3. Safely `JSON.parse(reportSummaryJson)` inside try/catch — if it fails, generate the PDF with summary fields only.
4. `const blob = await pdf(<ReportPDFDocument report={r} summary={s} />).toBlob();`
5. Build filename: `ALIS-Report-${reportId}-${slug(title)}.pdf` (slug: lowercase, non-alphanumerics → `-`, trim, max 60).
6. Trigger download via temporary `<a>` + `URL.createObjectURL` + `revokeObjectURL`.
7. Throw typed errors with friendly messages so the caller can `toast.error`.

### 3. `src/lib/alis.ts` (edit)
- Remove the existing `downloadReportPdf` (which calls the Python `/download-pdf` endpoint) and any stray JSX.
- Add `export { downloadReportPdf } from "./downloadReport";` so all current imports keep working.
- Keep `getReport`, `listReportsForClient` (used as Supabase-miss fallback indirectly via the helper).

### 4. `src/pages/legal/LegalReports.tsx` (edit)
- Replace the small ghost icon button with a prominent **"Download PDF"** `Button` (default variant, `Download` icon, label visible) on each completed report row.
- Track `downloadingId` state; show `Loader2` spinner + "Generating…" while pending; disable button during.
- `toast.success("Report downloaded")` / `toast.error(err.message)`.
- Only render the button when `analysisStatus === "COMPLETED"`.

## Dependencies
`@react-pdf/renderer` is not yet installed — add it. `date-fns`, `sonner`, `lucide-react`, shadcn `Button` already present.

## Technical notes
- `@react-pdf/renderer` runs fully client-side; uses built-in Helvetica so no font-loading network calls.
- All long text fields use `<Text>` with `wrap` to avoid layout overflow; clause cards use `wrap break={false}` only for the header row so the title doesn't split from its badge.
- Risk color map centralized at top of `ReportPDFDocument.tsx`.
- `downloadReport.ts` is framework-agnostic — callable from any page (Documents, DocumentDetail, dealer/user reports) later.
- No changes to routing, auth, Java/Python clients, or Supabase schema.

## Out of scope
- Server-side PDF rendering.
- Editing the existing Python `/api/reports/{id}/download-pdf` endpoint.
- Bulk export / zip.
