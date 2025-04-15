import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { AnalysisResult, SEOStatusType } from "@/lib/types";
import { getStatusColor } from "@/lib/utils";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Clock, FileText, Zap } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface PageSpeedProps {
  result: AnalysisResult;
}

export default function PageSpeed({ result }: PageSpeedProps) {
  const [open, setOpen] = useState(true);
  
  // Check if pageSpeed data exists
  const pageSpeed = result.pageSpeed || {
    loadTime: 0,
    resourceSize: 0,
    requestCount: 1,
    status: 'warning' as SEOStatusType,
    feedback: 'Page speed data not available.'
  };
  
  // Helper function to format load time nicely
  const formatLoadTime = (ms: number): string => {
    return ms < 1000 
      ? `${ms}ms` 
      : `${(ms / 1000).toFixed(2)}s`;
  };
  
  // Helper function to format file size nicely
  const formatSize = (kb: number): string => {
    if (kb < 1024) {
      return `${Math.round(kb)} KB`;
    } else {
      return `${(kb / 1024).toFixed(2)} MB`;
    }
  };
  
  // Helper function to determine load time scale (0-100)
  const getLoadTimeScale = (ms: number): number => {
    // Consider anything below 500ms as excellent (100)
    // and anything above 5000ms as very poor (0)
    if (ms <= 500) return 100;
    if (ms >= 5000) return 0;
    
    // Scale between 500ms and 5000ms
    return 100 - (((ms - 500) / 4500) * 100);
  };
  
  const getStatusBadge = (status: SEOStatusType) => {
    const statusColors: Record<SEOStatusType, string> = {
      good: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      error: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    };
    
    return (
      <Badge className={`${statusColors[status]} font-medium`} variant="outline">
        {status === "good" ? "Fast" : status === "warning" ? "Average" : "Slow"}
      </Badge>
    );
  };
  
  return (
    <Card className="mb-6">
      <Collapsible open={open} onOpenChange={setOpen}>
        <CardContent className="pt-5">
          <CollapsibleTrigger className="flex items-center justify-between w-full mb-4">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-medium">Page Speed Analysis</h2>
            </div>
            <div className="text-muted-foreground">
              {open ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              )}
            </div>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Load Time Indicator */}
              <div className="space-y-2 p-4 border rounded-md">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <h3 className="font-medium">Page Load Time</h3>
                  </div>
                  {getStatusBadge(pageSpeed.status)}
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold" style={{ color: getStatusColor(pageSpeed.status) }}>
                    {formatLoadTime(pageSpeed.loadTime)}
                  </span>
                </div>
                
                <Progress 
                  value={getLoadTimeScale(pageSpeed.loadTime)} 
                  className="h-2" 
                  indicatorClassName={`bg-${pageSpeed.status === 'good' ? 'green' : pageSpeed.status === 'warning' ? 'yellow' : 'red'}-500`}
                />
                
                <p className="text-sm text-muted-foreground mt-2">
                  {pageSpeed.feedback}
                </p>
              </div>
              
              {/* Resource Stats */}
              <div className="space-y-4 p-4 border rounded-md">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <h3 className="font-medium">Resource Statistics</h3>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Page Size:</span>
                    <span className="font-medium">{formatSize(pageSpeed.resourceSize || 0)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Request Count:</span>
                    <span className="font-medium">{pageSpeed.requestCount || 1}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mt-4 p-3 bg-blue-50 rounded-md dark:bg-blue-900/30">
                  <AlertCircle className="h-4 w-4 text-blue-500" />
                  <span className="text-xs text-blue-700 dark:text-blue-300">
                    Faster page loads improve user experience and SEO rankings.
                  </span>
                </div>
              </div>
            </div>
            
            <div className="mt-4 space-y-3 p-4 border rounded-md">
              <h3 className="font-medium">Optimization Tips</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="text-primary"><path d="m5 12 5 5 10-10"></path></svg>
                  </div>
                  <span>Compress images and use WebP format</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="text-primary"><path d="m5 12 5 5 10-10"></path></svg>
                  </div>
                  <span>Minify CSS, JavaScript, and HTML</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="text-primary"><path d="m5 12 5 5 10-10"></path></svg>
                  </div>
                  <span>Enable browser caching</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="text-primary"><path d="m5 12 5 5 10-10"></path></svg>
                  </div>
                  <span>Use a Content Delivery Network (CDN)</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="text-primary"><path d="m5 12 5 5 10-10"></path></svg>
                  </div>
                  <span>Reduce the number of HTTP requests</span>
                </li>
              </ul>
            </div>
          </CollapsibleContent>
        </CardContent>
      </Collapsible>
    </Card>
  );
}