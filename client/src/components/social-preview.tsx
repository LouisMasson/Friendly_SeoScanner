import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from "@/components/ui/collapsible";
import { AnalysisResult } from "@/lib/types";
import { formatUrl, truncateString } from "@/lib/utils";
import { CheckCircle2, AlertCircle, XCircle } from "lucide-react";

interface SocialPreviewProps {
  result: AnalysisResult;
}

export default function SocialPreview({ result }: SocialPreviewProps) {
  const [open, setOpen] = useState(true);
  
  // Use OG tags if available, fall back to basic meta tags
  const ogTitle = result.ogTags.title || result.title || 'No title available';
  const ogDescription = result.ogTags.description || result.description || 'No description available';
  const ogImage = result.ogTags.image || '';
  
  // Use Twitter tags if available, fall back to OG tags, then to basic meta tags
  const twitterTitle = result.twitterTags.title || ogTitle;
  const twitterDescription = result.twitterTags.description || ogDescription;
  const twitterImage = result.twitterTags.image || ogImage;
  
  // Get appropriate icon based on status
  const getOgIcon = () => {
    switch (result.ogTags.status) {
      case 'good':
        return <CheckCircle2 className="text-success" />;
      case 'warning':
        return <AlertCircle className="text-warning" />;
      case 'error':
        return <XCircle className="text-destructive" />;
    }
  };
  
  const getTwitterIcon = () => {
    switch (result.twitterTags.status) {
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
            <h2 className="text-lg font-medium">Social Media Preview</h2>
            <div className="text-muted-foreground">
              {open ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              )}
            </div>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <div className="mb-4">
              <h3 className="font-medium text-base mb-2">Facebook/LinkedIn Preview</h3>
              <div className="border border-muted rounded-md overflow-hidden">
                {ogImage ? (
                  <div className="bg-muted h-40 w-full flex items-center justify-center">
                    <img
                      src={ogImage}
                      alt="Open Graph preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "https://placehold.co/600x400/e2e8f0/64748b?text=No+Image+Available";
                      }}
                    />
                  </div>
                ) : (
                  <div className="bg-muted h-40 w-full flex items-center justify-center text-muted-foreground">
                    No image available
                  </div>
                )}
                <div className="p-3">
                  <div className="text-foreground/60 text-xs uppercase tracking-wide mb-1">
                    {formatUrl(result.url)}
                  </div>
                  <div className="font-medium mb-1">{ogTitle}</div>
                  <div className="text-sm text-foreground/80">
                    {truncateString(ogDescription, 100)}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <h3 className="font-medium text-base mb-2">Twitter Preview</h3>
              <div className="border border-muted rounded-md overflow-hidden">
                {twitterImage ? (
                  <div className="bg-muted h-40 w-full flex items-center justify-center">
                    <img
                      src={twitterImage}
                      alt="Twitter preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "https://placehold.co/600x400/e2e8f0/64748b?text=No+Image+Available";
                      }}
                    />
                  </div>
                ) : (
                  <div className="bg-muted h-40 w-full flex items-center justify-center text-muted-foreground">
                    No image available
                  </div>
                )}
                <div className="p-3">
                  <div className="text-foreground/60 text-xs uppercase tracking-wide mb-1">
                    {formatUrl(result.url)}
                  </div>
                  <div className="font-medium mb-1">{twitterTitle}</div>
                  <div className="text-sm text-foreground/80">
                    {truncateString(twitterDescription, 100)}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 flex-shrink-0 mt-0.5">
                  {getOgIcon()}
                </div>
                <div>
                  <h3 className="font-medium">Open Graph Tags</h3>
                  <p className="text-sm text-foreground/70 mb-1">
                    {result.ogTags.feedback}
                  </p>
                  <div className="text-xs text-foreground/70">
                    Recommended tags: <code>og:title</code>, <code>og:description</code>, <code>og:image</code>, <code>og:url</code>, <code>og:type</code>
                  </div>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 flex-shrink-0 mt-0.5">
                  {getTwitterIcon()}
                </div>
                <div>
                  <h3 className="font-medium">Twitter Card Tags</h3>
                  <p className="text-sm text-foreground/70 mb-1">
                    {result.twitterTags.feedback}
                  </p>
                  <div className="text-xs text-foreground/70">
                    Recommended tags: <code>twitter:card</code>, <code>twitter:title</code>, <code>twitter:description</code>, <code>twitter:image</code>
                  </div>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </CardContent>
      </Collapsible>
    </Card>
  );
}
