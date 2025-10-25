"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Step2() {
  const router = useRouter();
  const [identity, setIdentity] = useState<any>(null);
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");

  useEffect(() => {
    // Load identity from session
    const stored = sessionStorage.getItem("civic_identity");
    if (stored) {
      setIdentity(JSON.parse(stored));
    } else {
      router.push("/onboarding/step1");
      return;
    }

    // Load templates
    fetch("/api/templates")
      .then(res => res.json())
      .then(data => setTemplates(data.templates || []))
      .catch(err => console.error("Failed to load templates:", err));
  }, [router]);

  const handleNext = () => {
    if (selectedTemplate) {
      // Store template selection
      const updatedIdentity = { ...identity, template: selectedTemplate };
      sessionStorage.setItem("civic_identity", JSON.stringify(updatedIdentity));
      router.push("/onboarding/step3");
    }
  };

  if (!identity) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-4xl font-bold mb-8 text-center">Guided Setup</h2>

        <div className="bg-white p-8 rounded-lg shadow-lg mb-8">
          <h3 className="text-2xl font-semibold mb-4">Welcome, {identity.username}!</h3>
          
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <h4 className="font-semibold mb-2">Your Civic Identity</h4>
            <div className="space-y-1 text-sm">
              <p><strong>Domain:</strong> {identity.domain}</p>
              <p><strong>GIC Wallet:</strong> {identity.gicWallet}</p>
              <p><strong>Companion:</strong> {identity.companion}</p>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-4">Choose Your Domain Template</h4>
            <p className="text-gray-600 mb-4">
              Select a template that reflects your personality and goals. You can customize it later.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition ${
                    selectedTemplate === template.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setSelectedTemplate(template.id)}
                >
                  <h5 className="font-semibold mb-2">{template.name}</h5>
                  <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {template.features.map((feature: string) => (
                      <span
                        key={feature}
                        className="px-2 py-1 bg-gray-100 text-xs rounded"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg mb-6">
            <h4 className="font-semibold mb-2">Next Steps</h4>
            <ul className="text-sm space-y-1">
              <li>• Configure your domain settings</li>
              <li>• Set up your reflection preferences</li>
              <li>• Connect with your companion AI</li>
              <li>• Begin your first reflection</li>
            </ul>
          </div>

          <button
            onClick={handleNext}
            disabled={!selectedTemplate}
            className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
          >
            Continue Setup →
          </button>
        </div>
      </div>
    </div>
  );
}