"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Step1() {
  const router = useRouter();
  const [accepted, setAccepted] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    dateOfBirth: "",
    companion: "",
  });

  const handleSubmit = async () => {
    try {
      const response = await fetch("/api/identity/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(`Error: ${error.detail || "Failed to create identity"}`);
        return;
      }

      const data = await response.json();
      
      // Store in session
      sessionStorage.setItem("civic_identity", JSON.stringify({ 
        ...formData,
        ...data 
      }));

      router.push("/onboarding/step2");
    } catch (error) {
      console.error("Error creating identity:", error);
      alert("Failed to create identity. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h2 className="text-4xl font-bold mb-8 text-center">Civic Oath</h2>

        <div className="bg-white p-8 rounded-lg shadow-lg mb-8">
          <h3 className="text-2xl font-semibold mb-4">Terms & Charter</h3>
          
          <div className="prose mb-6">
            <p className="mb-4">By joining Civic OS, you agree to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Integrity first; symbiosis over extraction</li>
              <li>Your reflections are yours, sealed to your ledger</li>
              <li>Operate under the Custos Charter principles</li>
              <li>Maintain GI ≥ 0.92 for governance participation</li>
            </ul>
          </div>

          <label className="flex items-center space-x-3">
            <input 
              type="checkbox" 
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="w-5 h-5"
            />
            <span>I understand and accept the Civic Oath</span>
          </label>
        </div>

        {accepted && (
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h3 className="text-2xl font-semibold mb-6">Create Your Identity</h3>

            <div className="space-y-4">
              <div>
                <label className="block mb-2 font-medium">Username (your .gic domain)</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="michael"
                />
                <p className="text-sm text-gray-600 mt-1">
                  Will become: {formData.username ? `${formData.username}.gic.civic.os` : "username.gic.civic.os"}
                </p>
              </div>

              <div>
                <label className="block mb-2 font-medium">Date of Birth</label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-600 mt-1">
                  Used for Bio-DNA entropy (never public)
                </p>
              </div>

              <div>
                <label className="block mb-2 font-medium">Choose Your Companion</label>
                <select
                  value={formData.companion}
                  onChange={(e) => setFormData({...formData, companion: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select...</option>
                  <option value="JADE">JADE - The Builder (Rationality: 0.95)</option>
                  <option value="EVE">EVE - The Reflector (Empathy: 0.95)</option>
                  <option value="ZEUS">ZEUS - The Arbiter (Balance: 0.88)</option>
                  <option value="HERMES">HERMES - The Messenger (Communication: 0.82)</option>
                </select>
              </div>

              <button
                onClick={handleSubmit}
                disabled={!formData.username || !formData.dateOfBirth || !formData.companion}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
              >
                Create Identity →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
