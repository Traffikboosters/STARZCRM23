import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Download, Mail, FileText, FileSpreadsheet, FileImage, Send, Loader2 } from "lucide-react";

interface ReportExportProps {
  reportType: string;
  reportData: any;
  reportTitle: string;
  fileName?: string;
}

export default function ReportExport({ reportType, reportData, reportTitle, fileName }: ReportExportProps) {
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [emailData, setEmailData] = useState({
    recipients: "michael.thompson@traffikboosters.com",
    subject: `${reportTitle} - STARZ Report`,
    message: `Please find attached the ${reportTitle} report generated from STARZ platform.\n\nBest regards,\nSTARZ Reporting System`,
    format: "pdf",
    includeCharts: true,
    includeRawData: false
  });

  const { toast } = useToast();

  const downloadReport = async (format: 'pdf' | 'csv' | 'excel' | 'json') => {
    setIsDownloading(true);
    try {
      const response = await apiRequest("POST", "/api/reports/download", {
        reportType,
        reportData,
        reportTitle,
        format,
        fileName: fileName || `${reportType}_report_${Date.now()}`
      });

      // Create download link
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileName || reportType}_report.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Download Complete",
        description: `${reportTitle} report downloaded successfully as ${format.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const emailReport = async () => {
    setIsSending(true);
    try {
      await apiRequest("POST", "/api/reports/email", {
        reportType,
        reportData,
        reportTitle,
        recipients: emailData.recipients.split(',').map(email => email.trim()),
        subject: emailData.subject,
        message: emailData.message,
        format: emailData.format,
        includeCharts: emailData.includeCharts,
        includeRawData: emailData.includeRawData,
        fileName: fileName || `${reportType}_report`
      });

      toast({
        title: "Email Sent",
        description: `${reportTitle} report emailed successfully to ${emailData.recipients}`,
      });
      setIsEmailModalOpen(false);
    } catch (error) {
      toast({
        title: "Email Failed",
        description: "Failed to send report email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Download Dropdown */}
      <div className="relative group">
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Download
        </Button>
        <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
          <div className="py-1">
            <button
              onClick={() => downloadReport('pdf')}
              disabled={isDownloading}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              PDF Report
            </button>
            <button
              onClick={() => downloadReport('excel')}
              disabled={isDownloading}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Excel Spreadsheet
            </button>
            <button
              onClick={() => downloadReport('csv')}
              disabled={isDownloading}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
            >
              <FileSpreadsheet className="h-4 w-4" />
              CSV Data
            </button>
            <button
              onClick={() => downloadReport('json')}
              disabled={isDownloading}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              JSON Data
            </button>
          </div>
        </div>
      </div>

      {/* Email Button */}
      <Dialog open={isEmailModalOpen} onOpenChange={setIsEmailModalOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Email Report</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="recipients">Recipients (comma-separated)</Label>
              <Input
                id="recipients"
                value={emailData.recipients}
                onChange={(e) => setEmailData(prev => ({ ...prev, recipients: e.target.value }))}
                placeholder="email1@company.com, email2@company.com"
              />
            </div>
            
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={emailData.subject}
                onChange={(e) => setEmailData(prev => ({ ...prev, subject: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="format">Format</Label>
              <Select value={emailData.format} onValueChange={(value) => setEmailData(prev => ({ ...prev, format: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF Report</SelectItem>
                  <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                  <SelectItem value="csv">CSV Data</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeCharts"
                checked={emailData.includeCharts}
                onCheckedChange={(checked) => setEmailData(prev => ({ ...prev, includeCharts: !!checked }))}
              />
              <Label htmlFor="includeCharts">Include charts and visualizations</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeRawData"
                checked={emailData.includeRawData}
                onCheckedChange={(checked) => setEmailData(prev => ({ ...prev, includeRawData: !!checked }))}
              />
              <Label htmlFor="includeRawData">Include raw data tables</Label>
            </div>

            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={emailData.message}
                onChange={(e) => setEmailData(prev => ({ ...prev, message: e.target.value }))}
                rows={4}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEmailModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={emailReport} disabled={isSending}>
                {isSending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Email
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {isDownloading && (
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <Loader2 className="h-3 w-3 animate-spin" />
          Downloading...
        </div>
      )}
    </div>
  );
}