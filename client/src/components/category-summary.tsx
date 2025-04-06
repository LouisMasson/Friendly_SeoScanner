import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { AnalysisResult, SEOStatusType } from "@/lib/types";
import { CheckCircle2, AlertCircle, XCircle, BookOpenText, Share2, Search } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface CategorySummaryProps {
  result: AnalysisResult;
}

export default function CategorySummary({ result }: CategorySummaryProps) {
  // Calculate category scores
  const getScoreForStatus = (status: SEOStatusType): number => {
    switch (status) {
      case 'good': return 100;
      case 'warning': return 50;
      case 'error': return 0;
      default: return 0;
    }
  };

  // Get status based on score
  const getStatusFromScore = (score: number): SEOStatusType => {
    if (score >= 80) return "good";
    if (score >= 50) return "warning";
    return "error";
  };

  // Calculate meta tags score
  const calculateMetaTagsScore = (): number => {
    if (result.metaTags.length === 0) return 0;
    
    const totalScore = result.metaTags.reduce((acc, tag) => {
      return acc + getScoreForStatus(tag.status);
    }, 0);
    
    return Math.round(totalScore / result.metaTags.length);
  };
  
  // Calculate scores for each category
  const basicSEOScore = Math.round(
    (getScoreForStatus(result.titleTag.status) + 
     getScoreForStatus(result.descriptionTag.status)) / 2
  );
  
  const socialScore = Math.round(
    (getScoreForStatus(result.ogTags.status) + 
     getScoreForStatus(result.twitterTags.status)) / 2
  );
  
  const metaTagsScore = calculateMetaTagsScore();
  
  const basicSEOStatus = getStatusFromScore(basicSEOScore);
  const socialStatus = getStatusFromScore(socialScore);
  const metaTagsStatus = getStatusFromScore(metaTagsScore);
  
  // Get icon for category
  const getStatusIcon = (status: SEOStatusType) => {
    switch (status) {
      case 'good': 
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-amber-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  return (
    <Card className="mb-6">
      <CardContent className="pt-5">
        <h2 className="text-lg font-medium mb-4">SEO Performance Overview</h2>
        
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">Basic SEO</span>
            </TabsTrigger>
            <TabsTrigger value="social" className="flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">Social Media</span>
            </TabsTrigger>
            <TabsTrigger value="meta" className="flex items-center gap-2">
              <BookOpenText className="h-4 w-4" />
              <span className="hidden sm:inline">Meta Tags</span>
            </TabsTrigger>
          </TabsList>
          
          <div className="mt-4">
            <TabsContent value="basic" className="mt-0">
              <div className="p-4 border rounded-md">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(basicSEOStatus)}
                    <h3 className="font-medium">Essential SEO Elements</h3>
                  </div>
                  <div className="font-bold text-lg">{basicSEOScore}%</div>
                </div>
                
                <Progress value={basicSEOScore} className="h-2 mb-4" 
                  indicatorClassName={basicSEOStatus === 'good' ? 'bg-green-500' : basicSEOStatus === 'warning' ? 'bg-amber-500' : 'bg-red-500'} />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-start gap-2 p-3 bg-muted/30 rounded-md">
                    <div>{getStatusIcon(result.titleTag.status)}</div>
                    <div>
                      <h4 className="font-medium">Title Tag</h4>
                      <p className="text-sm">{result.titleTag.feedback}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 p-3 bg-muted/30 rounded-md">
                    <div>{getStatusIcon(result.descriptionTag.status)}</div>
                    <div>
                      <h4 className="font-medium">Meta Description</h4>
                      <p className="text-sm">{result.descriptionTag.feedback}</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="social" className="mt-0">
              <div className="p-4 border rounded-md">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(socialStatus)}
                    <h3 className="font-medium">Social Media Optimization</h3>
                  </div>
                  <div className="font-bold text-lg">{socialScore}%</div>
                </div>
                
                <Progress value={socialScore} className="h-2 mb-4" 
                  indicatorClassName={socialStatus === 'good' ? 'bg-green-500' : socialStatus === 'warning' ? 'bg-amber-500' : 'bg-red-500'} />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-start gap-2 p-3 bg-muted/30 rounded-md">
                    <div>{getStatusIcon(result.ogTags.status)}</div>
                    <div>
                      <h4 className="font-medium">Open Graph Tags</h4>
                      <p className="text-sm">{result.ogTags.feedback}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 p-3 bg-muted/30 rounded-md">
                    <div>{getStatusIcon(result.twitterTags.status)}</div>
                    <div>
                      <h4 className="font-medium">Twitter Card Tags</h4>
                      <p className="text-sm">{result.twitterTags.feedback}</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="meta" className="mt-0">
              <div className="p-4 border rounded-md">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(metaTagsStatus)}
                    <h3 className="font-medium">Meta Tags Analysis</h3>
                  </div>
                  <div className="font-bold text-lg">{metaTagsScore}%</div>
                </div>
                
                <Progress value={metaTagsScore} className="h-2 mb-4" 
                  indicatorClassName={metaTagsStatus === 'good' ? 'bg-green-500' : metaTagsStatus === 'warning' ? 'bg-amber-500' : 'bg-red-500'} />
                
                <div className="p-3 bg-muted/30 rounded-md">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium">Meta Tags Found</h4>
                    <span className="font-bold">{result.tagCount}</span>
                  </div>
                  <p className="text-sm">
                    {metaTagsStatus === 'good' 
                      ? 'Great! Your page has all essential meta tags implemented correctly.'
                      : metaTagsStatus === 'warning'
                        ? 'Some meta tags could be improved or are missing. Check the detailed analysis below.'
                        : 'Critical meta tags are missing. Check the detailed analysis below.'}
                  </p>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}