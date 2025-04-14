import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AnalysisResult, SEOStatusType } from "@/lib/types";
import { getStatusColor } from "@/lib/utils";
import { CheckCircle2, XCircle, AlertCircle, Smartphone, Eye, Layout, Fingerprint, Type, Code } from "lucide-react";
import { Badge } from "./ui/badge";

interface MobileFriendlinessProps {
  result: AnalysisResult;
}

export default function MobileFriendliness({ result }: MobileFriendlinessProps) {
  const { mobileFriendliness } = result;
  
  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle2 className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };
  
  const getStatusBadge = (status: SEOStatusType) => {
    switch (status) {
      case "good":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-600 border-0">
            <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Good
          </Badge>
        );
      case "warning":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-600 border-0">
            <AlertCircle className="h-3.5 w-3.5 mr-1" /> Needs Improvement
          </Badge>
        );
      case "error":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-600 border-0">
            <XCircle className="h-3.5 w-3.5 mr-1" /> Major Issues
          </Badge>
        );
      default:
        return null;
    }
  };
  
  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium flex items-center">
            <Smartphone className="h-5 w-5 mr-2 text-primary" />
            Mobile-Friendliness Analysis
          </CardTitle>
          {getStatusBadge(mobileFriendliness.status)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <p className="text-muted-foreground text-sm mb-2">
            {mobileFriendliness.feedback}
          </p>
          
          <div className="flex items-center gap-2 mt-3 mb-1">
            <span className="text-sm font-medium">Score</span>
            <span className="text-sm ml-auto">{mobileFriendliness.score}/100</span>
          </div>
          <Progress 
            value={mobileFriendliness.score} 
            className="h-2"
            indicatorClassName={
              mobileFriendliness.score >= 80 ? "bg-green-500" : 
              mobileFriendliness.score >= 50 ? "bg-amber-500" : 
              "bg-red-500"
            }
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="flex items-start gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${mobileFriendliness.viewport ? 'bg-green-100' : 'bg-red-100'}`}>
              {getStatusIcon(mobileFriendliness.viewport)}
            </div>
            <div>
              <h3 className="text-sm font-medium flex items-center gap-1">
                <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                Viewport Meta Tag
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {mobileFriendliness.viewport 
                  ? "Properly configured viewport tag detected" 
                  : "No viewport meta tag found - essential for responsive design"}
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${mobileFriendliness.responsiveDesign ? 'bg-green-100' : 'bg-red-100'}`}>
              {getStatusIcon(mobileFriendliness.responsiveDesign)}
            </div>
            <div>
              <h3 className="text-sm font-medium flex items-center gap-1">
                <Layout className="h-3.5 w-3.5 text-muted-foreground" />
                Responsive Design
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {mobileFriendliness.responsiveDesign 
                  ? "Responsive design techniques detected" 
                  : "No responsive design indicators found"}
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${mobileFriendliness.touchElements ? 'bg-green-100' : 'bg-red-100'}`}>
              {getStatusIcon(mobileFriendliness.touchElements)}
            </div>
            <div>
              <h3 className="text-sm font-medium flex items-center gap-1">
                <Fingerprint className="h-3.5 w-3.5 text-muted-foreground" />
                Touch-Friendly Elements
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {mobileFriendliness.touchElements 
                  ? "Touch-optimized elements detected" 
                  : "Touch optimization improvements suggested"}
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${mobileFriendliness.fontReadability ? 'bg-green-100' : 'bg-red-100'}`}>
              {getStatusIcon(mobileFriendliness.fontReadability)}
            </div>
            <div>
              <h3 className="text-sm font-medium flex items-center gap-1">
                <Type className="h-3.5 w-3.5 text-muted-foreground" />
                Font Readability
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {mobileFriendliness.fontReadability 
                  ? "Flexible font sizing for readability" 
                  : "Fixed font sizes may cause readability issues"}
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${mobileFriendliness.mediaQueries ? 'bg-green-100' : 'bg-red-100'}`}>
              {getStatusIcon(mobileFriendliness.mediaQueries)}
            </div>
            <div>
              <h3 className="text-sm font-medium flex items-center gap-1">
                <Code className="h-3.5 w-3.5 text-muted-foreground" />
                Media Queries
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {mobileFriendliness.mediaQueries 
                  ? "Media queries found for responsive breakpoints" 
                  : "No media queries detected for screen sizes"}
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-6 bg-muted/20 p-4 rounded-lg">
          <h3 className="text-sm font-medium mb-2">Why Mobile-Friendliness Matters</h3>
          <p className="text-xs text-muted-foreground">
            Mobile-friendly websites rank higher in search results, provide better user experiences, 
            and convert more visitors into customers. Google primarily uses the mobile version 
            of your site for indexing and ranking, making mobile optimization critical for SEO success.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}