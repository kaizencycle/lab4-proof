"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function Home() {
  const router = useRouter();
  const [hasIdentity, setHasIdentity] = useState(false);

  useEffect(() => {
    // Check if user has existing identity
    const stored = sessionStorage.getItem("civic_identity");
    setHasIdentity(!!stored);
  }, []);

  const handleGetStarted = () => {
    if (hasIdentity) {
      router.push("/dashboard");
    } else {
      router.push("/onboarding/step1");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-white mb-6">
            Civic OS
          </h1>
          <p className="text-2xl text-blue-200 mb-8">
            Constitutional AI Governance Platform
          </p>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            Join the future of ethical AI governance. Create your civic identity, 
            engage with companion AIs, and participate in constitutional decision-making 
            through the power of reflection and integrity.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🛡️</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Constitutional Integrity</h3>
            <p className="text-gray-300">
              Operate under the Custos Charter with AI companions that prioritize 
              ethical behavior and human values.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
            <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🤖</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">AI Companions</h3>
            <p className="text-gray-300">
              Choose from JADE, EVE, ZEUS, or HERMES - each with unique capabilities 
              to guide your civic journey.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Governance Participation</h3>
            <p className="text-gray-300">
              Earn GI scores through reflection and participation. 
              Maintain GI ≥ 0.92 for governance access.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <button
            onClick={handleGetStarted}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xl font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
          >
            {hasIdentity ? "Go to Dashboard" : "Start Your Journey"}
          </button>
          
          {!hasIdentity && (
            <p className="text-gray-400 mt-4">
              Create your .gic domain and join the constitutional AI revolution
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-gray-400">
          <p className="mb-2">Powered by the Custos Charter v1.0</p>
          <p className="text-sm">
            Integrity First • Symbiosis Over Extraction • Reflection Sovereignty
          </p>
        </div>
      </div>
    </div>
  );
}