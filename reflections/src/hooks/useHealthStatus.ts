import { useState, useEffect } from 'react';

type LabKey = "lab7" | "lab4" | "lab6" | "ledger" | "gic";
type Status = "up" | "down" | "degraded" | "unknown";

interface HealthData {
  labStatus: Partial<Record<LabKey, Status>>;
  oaaLearning: boolean;
  lastUpdated: string;
}

export function useHealthStatus() {
  const [healthData, setHealthData] = useState<HealthData>({
    labStatus: {},
    oaaLearning: false,
    lastUpdated: new Date().toISOString()
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHealthData = async () => {
      try {
        const response = await fetch('/api/health/summary');
        if (!response.ok) {
          throw new Error('Failed to fetch health data');
        }
        const data = await response.json();
        setHealthData(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        // Fallback to default status
        setHealthData({
          labStatus: {
            lab7: "unknown",
            lab4: "unknown",
            lab6: "unknown",
            ledger: "unknown",
            gic: "unknown"
          },
          oaaLearning: false,
          lastUpdated: new Date().toISOString()
        });
      } finally {
        setLoading(false);
      }
    };

    fetchHealthData();
    
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchHealthData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return { healthData, loading, error };
}