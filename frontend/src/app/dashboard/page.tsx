"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const [identity, setIdentity] = useState<any>(null);
  const [reflections, setReflections] = useState<any[]>([]);
  const [giScore, setGiScore] = useState(1.0);

  useEffect(() => {
    // Load identity from session
    const stored = sessionStorage.getItem("civic_identity");
    if (stored) {
      setIdentity(JSON.parse(stored));
    } else {
      router.push("/onboarding/step1");
      return;
    }

    // Load reflections
    const storedReflections = sessionStorage.getItem("civic_reflections");
    if (storedReflections) {
      setReflections(JSON.parse(storedReflections));
    }

    // Load GI score
    if (stored) {
      const parsed = JSON.parse(stored);
      setGiScore(parsed.giScore || 1.0);
    }
  }, [router]);

  const getGiColor = (score: number) => {
    if (score >= 0.95) return "text-green-600";
    if (score >= 0.92) return "text-yellow-600";
    return "text-red-600";
  };

  const getGiStatus = (score: number) => {
    if (score >= 0.95) return "Excellent";
    if (score >= 0.92) return "Good";
    return "Needs Attention";
  };

  if (!identity) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {identity.username}
              </h1>
              <p className="text-gray-600 mt-1">{identity.domain}</p>
            </div>
            <div className="text-right">
              <div className={`text-2xl font-bold ${getGiColor(giScore)}`}>
                GI: {giScore.toFixed(3)}
              </div>
              <div className="text-sm text-gray-500">
                {getGiStatus(giScore)}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Reflections</h3>
            <div className="text-3xl font-bold text-blue-600">{reflections.length}</div>
            <p className="text-sm text-gray-500">Total entries</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Companion</h3>
            <div className="text-3xl font-bold text-purple-600">{identity.companion}</div>
            <p className="text-sm text-gray-500">AI Assistant</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">GIC Wallet</h3>
            <div className="text-lg font-mono text-green-600">{identity.gicWallet}</div>
            <p className="text-sm text-gray-500">Civic Token</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Status</h3>
            <div className="text-3xl font-bold text-green-600">Active</div>
            <p className="text-sm text-gray-500">Citizen</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Reflections */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Reflections</h2>
              
              {reflections.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No reflections yet</p>
                  <button
                    onClick={() => router.push("/reflections/new")}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Start Your First Reflection
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {reflections.slice(0, 5).map((reflection) => (
                    <div key={reflection.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-500">
                          {new Date(reflection.timestamp).toLocaleDateString()}
                        </span>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {reflection.companion}
                        </span>
                      </div>
                      <p className="text-gray-700 line-clamp-3">
                        {reflection.content}
                      </p>
                    </div>
                  ))}
                  
                  {reflections.length > 5 && (
                    <button
                      onClick={() => router.push("/reflections")}
                      className="w-full text-center py-2 text-blue-600 hover:text-blue-700 transition"
                    >
                      View All Reflections ({reflections.length})
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Constitutional Status */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Constitutional Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Charter Compliance</span>
                  <span className="text-green-600 font-semibold">✓ Active</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Ledger Integrity</span>
                  <span className="text-green-600 font-semibold">✓ Verified</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Governance Access</span>
                  <span className={giScore >= 0.92 ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                    {giScore >= 0.92 ? "✓ Eligible" : "✗ Ineligible"}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => router.push("/reflections/new")}
                  className="w-full text-left px-4 py-2 text-blue-600 hover:bg-blue-50 rounded transition"
                >
                  New Reflection
                </button>
                <button
                  onClick={() => router.push("/companion")}
                  className="w-full text-left px-4 py-2 text-purple-600 hover:bg-purple-50 rounded transition"
                >
                  Chat with {identity.companion}
                </button>
                <button
                  onClick={() => router.push("/ledger")}
                  className="w-full text-left px-4 py-2 text-green-600 hover:bg-green-50 rounded transition"
                >
                  View Ledger
                </button>
                <button
                  onClick={() => router.push("/governance")}
                  className="w-full text-left px-4 py-2 text-orange-600 hover:bg-orange-50 rounded transition"
                >
                  Governance
                </button>
              </div>
            </div>

            {/* Companion Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Companion</h3>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl font-bold text-purple-600">
                    {identity.companion.charAt(0)}
                  </span>
                </div>
                <h4 className="font-semibold text-gray-900">{identity.companion}</h4>
                <p className="text-sm text-gray-600 mt-1">
                  {identity.companion === "JADE" && "The Builder - Precision & Analysis"}
                  {identity.companion === "EVE" && "The Reflector - Empathy & Wisdom"}
                  {identity.companion === "ZEUS" && "The Arbiter - Justice & Balance"}
                  {identity.companion === "HERMES" && "The Messenger - Communication & Connection"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}