import { Card, CardContent } from "@/components/ui/card";
import { AnalysisResult, SEOStatusType } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { formatUrl } from "@/lib/utils";
import { CheckCircle2, AlertCircle, XCircle } from "lucide-react";

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
  
  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'text-green-600 bg-green-50';
    if (score >= 80) return 'text-green-500 bg-green-50';
    if (score >= 70) return 'text-amber-500 bg-amber-50';
    if (score >= 50) return 'text-amber-600 bg-amber-50';
    if (score >= 30) return 'text-orange-500 bg-orange-50';
    return 'text-red-500 bg-red-50';
  };
  
  const getScoreIcon = () => {
    if (result.score >= 80) {
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    } else if (result.score >= 50) {
      return <AlertCircle className="h-5 w-5 text-amber-500" />;
    } else {
      return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  return (
    <Card className="mb-6">
      <CardContent className="pt-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Analysis Results</h2>
          <div className="flex items-center">
            <div className="mr-2">
              {getScoreIcon()}
            </div>
            <Badge 
              variant="outline" 
              className={`
                ${getScoreColor(result.score)}
                px-3 py-1 rounded-full text-sm font-medium border-0
              `}
            >
              Score: {result.score}/100
            </Badge>
          </div>
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
