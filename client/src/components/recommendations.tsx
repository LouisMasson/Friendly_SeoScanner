import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from "@/components/ui/collapsible";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AnalysisResult, SEOStatusType } from "@/lib/types";

interface RecommendationsProps {
  result: AnalysisResult;
}

export default function Recommendations({ result }: RecommendationsProps) {
  const [open, setOpen] = useState(true);
  
  const getBorderColor = (status: SEOStatusType) => {
    switch (status) {
      case 'good':
        return 'border-success bg-success/5';
      case 'warning':
        return 'border-warning bg-warning/5';
      case 'error':
        return 'border-destructive bg-destructive/5';
      default:
        return 'border-muted bg-muted/5';
    }
  };

  return (
    <Card className="mb-6">
      <Collapsible open={open} onOpenChange={setOpen}>
        <CardContent className="pt-5">
          <CollapsibleTrigger className="flex items-center justify-between w-full mb-4">
            <h2 className="text-lg font-medium">Recommendations</h2>
            <div className="text-muted-foreground">
              {open ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              )}
            </div>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <div className="space-y-4">
              {result.recommendations.length > 0 ? (
                result.recommendations.map((rec, index) => (
                  <div 
                    key={index} 
                    className={`p-3 border-l-4 rounded-r ${getBorderColor(rec.status)}`}
                  >
                    <h3 className="font-medium">{rec.title}</h3>
                    <p className="text-foreground/80 text-sm">
                      {rec.description}
                    </p>
                    {rec.exampleCode && (
                      <div className="mt-2">
                        <Accordion type="single" collapsible>
                          <AccordionItem value={`code-example-${index}`} className="border-0">
                            <AccordionTrigger className="text-primary py-1 text-sm hover:no-underline">
                              See example code
                            </AccordionTrigger>
                            <AccordionContent>
                              <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-x-auto">
                                <code>{rec.exampleCode}</code>
                              </pre>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-foreground/60">
                  No recommendations needed. Your SEO implementation is good!
                </div>
              )}
            </div>
          </CollapsibleContent>
        </CardContent>
      </Collapsible>
    </Card>
  );
}
