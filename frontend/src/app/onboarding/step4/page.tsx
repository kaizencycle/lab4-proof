"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Step4() {
  const router = useRouter();
  const [identity, setIdentity] = useState<any>(null);
  const [reflection, setReflection] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Load identity from session
    const stored = sessionStorage.getItem("civic_identity");
    if (stored) {
      setIdentity(JSON.parse(stored));
    } else {
      router.push("/onboarding/step1");
      return;
    }
  }, [router]);

  const handleSubmitReflection = async () => {
    if (!reflection.trim()) return;

    setSubmitting(true);
    try {
      // In a real implementation, this would save to the ledger
      const reflectionData = {
        id: Date.now().toString(),
        content: reflection,
        timestamp: new Date().toISOString(),
        identity: identity.identityId,
        companion: identity.companion
      };

      // Store in session for now
      const existingReflections = JSON.parse(
        sessionStorage.getItem("civic_reflections") || "[]"
      );
      existingReflections.push(reflectionData);
      sessionStorage.setItem("civic_reflections", JSON.stringify(existingReflections));

      // Calculate initial GI score
      const giScore = await fetch("/api/integrity/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identityId: identity.identityId }),
      }).then(res => res.json()).then(data => data.score || 1.0);

      // Store GI score
      const updatedIdentity = { ...identity, giScore, firstReflection: true };
      sessionStorage.setItem("civic_identity", JSON.stringify(updatedIdentity));

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (error) {
      console.error("Error submitting reflection:", error);
      alert("Failed to submit reflection. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!identity) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-cyan-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h2 className="text-4xl font-bold mb-8 text-center">First Reflection</h2>

        <div className="bg-white p-8 rounded-lg shadow-lg mb-8">
          <h3 className="text-2xl font-semibold mb-4">Welcome to Civic OS, {identity.username}!</h3>
          
          <div className="bg-green-50 p-4 rounded-lg mb-6">
            <h4 className="font-semibold mb-2">✅ Domain Successfully Sealed</h4>
            <div className="text-sm space-y-1">
              <p><strong>Domain:</strong> {identity.domain}</p>
              <p><strong>Seal Hash:</strong> {identity.sealHash?.substring(0, 16)}...</p>
              <p><strong>Sealed:</strong> {new Date(identity.sealTimestamp).toLocaleString()}</p>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-4">Your First Reflection</h4>
            <p className="text-gray-600 mb-4">
              Begin your journey with a reflection on what brought you to Civic OS. 
              This will be your first entry in your personal ledger.
            </p>

            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <h5 className="font-semibold mb-2">Companion: {identity.companion}</h5>
              <p className="text-sm text-gray-600">
                {identity.companion === "JADE" && "Focus on clarity and precision in your thoughts."}
                {identity.companion === "EVE" && "Reflect deeply on your emotions and motivations."}
                {identity.companion === "ZEUS" && "Consider the balance and ethics in your decisions."}
                {identity.companion === "HERMES" && "Express your thoughts clearly and connect ideas."}
              </p>
            </div>

            <textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="What brings you to Civic OS? What are your hopes and intentions for this journey?..."
              className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            />
            <p className="text-sm text-gray-500 mt-1">
              {reflection.length} characters
            </p>
          </div>

          <div className="bg-indigo-50 p-4 rounded-lg mb-6">
            <h4 className="font-semibold mb-2">What Happens Next?</h4>
            <ul className="text-sm space-y-1">
              <li>• Your reflection will be sealed to your personal ledger</li>
              <li>• Your GI (Governance Integrity) score will be calculated</li>
              <li>• You'll gain access to the full Civic OS dashboard</li>
              <li>• Your companion will be ready to assist you</li>
            </ul>
          </div>

          <button
            onClick={handleSubmitReflection}
            disabled={!reflection.trim() || submitting}
            className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
          >
            {submitting ? "Sealing Reflection..." : "Complete Onboarding →"}
          </button>
        </div>
      </div>
    </div>
  );
}