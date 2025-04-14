import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from "lucide-react";
import { AnalysisResult } from "@/lib/types";
import { generateSEOReport } from "@/utils/pdf-generator";
import { useToast } from "@/hooks/use-toast";

interface ExportPDFButtonProps {
  result: AnalysisResult;
}

export default function ExportPDFButton({ result }: ExportPDFButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  
  const handleExport = async () => {
    try {
      setIsGenerating(true);
      
      // Generate a PDF document
      const doc = generateSEOReport(result);
      
      // Generate a filename based on the domain
      const domain = new URL(result.url).hostname;
      const filename = `seo-report-${domain}-${new Date().toISOString().split('T')[0]}.pdf`;
      
      // Save the PDF
      doc.save(filename);
      
      toast({
        title: "PDF Generated",
        description: `Your SEO report has been downloaded as ${filename}`,
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "PDF Generation Failed",
        description: "There was an error generating your PDF report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleExport}
      disabled={isGenerating}
      className="flex items-center gap-1"
    >
      {isGenerating ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin mr-1" />
          Generating PDF...
        </>
      ) : (
        <>
          <FileDown className="h-4 w-4 mr-1" />
          Export PDF Report
        </>
      )}
    </Button>
  );
}