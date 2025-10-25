"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const [identity, setIdentity] = useState<any>(null);
  const [reflections, setReflections] = useState<any[]>([]);
  const [giScore, setGIScore] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const stored = sessionStorage.getItem("civic_identity");
      if (!stored) {
        router.push("/onboarding/step1");
        return;
      }
      
      const parsed = JSON.parse(stored);
      setIdentity(parsed);

      // Load reflections
      const reflsResponse = await fetch("/api/reflections/list");
      if (reflsResponse.ok) {
        const refls = await reflsResponse.json();
        setReflections(refls.data || []);
      }

      // Load GI score
      const giResponse = await fetch("/api/integrity/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identityId: parsed.identityId }),
      });
      
      if (giResponse.ok) {
        const gi = await giResponse.json();
        setGIScore(gi.score);
      }
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewReflection = () => {
    router.push("/reflections");
  };

  const handleViewLedger = () => {
    // TODO: Implement ledger view
    alert("Ledger view coming soon!");
  };

  const handleExportCapsule = () => {
    // TODO: Implement export functionality
    alert("Export functionality coming soon!");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!identity) {
    return <div className="min-h-screen flex items-center justify-center">No identity found</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Left Sidebar */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-4">Your Identity</h3>
              <p className="font-bold text-lg mb-2">{identity.username}.gic</p>
              <p className="text-sm text-gray-600">Companion: {identity.companion}</p>
              <p className="text-sm text-gray-600">GI Score: {giScore}</p>
              <p className="text-sm text-gray-600">Wallet: {identity.gicWallet}</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
              <button 
                onClick={handleNewReflection}
                className="w-full mb-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                New Reflection
              </button>
              <button 
                onClick={handleViewLedger}
                className="w-full mb-2 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition"
              >
                View Ledger
              </button>
              <button 
                onClick={handleExportCapsule}
                className="w-full px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition"
              >
                Export Capsule
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-2">
            <h2 className="text-3xl font-bold mb-6">Your Reflections</h2>
            
            <div className="space-y-4">
              {reflections.length === 0 ? (
                <div className="bg-white p-8 rounded-lg shadow text-center">
                  <p className="text-gray-600 mb-4">No reflections yet. Start your journey!</p>
                  <button
                    onClick={handleNewReflection}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Write Your First Reflection
                  </button>
                </div>
              ) : (
                reflections.map((reflection, index) => (
                  <div key={index} className="bg-white p-6 rounded-lg shadow">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm text-gray-600">
                        {new Date(reflection.timestamp || Date.now()).toLocaleDateString()}
                      </span>
                      <span className="text-xs bg-blue-100 px-2 py-1 rounded">
                        {reflection.tag || "reflection"}
                      </span>
                    </div>
                    <p className="text-gray-800">{reflection.content}</p>
                    {reflection.ledgerHash && (
                      <div className="mt-4 text-xs text-gray-500">
                        Sealed: {reflection.ledgerHash.substring(0, 16)}...
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
