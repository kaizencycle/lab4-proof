"use client";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-4xl mx-auto px-4 py-20">
        <h1 className="text-6xl font-bold text-center mb-6">
          Welcome to Your Civic Home
        </h1>
        
        <p className="text-xl text-center text-gray-700 mb-12">
          Create your sovereign .gic domain and join the Civic OS ecosystem
        </p>

        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <CompanionCard name="JADE" role="Builder" />
          <CompanionCard name="EVE" role="Reflector" />
          <CompanionCard name="ZEUS" role="Arbiter" />
          <CompanionCard name="HERMES" role="Messenger" />
        </div>

        <div className="text-center">
          <Link 
            href="/onboarding/step1"
            className="px-12 py-4 bg-blue-600 text-white rounded-lg text-xl hover:bg-blue-700 transition"
          >
            Begin Your Journey →
          </Link>
        </div>

        <div className="mt-16 text-center text-sm text-gray-600">
          <p>Civic OS • Integrity First • Symbiosis Over Extraction</p>
        </div>
      </div>
    </main>
  );
}

function CompanionCard({ name, role }: { name: string; role: string }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg text-center">
      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white font-bold text-xl">
        {name[0]}
      </div>
      <h3 className="text-lg font-semibold mb-2">{name}</h3>
      <p className="text-sm text-gray-600">{role}</p>
    </div>
  );
}
