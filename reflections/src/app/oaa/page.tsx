export default function OAAPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">OAA (Operational AI Assistant)</h1>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-2">System Status</h2>
        <p className="text-gray-700">
          The OAA is currently monitoring all lab systems and maintaining operational continuity.
        </p>
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
            <span>Lab7 OAA: Operational</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></span>
            <span>Lab4 Frontend: Degraded Performance</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
            <span>Lab6 Shield: Operational</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
            <span>Civic Ledger: Offline</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-gray-400 rounded-full"></span>
            <span>GIC Index: Unknown Status</span>
          </div>
        </div>
      </div>
    </div>
  );
}