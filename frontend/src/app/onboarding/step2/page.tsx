"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Step2() {
  const router = useRouter();
  const [identity, setIdentity] = useState<any>(null);
  const [template, setTemplate] = useState("aurora");
  const [theme, setTheme] = useState("light");
  const [sections, setSections] = useState(["about", "reflections"]);

  useEffect(() => {
    const stored = sessionStorage.getItem("civic_identity");
    if (stored) {
      setIdentity(JSON.parse(stored));
    } else {
      router.push("/onboarding/step1");
    }
  }, [router]);

  const companionMessages = {
    JADE: "Let's build your home with precision and clarity.",
    EVE: "I'll help you reflect on what matters most to you.",
    ZEUS: "Choose wisely - your domain represents your civic presence.",
    HERMES: "I'll ensure your message reaches the network clearly.",
  };

  const handleContinue = () => {
    // Store configuration
    const config = { template, theme, sections };
    sessionStorage.setItem("domain_config", JSON.stringify(config));
    router.push("/onboarding/step3");
  };

  if (!identity) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Left: Companion Chat */}
          <div className="md:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white font-bold text-xl">
                {identity.companion[0]}
              </div>
              <h3 className="text-xl font-semibold text-center mb-4">{identity.companion}</h3>
              <p className="text-gray-700 text-center">
                "{companionMessages[identity.companion as keyof typeof companionMessages]}"
              </p>
            </div>
          </div>

          {/* Right: Customization */}
          <div className="md:col-span-2">
            <h2 className="text-3xl font-bold mb-6">Design Your .gic Home</h2>

            <div className="space-y-6">
              {/* Template Selection */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-semibold mb-4">Choose Template</h3>
                <div className="grid grid-cols-3 gap-4">
                  <TemplateCard 
                    id="aurora" 
                    name="Aurora" 
                    description="Clean, modern design"
                    active={template === "aurora"}
                    onClick={() => setTemplate("aurora")}
                  />
                  <TemplateCard 
                    id="echo" 
                    name="Echo" 
                    description="Conversational layout"
                    active={template === "echo"}
                    onClick={() => setTemplate("echo")}
                  />
                  <TemplateCard 
                    id="archive" 
                    name="Archive" 
                    description="Timeline-based design"
                    active={template === "archive"}
                    onClick={() => setTemplate("archive")}
                  />
                </div>
              </div>

              {/* Theme Selection */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-semibold mb-4">Theme</h3>
                <div className="flex gap-4">
                  <button 
                    className={`px-6 py-2 rounded ${theme === "light" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                    onClick={() => setTheme("light")}
                  >
                    Light
                  </button>
                  <button 
                    className={`px-6 py-2 rounded ${theme === "dark" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                    onClick={() => setTheme("dark")}
                  >
                    Dark
                  </button>
                </div>
              </div>

              {/* Sections */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-semibold mb-4">Add Sections</h3>
                <div className="space-y-2">
                  {[
                    { id: "about", name: "About Me" },
                    { id: "projects", name: "Projects" },
                    { id: "reflections", name: "Reflections" },
                    { id: "ledger", name: "Ledger Feed" }
                  ].map(section => (
                    <label key={section.id} className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        checked={sections.includes(section.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSections([...sections, section.id]);
                          } else {
                            setSections(sections.filter(s => s !== section.id));
                          }
                        }}
                        className="w-4 h-4"
                      />
                      <span>{section.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="bg-gray-100 p-8 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Preview:</p>
                <div className="bg-white p-4 rounded border-2 border-blue-500">
                  <h4 className="font-bold">{identity.domain}</h4>
                  <p className="text-sm text-gray-600">Template: {template} • Theme: {theme}</p>
                  <p className="text-sm text-gray-600">Sections: {sections.join(", ")}</p>
                </div>
              </div>

              <button
                onClick={handleContinue}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Continue to Sealing →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TemplateCard({ id, name, description, active, onClick }: {
  id: string;
  name: string;
  description: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`p-4 rounded-lg border-2 text-left transition ${
        active 
          ? "border-blue-500 bg-blue-50" 
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      <h4 className="font-semibold mb-1">{name}</h4>
      <p className="text-sm text-gray-600">{description}</p>
    </button>
  );
}
