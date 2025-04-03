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
import { CheckCircle, AlertTriangle, XCircle } from "lucide-react";

interface RecommendationsProps {
  result: AnalysisResult;
}

export default function Recommendations({ result }: RecommendationsProps) {
  const [open, setOpen] = useState(true);
  
  const getRecommendationStyles = (status: SEOStatusType) => {
    switch (status) {
      case 'good':
        return {
          border: 'border-green-300 bg-green-50',
          icon: <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />,
          title: 'text-green-700'
        };
      case 'warning':
        return {
          border: 'border-amber-300 bg-amber-50',
          icon: <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" />,
          title: 'text-amber-700'
        };
      case 'error':
        return {
          border: 'border-red-300 bg-red-50',
          icon: <XCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />,
          title: 'text-red-700'
        };
      default:
        return {
          border: 'border-gray-300 bg-gray-50',
          icon: null,
          title: 'text-foreground'
        };
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
                result.recommendations.map((rec, index) => {
                  const styles = getRecommendationStyles(rec.status);
                  
                  return (
                    <div 
                      key={index} 
                      className={`p-4 border rounded-md shadow-sm ${styles.border}`}
                    >
                      <div className="flex items-start">
                        {styles.icon}
                        <div>
                          <h3 className={`font-semibold ${styles.title}`}>{rec.title}</h3>
                          <p className="text-foreground/80 text-sm mt-1">
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
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-6 text-center border rounded-md border-green-200 bg-green-50">
                  <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <div className="text-green-700 font-medium">No recommendations needed. Your SEO implementation is good!</div>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </CardContent>
      </Collapsible>
    </Card>
  );
}
