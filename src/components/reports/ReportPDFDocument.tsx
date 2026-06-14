import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { format } from "date-fns";
import type { ReportInfo, RiskLevel } from "@/lib/alis";

export interface ParsedSummary {
  clauses?: Array<{
    clauseId?: string | number;
    clauseNumber?: number;
    text?: string;
    highlight?: boolean;
    finalRiskLevel?: RiskLevel;
    mlRiskLevel?: RiskLevel;
    groqRiskLevel?: RiskLevel;
    explanation?: string;
    recommendation?: string;
    detectedKeywords?: string[];
    lawReference?: string | null;
    pageNumber?: number | null;
  }>;
  analysis?: {
    executiveSummary?: string;
    keyFindings?: string;
    overallExplanation?: string;
    overallRecommendation?: string;
    lawsApplicable?: string[];
    similarCasesUsed?: number;
  };
  riskProfile?: {
    totalClauses?: number;
    highRiskClauses?: number;
    mediumRiskClauses?: number;
    lowRiskClauses?: number;
    complianceScore?: number;
    overallRiskLevel?: RiskLevel;
    flaggedForReview?: boolean;
  };
  topRulesUsed?: Array<{
    rule_id?: number;
    keyword?: string;
    act_name?: string;
    act_year?: number | string;
    act_number?: string;
    act_section?: string | null;
    risk_level?: RiskLevel;
    requirements?: string;
    suggestion?: string;
  }>;
  reportMeta?: {
    jurisdiction?: string;
    documentType?: string;
    modelVersion?: string;
    pipelineVersion?: string;
  };
}

const NAVY = "#0F2A4A";
const GOLD = "#C9A24A";
const MUTED = "#5B6470";
const BORDER = "#D8DEE6";
const SOFT = "#F4F6F9";

const RISK_COLOR: Record<string, string> = {
  HIGH: "#C0392B",
  MEDIUM: "#D08A1E",
  LOW: "#2E7D5B",
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 56,
    paddingBottom: 64,
    paddingHorizontal: 44,
    fontFamily: "Helvetica",
    fontSize: 10.5,
    color: "#1A2233",
    lineHeight: 1.45,
  },
  // Cover
  coverHeader: { backgroundColor: NAVY, padding: 24, marginHorizontal: -44, marginTop: -56 },
  coverWordmark: { color: "#FFFFFF", fontFamily: "Helvetica-Bold", fontSize: 14, letterSpacing: 4 },
  coverSub: { color: GOLD, fontSize: 9, letterSpacing: 2, marginTop: 4 },
  coverTitle: { fontFamily: "Helvetica-Bold", fontSize: 26, color: NAVY, marginTop: 48 },
  coverDocTitle: { fontSize: 14, color: MUTED, marginTop: 8 },
  coverMetaGrid: { marginTop: 36, borderTop: `1pt solid ${BORDER}`, paddingTop: 16 },
  coverMetaRow: { flexDirection: "row", marginBottom: 8 },
  coverMetaLabel: { width: 130, color: MUTED, fontSize: 9, letterSpacing: 1 },
  coverMetaValue: { flex: 1, fontFamily: "Helvetica-Bold", fontSize: 10.5 },
  riskBadgeLarge: {
    marginTop: 28,
    alignSelf: "flex-start",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 4,
    color: "#FFFFFF",
    fontFamily: "Helvetica-Bold",
    fontSize: 16,
    letterSpacing: 2,
  },
  scoreBlock: { marginTop: 24 },
  scoreLabel: { fontSize: 9, color: MUTED, letterSpacing: 1.5 },
  scoreValue: { fontFamily: "Helvetica-Bold", fontSize: 40, color: NAVY, marginTop: 2 },
  scoreBarBg: { marginTop: 8, height: 8, backgroundColor: SOFT, borderRadius: 4 },
  scoreBarFg: { height: 8, backgroundColor: NAVY, borderRadius: 4 },
  // Sections
  sectionTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 14,
    color: NAVY,
    marginBottom: 10,
    paddingBottom: 6,
    borderBottom: `1pt solid ${GOLD}`,
  },
  paragraph: { marginBottom: 8, textAlign: "justify" },
  // Recommendation block
  recBlock: {
    marginTop: 10,
    padding: 12,
    backgroundColor: SOFT,
    borderLeft: `3pt solid ${NAVY}`,
  },
  recLabel: { fontFamily: "Helvetica-Bold", fontSize: 9, color: NAVY, letterSpacing: 1.5, marginBottom: 4 },
  // Chips
  chipRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 6 },
  chip: {
    fontSize: 8.5,
    paddingVertical: 3,
    paddingHorizontal: 8,
    backgroundColor: SOFT,
    border: `1pt solid ${BORDER}`,
    borderRadius: 10,
    marginRight: 6,
    marginBottom: 6,
    color: NAVY,
  },
  // Table
  table: { marginTop: 4, border: `1pt solid ${BORDER}`, borderRadius: 2 },
  tr: { flexDirection: "row", borderBottom: `1pt solid ${BORDER}` },
  trLast: { flexDirection: "row" },
  th: {
    flex: 1,
    padding: 8,
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    color: "#FFFFFF",
    backgroundColor: NAVY,
    letterSpacing: 1,
  },
  td: { flex: 1, padding: 8, fontSize: 10 },
  tdAlt: { flex: 1, padding: 8, fontSize: 10, backgroundColor: SOFT },
  // Clause card
  clauseCard: {
    marginBottom: 12,
    border: `1pt solid ${BORDER}`,
    borderRadius: 3,
  },
  clauseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    backgroundColor: SOFT,
    borderBottom: `1pt solid ${BORDER}`,
  },
  clauseTitle: { fontFamily: "Helvetica-Bold", fontSize: 11, color: NAVY },
  riskBadgeSmall: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: "#FFFFFF",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 3,
    letterSpacing: 1,
  },
  clauseBody: { padding: 10 },
  clauseQuote: {
    fontSize: 9.5,
    color: "#2B3340",
    fontStyle: "italic",
    paddingLeft: 8,
    borderLeft: `2pt solid ${BORDER}`,
    marginBottom: 8,
  },
  label: { fontFamily: "Helvetica-Bold", fontSize: 9, color: MUTED, letterSpacing: 1, marginTop: 6 },
  // Rules
  ruleCard: {
    marginBottom: 10,
    padding: 10,
    border: `1pt solid ${BORDER}`,
    borderRadius: 3,
  },
  ruleHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  ruleAct: { fontSize: 9, color: MUTED },
  ruleKeyword: { fontFamily: "Helvetica-Bold", fontSize: 11, color: NAVY },
  // Footer
  footer: {
    position: "absolute",
    bottom: 24,
    left: 44,
    right: 44,
    paddingTop: 8,
    borderTop: `1pt solid ${BORDER}`,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    color: MUTED,
  },
});

function trim(text: string | undefined, max = 420): string {
  if (!text) return "";
  const t = text.replace(/\s+/g, " ").trim();
  return t.length > max ? `${t.slice(0, max)}…` : t;
}

function RiskBadge({ level, big = false }: { level?: string; big?: boolean }) {
  const bg = RISK_COLOR[level ?? "LOW"] ?? RISK_COLOR.LOW;
  return (
    <Text style={[big ? styles.riskBadgeLarge : styles.riskBadgeSmall, { backgroundColor: bg }]}>
      {(level ?? "LOW").toUpperCase()} RISK
    </Text>
  );
}

function Footer({ generatedAt }: { generatedAt: string }) {
  return (
    <View style={styles.footer} fixed>
      <Text>
        ALIS — Automated Legal Intelligence System · Generated {generatedAt} · AI-assisted; not legal advice.
      </Text>
      <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
    </View>
  );
}

export interface ReportPDFDocumentProps {
  report: ReportInfo;
  summary: ParsedSummary | null;
}

export function ReportPDFDocument({ report, summary }: ReportPDFDocumentProps) {
  const generatedAtDate = report.generatedAt ? new Date(report.generatedAt) : new Date();
  const generatedAt = format(generatedAtDate, "d MMM yyyy 'at' HH:mm");
  const risk = (summary?.riskProfile?.overallRiskLevel ?? report.riskLevel ?? "LOW") as string;
  const score =
    summary?.riskProfile?.complianceScore ??
    Math.round(report.similarityScore ?? 0);

  const highlightedClauses = (summary?.clauses ?? []).filter(
    (c) => c.highlight || c.finalRiskLevel === "HIGH" || c.finalRiskLevel === "MEDIUM"
  );

  const rp = summary?.riskProfile;
  const analysis = summary?.analysis;
  const rules = summary?.topRulesUsed ?? [];

  return (
    <Document
      title={`ALIS Compliance Report #${report.reportId}`}
      author="ALIS"
      subject={report.documentTitle}
    >
      {/* Cover */}
      <Page size="A4" style={styles.page}>
        <View style={styles.coverHeader}>
          <Text style={styles.coverWordmark}>ALIS</Text>
          <Text style={styles.coverSub}>AUTOMATED LEGAL INTELLIGENCE SYSTEM</Text>
        </View>

        <Text style={styles.coverTitle}>Compliance Analysis Report</Text>
        <Text style={styles.coverDocTitle}>{report.documentTitle ?? "Untitled document"}</Text>

        <RiskBadge level={risk} big />

        <View style={styles.scoreBlock}>
          <Text style={styles.scoreLabel}>COMPLIANCE SCORE</Text>
          <Text style={styles.scoreValue}>{score}</Text>
          <View style={styles.scoreBarBg}>
            <View style={[styles.scoreBarFg, { width: `${Math.min(100, Math.max(0, score))}%` }]} />
          </View>
        </View>

        <View style={styles.coverMetaGrid}>
          {[
            ["REPORT ID", `#${report.reportId}`],
            ["DOCUMENT ID", `#${report.documentId}`],
            ["CLIENT ID", `#${report.clientId}`],
            ["JURISDICTION", summary?.reportMeta?.jurisdiction ?? "South Africa"],
            ["DOCUMENT TYPE", summary?.reportMeta?.documentType ?? "—"],
            ["MODEL", report.modelVersion ?? summary?.reportMeta?.modelVersion ?? "—"],
            ["GENERATED", generatedAt],
            ["STATUS", report.analysisStatus ?? "COMPLETED"],
          ].map(([k, v]) => (
            <View key={k} style={styles.coverMetaRow}>
              <Text style={styles.coverMetaLabel}>{k}</Text>
              <Text style={styles.coverMetaValue}>{v}</Text>
            </View>
          ))}
        </View>

        <Footer generatedAt={generatedAt} />
      </Page>

      {/* Executive Summary + Risk Breakdown */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Executive Summary</Text>
        <Text style={styles.paragraph}>
          {analysis?.executiveSummary ?? report.aiExplanation ?? "No executive summary available."}
        </Text>

        {analysis?.keyFindings && (
          <>
            <Text style={styles.label}>KEY FINDINGS</Text>
            <Text style={styles.paragraph}>{analysis.keyFindings}</Text>
          </>
        )}

        {(analysis?.lawsApplicable ?? []).length > 0 && (
          <>
            <Text style={styles.label}>APPLICABLE LAWS</Text>
            <View style={styles.chipRow}>
              {analysis!.lawsApplicable!.map((l) => (
                <Text key={l} style={styles.chip}>{l}</Text>
              ))}
            </View>
          </>
        )}

        <View style={styles.recBlock}>
          <Text style={styles.recLabel}>AI RECOMMENDATION</Text>
          <Text>{analysis?.overallRecommendation ?? report.aiRecommendation ?? "—"}</Text>
        </View>

        <View style={{ marginTop: 22 }}>
          <Text style={styles.sectionTitle}>Risk Breakdown</Text>
          <View style={styles.table}>
            <View style={styles.tr}>
              <Text style={styles.th}>METRIC</Text>
              <Text style={styles.th}>VALUE</Text>
            </View>
            {[
              ["Total clauses analyzed", String(rp?.totalClauses ?? (summary?.clauses?.length ?? 0))],
              ["High-risk clauses", String(rp?.highRiskClauses ?? 0)],
              ["Medium-risk clauses", String(rp?.mediumRiskClauses ?? 0)],
              ["Low-risk clauses", String(rp?.lowRiskClauses ?? 0)],
              ["Overall risk level", String(rp?.overallRiskLevel ?? risk)],
              ["Compliance score", `${score} / 100`],
              ["Flagged for review", rp?.flaggedForReview ? "Yes" : "No"],
              ["Similar cases referenced", String(analysis?.similarCasesUsed ?? 0)],
            ].map(([k, v], i, arr) => (
              <View key={k} style={i === arr.length - 1 ? styles.trLast : styles.tr}>
                <Text style={i % 2 === 0 ? styles.td : styles.tdAlt}>{k}</Text>
                <Text style={i % 2 === 0 ? styles.td : styles.tdAlt}>{v}</Text>
              </View>
            ))}
          </View>
        </View>

        <Footer generatedAt={generatedAt} />
      </Page>

      {/* Detailed Clause Analysis */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Detailed Clause Analysis</Text>
        {highlightedClauses.length === 0 ? (
          <Text style={styles.paragraph}>
            No high or medium risk clauses were identified. All clauses are LOW risk.
          </Text>
        ) : (
          highlightedClauses.map((c, idx) => (
            <View key={String(c.clauseId ?? idx)} style={styles.clauseCard} wrap={false}>
              <View style={styles.clauseHeader}>
                <Text style={styles.clauseTitle}>
                  Clause {c.clauseNumber ?? c.clauseId ?? idx + 1}
                </Text>
                <RiskBadge level={c.finalRiskLevel ?? c.mlRiskLevel ?? "MEDIUM"} />
              </View>
              <View style={styles.clauseBody}>
                <Text style={styles.clauseQuote}>“{trim(c.text, 360)}”</Text>

                {c.explanation && (
                  <>
                    <Text style={styles.label}>EXPLANATION</Text>
                    <Text>{c.explanation}</Text>
                  </>
                )}

                {c.recommendation && (
                  <>
                    <Text style={styles.label}>RECOMMENDATION</Text>
                    <Text>{c.recommendation}</Text>
                  </>
                )}

                {c.lawReference && (
                  <>
                    <Text style={styles.label}>LAW REFERENCE</Text>
                    <Text>{c.lawReference}</Text>
                  </>
                )}

                {(c.detectedKeywords ?? []).length > 0 && (
                  <>
                    <Text style={styles.label}>DETECTED KEYWORDS</Text>
                    <View style={styles.chipRow}>
                      {c.detectedKeywords!.map((k) => (
                        <Text key={k} style={styles.chip}>{k}</Text>
                      ))}
                    </View>
                  </>
                )}
              </View>
            </View>
          ))
        )}

        <Footer generatedAt={generatedAt} />
      </Page>

      {/* Top Rules Used */}
      {rules.length > 0 && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.sectionTitle}>Top Rules Applied</Text>
          {rules.map((r, idx) => (
            <View key={`${r.rule_id ?? idx}`} style={styles.ruleCard} wrap={false}>
              <View style={styles.ruleHeader}>
                <Text style={styles.ruleKeyword}>{r.keyword ?? "—"}</Text>
                <RiskBadge level={r.risk_level ?? "LOW"} />
              </View>
              <Text style={styles.ruleAct}>
                {r.act_name ?? "—"}
                {r.act_number ? ` · ${r.act_number}` : ""}
                {r.act_year ? ` (${r.act_year})` : ""}
                {r.act_section ? ` · §${r.act_section}` : ""}
              </Text>

              {r.requirements && (
                <>
                  <Text style={styles.label}>REQUIREMENT</Text>
                  <Text>{trim(r.requirements, 500)}</Text>
                </>
              )}
              {r.suggestion && (
                <>
                  <Text style={styles.label}>SUGGESTION</Text>
                  <Text>{trim(r.suggestion, 500)}</Text>
                </>
              )}
            </View>
          ))}

          <Footer generatedAt={generatedAt} />
        </Page>
      )}
    </Document>
  );
}

export default ReportPDFDocument;
