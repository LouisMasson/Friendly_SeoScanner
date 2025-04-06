import { Card, CardContent } from "@/components/ui/card";
import { AnalysisResult, SEOStatusType } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { formatUrl, getFaviconUrl } from "@/lib/utils";
import { CheckCircle2, AlertCircle, XCircle, ExternalLink, Globe, Tag, BookOpen } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ResultSummaryProps {
  result: AnalysisResult;
}

export default function ResultSummary({ result }: ResultSummaryProps) {
  const getScoreStatus = (score: number): SEOStatusType => {
    if (score >= 80) return "good";
    if (score >= 50) return "warning";
    return "error";
  };
  
  // Helper to convert SEO status to a numeric score
  const getStatusScore = (status: SEOStatusType): number => {
    switch (status) {
      case 'good': return 100;
      case 'warning': return 50;
      case 'error': return 0;
      default: return 0;
    }
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
  
  const getProgressColor = (score: number): string => {
    if (score >= 90) return 'bg-green-600';
    if (score >= 80) return 'bg-green-500';
    if (score >= 70) return 'bg-amber-500';
    if (score >= 50) return 'bg-amber-600';
    if (score >= 30) return 'bg-orange-500';
    return 'bg-red-500';
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
  
  const getFeedbackMessage = (score: number): string => {
    if (score >= 90) return 'Excellent! Your SEO implementation is outstanding.';
    if (score >= 80) return 'Great job! Your SEO is well implemented.';
    if (score >= 70) return 'Good! A few improvements would make your SEO stronger.';
    if (score >= 50) return 'Average. Several improvements are recommended.';
    if (score >= 30) return 'Needs work. Multiple important SEO elements are missing.';
    return 'Critical issues found. Urgent SEO improvements needed.';
  };

  return (
    <Card className="mb-6">
      <CardContent className="pt-5">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Score visualization - Left side */}
          <div className="flex-1">
            <h2 className="text-lg font-medium mb-3">SEO Score</h2>
            
            <div className="flex flex-col items-center justify-center p-4 bg-muted/20 rounded-lg">
              <div className="relative w-36 h-36 flex items-center justify-center mb-3">
                {/* Circular progress background */}
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="45" 
                    fill="none" 
                    stroke="currentColor" 
                    className="text-muted-foreground/20" 
                    strokeWidth="10" 
                  />
                  
                  {/* Circular progress bar */}
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="45" 
                    fill="none" 
                    stroke="currentColor" 
                    className={result.score >= 80 ? "text-green-500" : result.score >= 50 ? "text-amber-500" : "text-red-500"} 
                    strokeWidth="10" 
                    strokeDasharray="283" 
                    strokeDashoffset={283 - (283 * result.score / 100)} 
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                
                {/* Score in the center */}
                <div className="absolute flex flex-col items-center justify-center">
                  <span className={`text-4xl font-bold ${getScoreColor(result.score)}`}>
                    {result.score}
                  </span>
                  <span className="text-xs font-medium text-foreground/70">out of 100</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mt-1">
                {getScoreIcon()}
                <span className={`${getScoreColor(result.score)} font-medium text-sm`}>
                  {scoreStatus === "good" ? "Good" : scoreStatus === "warning" ? "Needs Improvement" : "Critical Issues"}
                </span>
              </div>
              
              <p className="text-sm text-center mt-2">{getFeedbackMessage(result.score)}</p>
            </div>
          </div>
          
          {/* Website details - Right side */}
          <div className="flex-1">
            <h2 className="text-lg font-medium mb-3">Website Details</h2>
            
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 p-4 bg-muted/20 rounded-lg">
                <div className="w-10 h-10 bg-muted/40 rounded-full flex items-center justify-center">
                  <img 
                    src={getFaviconUrl(result.url)} 
                    alt="Website favicon"
                    className="w-6 h-6"
                    onError={(e) => {
                      e.currentTarget.src = '';
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement?.querySelector('svg')?.classList.remove('hidden');
                    }}
                  />
                  <Globe className="w-5 h-5 text-foreground/70 hidden" />
                </div>
                <div className="flex-1">
                  <div className="text-sm text-foreground/70">Website URL</div>
                  <div className="font-medium flex items-center gap-1 truncate">
                    {formatUrl(result.url)}
                    <a href={result.url} target="_blank" rel="noreferrer" className="inline-flex">
                      <ExternalLink className="h-3.5 w-3.5 text-foreground/50" />
                    </a>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col p-4 bg-muted/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Tag className="h-4 w-4 text-foreground/70" />
                    <div className="text-sm text-foreground/70">Meta Tags</div>
                  </div>
                  <div className="font-medium text-lg">{result.tagCount}</div>
                  <div className="text-xs text-foreground/60">Tags detected</div>
                </div>
                
                <div className="flex flex-col p-4 bg-muted/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="h-4 w-4 text-foreground/70" />
                    <div className="text-sm text-foreground/70">Title</div>
                  </div>
                  <div className="font-medium truncate text-sm">
                    {result.title || "No title found"}
                  </div>
                </div>
              </div>
              
              {/* Main metrics summary */}
              <div className="flex flex-col gap-2">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">Title</span>
                    <Badge 
                      variant="outline" 
                      className={`${getScoreColor(getStatusScore(result.titleTag.status))} px-2 text-xs font-medium border-0`}
                    >
                      {result.titleTag.status === 'good' ? 'Good' : result.titleTag.status === 'warning' ? 'Improve' : 'Missing'}
                    </Badge>
                  </div>
                  <Progress 
                    value={getStatusScore(result.titleTag.status)} 
                    className="h-1.5" 
                    indicatorClassName={result.titleTag.status === 'good' ? 'bg-green-500' : result.titleTag.status === 'warning' ? 'bg-amber-500' : 'bg-red-500'} 
                  />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">Description</span>
                    <Badge 
                      variant="outline" 
                      className={`${getScoreColor(getStatusScore(result.descriptionTag.status))} px-2 text-xs font-medium border-0`}
                    >
                      {result.descriptionTag.status === 'good' ? 'Good' : result.descriptionTag.status === 'warning' ? 'Improve' : 'Missing'}
                    </Badge>
                  </div>
                  <Progress 
                    value={getStatusScore(result.descriptionTag.status)} 
                    className="h-1.5" 
                    indicatorClassName={result.descriptionTag.status === 'good' ? 'bg-green-500' : result.descriptionTag.status === 'warning' ? 'bg-amber-500' : 'bg-red-500'} 
                  />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">Social Media</span>
                    <Badge 
                      variant="outline" 
                      className={`${getScoreColor(getStatusScore(result.ogTags.status))} px-2 text-xs font-medium border-0`}
                    >
                      {result.ogTags.status === 'good' ? 'Good' : result.ogTags.status === 'warning' ? 'Improve' : 'Missing'}
                    </Badge>
                  </div>
                  <Progress 
                    value={getStatusScore(result.ogTags.status)} 
                    className="h-1.5" 
                    indicatorClassName={result.ogTags.status === 'good' ? 'bg-green-500' : result.ogTags.status === 'warning' ? 'bg-amber-500' : 'bg-red-500'} 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
