import { useState, useEffect } from "react";
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
import AIRecommendations from "@/components/ai-recommendations";
import MobileFriendliness from "@/components/mobile-friendliness";
import PageSpeed from "@/components/page-speed";
import ShareButton from "@/components/share-button";
import { Search, Loader2 } from "lucide-react";
import { useLocation } from "wouter";

export default function Home() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoadingShared, setIsLoadingShared] = useState(false);
  const { toast } = useToast();
  const [location] = useLocation();
  
  // Parse URL parameters on component mount to check for shared analysis
  useEffect(() => {
    const checkForSharedAnalysis = async () => {
      try {
        // Get the URL parameter
        const urlParams = new URLSearchParams(window.location.search);
        const sharedUrl = urlParams.get('url');
        
        if (sharedUrl) {
          setIsLoadingShared(true);
          // Fetch the analysis for the shared URL
          const decodedUrl = decodeURIComponent(sharedUrl);
          
          // First try to get from existing analysis
          let analysis = await SEOAnalyzerService.getAnalysisByUrl(decodedUrl);
          
          // If not found, perform a new analysis
          if (!analysis) {
            analysis = await SEOAnalyzerService.analyzeUrl(decodedUrl, false);
          }
          
          if (analysis) {
            setAnalysisResult(analysis);
            toast({
              title: "Shared Analysis Loaded",
              description: `Showing SEO analysis for ${new URL(decodedUrl).hostname}`,
            });
          }
        }
      } catch (error) {
        console.error("Error loading shared analysis:", error);
        toast({
          title: "Failed to Load Shared Analysis",
          description: "There was an error loading the shared analysis",
          variant: "destructive",
        });
      } finally {
        setIsLoadingShared(false);
      }
    };
    
    checkForSharedAnalysis();
  }, [location, toast]);
  
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
          {analysisResult && (
            <div>
              <ShareButton result={analysisResult} />
            </div>
          )}
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-6 max-w-5xl">
        <URLInput 
          onAnalyze={handleAnalyze} 
          isLoading={analyzeUrlMutation.isPending || isLoadingShared} 
        />
        
        {isLoadingShared && (
          <div className="text-center mt-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading shared analysis...</p>
          </div>
        )}
        
        {!isLoadingShared && analysisResult && (
          <div>
            <ResultSummary result={analysisResult} />
            <CategorySummary result={analysisResult} />
            <PageSpeed result={analysisResult} />
            <GooglePreview result={analysisResult} />
            <SocialPreview result={analysisResult} />
            <MobileFriendliness result={analysisResult} />
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
