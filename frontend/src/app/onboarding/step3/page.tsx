"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Step3() {
  const router = useRouter();
  const [identity, setIdentity] = useState<any>(null);
  const [config, setConfig] = useState({
    theme: "light",
    notifications: true,
    privacy: "standard",
    companion_frequency: "daily"
  });
  const [sealing, setSealing] = useState(false);

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

  const handleSeal = async () => {
    setSealing(true);
    try {
      const response = await fetch("/api/domain/seal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identity: identity.identityId,
          config: config,
          companion: identity.companion
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(`Error: ${error.detail || "Failed to seal domain"}`);
        return;
      }

      const data = await response.json();
      
      // Store sealing result
      const updatedIdentity = { 
        ...identity, 
        sealed: true,
        sealHash: data.hash,
        sealTimestamp: data.timestamp
      };
      sessionStorage.setItem("civic_identity", JSON.stringify(updatedIdentity));

      router.push("/onboarding/step4");
    } catch (error) {
      console.error("Error sealing domain:", error);
      alert("Failed to seal domain. Please try again.");
    } finally {
      setSealing(false);
    }
  };

  if (!identity) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h2 className="text-4xl font-bold mb-8 text-center">Domain Sealing</h2>

        <div className="bg-white p-8 rounded-lg shadow-lg mb-8">
          <h3 className="text-2xl font-semibold mb-4">Configure Your Domain</h3>
          
          <div className="bg-purple-50 p-4 rounded-lg mb-6">
            <h4 className="font-semibold mb-2">Domain: {identity.domain}</h4>
            <p className="text-sm text-gray-600">
              Your domain configuration will be sealed to the Civic Ledger, ensuring 
              immutability and integrity of your settings.
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block mb-2 font-medium">Theme Preference</label>
              <select
                value={config.theme}
                onChange={(e) => setConfig({...config, theme: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="light">Light Theme</option>
                <option value="dark">Dark Theme</option>
                <option value="auto">Auto (System)</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 font-medium">Notifications</label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="notifications"
                    checked={config.notifications}
                    onChange={() => setConfig({...config, notifications: true})}
                    className="mr-2"
                  />
                  Enabled
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="notifications"
                    checked={!config.notifications}
                    onChange={() => setConfig({...config, notifications: false})}
                    className="mr-2"
                  />
                  Disabled
                </label>
              </div>
            </div>

            <div>
              <label className="block mb-2 font-medium">Privacy Level</label>
              <select
                value={config.privacy}
                onChange={(e) => setConfig({...config, privacy: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="public">Public (Open reflections)</option>
                <option value="standard">Standard (Selective sharing)</option>
                <option value="private">Private (Companion only)</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 font-medium">Companion Interaction Frequency</label>
              <select
                value={config.companion_frequency}
                onChange={(e) => setConfig({...config, companion_frequency: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="realtime">Real-time (Always available)</option>
                <option value="daily">Daily check-ins</option>
                <option value="weekly">Weekly summaries</option>
                <option value="on-demand">On-demand only</option>
              </select>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg mb-6">
            <h4 className="font-semibold mb-2">⚠️ Important</h4>
            <p className="text-sm text-gray-700">
              Once sealed, your domain configuration becomes immutable and will be 
              recorded on the Civic Ledger. Changes require a new domain or 
              constitutional amendment process.
            </p>
          </div>

          <button
            onClick={handleSeal}
            disabled={sealing}
            className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
          >
            {sealing ? "Sealing Domain..." : "Seal Domain to Ledger →"}
          </button>
        </div>
      </div>
    </div>
  );
}