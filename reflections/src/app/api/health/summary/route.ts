import { NextResponse } from 'next/server';

type LabKey = "lab7" | "lab4" | "lab6" | "ledger" | "gic";
type Status = "up" | "down" | "degraded" | "unknown";

interface HealthSummary {
  labStatus: Partial<Record<LabKey, Status>>;
  oaaLearning: boolean;
  lastUpdated: string;
}

// Mock health data - replace with actual health checks
async function getHealthData(): Promise<HealthSummary> {
  // In a real implementation, this would check:
  // - Lab7 OAA service health
  // - Lab4 Frontend health  
  // - Lab6 Shield service health
  // - Civic Ledger integrity
  // - GIC Index service health
  
  return {
    labStatus: {
      lab7: "up",
      lab4: "degraded", 
      lab6: "up",
      ledger: "down",
      gic: "unknown"
    },
    oaaLearning: false, // Set to true when OAA is actively learning
    lastUpdated: new Date().toISOString()
  };
}

export async function GET() {
  try {
    const healthData = await getHealthData();
    return NextResponse.json(healthData);
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      { 
        labStatus: {},
        oaaLearning: false,
        lastUpdated: new Date().toISOString(),
        error: 'Health check failed'
      },
      { status: 500 }
    );
  }
}