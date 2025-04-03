import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from "@/components/ui/collapsible";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AnalysisResult, SEOStatusType } from "@/lib/types";
import { truncateString } from "@/lib/utils";
import { CheckCircle, AlertTriangle, XCircle } from "lucide-react";

interface SEOTagsAnalysisProps {
  result: AnalysisResult;
}

export default function SEOTagsAnalysis({ result }: SEOTagsAnalysisProps) {
  const [open, setOpen] = useState(true);
  
  const getStatusBadge = (status: SEOStatusType) => {
    let label = "Unknown";
    let icon = null;
    let colorClass = "";
    
    switch (status) {
      case 'good':
        label = "Good";
        icon = <CheckCircle className="h-3.5 w-3.5 mr-1" />;
        colorClass = "bg-green-50 text-green-600 border-green-200";
        break;
      case 'warning':
        label = "Improve";
        icon = <AlertTriangle className="h-3.5 w-3.5 mr-1" />;
        colorClass = "bg-amber-50 text-amber-600 border-amber-200";
        break;
      case 'error':
        label = "Missing";
        icon = <XCircle className="h-3.5 w-3.5 mr-1" />;
        colorClass = "bg-red-50 text-red-600 border-red-200";
        break;
    }
    
    return (
      <Badge 
        variant="outline" 
        className={`${colorClass} px-2 py-0.5 rounded-full text-xs font-medium flex items-center`}
      >
        {icon}
        {label}
      </Badge>
    );
  };

  return (
    <Card className="mb-6">
      <Collapsible open={open} onOpenChange={setOpen}>
        <CardContent className="pt-5">
          <CollapsibleTrigger className="flex items-center justify-between w-full mb-4">
            <h2 className="text-lg font-medium">SEO Tags Analysis</h2>
            <div className="text-muted-foreground">
              {open ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              )}
            </div>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="font-medium">Tag Type</TableHead>
                    <TableHead className="font-medium">Status</TableHead>
                    <TableHead className="font-medium">Content</TableHead>
                    <TableHead className="font-medium">Recommendation</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.metaTags.map((tag, index) => (
                    <TableRow key={index} className="border-b">
                      <TableCell className="font-medium">{tag.type}</TableCell>
                      <TableCell>{getStatusBadge(tag.status)}</TableCell>
                      <TableCell>
                        {tag.content ? (
                          <code className="text-xs bg-muted p-1 rounded">
                            {truncateString(tag.content, 40)}
                          </code>
                        ) : (
                          <span className="text-foreground/50">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-foreground/80">
                        {tag.recommendation}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CollapsibleContent>
        </CardContent>
      </Collapsible>
    </Card>
  );
}
