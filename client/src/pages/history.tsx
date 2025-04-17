import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useLocation } from "wouter";
import { AnalysisResult } from "@/lib/types";
import { SEOAnalyzerService } from "@/services/seo-analyzer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Clock, Globe, ChevronRight, BarChart2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function HistoryPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [analyses, setAnalyses] = useState<AnalysisResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!authLoading && !isAuthenticated) {
      setLocation("/login");
    }
  }, [isAuthenticated, authLoading, setLocation]);

  useEffect(() => {
    const fetchAnalyses = async () => {
      if (!isAuthenticated) return;
      
      try {
        setIsLoading(true);
        const userAnalyses = await SEOAnalyzerService.getUserAnalyses();
        setAnalyses(userAnalyses);
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de récupérer votre historique d'analyses",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchAnalyses();
    }
  }, [isAuthenticated, toast]);

  const handleViewAnalysis = (url: string) => {
    setLocation(`/?url=${encodeURIComponent(url)}`);
  };

  if (authLoading) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <div className="animate-spin text-muted-foreground w-8 h-8">
          <Loader2 className="h-full w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Historique des analyses</h1>
        <p className="text-muted-foreground">
          Consultez les résultats de vos analyses SEO précédentes
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin text-muted-foreground w-8 h-8">
            <Loader2 className="h-full w-full" />
          </div>
        </div>
      ) : analyses.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <div className="mx-auto mb-4 bg-muted rounded-full p-3 w-12 h-12 flex items-center justify-center">
              <BarChart2 className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">Aucune analyse trouvée</h3>
            <p className="text-muted-foreground mb-6">
              Vous n'avez pas encore effectué d'analyse SEO. Analysez un site pour le voir apparaître ici.
            </p>
            <Button onClick={() => setLocation("/")}>
              Analyser un site
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {analyses.map((analysis, index) => (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="grid md:grid-cols-[1fr,auto] border-b">
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground truncate max-w-md">
                        {analysis.url}
                      </span>
                    </div>
                    
                    <h3 className="font-medium text-lg truncate mb-2">
                      {analysis.title || "Sans titre"}
                    </h3>
                    
                    <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                      {analysis.description || "Aucune description disponible"}
                    </p>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-3">
                      <Clock className="h-4 w-4" />
                      <span>
                        Score de chargement: {analysis.pageSpeed.loadTime}ms
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between md:flex-col md:justify-center border-t md:border-t-0 md:border-l bg-muted/10 p-4 md:p-6">
                    <div className="flex flex-col items-center mb-4">
                      <div className="text-2xl font-bold">{analysis.score}</div>
                      <div className="text-xs text-muted-foreground">Score SEO</div>
                    </div>
                    
                    <Button onClick={() => handleViewAnalysis(analysis.url)}>
                      Détails
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}