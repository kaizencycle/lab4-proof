export default function DocsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Documentation</h1>
      <div className="space-y-4">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">API Documentation</h2>
          <p className="text-gray-700">Complete API reference for all Lab7 services.</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">Integration Guides</h2>
          <p className="text-gray-700">Step-by-step guides for integrating with Lab7 systems.</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">Troubleshooting</h2>
          <p className="text-gray-700">Common issues and their solutions.</p>
        </div>
      </div>
    </div>
  );
}