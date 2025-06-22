import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SecureEmailIntegration from "@/components/secure-email-integration";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { 
  Shield, 
  Lock, 
  Unlock,
  Key,
  Eye,
  EyeOff,
  FileText,
  Download,
  Upload,
  Share,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Calendar,
  Activity,
  Settings,
  Fingerprint,
  ShieldCheck
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import traffikBoostersLogo from "@assets/newTRAFIC BOOSTERS3 copy_1750608395971.png";

interface SecureFile {
  id: string;
  name: string;
  size: number;
  type: string;
  encrypted: boolean;
  encryptionLevel: 'AES-256' | 'RSA-2048' | 'ChaCha20';
  accessLevel: 'public' | 'internal' | 'confidential' | 'restricted';
  uploadedBy: string;
  uploadedAt: string;
  lastAccessed: string;
  accessCount: number;
  permissions: FilePermission[];
  auditLog: AuditLogEntry[];
  isLocked: boolean;
  expiresAt?: string;
  watermark: boolean;
  dlpEnabled: boolean;
}

interface FilePermission {
  userId: string;
  userName: string;
  role: string;
  permissions: ('read' | 'write' | 'delete' | 'share')[];
  grantedAt: string;
  grantedBy: string;
}

interface AuditLogEntry {
  id: string;
  action: 'upload' | 'download' | 'view' | 'share' | 'encrypt' | 'decrypt' | 'delete' | 'modify_permissions';
  userId: string;
  userName: string;
  timestamp: string;
  ipAddress: string;
  details: string;
  risk: 'low' | 'medium' | 'high';
}

const sampleFiles: SecureFile[] = [
  {
    id: "SF-001",
    name: "Client_Contract_Bella_Vista.pdf",
    size: 2456789,
    type: "application/pdf",
    encrypted: true,
    encryptionLevel: "AES-256",
    accessLevel: "confidential",
    uploadedBy: "Sarah Johnson",
    uploadedAt: "2025-01-02T10:30:00Z",
    lastAccessed: "2025-01-02T15:45:00Z",
    accessCount: 3,
    isLocked: false,
    expiresAt: "2025-07-02T00:00:00Z",
    watermark: true,
    dlpEnabled: true,
    permissions: [
      {
        userId: "1",
        userName: "Sarah Johnson",
        role: "Account Manager",
        permissions: ["read", "write", "share"],
        grantedAt: "2025-01-02T10:30:00Z",
        grantedBy: "System"
      },
      {
        userId: "2",
        userName: "Mike Rodriguez",
        role: "Sales Director",
        permissions: ["read"],
        grantedAt: "2025-01-02T11:00:00Z",
        grantedBy: "Sarah Johnson"
      }
    ],
    auditLog: [
      {
        id: "AL-001",
        action: "upload",
        userId: "1",
        userName: "Sarah Johnson",
        timestamp: "2025-01-02T10:30:00Z",
        ipAddress: "192.168.1.100",
        details: "File uploaded with AES-256 encryption",
        risk: "low"
      },
      {
        id: "AL-002",
        action: "view",
        userId: "2",
        userName: "Mike Rodriguez",
        timestamp: "2025-01-02T15:45:00Z",
        ipAddress: "192.168.1.101",
        details: "Document viewed via secure viewer",
        risk: "low"
      }
    ]
  },
  {
    id: "SF-002",
    name: "Financial_Report_Q4_2024.xlsx",
    size: 1234567,
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    encrypted: true,
    encryptionLevel: "RSA-2048",
    accessLevel: "restricted",
    uploadedBy: "David Chen",
    uploadedAt: "2025-01-01T09:15:00Z",
    lastAccessed: "2025-01-02T08:30:00Z",
    accessCount: 7,
    isLocked: true,
    expiresAt: "2025-03-01T00:00:00Z",
    watermark: true,
    dlpEnabled: true,
    permissions: [
      {
        userId: "3",
        userName: "David Chen",
        role: "CFO",
        permissions: ["read", "write", "delete", "share"],
        grantedAt: "2025-01-01T09:15:00Z",
        grantedBy: "System"
      }
    ],
    auditLog: [
      {
        id: "AL-003",
        action: "upload",
        userId: "3",
        userName: "David Chen",
        timestamp: "2025-01-01T09:15:00Z",
        ipAddress: "192.168.1.102",
        details: "Confidential financial document uploaded",
        risk: "medium"
      },
      {
        id: "AL-004",
        action: "encrypt",
        userId: "3",
        userName: "David Chen",
        timestamp: "2025-01-01T09:16:00Z",
        ipAddress: "192.168.1.102",
        details: "Enhanced encryption applied (RSA-2048)",
        risk: "low"
      }
    ]
  }
];

export default function SecureFileManager() {
  const [files, setFiles] = useState<SecureFile[]>(sampleFiles);
  const [selectedFile, setSelectedFile] = useState<SecureFile>(files[0]);
  const [securitySettings, setSecuritySettings] = useState({
    defaultEncryption: "AES-256",
    requireMFA: true,
    autoLockTimeout: 30,
    dlpEnabled: true,
    watermarkEnabled: true,
    auditRetention: 365
  });
  const [encryptionProgress, setEncryptionProgress] = useState(0);
  const [isEncrypting, setIsEncrypting] = useState(false);
  const { toast } = useToast();

  const getAccessLevelColor = (level: SecureFile['accessLevel']) => {
    switch (level) {
      case 'public': return 'bg-green-100 text-green-800';
      case 'internal': return 'bg-blue-100 text-blue-800';
      case 'confidential': return 'bg-orange-100 text-orange-800';
      case 'restricted': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskColor = (risk: AuditLogEntry['risk']) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const encryptFile = async (fileId: string, encryptionLevel: SecureFile['encryptionLevel']) => {
    setIsEncrypting(true);
    setEncryptionProgress(0);
    
    // Simulate encryption progress
    const interval = setInterval(() => {
      setEncryptionProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsEncrypting(false);
          
          // Update file encryption status
          setFiles(prevFiles => 
            prevFiles.map(file => 
              file.id === fileId 
                ? { 
                    ...file, 
                    encrypted: true, 
                    encryptionLevel,
                    auditLog: [
                      ...file.auditLog,
                      {
                        id: `AL-${Date.now()}`,
                        action: 'encrypt',
                        userId: "1",
                        userName: "Current User",
                        timestamp: new Date().toISOString(),
                        ipAddress: "192.168.1.100",
                        details: `File encrypted with ${encryptionLevel}`,
                        risk: "low"
                      }
                    ]
                  }
                : file
            )
          );
          
          toast({
            title: "File Encrypted Successfully",
            description: `${encryptionLevel} encryption applied to the file.`,
          });
          
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const toggleFileLock = (fileId: string) => {
    setFiles(prevFiles => 
      prevFiles.map(file => 
        file.id === fileId 
          ? { 
              ...file, 
              isLocked: !file.isLocked,
              auditLog: [
                ...file.auditLog,
                {
                  id: `AL-${Date.now()}`,
                  action: file.isLocked ? 'decrypt' : 'encrypt',
                  userId: "1",
                  userName: "Current User",
                  timestamp: new Date().toISOString(),
                  ipAddress: "192.168.1.100",
                  details: `File ${file.isLocked ? 'unlocked' : 'locked'} by user`,
                  risk: "medium"
                }
              ]
            }
          : file
      )
    );
    
    const file = files.find(f => f.id === fileId);
    toast({
      title: file?.isLocked ? "File Unlocked" : "File Locked",
      description: file?.isLocked ? "File is now accessible" : "File is now protected",
    });
  };

  const shareFile = (fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (file) {
      // Add audit log entry
      setFiles(prevFiles => 
        prevFiles.map(f => 
          f.id === fileId 
            ? { 
                ...f,
                auditLog: [
                  ...f.auditLog,
                  {
                    id: `AL-${Date.now()}`,
                    action: 'share',
                    userId: "1",
                    userName: "Current User",
                    timestamp: new Date().toISOString(),
                    ipAddress: "192.168.1.100",
                    details: "Secure sharing link generated",
                    risk: "medium"
                  }
                ]
              }
            : f
        )
      );
      
      toast({
        title: "Secure Share Link Generated",
        description: "Encrypted sharing link copied to clipboard",
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Secure File Manager</h1>
          <p className="text-muted-foreground">Advanced encryption and security for sensitive documents</p>
        </div>
        <div className="flex items-center gap-2">
          <img src={traffikBoostersLogo} alt="Traffik Boosters" className="h-8 w-auto" />
          <Button>
            <Upload className="w-4 h-4 mr-2" />
            Upload Secure File
          </Button>
        </div>
      </div>

      <Tabs defaultValue="files" className="space-y-6">
        <TabsList>
          <TabsTrigger value="files">Secure Files</TabsTrigger>
          <TabsTrigger value="email">Email Integration</TabsTrigger>
          <TabsTrigger value="encryption">Encryption Center</TabsTrigger>
          <TabsTrigger value="audit">Audit & Compliance</TabsTrigger>
          <TabsTrigger value="settings">Security Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="email" className="space-y-6">
          <SecureEmailIntegration />
        </TabsContent>

        <TabsContent value="files" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Files List */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Protected Files</h3>
              {files.map((file) => (
                <Card 
                  key={file.id}
                  className={`cursor-pointer transition-all ${
                    selectedFile.id === file.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedFile(file)}
                >
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium text-sm">{file.name}</span>
                        </div>
                        {file.isLocked ? (
                          <Lock className="w-4 h-4 text-red-500" />
                        ) : (
                          <Unlock className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Badge className={getAccessLevelColor(file.accessLevel)} variant="secondary">
                          {file.accessLevel}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatFileSize(file.size)}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          {file.encrypted && <Shield className="w-3 h-3 text-green-500" />}
                          {file.watermark && <Fingerprint className="w-3 h-3 text-blue-500" />}
                          {file.dlpEnabled && <ShieldCheck className="w-3 h-3 text-purple-500" />}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {file.accessCount} views
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* File Details */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        {selectedFile.name}
                      </CardTitle>
                      <CardDescription>
                        {selectedFile.encrypted ? 'Encrypted' : 'Unencrypted'} • {selectedFile.encryptionLevel}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getAccessLevelColor(selectedFile.accessLevel)} variant="secondary">
                        {selectedFile.accessLevel}
                      </Badge>
                      {selectedFile.isLocked ? (
                        <Lock className="w-5 h-5 text-red-500" />
                      ) : (
                        <Unlock className="w-5 h-5 text-green-500" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* File Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">Uploaded by:</span>
                        <span>{selectedFile.uploadedBy}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">Uploaded:</span>
                        <span>{new Date(selectedFile.uploadedAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">Access Count:</span>
                        <span>{selectedFile.accessCount}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">Encryption:</span>
                        <span>{selectedFile.encryptionLevel}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">Expires:</span>
                        <span>
                          {selectedFile.expiresAt 
                            ? new Date(selectedFile.expiresAt).toLocaleDateString()
                            : 'Never'
                          }
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">Last Accessed:</span>
                        <span>{new Date(selectedFile.lastAccessed).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Security Features */}
                  <div>
                    <h4 className="font-medium mb-4">Security Features</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-green-500" />
                          <span className="text-sm">Encrypted</span>
                        </div>
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Fingerprint className="w-4 h-4 text-blue-500" />
                          <span className="text-sm">Watermarked</span>
                        </div>
                        {selectedFile.watermark ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-yellow-500" />
                        )}
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-purple-500" />
                          <span className="text-sm">DLP Protected</span>
                        </div>
                        {selectedFile.dlpEnabled ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-yellow-500" />
                        )}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Actions */}
                  <div className="space-y-4">
                    <h4 className="font-medium">File Actions</h4>
                    <div className="flex flex-wrap gap-3">
                      <Button 
                        variant="outline"
                        onClick={() => toggleFileLock(selectedFile.id)}
                        className="flex items-center gap-2"
                      >
                        {selectedFile.isLocked ? (
                          <>
                            <Unlock className="w-4 h-4" />
                            Unlock File
                          </>
                        ) : (
                          <>
                            <Lock className="w-4 h-4" />
                            Lock File
                          </>
                        )}
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => shareFile(selectedFile.id)}
                        className="flex items-center gap-2"
                      >
                        <Share className="w-4 h-4" />
                        Secure Share
                      </Button>
                      <Button variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                      <Button variant="outline">
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Permissions */}
              <Card>
                <CardHeader>
                  <CardTitle>Access Permissions</CardTitle>
                  <CardDescription>Manage who can access this file</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedFile.permissions.map((permission, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{permission.userName}</p>
                          <p className="text-sm text-muted-foreground">{permission.role}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {permission.permissions.map((perm) => (
                            <Badge key={perm} variant="outline" className="text-xs">
                              {perm}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="encryption" className="space-y-6">
          {/* Encryption Center */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                Encryption Center
              </CardTitle>
              <CardDescription>Manage file encryption and security levels</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Encryption Progress */}
              {isEncrypting && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Encrypting File...</span>
                    <span className="text-sm text-muted-foreground">{encryptionProgress}%</span>
                  </div>
                  <Progress value={encryptionProgress} className="h-2" />
                </div>
              )}

              {/* Encryption Options */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4">
                  <div className="space-y-2">
                    <Shield className="w-8 h-8 text-green-500" />
                    <h4 className="font-medium">AES-256</h4>
                    <p className="text-sm text-muted-foreground">
                      Standard encryption for business documents
                    </p>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => encryptFile(selectedFile.id, 'AES-256')}
                      disabled={isEncrypting}
                    >
                      Apply AES-256
                    </Button>
                  </div>
                </Card>
                
                <Card className="p-4">
                  <div className="space-y-2">
                    <Shield className="w-8 h-8 text-blue-500" />
                    <h4 className="font-medium">RSA-2048</h4>
                    <p className="text-sm text-muted-foreground">
                      Enhanced security for confidential files
                    </p>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => encryptFile(selectedFile.id, 'RSA-2048')}
                      disabled={isEncrypting}
                    >
                      Apply RSA-2048
                    </Button>
                  </div>
                </Card>
                
                <Card className="p-4">
                  <div className="space-y-2">
                    <Shield className="w-8 h-8 text-purple-500" />
                    <h4 className="font-medium">ChaCha20</h4>
                    <p className="text-sm text-muted-foreground">
                      Military-grade encryption for restricted access
                    </p>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => encryptFile(selectedFile.id, 'ChaCha20')}
                      disabled={isEncrypting}
                    >
                      Apply ChaCha20
                    </Button>
                  </div>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          {/* Audit Log */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Audit Log
              </CardTitle>
              <CardDescription>Complete access and security audit trail</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {selectedFile.auditLog.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{entry.action.replace('_', ' ')}</span>
                        <Badge className={getRiskColor(entry.risk)} variant="secondary">
                          {entry.risk} risk
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{entry.details}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>User: {entry.userName}</span>
                        <span>IP: {entry.ipAddress}</span>
                        <span>{new Date(entry.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Security Settings
              </CardTitle>
              <CardDescription>Configure global security policies</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Default Encryption</Label>
                    <Select value={securitySettings.defaultEncryption} onValueChange={(value) => 
                      setSecuritySettings(prev => ({ ...prev, defaultEncryption: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AES-256">AES-256</SelectItem>
                        <SelectItem value="RSA-2048">RSA-2048</SelectItem>
                        <SelectItem value="ChaCha20">ChaCha20</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Auto-lock Timeout (minutes)</Label>
                    <Input 
                      type="number" 
                      value={securitySettings.autoLockTimeout}
                      onChange={(e) => setSecuritySettings(prev => ({ 
                        ...prev, 
                        autoLockTimeout: parseInt(e.target.value) 
                      }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Audit Retention (days)</Label>
                    <Input 
                      type="number" 
                      value={securitySettings.auditRetention}
                      onChange={(e) => setSecuritySettings(prev => ({ 
                        ...prev, 
                        auditRetention: parseInt(e.target.value) 
                      }))}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Require Multi-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">
                        Require MFA for accessing confidential files
                      </p>
                    </div>
                    <Switch 
                      checked={securitySettings.requireMFA}
                      onCheckedChange={(checked) => setSecuritySettings(prev => ({ 
                        ...prev, 
                        requireMFA: checked 
                      }))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Data Loss Prevention (DLP)</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically scan for sensitive content
                      </p>
                    </div>
                    <Switch 
                      checked={securitySettings.dlpEnabled}
                      onCheckedChange={(checked) => setSecuritySettings(prev => ({ 
                        ...prev, 
                        dlpEnabled: checked 
                      }))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Automatic Watermarking</Label>
                      <p className="text-sm text-muted-foreground">
                        Add digital watermarks to documents
                      </p>
                    </div>
                    <Switch 
                      checked={securitySettings.watermarkEnabled}
                      onCheckedChange={(checked) => setSecuritySettings(prev => ({ 
                        ...prev, 
                        watermarkEnabled: checked 
                      }))}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}