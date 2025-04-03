import { Card, CardContent } from "@/components/ui/card";
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from "@/components/ui/collapsible";
import { AnalysisResult } from "@/lib/types";
import { truncateString, formatUrl } from "@/lib/utils";
import { CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import { useState } from "react";

interface GooglePreviewProps {
  result: AnalysisResult;
}

export default function GooglePreview({ result }: GooglePreviewProps) {
  const [open, setOpen] = useState(true);
  
  // Format description for Google preview
  const description = result.description || '';
  
  // Display appropriate icon based on status
  const getTitleIcon = () => {
    switch (result.titleTag.status) {
      case 'good':
        return <CheckCircle2 className="text-success" />;
      case 'warning':
        return <AlertCircle className="text-warning" />;
      case 'error':
        return <XCircle className="text-destructive" />;
    }
  };
  
  const getDescriptionIcon = () => {
    switch (result.descriptionTag.status) {
      case 'good':
        return <CheckCircle2 className="text-success" />;
      case 'warning':
        return <AlertCircle className="text-warning" />;
      case 'error':
        return <XCircle className="text-destructive" />;
    }
  };

  return (
    <Card className="mb-6">
      <Collapsible open={open} onOpenChange={setOpen}>
        <CardContent className="pt-5">
          <CollapsibleTrigger className="flex items-center justify-between w-full mb-4">
            <h2 className="text-lg font-medium">Google Search Preview</h2>
            <div className="text-muted-foreground">
              {open ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              )}
            </div>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <div className="border border-muted rounded-md p-4 mb-4">
              <div className="text-primary text-base font-medium mb-1 line-clamp-1">
                {result.title || 'No title available'}
              </div>
              <div className="text-green-800 text-sm mb-1 line-clamp-1">
                {formatUrl(result.url)}
              </div>
              <div className="text-foreground/80 text-sm line-clamp-2">
                {description || 'No description available'}
              </div>
            </div>
            
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 flex-shrink-0 mt-0.5">
                  {getTitleIcon()}
                </div>
                <div>
                  <h3 className="font-medium">Title Tag</h3>
                  <p className="text-sm text-foreground/70 mb-1">
                    {result.titleTag.feedback}
                  </p>
                  {result.title && (
                    <code className="text-xs bg-muted p-1 rounded block">
                      &lt;title&gt;{truncateString(result.title, 60)}&lt;/title&gt;
                    </code>
                  )}
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 flex-shrink-0 mt-0.5">
                  {getDescriptionIcon()}
                </div>
                <div>
                  <h3 className="font-medium">Meta Description</h3>
                  <p className="text-sm text-foreground/70 mb-1">
                    {result.descriptionTag.feedback}
                  </p>
                  {description ? (
                    <code className="text-xs bg-muted p-1 rounded block">
                      &lt;meta name="description" content="{truncateString(description, 100)}"&gt;
                    </code>
                  ) : (
                    <code className="text-xs bg-muted p-1 rounded block text-foreground/50">
                      No meta description found
                    </code>
                  )}
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </CardContent>
      </Collapsible>
    </Card>
  );
}
