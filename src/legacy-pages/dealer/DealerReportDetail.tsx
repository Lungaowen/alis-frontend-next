import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Download, FileText, AlertTriangle, CheckCircle, Clock, Scale, Building2, Calendar, MapPin, Tag } from "lucide-react";
import { PortalLayout } from "@/components/app/PortalLayout";
import { Spinner, EmptyState, ProgressBar } from "@/components/app/Primitives";
import { RiskBadge } from "@/components/app/StatusBadges";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getDetailedReport, type DetailedReport } from "@/lib/alis";
import { toast } from "sonner";

export default function DealerReportDetailPage() {
  const { documentId } = useParams<{ documentId: string }>();
  const [report, setReport] = useState<DetailedReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!documentId) return;
    const fetchReport = async () => {
      try {
        const data = await getDetailedReport(parseInt(documentId));
        setReport(data);
      } catch (e) {
        toast.error((e as Error)?.message ?? "Failed to load report");
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [documentId]);

  if (loading) return <PortalLayout title="Report Details"><Spinner /></PortalLayout>;
  if (!report) return <PortalLayout title="Report Details"><EmptyState title="Report not found" description="The requested report could not be found." /></PortalLayout>;

  const summary = report.report_summary_json;

  return (
    <PortalLayout
      title="Detailed Report"
      eyebrow="Deal Maker"
      description={`Analysis for document #${report.document_id}`}
      actions={
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to="/dealer/deals"><ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Deals</Link>
          </Button>
          <Button asChild>
            <a href={report.report_url} target="_blank" rel="noopener noreferrer">
              <Download className="mr-1.5 h-4 w-4" /> Download PDF
            </a>
          </Button>
        </div>
      }
    >
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="clauses">Clauses</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="entities">Entities</TabsTrigger>
          <TabsTrigger value="keywords">Keywords</TabsTrigger>
          <TabsTrigger value="rules">Rules</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Risk Level</CardTitle>
              </CardHeader>
              <CardContent>
                <RiskBadge level={report.risk_level} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <ProgressBar value={summary.riskProfile.complianceScore} />
                  <span className="text-2xl font-semibold">{summary.riskProfile.complianceScore}%</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total Clauses</CardTitle>
              </CardHeader>
              <CardContent>
                <span className="text-2xl font-semibold">{summary.riskProfile.totalClauses}</span>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Analysis Status</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant={report.analysis_status === "COMPLETED" ? "default" : "secondary"}>
                  {report.analysis_status}
                </Badge>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Executive Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{summary.analysis.executiveSummary}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AI Recommendation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{report.ai_recommendation}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AI Explanation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{report.ai_explanation}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clauses" className="space-y-4">
          <div className="grid gap-4">
            {summary.clauses.map((clause) => (
              <Card key={clause.clauseId} className={clause.highlight ? "border-accent" : ""}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">Clause {clause.clauseNumber}</CardTitle>
                      <CardDescription>{clause.type}</CardDescription>
                    </div>
                    <Badge variant={clause.finalRiskLevel === "HIGH" ? "destructive" : clause.finalRiskLevel === "MEDIUM" ? "secondary" : "default"}>
                      {clause.finalRiskLevel}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm whitespace-pre-wrap">{clause.text}</p>
                  <div className="text-sm text-muted-foreground">
                    <p><strong>Explanation:</strong> {clause.explanation}</p>
                    <p><strong>Recommendation:</strong> {clause.recommendation}</p>
                  </div>
                  {clause.detectedKeywords.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {clause.detectedKeywords.map((keyword) => (
                        <Badge key={keyword} variant="outline" className="text-xs">{keyword}</Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Key Findings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{summary.analysis.keyFindings}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Applicable Laws</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {summary.analysis.lawsApplicable.map((law) => (
                  <Badge key={law} variant="outline">{law}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Overall Explanation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{summary.analysis.overallExplanation}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Similar Cases Used</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{summary.analysis.similarCasesUsed} similar cases referenced</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="entities" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Calendar className="h-4 w-4" /> Dates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {summary.entities.dates.map((date, i) => (
                    <div key={i} className="text-sm">
                      <Badge variant="outline">{date.rawString}</Badge>
                      <span className="text-xs text-muted-foreground ml-2">{date.isoDate}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> Locations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {summary.entities.locations.map((loc, i) => (
                    <Badge key={i} variant="outline">{loc.name}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Building2 className="h-4 w-4" /> Company Registrations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {summary.entities.identifiers.companyRegNumbers.map((reg, i) => (
                    <Badge key={i} variant="outline">{reg}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText className="h-4 w-4" /> Case Numbers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {summary.entities.identifiers.caseNumbers.map((num, i) => (
                    <Badge key={i} variant="outline">{num}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Scale className="h-4 w-4" /> Extraction Confidence
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <ProgressBar value={summary.entities.extractionStats.confidence * 100} />
                  <span className="text-sm font-semibold">{Math.round(summary.entities.extractionStats.confidence * 100)}%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="keywords" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Keywords (TF-IDF)</CardTitle>
              <CardDescription>{summary.keywords.keywordStats.tfidfKeywordCount} keywords identified</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {summary.keywords.tfidfKeywords.slice(0, 20).map((kw) => (
                  <Badge key={kw.keyword} variant="outline" className="text-xs">
                    {kw.keyword} ({kw.score.toFixed(2)})
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detected Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {summary.keywords.detectedCategories.map((cat) => (
                  <div key={cat.category} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{cat.category}</p>
                      <p className="text-xs text-muted-foreground">{cat.lawReference}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={cat.riskLevel === "HIGH" ? "destructive" : cat.riskLevel === "MEDIUM" ? "secondary" : "default"}>
                        {cat.riskLevel}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">{cat.score.toFixed(1)}% match</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dominant Law References</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {summary.keywords.dominantLawReferences.map((ref) => (
                  <Badge key={ref} variant="outline">{ref}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <div className="grid gap-4">
            {summary.topRulesUsed.map((rule) => (
              <Card key={rule.rule_id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{rule.act_name} ({rule.act_year})</CardTitle>
                      <CardDescription>{rule.act_number}</CardDescription>
                    </div>
                    <Badge variant={rule.risk_level === "HIGH" ? "destructive" : rule.risk_level === "MEDIUM" ? "secondary" : "default"}>
                      {rule.risk_level}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-medium">Keyword: {rule.keyword}</p>
                    <p className="text-xs text-muted-foreground">Relevance Score: {rule.relevanceScore}</p>
                  </div>
                  <div className="text-sm">
                    <p className="font-medium">Requirements:</p>
                    <p className="text-muted-foreground whitespace-pre-wrap text-xs">{rule.requirements}</p>
                  </div>
                  <div className="text-sm">
                    <p className="font-medium">Suggestion:</p>
                    <p className="text-muted-foreground whitespace-pre-wrap text-xs">{rule.suggestion}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </PortalLayout>
  );
}
