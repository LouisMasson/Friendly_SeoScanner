import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from "@/components/ui/collapsible";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Sparkles, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { AnalysisResult, RecommendationEntry, SEOStatusType } from '@/lib/types';
import { getStatusColor } from '@/lib/utils';
import { DeepSeekService } from '@/services/deepseek-service';
import { useToast } from '@/hooks/use-toast';

interface AIRecommendationsProps {
  result: AnalysisResult;
}

export default function AIRecommendations({ result }: AIRecommendationsProps) {
  const [open, setOpen] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<RecommendationEntry[]>([]);
  const [summaryText, setSummaryText] = useState<string>('');
  const { toast } = useToast();

  // Mutation for AI recommendations
  const generateRecommendationsMutation = useMutation({
    mutationFn: DeepSeekService.generateRecommendations,
    onSuccess: (data) => {
      setAiRecommendations(data.recommendations);
      setSummaryText(data.summaryText);
      setOpen(true);
      toast({
        title: "AI Recommendations Generated",
        description: "AI-powered SEO recommendations are ready for review",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to generate AI recommendations",
        description: error instanceof Error ? error.message : "An error occurred",
      });
    }
  });

  const handleGenerateAIRecommendations = () => {
    generateRecommendationsMutation.mutate(result);
  };

  const getRecommendationStyles = (status: SEOStatusType) => {
    const color = getStatusColor(status);
    
    return {
      icon: status === 'good' ? '✅' : status === 'warning' ? '⚠️' : '❌',
      title: `text-${color}-700 dark:text-${color}-400`,
      border: `border-${color}-200`,
      bg: `bg-${color}-50`
    };
  };

  return (
    <Card className="mb-6">
      <Collapsible open={open} onOpenChange={setOpen}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl flex items-center">
            <Sparkles className="h-5 w-5 mr-2 text-primary" />
            AI-Powered Recommendations
          </CardTitle>
          {aiRecommendations.length > 0 && (
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-9 p-0">
                {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
          )}
        </CardHeader>

        <CardContent>
          {aiRecommendations.length === 0 ? (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Generate AI-powered SEO recommendations based on your analysis results. Get intelligent 
                insights tailored to your website's specific SEO strengths and weaknesses.
              </p>
              
              <Button 
                onClick={handleGenerateAIRecommendations}
                disabled={generateRecommendationsMutation.isPending}
                className="w-full sm:w-auto flex items-center gap-2 mt-4"
              >
                {generateRecommendationsMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating AI Recommendations...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate AI Recommendations
                  </>
                )}
              </Button>
            </div>
          ) : (
            <CollapsibleContent>
              {summaryText && (
                <Alert className="mb-6 bg-primary/5 border-primary/20">
                  <AlertTitle className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    AI Summary
                  </AlertTitle>
                  <AlertDescription className="mt-2">
                    {summaryText}
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-4 mt-4">
                {aiRecommendations.map((rec, index) => {
                  const styles = getRecommendationStyles(rec.status);
                  
                  return (
                    <div 
                      key={`ai-rec-${index}`} 
                      className={`rounded-lg border p-4 ${styles.border} ${styles.bg}`}
                    >
                      <div className="flex gap-4">
                        <div className="mt-0.5">
                          <span className="text-lg" aria-hidden="true">{styles.icon}</span>
                        </div>
                        <div className="space-y-1 flex-1">
                          <h3 className={`font-semibold ${styles.title}`}>{rec.title}</h3>
                          <p className="text-foreground/80 text-sm mt-1">
                            {rec.description}
                          </p>
                          {rec.exampleCode && (
                            <div className="mt-2">
                              <Accordion type="single" collapsible>
                                <AccordionItem value={`ai-code-example-${index}`} className="border-0">
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
                })}
              </div>
              
              <div className="mt-6">
                <Button
                  onClick={handleGenerateAIRecommendations}
                  disabled={generateRecommendationsMutation.isPending}
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-2"
                >
                  {generateRecommendationsMutation.isPending ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Refreshing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3 w-3" />
                      Refresh AI Recommendations
                    </>
                  )}
                </Button>
              </div>
            </CollapsibleContent>
          )}
        </CardContent>
      </Collapsible>
    </Card>
  );
}