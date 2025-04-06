import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { isValidUrl, ensureHttpProtocol } from "@/lib/utils";

interface URLInputProps {
  onAnalyze: (url: string) => void;
  isLoading: boolean;
}

export default function URLInput({ onAnalyze, isLoading }: URLInputProps) {
  const [url, setUrl] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      toast({
        title: "URL required",
        description: "Please enter a URL to analyze",
        variant: "destructive",
      });
      return;
    }
    
    // Add https:// prefix if not present
    let formattedUrl = ensureHttpProtocol(url.trim());
    
    if (!isValidUrl(formattedUrl)) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL to analyze",
        variant: "destructive",
      });
      return;
    }
    
    onAnalyze(formattedUrl);
  };

  return (
    <Card className="mb-8">
      <CardContent className="pt-5">
        <h2 className="text-lg font-medium mb-4">Analyze Website SEO</h2>
        <p className="text-foreground/80 mb-4">
          Enter a URL to analyze the SEO meta tags and get recommendations for optimization.
        </p>
        
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 items-start">
          <div className="flex-grow w-full">
            <Input
              type="text"
              placeholder="example.com or https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full"
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground mt-1">
              You can enter a URL with or without http/https - we'll handle it for you.
            </p>
          </div>
          <Button 
            type="submit" 
            className="min-w-[100px] justify-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Analyzing</span>
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                <span>Analyze</span>
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
