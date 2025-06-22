import MightyCallIntegration from "@/components/mightycall-integration";

export default function MightyCallPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">MightyCall Integration</h1>
          <p className="text-gray-600 mt-2">
            Manage your phone system integration and click-to-call functionality
          </p>
        </div>
        <MightyCallIntegration />
      </div>
    </div>
  );
}