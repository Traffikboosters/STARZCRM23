import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Copy, Mail, Send, User, UserPlus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function UserInvitation() {
  const [isInviting, setIsInviting] = useState(false);
  const [inviteData, setInviteData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: 'sales_rep'
  });
  const [inviteResult, setInviteResult] = useState<any>(null);
  const { toast } = useToast();

  const handleInviteUser = async () => {
    if (!inviteData.email || !inviteData.firstName || !inviteData.lastName) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsInviting(true);

    try {
      const response = await fetch('/api/users/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inviteData)
      });

      if (response.ok) {
        const result = await response.json();
        setInviteResult(result);
        
        toast({
          title: "Invitation Sent",
          description: `Invitation prepared for ${inviteData.firstName} ${inviteData.lastName}`,
        });

        // Reset form
        setInviteData({
          email: '',
          firstName: '',
          lastName: '',
          role: 'sales_rep'
        });
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send invitation');
      }
    } catch (error: any) {
      toast({
        title: "Invitation Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsInviting(false);
    }
  };

  const copyInviteLink = () => {
    if (inviteResult?.inviteLink) {
      navigator.clipboard.writeText(inviteResult.inviteLink);
      toast({
        title: "Link Copied",
        description: "Invitation link copied to clipboard",
      });
    }
  };

  const openEmailClient = () => {
    if (inviteResult) {
      const subject = encodeURIComponent("Invitation to Join Starz Platform - Traffik Boosters");
      const body = encodeURIComponent(`Hi ${inviteData.firstName},

You've been invited to join the Starz business management platform.

Starz is Traffik Boosters' comprehensive CRM and business management system that includes:
- Lead management and tracking
- Sales pipeline and analytics
- Phone system integration
- Real-time notifications
- Performance tracking

To accept your invitation and set up your account, click the link below:
${inviteResult.inviteLink}

This invitation expires in 7 days.

If you have any questions, contact your administrator or call (877) 840-6250.

Best regards,
Traffik Boosters Team
More Traffik! More Sales!`);

      window.open(`mailto:${inviteData.email}?subject=${subject}&body=${body}`);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-[hsl(14,88%,55%)]" />
            Send User Invitation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={inviteData.firstName}
                onChange={(e) => setInviteData(prev => ({ ...prev, firstName: e.target.value }))}
                placeholder="Steve"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={inviteData.lastName}
                onChange={(e) => setInviteData(prev => ({ ...prev, lastName: e.target.value }))}
                placeholder="Williams"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={inviteData.email}
              onChange={(e) => setInviteData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="steve.williams@traffikboosters.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select 
              value={inviteData.role} 
              onValueChange={(value) => setInviteData(prev => ({ ...prev, role: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sales_rep">Sales Representative</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="admin">Administrator</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={handleInviteUser}
            disabled={isInviting}
            className="w-full"
            style={{ backgroundColor: 'hsl(29, 85%, 58%)' }}
          >
            {isInviting ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                Preparing Invitation...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Generate Invitation Link
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {inviteResult && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Invitation Generated Successfully
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-white rounded border">
              <p className="text-sm text-gray-600 mb-2">Invitation Details:</p>
              <p className="font-medium">{inviteResult.message}</p>
              <p className="text-sm text-gray-500">Expires: {new Date(inviteResult.expires).toLocaleString()}</p>
            </div>

            <div className="p-3 bg-white rounded border">
              <p className="text-sm text-gray-600 mb-2">Secure Access Link:</p>
              <div className="flex items-center gap-2">
                <Input
                  value={inviteResult.inviteLink}
                  readOnly
                  className="font-mono text-xs"
                />
                <Button
                  onClick={copyInviteLink}
                  variant="outline"
                  size="sm"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={openEmailClient}
                variant="outline"
                className="flex-1"
              >
                <Mail className="w-4 h-4 mr-2" />
                Open Email Client
              </Button>
              <Button
                onClick={copyInviteLink}
                variant="outline"
                className="flex-1"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Link
              </Button>
            </div>

            <div className="text-sm text-gray-600 p-3 bg-white rounded border">
              <p className="font-medium mb-1">Next Steps:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Send the invitation link to Steve Williams</li>
                <li>Steve will create his account and password</li>
                <li>He'll have full access to Starz platform</li>
                <li>Account includes sales tools, CRM, and phone system</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-[hsl(14,88%,55%)]" />
            Quick Invite: Steve Williams
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Send a pre-filled invitation to Steve Williams at Traffik Boosters
          </p>
          <Button 
            onClick={() => {
              setInviteData({
                email: 'steve.williams@traffikboosters.com',
                firstName: 'Steve',
                lastName: 'Williams',
                role: 'sales_rep'
              });
            }}
            variant="outline"
            className="w-full"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Pre-fill Steve Williams Details
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}