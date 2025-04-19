import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { LoaderCircle, FileUp, RefreshCw, Play, Upload, Download, CheckCircle, AlertTriangle, XCircle, FileJson, BarChart } from 'lucide-react';
import JsonVisualizer from '@/components/json-visualizer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/auth-context';
import { MetadataService } from '@/services/metadata-service';
import { PageData, BulkMetadataRequest, BulkMetadataResponse, JobStatus, GeneratedMetadata } from '@shared/types';

// Form validation schema for URL input
const urlInputSchema = z.object({
  urls: z.string().min(1, 'Please enter at least one URL'),
  sitemapUrl: z.string().optional(),
});
type UrlInputFormValues = z.infer<typeof urlInputSchema>;

// Form validation schema for options
const optionsSchema = z.object({
  optimizeFor: z.enum(['traffic', 'conversions', 'engagement']),
  industry: z.string().optional(),
  targetKeywords: z.string().optional(),
  maxTitleLength: z.coerce.number().min(10).max(100).optional(),
  maxDescriptionLength: z.coerce.number().min(50).max(300).optional(),
  includeJsonLd: z.boolean().default(true),
  jsonLdType: z.enum(['Article', 'Product', 'LocalBusiness', 'Organization', 'WebPage']).default('WebPage'),
});
type OptionsFormValues = z.infer<typeof optionsSchema>;

export default function MetadataGenerator() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State
  const [activeTab, setActiveTab] = useState('input');
  const [pages, setPages] = useState<PageData[]>([]);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [jobResults, setJobResults] = useState<BulkMetadataResponse | null>(null);
  const [showVisualizer, setShowVisualizer] = useState(false);
  const [visualizerData, setVisualizerData] = useState<any>(null);
  
  // JSON file input ref
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  // URL input form
  const urlForm = useForm<UrlInputFormValues>({
    resolver: zodResolver(urlInputSchema),
    defaultValues: {
      urls: '',
      sitemapUrl: '',
    },
  });
  
  // Options form
  const optionsForm = useForm<OptionsFormValues>({
    resolver: zodResolver(optionsSchema),
    defaultValues: {
      optimizeFor: 'traffic',
      industry: '',
      targetKeywords: '',
      maxTitleLength: 60,
      maxDescriptionLength: 160,
      includeJsonLd: true,
      jsonLdType: 'WebPage',
    },
  });
  
  // Query for user's jobs
  const { data: userJobs, isLoading: isLoadingJobs } = useQuery({
    queryKey: ['/api/metadata/jobs'],
    queryFn: () => MetadataService.getUserJobs(10),
    enabled: isAuthenticated,
  });
  
  // Query for active job status
  const { data: jobStatus, isLoading: isLoadingStatus } = useQuery({
    queryKey: ['/api/metadata/jobs', activeJobId, 'status'],
    queryFn: () => activeJobId ? MetadataService.getJobStatus(activeJobId) : null,
    enabled: !!activeJobId,
    refetchInterval: (data) => {
      // Poll every 2 seconds while the job is active
      return data?.status === 'queued' || data?.status === 'processing' ? 2000 : false;
    },
    refetchIntervalInBackground: false
  });
  
  // Effect to fetch job results when status is completed
  React.useEffect(() => {
    if (jobStatus?.status === 'completed' && activeJobId) {
      fetchJobResults.mutate(activeJobId);
    }
  }, [jobStatus]);
  
  // Mutation for parsing URLs
  const parseUrls = useMutation({
    mutationFn: async (formData: UrlInputFormValues) => {
      const urlsList: string[] = [];
      
      // Parse URLs from textarea
      if (formData.urls) {
        const lines = formData.urls.split('\n');
        lines.forEach(line => {
          const url = line.trim();
          if (url && url.includes('.')) {
            urlsList.push(url);
          }
        });
      }
      
      // Extract URLs from sitemap if provided
      if (formData.sitemapUrl) {
        try {
          const sitemapUrls = await MetadataService.extractUrlsFromSitemap(formData.sitemapUrl);
          urlsList.push(...sitemapUrls);
        } catch (error) {
          console.error('Error extracting URLs from sitemap:', error);
          toast({
            title: 'Sitemap Error',
            description: 'Failed to extract URLs from the sitemap',
            variant: 'destructive',
          });
        }
      }
      
      // Remove duplicates
      const uniqueUrls = Array.from(new Set(urlsList));
      
      // Process each URL to extract content
      const pagePromises = uniqueUrls.map(url => MetadataService.extractPageContent(url));
      return Promise.all(pagePromises);
    },
    onSuccess: (data) => {
      setPages(data);
      toast({
        title: 'URLs Processed',
        description: `Successfully processed ${data.length} URLs`,
      });
      
      // Move to the next tab
      setActiveTab('preview');
    },
    onError: (error) => {
      toast({
        title: 'Error Processing URLs',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    },
  });
  
  // Mutation for starting a metadata generation job
  const generateMetadata = useMutation({
    mutationFn: (request: BulkMetadataRequest) => {
      return MetadataService.generateMetadata(request);
    },
    onSuccess: (data) => {
      setActiveJobId(data.jobId);
      toast({
        title: 'Job Started',
        description: 'Metadata generation job has started',
      });
      
      // Move to the results tab
      setActiveTab('results');
      
      // Invalidate jobs query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/metadata/jobs'] });
    },
    onError: (error) => {
      toast({
        title: 'Error Starting Job',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    },
  });
  
  // Mutation for fetching job results
  const fetchJobResults = useMutation({
    mutationFn: (jobId: string) => {
      return MetadataService.getJobResults(jobId);
    },
    onSuccess: (data) => {
      setJobResults(data);
      toast({
        title: 'Results Ready',
        description: 'Metadata generation results are ready',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error Fetching Results',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    },
  });
  
  // Handle URL form submission
  const onUrlFormSubmit = (data: UrlInputFormValues) => {
    parseUrls.mutate(data);
  };
  
  // Handle options form submission
  const onOptionsFormSubmit = (data: OptionsFormValues) => {
    // Convert target keywords to array if provided
    const targetKeywords = data.targetKeywords ? data.targetKeywords.split(',').map(kw => kw.trim()) : undefined;
    
    // Create job request
    const request: BulkMetadataRequest = {
      pages,
      options: {
        optimizeFor: data.optimizeFor,
        industry: data.industry || undefined,
        targetKeywords,
        maxTitleLength: data.maxTitleLength,
        maxDescriptionLength: data.maxDescriptionLength,
        includeJsonLd: data.includeJsonLd,
        jsonLdType: data.jsonLdType,
      },
    };
    
    generateMetadata.mutate(request);
  };
  
  // Handle job selection from history
  const handleJobSelect = (jobId: string) => {
    setActiveJobId(jobId);
    fetchJobResults.mutate(jobId);
  };
  
  // Format date string
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };
  
  // Render status badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>;
      case 'processing':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Processing</Badge>;
      case 'queued':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Queued</Badge>;
      case 'failed':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="text-green-500 h-5 w-5" />;
      case 'warning':
        return <AlertTriangle className="text-yellow-500 h-5 w-5" />;
      case 'error':
        return <XCircle className="text-red-500 h-5 w-5" />;
      default:
        return null;
    }
  };
  
  // Download export URL
  const handleDownload = (format: 'csv' | 'json' = 'json') => {
    if (!activeJobId) return;
    
    const url = MetadataService.getExportUrl(activeJobId, format);
    window.open(url, '_blank');
  };
  
  // Handle opening the JSON visualizer
  const handleOpenVisualizer = (data: any, title?: string) => {
    setVisualizerData(data);
    setShowVisualizer(true);
  };
  
  // Handle JSON file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }
      
      const file = event.target.files[0];
      if (file.type !== 'application/json') {
        toast({
          title: 'Invalid File Type',
          description: 'Please upload a JSON file',
          variant: 'destructive',
        });
        return;
      }
      
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string;
          const jsonData = JSON.parse(content);
          
          // Check if the JSON is valid and has the expected structure
          if (!Array.isArray(jsonData)) {
            // Check if it's possibly a single page
            if (jsonData.url) {
              setPages([jsonData as PageData]);
              toast({
                title: 'JSON Loaded',
                description: `Successfully loaded 1 page from JSON`,
              });
            } else if (jsonData.pages && Array.isArray(jsonData.pages)) {
              // Check if it's a BulkMetadataRequest format
              setPages(jsonData.pages as PageData[]);
              
              // Also set options if available
              if (jsonData.options) {
                const opts = jsonData.options;
                optionsForm.setValue('optimizeFor', opts.optimizeFor || 'traffic');
                if (opts.industry) optionsForm.setValue('industry', opts.industry);
                if (opts.targetKeywords) {
                  optionsForm.setValue('targetKeywords', 
                    Array.isArray(opts.targetKeywords) ? opts.targetKeywords.join(', ') : opts.targetKeywords
                  );
                }
                if (opts.maxTitleLength) optionsForm.setValue('maxTitleLength', opts.maxTitleLength);
                if (opts.maxDescriptionLength) optionsForm.setValue('maxDescriptionLength', opts.maxDescriptionLength);
                if (opts.includeJsonLd !== undefined) optionsForm.setValue('includeJsonLd', opts.includeJsonLd);
                if (opts.jsonLdType) optionsForm.setValue('jsonLdType', opts.jsonLdType);
              }
              
              toast({
                title: 'JSON Loaded',
                description: `Successfully loaded ${jsonData.pages.length} pages from JSON`,
              });
            } else {
              throw new Error('Invalid JSON format. Expected an array of pages or a valid page object');
            }
          } else {
            // It's an array of pages
            setPages(jsonData as PageData[]);
            toast({
              title: 'JSON Loaded',
              description: `Successfully loaded ${jsonData.length} pages from JSON`,
            });
          }
          
          // Move to the next tab 
          setActiveTab('preview');
          
          // Reset file input
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        } catch (error) {
          console.error('Error parsing JSON:', error);
          toast({
            title: 'JSON Parse Error',
            description: error instanceof Error ? error.message : 'Invalid JSON format',
            variant: 'destructive',
          });
        }
      };
      
      reader.readAsText(file);
    } catch (error) {
      console.error('Error handling file upload:', error);
      toast({
        title: 'File Upload Error',
        description: error instanceof Error ? error.message : 'An error occurred processing the file',
        variant: 'destructive',
      });
    }
  };
  
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-4">AI Metadata Generator</h1>
      <p className="text-gray-600 mb-8">
        Generate optimized title tags, meta descriptions, and JSON-LD schema markup using AI
      </p>
      
      {/* JSON Visualizer Dialog */}
      <Dialog open={showVisualizer} onOpenChange={setShowVisualizer}>
        <DialogContent className="max-w-5xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>JSON Visualization</DialogTitle>
          </DialogHeader>
          <JsonVisualizer data={visualizerData} />
        </DialogContent>
      </Dialog>
      
      {!isAuthenticated && (
        <Alert variant="destructive" className="mb-8">
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription>
            Please <Link href="/login" className="underline">login</Link> or{' '}
            <Link href="/register" className="underline">register</Link> to use this feature.
          </AlertDescription>
        </Alert>
      )}
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="input" disabled={!isAuthenticated}>Input URLs</TabsTrigger>
          <TabsTrigger value="preview" disabled={!isAuthenticated || pages.length === 0}>Preview & Options</TabsTrigger>
          <TabsTrigger value="results" disabled={!isAuthenticated}>Results & History</TabsTrigger>
        </TabsList>
        
        {/* URL Input Tab */}
        <TabsContent value="input">
          <Card>
            <CardHeader>
              <CardTitle>Enter URLs</CardTitle>
              <CardDescription>Paste URLs or provide a sitemap URL to analyze</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <h3 className="text-lg font-medium mb-2">Import from JSON</h3>
                <p className="text-sm text-slate-600 mb-3">
                  Upload a JSON file with page data to analyze. The JSON should contain an array of page objects or a single page object.
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="application/json"
                    onChange={handleFileUpload}
                    ref={fileInputRef}
                    className="hidden"
                    id="jsonFileInput"
                  />
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <FileJson className="mr-2 h-4 w-4" />
                    Select JSON File
                  </Button>
                  <div className="text-sm text-slate-500">
                    Supported formats: 
                    <code className="ml-1 text-xs bg-slate-100 p-1 rounded">PageData[]</code> or 
                    <code className="ml-1 text-xs bg-slate-100 p-1 rounded">BulkMetadataRequest</code>
                  </div>
                </div>
              </div>
              
              <form onSubmit={urlForm.handleSubmit(onUrlFormSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="urls">URLs (one per line)</Label>
                  <Textarea
                    id="urls"
                    placeholder="https://example.com
https://example.com/about
https://example.com/products"
                    className="min-h-[200px]"
                    {...urlForm.register('urls')}
                  />
                  {urlForm.formState.errors.urls && (
                    <p className="text-sm text-red-500">{urlForm.formState.errors.urls.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sitemapUrl">Sitemap URL (optional)</Label>
                  <Input
                    id="sitemapUrl"
                    placeholder="https://example.com/sitemap.xml"
                    {...urlForm.register('sitemapUrl')}
                  />
                </div>
                
                <Button type="submit" disabled={parseUrls.isPending}>
                  {parseUrls.isPending ? (
                    <>
                      <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <FileUp className="mr-2 h-4 w-4" />
                      Process URLs
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Preview & Options Tab */}
        <TabsContent value="preview">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>URLs Preview</CardTitle>
                <CardDescription>Found {pages.length} URLs to process</CardDescription>
              </CardHeader>
              <CardContent className="max-h-[400px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>URL</TableHead>
                      <TableHead>Title</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pages.map((page, index) => (
                      <TableRow key={index}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="max-w-[150px] truncate">
                          <a href={page.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {page.url}
                          </a>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">{page.title || 'No title'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Generation Options</CardTitle>
                <CardDescription>Configure AI metadata generation settings</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={optionsForm.handleSubmit(onOptionsFormSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="optimizeFor">Optimize For</Label>
                    <Select
                      defaultValue={optionsForm.getValues('optimizeFor')}
                      onValueChange={(value) => optionsForm.setValue('optimizeFor', value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select optimization goal" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="traffic">Traffic & Rankings</SelectItem>
                        <SelectItem value="conversions">Conversions & Sales</SelectItem>
                        <SelectItem value="engagement">Engagement & CTR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry (optional)</Label>
                    <Input
                      id="industry"
                      placeholder="E.g., Healthcare, Technology, Finance"
                      {...optionsForm.register('industry')}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="targetKeywords">Target Keywords (comma separated, optional)</Label>
                    <Textarea
                      id="targetKeywords"
                      placeholder="E.g., seo, optimization, meta tags"
                      className="min-h-[80px]"
                      {...optionsForm.register('targetKeywords')}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="maxTitleLength">Max Title Length</Label>
                      <Input
                        id="maxTitleLength"
                        type="number"
                        {...optionsForm.register('maxTitleLength')}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="maxDescriptionLength">Max Description Length</Label>
                      <Input
                        id="maxDescriptionLength"
                        type="number"
                        {...optionsForm.register('maxDescriptionLength')}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="includeJsonLd"
                        checked={optionsForm.watch('includeJsonLd')}
                        onChange={(e) => optionsForm.setValue('includeJsonLd', e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="includeJsonLd">Include JSON-LD Schema</Label>
                    </div>
                  </div>
                  
                  {optionsForm.watch('includeJsonLd') && (
                    <div className="space-y-2">
                      <Label htmlFor="jsonLdType">JSON-LD Type</Label>
                      <Select
                        defaultValue={optionsForm.getValues('jsonLdType')}
                        onValueChange={(value) => optionsForm.setValue('jsonLdType', value as any)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select schema type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="WebPage">WebPage</SelectItem>
                          <SelectItem value="Article">Article</SelectItem>
                          <SelectItem value="Product">Product</SelectItem>
                          <SelectItem value="LocalBusiness">LocalBusiness</SelectItem>
                          <SelectItem value="Organization">Organization</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  <Button type="submit" disabled={generateMetadata.isPending || pages.length === 0}>
                    {generateMetadata.isPending ? (
                      <>
                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                        Starting Job...
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        Generate Metadata
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Results Tab */}
        <TabsContent value="results">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Job History</CardTitle>
                <CardDescription>Your recent metadata generation jobs</CardDescription>
              </CardHeader>
              <CardContent className="max-h-[400px] overflow-y-auto">
                {isLoadingJobs ? (
                  <div className="flex justify-center py-4">
                    <LoaderCircle className="h-6 w-6 animate-spin text-gray-400" />
                  </div>
                ) : userJobs && userJobs.length > 0 ? (
                  <div className="space-y-4">
                    {userJobs.map((job) => (
                      <div 
                        key={job.jobId} 
                        className={`p-3 border rounded-md cursor-pointer hover:bg-gray-50 ${activeJobId === job.jobId ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                        onClick={() => handleJobSelect(job.jobId)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="text-sm font-medium truncate max-w-[150px]">{job.jobId}</div>
                          {renderStatusBadge(job.status)}
                        </div>
                        <div className="mt-2 text-xs text-gray-500">{formatDate(job.updatedAt)}</div>
                        {job.status === 'processing' && (
                          <Progress value={job.progress} className="h-1 mt-2" />
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    No jobs found. Generate metadata to see your jobs here.
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Results</CardTitle>
                <CardDescription>
                  {activeJobId ? (
                    <>Job ID: {activeJobId}</>
                  ) : (
                    <>Select a job or generate new metadata</>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingStatus ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <LoaderCircle className="h-8 w-8 animate-spin text-gray-400 mb-4" />
                    <p className="text-gray-500">Loading job status...</p>
                  </div>
                ) : jobStatus ? (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <div className="space-y-1">
                        <h3 className="font-medium">Status: {renderStatusBadge(jobStatus.status)}</h3>
                        <p className="text-sm text-gray-500">{jobStatus.message}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/metadata/jobs', activeJobId, 'status'] })}
                        >
                          <RefreshCw className="h-4 w-4 mr-1" />
                          Refresh
                        </Button>
                      </div>
                    </div>
                    
                    {(jobStatus.status === 'processing' || jobStatus.status === 'queued') && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress: {jobStatus.progress}%</span>
                        </div>
                        <Progress value={jobStatus.progress} className="h-2" />
                      </div>
                    )}
                    
                    {jobResults && (
                      <>
                        <div className="space-y-4">
                          <div className="bg-gray-50 p-4 rounded-md">
                            <h3 className="font-medium mb-2">Summary</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <div className="text-gray-500">Total Pages</div>
                                <div className="font-medium">{jobResults.summary.totalPages}</div>
                              </div>
                              <div>
                                <div className="text-gray-500">Processed</div>
                                <div className="font-medium">{jobResults.summary.processedPages}</div>
                              </div>
                              <div>
                                <div className="text-gray-500">Avg. Score</div>
                                <div className="font-medium">{Math.round(jobResults.summary.averageScore)}%</div>
                              </div>
                              <div>
                                <div className="text-gray-500">Status</div>
                                <div className="font-medium">{jobResults.status}</div>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h3 className="font-medium mb-2">Suggested Improvements</h3>
                            <ul className="list-disc ml-5 text-sm space-y-1">
                              {jobResults.summary.suggestedImprovements.map((improvement, i) => (
                                <li key={i}>{improvement}</li>
                              ))}
                            </ul>
                          </div>
                          
                          {jobResults.results.length > 0 && (
                            <div>
                              <div className="flex justify-between items-center mb-2">
                                <h3 className="font-medium">Results</h3>
                                <div className="flex space-x-2">
                                  <Button variant="outline" size="sm" onClick={() => handleDownload('json')}>
                                    <Download className="h-4 w-4 mr-1" />
                                    JSON
                                  </Button>
                                  <Button variant="outline" size="sm" onClick={() => handleDownload('csv')}>
                                    <Download className="h-4 w-4 mr-1" />
                                    CSV
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => handleOpenVisualizer(jobResults, 'Metadata Results Visualization')}
                                  >
                                    <BarChart className="h-4 w-4 mr-1" />
                                    Visualize
                                  </Button>
                                </div>
                              </div>
                              
                              <div className="border rounded-md overflow-x-auto">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>URL</TableHead>
                                      <TableHead>Title</TableHead>
                                      <TableHead>Description</TableHead>
                                      <TableHead>Score</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {jobResults.results.map((result, index) => (
                                      <TableRow key={index}>
                                        <TableCell className="max-w-[150px] truncate">
                                          <a 
                                            href={result.url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline"
                                          >
                                            {result.url}
                                          </a>
                                        </TableCell>
                                        <TableCell className="max-w-[200px] truncate">{result.title}</TableCell>
                                        <TableCell className="max-w-[200px] truncate">{result.description}</TableCell>
                                        <TableCell>
                                          <div className="flex items-center">
                                            <span className={`font-medium ${result.score > 80 ? 'text-green-600' : result.score > 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                                              {result.score}%
                                            </span>
                                          </div>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Upload className="h-8 w-8 mx-auto mb-4 text-gray-400" />
                    <p>No job selected. Select a job from the history or generate new metadata.</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => setActiveTab('input')}
                    >
                      Start New Job
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}