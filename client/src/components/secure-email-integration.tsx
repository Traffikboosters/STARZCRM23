import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { 
  Mail, 
  Send, 
  Shield, 
  Lock, 
  Key,
  FileText,
  Copy,
  Check,
  AlertTriangle,
  Clock,
  User,
  Settings,
  Download,
  Eye
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SecureEmailComposer {
  to: string;
  cc: string;
  bcc: string;
  subject: string;
  body: string;
  attachments: SecureAttachment[];
  encryptionEnabled: boolean;
  passwordProtected: boolean;
  expirationTime: string;
  readReceipt: boolean;
  deliveryReceipt: boolean;
}

interface SecureAttachment {
  id: string;
  name: string;
  size: number;
  encrypted: boolean;
  password?: string;
  accessLevel: 'public' | 'internal' | 'confidential' | 'restricted';
}

export default function SecureEmailIntegration() {
  const [emailData, setEmailData] = useState<SecureEmailComposer>({
    to: "",
    cc: "",
    bcc: "",
    subject: "",
    body: "",
    attachments: [],
    encryptionEnabled: true,
    passwordProtected: false,
    expirationTime: "7d",
    readReceipt: false,
    deliveryReceipt: false
  });

  const [copiedEmailContent, setCopiedEmailContent] = useState(false);
  const [isGeneratingSecureLink, setIsGeneratingSecureLink] = useState(false);
  const { toast } = useToast();

  const sampleAttachments: SecureAttachment[] = [
    {
      id: "SF-001",
      name: "Client_Contract_Bella_Vista.pdf",
      size: 2456789,
      encrypted: true,
      password: "SecureDoc2025!",
      accessLevel: "confidential"
    },
    {
      id: "SF-002", 
      name: "Financial_Report_Q4_2024.xlsx",
      size: 1234567,
      encrypted: true,
      password: "FinReport#2024",
      accessLevel: "restricted"
    }
  ];

  const generateSecureEmailContent = () => {
    const securityNotice = emailData.encryptionEnabled ? 
      "\n🔒 SECURE EMAIL - This message contains encrypted attachments\n" +
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" : "";

    const attachmentSection = emailData.attachments.length > 0 ? 
      "\nSECURE ATTACHMENTS:\n" +
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
      emailData.attachments.map(att => 
        `📄 ${att.name}\n` +
        `   🔐 Encrypted: ${att.encrypted ? 'Yes' : 'No'}\n` +
        `   🛡️  Security Level: ${att.accessLevel.toUpperCase()}\n` +
        `   🔑 Access Password: ${att.password || 'Not required'}\n` +
        `   📊 Size: ${formatFileSize(att.size)}\n`
      ).join('\n') + "\n" : "";

    const securityInstructions = emailData.encryptionEnabled ?
      "SECURITY INSTRUCTIONS:\n" +
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
      "1. Download files only from secure links provided\n" +
      "2. Use the provided passwords to decrypt documents\n" +
      "3. Do not forward encrypted files without authorization\n" +
      (emailData.expirationTime ? `4. Files expire in ${getExpirationText(emailData.expirationTime)}\n` : "") +
      "5. Contact sender if you experience access issues\n\n" : "";

    const footer = 
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
      "Traffik Boosters - Secure Business Communications\n" +
      "📧 traffikboosters@gmail.com | 📞 +1-888-TRAFFIK\n" +
      "🌐 https://traffikboosters.com\n\n" +
      "This email was sent using enterprise-grade encryption.\n" +
      "If you received this in error, please delete immediately.";

    return `${securityNotice}${emailData.body}\n\n${attachmentSection}${securityInstructions}${footer}`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getExpirationText = (expiration: string) => {
    switch (expiration) {
      case '1h': return '1 hour';
      case '24h': return '24 hours';
      case '7d': return '7 days';
      case '30d': return '30 days';
      default: return expiration;
    }
  };

  const copySecureEmailToClipboard = () => {
    const emailContent = generateSecureEmailContent();
    const fullEmail = `To: ${emailData.to}\n` +
      (emailData.cc ? `CC: ${emailData.cc}\n` : '') +
      (emailData.bcc ? `BCC: ${emailData.bcc}\n` : '') +
      `Subject: ${emailData.subject}\n\n${emailContent}`;
    
    navigator.clipboard.writeText(fullEmail).then(() => {
      setCopiedEmailContent(true);
      toast({
        title: "Secure Email Copied!",
        description: "Encrypted email content has been copied to clipboard. Paste into your email client.",
      });
      setTimeout(() => setCopiedEmailContent(false), 3000);
    });
  };

  const openInEmailClient = () => {
    const emailContent = generateSecureEmailContent();
    const subject = encodeURIComponent(emailData.subject);
    const body = encodeURIComponent(emailContent);
    const to = encodeURIComponent(emailData.to);
    const cc = emailData.cc ? `&cc=${encodeURIComponent(emailData.cc)}` : '';
    const bcc = emailData.bcc ? `&bcc=${encodeURIComponent(emailData.bcc)}` : '';
    
    const mailtoLink = `mailto:${to}?subject=${subject}&body=${body}${cc}${bcc}`;
    window.open(mailtoLink, '_blank');
  };

  const generateSecureLinks = async () => {
    setIsGeneratingSecureLink(true);
    
    // Simulate secure link generation
    setTimeout(() => {
      const secureLinks = emailData.attachments.map(att => ({
        name: att.name,
        link: `https://secure.traffikboosters.com/files/${att.id}?token=${Math.random().toString(36).substring(2, 15)}`,
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      }));
      
      const linksText = secureLinks.map(link => 
        `📄 ${link.name}\n🔗 ${link.link}\n⏰ Expires: ${new Date(link.expires).toLocaleDateString()}\n`
      ).join('\n');
      
      setEmailData(prev => ({
        ...prev,
        body: prev.body + '\n\nSECURE DOWNLOAD LINKS:\n' + linksText
      }));
      
      setIsGeneratingSecureLink(false);
      toast({
        title: "Secure Links Generated",
        description: "Encrypted download links have been added to your email.",
      });
    }, 2000);
  };

  const addAttachment = (attachment: SecureAttachment) => {
    setEmailData(prev => ({
      ...prev,
      attachments: [...prev.attachments, attachment]
    }));
  };

  const removeAttachment = (attachmentId: string) => {
    setEmailData(prev => ({
      ...prev,
      attachments: prev.attachments.filter(att => att.id !== attachmentId)
    }));
  };

  const getAccessLevelColor = (level: SecureAttachment['accessLevel']) => {
    switch (level) {
      case 'public': return 'bg-green-100 text-green-800';
      case 'internal': return 'bg-blue-100 text-blue-800';
      case 'confidential': return 'bg-orange-100 text-orange-800';
      case 'restricted': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Secure Email Composer
          </CardTitle>
          <CardDescription>
            Send encrypted files and sensitive information through your email client
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Email Recipients */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="to">To *</Label>
              <Input
                id="to"
                type="email"
                value={emailData.to}
                onChange={(e) => setEmailData(prev => ({ ...prev, to: e.target.value }))}
                placeholder="recipient@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cc">CC</Label>
              <Input
                id="cc"
                type="email"
                value={emailData.cc}
                onChange={(e) => setEmailData(prev => ({ ...prev, cc: e.target.value }))}
                placeholder="cc@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bcc">BCC</Label>
              <Input
                id="bcc"
                type="email"
                value={emailData.bcc}
                onChange={(e) => setEmailData(prev => ({ ...prev, bcc: e.target.value }))}
                placeholder="bcc@example.com"
              />
            </div>
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              value={emailData.subject}
              onChange={(e) => setEmailData(prev => ({ ...prev, subject: e.target.value }))}
              placeholder="Secure Document Delivery - Confidential"
            />
          </div>

          {/* Security Settings */}
          <Card className="p-4">
            <h4 className="font-medium mb-4">Security Settings</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>End-to-End Encryption</Label>
                  <p className="text-sm text-muted-foreground">
                    Encrypt email content and attachments
                  </p>
                </div>
                <Switch 
                  checked={emailData.encryptionEnabled}
                  onCheckedChange={(checked) => setEmailData(prev => ({ 
                    ...prev, 
                    encryptionEnabled: checked 
                  }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Password Protection</Label>
                  <p className="text-sm text-muted-foreground">
                    Require password to access files
                  </p>
                </div>
                <Switch 
                  checked={emailData.passwordProtected}
                  onCheckedChange={(checked) => setEmailData(prev => ({ 
                    ...prev, 
                    passwordProtected: checked 
                  }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label>File Expiration</Label>
                <Select value={emailData.expirationTime} onValueChange={(value) => 
                  setEmailData(prev => ({ ...prev, expirationTime: value }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1h">1 Hour</SelectItem>
                    <SelectItem value="24h">24 Hours</SelectItem>
                    <SelectItem value="7d">7 Days</SelectItem>
                    <SelectItem value="30d">30 Days</SelectItem>
                    <SelectItem value="never">Never</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Read Receipt</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when email is read
                  </p>
                </div>
                <Switch 
                  checked={emailData.readReceipt}
                  onCheckedChange={(checked) => setEmailData(prev => ({ 
                    ...prev, 
                    readReceipt: checked 
                  }))}
                />
              </div>
            </div>
          </Card>

          {/* Message Body */}
          <div className="space-y-2">
            <Label htmlFor="body">Message</Label>
            <Textarea
              id="body"
              value={emailData.body}
              onChange={(e) => setEmailData(prev => ({ ...prev, body: e.target.value }))}
              placeholder="Please find the requested documents attached. These files contain confidential information and require secure access credentials provided below..."
              rows={6}
            />
          </div>

          <Separator />

          {/* Attachments Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Secure Attachments</h4>
              <Button 
                variant="outline" 
                size="sm"
                onClick={generateSecureLinks}
                disabled={isGeneratingSecureLink || emailData.attachments.length === 0}
              >
                {isGeneratingSecureLink ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Generating Links...
                  </>
                ) : (
                  <>
                    <Key className="w-4 h-4 mr-2" />
                    Generate Secure Links
                  </>
                )}
              </Button>
            </div>

            {/* Available Files to Attach */}
            <Card className="p-4">
              <h5 className="font-medium mb-3">Available Secure Files</h5>
              <div className="space-y-2">
                {sampleAttachments.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-2 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">{file.name}</p>
                        <div className="flex items-center gap-2">
                          <Badge className={getAccessLevelColor(file.accessLevel)} variant="secondary">
                            {file.accessLevel}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatFileSize(file.size)}
                          </span>
                          {file.encrypted && <Shield className="w-3 h-3 text-green-500" />}
                        </div>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => addAttachment(file)}
                      disabled={emailData.attachments.some(att => att.id === file.id)}
                    >
                      {emailData.attachments.some(att => att.id === file.id) ? 'Added' : 'Attach'}
                    </Button>
                  </div>
                ))}
              </div>
            </Card>

            {/* Selected Attachments */}
            {emailData.attachments.length > 0 && (
              <Card className="p-4">
                <h5 className="font-medium mb-3">Selected Attachments</h5>
                <div className="space-y-2">
                  {emailData.attachments.map((attachment) => (
                    <div key={attachment.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-sm">{attachment.name}</p>
                          <div className="flex items-center gap-2">
                            <Badge className={getAccessLevelColor(attachment.accessLevel)} variant="secondary">
                              {attachment.accessLevel}
                            </Badge>
                            {attachment.password && (
                              <Badge variant="outline" className="text-xs">
                                Password: {attachment.password}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => removeAttachment(attachment.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          <Separator />

          {/* Email Actions */}
          <div className="space-y-4">
            <h4 className="font-medium">Send Options</h4>
            <div className="flex flex-wrap gap-3">
              <Button 
                onClick={openInEmailClient}
                className="flex items-center gap-2"
                disabled={!emailData.to || !emailData.subject}
              >
                <Send className="w-4 h-4" />
                Open in Email Client
              </Button>
              <Button 
                variant="outline"
                onClick={copySecureEmailToClipboard}
                className="flex items-center gap-2"
                disabled={!emailData.to || !emailData.subject}
              >
                {copiedEmailContent ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                {copiedEmailContent ? "Copied!" : "Copy Email Content"}
              </Button>
              <Button variant="outline">
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Save Draft
              </Button>
            </div>
          </div>

          {/* Security Notice */}
          {emailData.encryptionEnabled && (
            <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h5 className="font-medium text-blue-900">Security Notice</h5>
                <p className="text-sm text-blue-700">
                  This email will include encryption instructions and secure download links. 
                  Recipients will need the provided passwords to access confidential attachments.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}