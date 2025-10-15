export default function OpsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Operations Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2 text-red-800">Critical Alerts</h2>
          <ul className="space-y-1 text-red-700">
            <li>• Civic Ledger service down</li>
            <li>• Lab4 performance degraded</li>
          </ul>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2 text-green-800">System Health</h2>
          <ul className="space-y-1 text-green-700">
            <li>• Lab7 OAA: Operational</li>
            <li>• Lab6 Shield: Operational</li>
          </ul>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2 text-yellow-800">Maintenance</h2>
          <ul className="space-y-1 text-yellow-700">
            <li>• Scheduled backup: 02:00 UTC</li>
            <li>• Security update pending</li>
          </ul>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2 text-blue-800">Metrics</h2>
          <ul className="space-y-1 text-blue-700">
            <li>• Uptime: 99.2%</li>
            <li>• Response time: 45ms avg</li>
          </ul>
        </div>
      </div>
    </div>
  );
}