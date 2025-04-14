import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { AnalysisResult } from "@/lib/types";
import { SEOAnalyzerService } from "@/services/seo-analyzer";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import URLInput from "@/components/url-input";
import ResultSummary from "@/components/result-summary";
import CategorySummary from "@/components/category-summary";
import GooglePreview from "@/components/google-preview";
import SocialPreview from "@/components/social-preview";
import SEOTagsAnalysis from "@/components/seo-tags-analysis";
import Recommendations from "@/components/recommendations";
import MobileFriendliness from "@/components/mobile-friendliness";
import { Search } from "lucide-react";

export default function Home() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const { toast } = useToast();
  
  const analyzeUrlMutation = useMutation({
    mutationFn: SEOAnalyzerService.analyzeUrl,
    onSuccess: (data) => {
      setAnalysisResult(data);
      toast({
        title: "Analysis complete",
        description: "SEO analysis completed successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "Failed to analyze the URL",
        variant: "destructive",
      });
    }
  });
  
  const handleAnalyze = (url: string) => {
    // Invalidate all queries to ensure we're always getting fresh data
    queryClient.invalidateQueries({ queryKey: ['/api/analyze'] });
    queryClient.invalidateQueries({ queryKey: ['/api/recent'] });
    analyzeUrlMutation.mutate(url);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-muted/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Search className="text-primary h-5 w-5" />
            <h1 className="text-lg font-semibold">SEO Meta Tag Analyzer</h1>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-6 max-w-5xl">
        <URLInput 
          onAnalyze={handleAnalyze} 
          isLoading={analyzeUrlMutation.isPending} 
        />
        
        {analysisResult && (
          <div>
            <ResultSummary result={analysisResult} />
            <CategorySummary result={analysisResult} />
            <GooglePreview result={analysisResult} />
            <SocialPreview result={analysisResult} />
            <SEOTagsAnalysis result={analysisResult} />
            <Recommendations result={analysisResult} />
          </div>
        )}
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-muted/60 py-4">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          <p>SEO Meta Tag Analyzer &copy; {new Date().getFullYear()} | Made by Louis with ❤️ and Replit</p>
        </div>
      </footer>
    </div>
  );
}
