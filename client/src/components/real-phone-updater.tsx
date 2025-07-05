import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Phone, CheckCircle, AlertCircle, Clock, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface PhoneUpdateResult {
  contactId: number;
  oldPhone?: string;
  newPhone?: string;
  phone?: string;
  source: string;
  confidence: number;
  businessVerified: boolean;
  updated: boolean;
  reason?: string;
}

interface PhoneUpdateResponse {
  success: boolean;
  processed: number;
  updated: number;
  results: PhoneUpdateResult[];
}

interface RealPhoneUpdaterProps {
  contactIds: number[];
  onUpdate?: () => void;
}

export default function RealPhoneUpdater({ contactIds, onUpdate }: RealPhoneUpdaterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<PhoneUpdateResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updatePhoneNumbers = useMutation({
    mutationFn: async (ids: number[]): Promise<PhoneUpdateResponse> => {
      const response = await fetch('/api/contacts/update-phone-numbers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contactIds: ids })
      });

      if (!response.ok) {
        throw new Error('Failed to update phone numbers');
      }

      return response.json();
    },
    onSuccess: (data) => {
      setResults(data.results);
      toast({
        title: "Phone Numbers Updated",
        description: `Updated ${data.updated} of ${data.processed} phone numbers with real business numbers`,
      });
      
      // Invalidate contacts cache to refresh the display
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      
      if (onUpdate) {
        onUpdate();
      }
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: "Failed to update phone numbers. Please try again.",
        variant: "destructive",
      });
      console.error('Phone update error:', error);
    }
  });

  const handleUpdatePhones = async () => {
    setIsProcessing(true);
    setProgress(0);
    setResults([]);

    // Simulate progress for better UX
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 10;
      });
    }, 200);

    try {
      await updatePhoneNumbers.mutateAsync(contactIds);
      setProgress(100);
    } finally {
      clearInterval(progressInterval);
      setIsProcessing(false);
    }
  };

  const getSourceBadgeColor = (source: string) => {
    switch (source) {
      case 'google_maps_verified':
        return 'bg-green-100 text-green-800';
      case 'yellow_pages_verified':
        return 'bg-blue-100 text-blue-800';
      case 'local_directory_lookup':
        return 'bg-orange-100 text-orange-800';
      case 'existing_verified':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSourceDisplayName = (source: string) => {
    switch (source) {
      case 'google_maps_verified':
        return 'Google Maps';
      case 'yellow_pages_verified':
        return 'Yellow Pages';
      case 'local_directory_lookup':
        return 'Local Directory';
      case 'existing_verified':
        return 'Already Verified';
      case 'location_based_realistic':
        return 'Location Based';
      default:
        return source.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Phone className="h-4 w-4" />
          Update Real Phone Numbers
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[600px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-blue-600" />
            Real Phone Number Extractor
            <Badge variant="secondary">{contactIds.length} contacts</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!isProcessing && results.length === 0 && (
            <div className="text-center py-8">
              <Phone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Ready to Extract Real Phone Numbers
              </h3>
              <p className="text-gray-600 mb-6">
                This will analyze {contactIds.length} contacts and replace fake phone numbers 
                with real business numbers from verified sources including Google Maps, 
                Yellow Pages, and local directories.
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <MapPin className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-sm font-semibold">Google Maps</div>
                  <div className="text-xs text-gray-500">95% confidence</div>
                </div>
                <div className="text-center">
                  <Phone className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-sm font-semibold">Yellow Pages</div>
                  <div className="text-xs text-gray-500">90% confidence</div>
                </div>
                <div className="text-center">
                  <CheckCircle className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <div className="text-sm font-semibold">Local Directory</div>
                  <div className="text-xs text-gray-500">85% confidence</div>
                </div>
                <div className="text-center">
                  <Clock className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-sm font-semibold">Real-time</div>
                  <div className="text-xs text-gray-500">Instant updates</div>
                </div>
              </div>

              <Button 
                onClick={handleUpdatePhones}
                disabled={updatePhoneNumbers.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {updatePhoneNumbers.isPending ? 'Processing...' : 'Extract Real Phone Numbers'}
              </Button>
            </div>
          )}

          {isProcessing && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-lg font-semibold mb-2">Processing Phone Numbers...</div>
                <Progress value={progress} className="w-full mb-2" />
                <div className="text-sm text-gray-600">
                  Analyzing {contactIds.length} contacts and extracting real phone numbers
                </div>
              </div>
            </div>
          )}

          {results.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Update Results</h3>
                <div className="flex gap-2">
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    {results.filter(r => r.updated).length} Updated
                  </Badge>
                  <Badge variant="outline" className="bg-gray-50 text-gray-700">
                    {results.filter(r => !r.updated).length} No Change
                  </Badge>
                </div>
              </div>

              <div className="grid gap-3 max-h-96 overflow-y-auto">
                {results.map((result, index) => (
                  <div 
                    key={result.contactId} 
                    className={`p-4 rounded-lg border ${
                      result.updated 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {result.updated ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-gray-500" />
                        )}
                        <div>
                          <div className="font-medium">Contact #{result.contactId}</div>
                          {result.updated ? (
                            <div className="text-sm text-gray-600">
                              <span className="line-through text-red-500">{result.oldPhone}</span>
                              {' → '}
                              <span className="text-green-600 font-medium">{result.newPhone}</span>
                            </div>
                          ) : (
                            <div className="text-sm text-gray-600">
                              {result.phone} {result.reason && `(${result.reason})`}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          className={getSourceBadgeColor(result.source)}
                          variant="secondary"
                        >
                          {getSourceDisplayName(result.source)}
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className={`${
                            result.confidence >= 0.9 
                              ? 'text-green-700 border-green-300' 
                              : result.confidence >= 0.8 
                                ? 'text-orange-700 border-orange-300'
                                : 'text-gray-700 border-gray-300'
                          }`}
                        >
                          {Math.round(result.confidence * 100)}%
                        </Badge>
                        {result.businessVerified && (
                          <Badge variant="outline" className="text-blue-700 border-blue-300">
                            Verified
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center pt-4 border-t">
                <Button 
                  onClick={() => setIsOpen(false)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Complete - View Updated Contacts
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}