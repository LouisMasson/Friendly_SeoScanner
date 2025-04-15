import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Check, Loader2 } from "lucide-react";
import { AnalysisResult } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

interface ShareButtonProps {
  result: AnalysisResult;
}

export default function ShareButton({ result }: ShareButtonProps) {
  const [isSharing, setIsSharing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();
  
  const handleShare = async () => {
    try {
      setIsSharing(true);
      
      // Create a sharable URL by encoding the URL being analyzed
      const baseUrl = window.location.origin;
      const shareUrl = `${baseUrl}?url=${encodeURIComponent(result.url)}`;
      
      // Copy to clipboard
      await navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
      
      // Show a success toast
      toast({
        title: "Link Copied!",
        description: "Share link has been copied to clipboard",
      });
      
      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Error sharing analysis:", error);
      toast({
        title: "Copy Failed",
        description: "There was an error copying the share link",
        variant: "destructive",
      });
    } finally {
      setIsSharing(false);
    }
  };
  
  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleShare}
      disabled={isSharing}
      className="flex items-center gap-1"
    >
      {isSharing ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin mr-1" />
          Copying link...
        </>
      ) : isCopied ? (
        <>
          <Check className="h-4 w-4 mr-1" />
          Copied!
        </>
      ) : (
        <>
          <Share2 className="h-4 w-4 mr-1" />
          Share Analysis
        </>
      )}
    </Button>
  );
}