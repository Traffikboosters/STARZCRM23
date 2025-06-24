import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, RefreshCw, DollarSign, FileText, AlertTriangle } from "lucide-react";
import traffikBoostersLogo from "@assets/newTRAFIC BOOSTERS3 copy_1750608395971.png";

interface WorkOrderAgreementProps {
  workOrderNumber: string;
  clientName: string;
  serviceDescription: string;
  totalAmount: string;
  startDate: string;
  estimatedCompletion: string;
  projectManager: string;
}

export default function WorkOrderAgreement({
  workOrderNumber,
  clientName,
  serviceDescription,
  totalAmount,
  startDate,
  estimatedCompletion,
  projectManager
}: WorkOrderAgreementProps) {
  const currentDate = new Date().toLocaleDateString();
  
  return (
    <div className="max-w-4xl mx-auto bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <img 
            src={traffikBoostersLogo} 
            alt="Traffik Boosters" 
            className="h-16 w-auto"
          />
          <div className="text-right">
            <h1 className="text-2xl font-bold text-gray-900">WORK ORDER AGREEMENT</h1>
            <p className="text-sm text-gray-600">Order #: {workOrderNumber}</p>
            <p className="text-sm text-gray-600">Date: {currentDate}</p>
          </div>
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-[#e45c2b]">More Traffik! More Sales!</p>
          <p className="text-sm text-gray-600">Professional Digital Marketing Services</p>
        </div>
      </div>

      {/* Client Information */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold mb-4">Client Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="font-medium">Client Name:</p>
            <p className="text-gray-700">{clientName}</p>
          </div>
          <div>
            <p className="font-medium">Project Manager:</p>
            <p className="text-gray-700">{projectManager}</p>
          </div>
        </div>
      </div>

      {/* Service Details */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold mb-4">Service Details</h2>
        <div className="space-y-4">
          <div>
            <p className="font-medium">Service Description:</p>
            <p className="text-gray-700">{serviceDescription}</p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-[#e45c2b]" />
              <div>
                <p className="font-medium text-sm">Start Date:</p>
                <p className="text-gray-700 text-sm">{startDate}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-[#e45c2b]" />
              <div>
                <p className="font-medium text-sm">Estimated Completion:</p>
                <p className="text-gray-700 text-sm">{estimatedCompletion}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-[#e45c2b]" />
              <div>
                <p className="font-medium text-sm">Total Amount:</p>
                <p className="text-gray-700 text-sm font-semibold">{totalAmount}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Refund Policy */}
      <div className="p-6 border-b border-gray-200 bg-yellow-50">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div className="flex-1">
            <h2 className="text-lg font-semibold mb-4 text-yellow-800">REFUND POLICY</h2>
            <div className="space-y-3">
              <Card className="border-yellow-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center space-x-2">
                    <RefreshCw className="h-4 w-4 text-green-600" />
                    <span>3-Day Full Refund Period</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">100% Refund</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-gray-700">
                    Client may request a full refund within <strong>3 business days</strong> from the work order start date. 
                    No questions asked, full amount will be refunded within 5-7 business days.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-yellow-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center space-x-2">
                    <RefreshCw className="h-4 w-4 text-orange-600" />
                    <span>After 3-Day Period</span>
                    <Badge variant="secondary" className="bg-orange-100 text-orange-800">50% Refund</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-gray-700">
                    After the 3-day period, client may request a 50% refund of the total amount paid. 
                    This applies to work not yet completed or delivered.
                  </p>
                </CardContent>
              </Card>

              <div className="bg-yellow-100 p-3 rounded-md border border-yellow-300">
                <p className="text-xs text-yellow-800 font-medium">
                  <strong>Important:</strong> Refund requests must be submitted in writing via email to support@traffikboosters.com. 
                  Completed and delivered work may not be eligible for refund under the 50% policy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Work Timeline */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold mb-4">Work Timeline & Milestones</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
            <span className="font-medium">Project Kickoff</span>
            <span className="text-sm text-gray-600">{startDate}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
            <span className="font-medium">3-Day Refund Period Ends</span>
            <span className="text-sm text-red-600 font-medium">
              {new Date(new Date(startDate).getTime() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
            <span className="font-medium">Estimated Completion</span>
            <span className="text-sm text-gray-600">{estimatedCompletion}</span>
          </div>
        </div>
      </div>

      {/* Terms and Conditions */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold mb-4">Terms and Conditions</h2>
        <div className="space-y-2 text-sm text-gray-700">
          <p>• Client agrees to provide all necessary materials, access, and information required for project completion.</p>
          <p>• Traffik Boosters will deliver services as outlined in the scope of work within the estimated timeframe.</p>
          <p>• Any changes to the scope of work must be agreed upon in writing and may result in additional charges.</p>
          <p>• Client is responsible for timely feedback and approvals to maintain project timeline.</p>
          <p>• Payment terms: Net 30 days from invoice date unless otherwise specified.</p>
          <p>• This agreement is governed by the laws of the United States.</p>
        </div>
      </div>

      {/* Signatures */}
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-6">Agreement Signatures</h2>
        <div className="grid grid-cols-2 gap-8">
          <div>
            <h3 className="font-medium mb-4">Client Acceptance</h3>
            <div className="border-b border-gray-300 mb-2 pb-8"></div>
            <p className="text-sm text-gray-600">Client Signature</p>
            <div className="border-b border-gray-300 mb-2 pb-2 mt-4"></div>
            <p className="text-sm text-gray-600">Date</p>
          </div>
          <div>
            <h3 className="font-medium mb-4">Traffik Boosters</h3>
            <div className="border-b border-gray-300 mb-2 pb-8"></div>
            <p className="text-sm text-gray-600">Authorized Representative</p>
            <div className="border-b border-gray-300 mb-2 pb-2 mt-4"></div>
            <p className="text-sm text-gray-600">Date</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 bg-gray-100 text-center">
        <p className="text-xs text-gray-600">
          Traffik Boosters - Professional Digital Marketing Services | Phone: (877) 840-6250 | Email: support@traffikboosters.com
        </p>
      </div>
    </div>
  );
}