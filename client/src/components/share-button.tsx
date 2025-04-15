import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Check, Copy, Loader2 } from "lucide-react";
import { AnalysisResult } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface ShareButtonProps {
  result: AnalysisResult;
}

export default function ShareButton({ result }: ShareButtonProps) {
  const [isSharing, setIsSharing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const { toast } = useToast();
  
  // Generate the share URL
  const generateShareUrl = () => {
    const baseUrl = window.location.origin;
    return `${baseUrl}?url=${encodeURIComponent(result.url)}`;
  };
  
  const handleShare = async () => {
    try {
      setIsSharing(true);
      
      // Create a sharable URL
      const url = generateShareUrl();
      setShareUrl(url);
      
      // Try to use the Web Share API first for mobile devices
      if (navigator.share) {
        await navigator.share({
          title: `SEO Analysis of ${new URL(result.url).hostname}`,
          text: `Check out this SEO analysis of ${result.url}. Overall score: ${result.score}%`,
          url
        });
        
        toast({
          title: "Shared Successfully",
          description: "The analysis has been shared",
        });
      } else {
        // Show dialog with the share URL
        setIsDialogOpen(true);
        
        // Automatically copy to clipboard
        await navigator.clipboard.writeText(url);
        setIsCopied(true);
        
        // Reset the copied state after 2 seconds
        setTimeout(() => {
          setIsCopied(false);
        }, 2000);
      }
    } catch (error) {
      console.error("Error sharing analysis:", error);
      toast({
        title: "Sharing Failed",
        description: "There was an error generating the share link",
        variant: "destructive",
      });
    } finally {
      setIsSharing(false);
    }
  };
  
  const handleCopyFromDialog = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
      
      toast({
        title: "Link Copied",
        description: "Share link has been copied to clipboard",
      });
      
      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      toast({
        title: "Copy Failed",
        description: "There was an error copying the link to clipboard",
        variant: "destructive",
      });
    }
  };
  
  return (
    <>
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
            Generating link...
          </>
        ) : (
          <>
            <Share2 className="h-4 w-4 mr-1" />
            Share Analysis
          </>
        )}
      </Button>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share SEO Analysis</DialogTitle>
            <DialogDescription>
              Anyone with this link can view this SEO analysis.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2">
            <div className="grid flex-1 gap-2">
              <Input
                value={shareUrl}
                readOnly
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Link automatically copied to clipboard!
              </p>
            </div>
            <Button 
              size="sm" 
              className="px-3" 
              onClick={handleCopyFromDialog}
              variant="secondary"
            >
              {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              <span className="sr-only">Copy</span>
            </Button>
          </div>
          <DialogFooter className="sm:justify-start">
            <Button
              variant="secondary"
              onClick={() => setIsDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}