import { Card, CardContent } from "@/components/ui/card";
import { AnalysisResult, SEOStatusType } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { formatUrl } from "@/lib/utils";

interface ResultSummaryProps {
  result: AnalysisResult;
}

export default function ResultSummary({ result }: ResultSummaryProps) {
  const getScoreStatus = (score: number): SEOStatusType => {
    if (score >= 80) return "good";
    if (score >= 50) return "warning";
    return "error";
  };

  const scoreStatus = getScoreStatus(result.score);

  return (
    <Card className="mb-6">
      <CardContent className="pt-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Analysis Results</h2>
          <Badge 
            variant="outline" 
            className={`
              ${scoreStatus === 'good' ? 'bg-success/10 text-success' : 
                scoreStatus === 'warning' ? 'bg-warning/10 text-warning' : 
                'bg-destructive/10 text-destructive'}
              px-2 py-0.5 rounded-full text-xs font-medium
            `}
          >
            Score: {result.score}/100
          </Badge>
        </div>
        
        <div className="mt-4 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 p-3 bg-muted/30 rounded-md">
            <div className="text-sm text-foreground/70 mb-1">Website</div>
            <div className="font-medium truncate">
              {formatUrl(result.url)}
            </div>
          </div>
          <div className="flex-1 p-3 bg-muted/30 rounded-md">
            <div className="text-sm text-foreground/70 mb-1">Found Tags</div>
            <div className="font-medium">
              {result.tagCount} SEO tags detected
            </div>
          </div>
          <div className="flex-1 p-3 bg-muted/30 rounded-md">
            <div className="text-sm text-foreground/70 mb-1">Page Title</div>
            <div className="font-medium truncate">
              {result.title || "No title found"}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
