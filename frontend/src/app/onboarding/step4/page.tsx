"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Step4() {
  const router = useRouter();
  const [reflection, setReflection] = useState("");
  const [companion, setCompanion] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const identity = sessionStorage.getItem("civic_identity");
    if (identity) {
      const parsed = JSON.parse(identity);
      setCompanion(parsed.companion);
    } else {
      router.push("/onboarding/step1");
    }
  }, [router]);

  const companionPrompts = {
    JADE: "What will you build in your new civic home?",
    EVE: "What is your first reflection inside your new world?",
    ZEUS: "How will you govern your digital presence?",
    HERMES: "What message do you want to share with the network?",
  };

  const handleSubmit = async () => {
    if (!reflection.trim()) return;
    
    setSubmitting(true);
    
    try {
      const identity = JSON.parse(sessionStorage.getItem("civic_identity") || "{}");
      
      // Save to Lab4 Memory Fabric (using existing API)
      const response = await fetch("/api/reflections/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: reflection,
          companion: companion,
          tag: "genesis",
          meta: {
            user: identity.identityId,
            domain: identity.domain,
            onboarding: true
          }
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save reflection");
      }

      // Mark onboarding as complete
      sessionStorage.setItem("onboarding_complete", "true");
      
      // Redirect to dashboard
      router.push("/dashboard");
    } catch (error) {
      console.error("Error saving reflection:", error);
      alert("Failed to save reflection. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!companion) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="mb-8 text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white font-bold text-2xl">
            {companion[0]}
          </div>
          <h2 className="text-3xl font-bold mb-2">
            {companion} says:
          </h2>
          <p className="text-xl text-gray-700">
            "{companionPrompts[companion as keyof typeof companionPrompts]}"
          </p>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-lg">
          <textarea
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            className="w-full h-64 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Write your first reflection..."
          />

          <div className="mt-4 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              This will be sealed to your ledger as your genesis block.
            </p>
            <button
              onClick={handleSubmit}
              disabled={!reflection.trim() || submitting}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
            >
              {submitting ? "Sealing..." : "Seal Reflection →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
