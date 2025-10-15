// reflections/src/components/HealthDashboard.tsx
import React, { useState, useEffect } from 'react';

interface HealthCheck {
  name: string;
  status: 'healthy' | 'warning' | 'critical' | 'unknown';
  message: string;
  duration_ms: number;
  metadata?: Record<string, any>;
}

interface HealthStatus {
  status: string;
  timestamp: string;
  checks: HealthCheck[];
  system_info: Record<string, any>;
  consecutive_failures: number;
  last_alert?: string;
}

interface HealthDashboardProps {
  apiBaseUrl?: string;
}

const HealthDashboard: React.FC<HealthDashboardProps> = ({ 
  apiBaseUrl = 'http://localhost:8000' 
}) => {
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchHealthStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiBaseUrl}/health/status`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setHealthStatus(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch health status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthStatus();
    
    if (autoRefresh) {
      const interval = setInterval(fetchHealthStatus, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh, apiBaseUrl]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return '#10b981'; // green
      case 'warning':
        return '#f59e0b'; // yellow
      case 'critical':
        return '#ef4444'; // red
      default:
        return '#6b7280'; // gray
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'critical':
        return '🚨';
      default:
        return '❓';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  if (loading && !healthStatus) {
    return (
      <div className="health-dashboard">
        <div className="loading">Loading health status...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="health-dashboard">
        <div className="error">
          <h3>Health Status Error</h3>
          <p>{error}</p>
          <button onClick={fetchHealthStatus}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="health-dashboard">
      <div className="dashboard-header">
        <h2>Health Dashboard</h2>
        <div className="controls">
          <label>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            Auto Refresh
          </label>
          <button onClick={fetchHealthStatus} disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {healthStatus && (
        <>
          <div className="overall-status">
            <div 
              className="status-card"
              style={{ borderColor: getStatusColor(healthStatus.status) }}
            >
              <div className="status-header">
                <span className="status-icon">
                  {getStatusIcon(healthStatus.status)}
                </span>
                <span className="status-text">
                  {healthStatus.status.toUpperCase()}
                </span>
              </div>
              <div className="status-details">
                <p>Last Check: {formatTimestamp(healthStatus.timestamp)}</p>
                {healthStatus.consecutive_failures > 0 && (
                  <p>Consecutive Failures: {healthStatus.consecutive_failures}</p>
                )}
                {healthStatus.last_alert && (
                  <p>Last Alert: {formatTimestamp(healthStatus.last_alert)}</p>
                )}
              </div>
            </div>
          </div>

          <div className="health-checks">
            <h3>Health Checks</h3>
            <div className="checks-grid">
              {healthStatus.checks.map((check, index) => (
                <div 
                  key={index}
                  className="check-card"
                  style={{ borderColor: getStatusColor(check.status) }}
                >
                  <div className="check-header">
                    <span className="check-icon">
                      {getStatusIcon(check.status)}
                    </span>
                    <span className="check-name">{check.name}</span>
                    <span className="check-duration">
                      {check.duration_ms.toFixed(1)}ms
                    </span>
                  </div>
                  <div className="check-message">{check.message}</div>
                  {check.metadata && Object.keys(check.metadata).length > 0 && (
                    <div className="check-metadata">
                      <details>
                        <summary>Details</summary>
                        <pre>{JSON.stringify(check.metadata, null, 2)}</pre>
                      </details>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {healthStatus.system_info && (
            <div className="system-info">
              <h3>System Information</h3>
              <div className="system-grid">
                {Object.entries(healthStatus.system_info).map(([key, value]) => (
                  <div key={key} className="system-item">
                    <span className="system-key">{key}:</span>
                    <span className="system-value">
                      {typeof value === 'number' ? value.toFixed(2) : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <style jsx>{`
        .health-dashboard {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .controls {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .controls label {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .controls button {
          padding: 8px 16px;
          background: #1a1d24;
          border: 1px solid #2a2f3a;
          color: #cfd7e3;
          border-radius: 6px;
          cursor: pointer;
        }

        .controls button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .overall-status {
          margin-bottom: 30px;
        }

        .status-card {
          border: 2px solid;
          border-radius: 12px;
          padding: 20px;
          background: #1a1d24;
        }

        .status-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
        }

        .status-icon {
          font-size: 24px;
        }

        .status-text {
          font-size: 20px;
          font-weight: bold;
        }

        .status-details p {
          margin: 5px 0;
          color: #9ca3af;
        }

        .health-checks {
          margin-bottom: 30px;
        }

        .checks-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 15px;
        }

        .check-card {
          border: 1px solid;
          border-radius: 8px;
          padding: 15px;
          background: #1a1d24;
        }

        .check-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 8px;
        }

        .check-name {
          font-weight: bold;
          flex: 1;
        }

        .check-duration {
          color: #9ca3af;
          font-size: 12px;
        }

        .check-message {
          color: #d1d5db;
          font-size: 14px;
        }

        .check-metadata {
          margin-top: 10px;
        }

        .check-metadata details {
          color: #9ca3af;
        }

        .check-metadata pre {
          background: #0f1116;
          padding: 10px;
          border-radius: 4px;
          font-size: 12px;
          overflow-x: auto;
        }

        .system-info {
          margin-bottom: 30px;
        }

        .system-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 10px;
        }

        .system-item {
          display: flex;
          justify-content: space-between;
          padding: 8px 12px;
          background: #1a1d24;
          border: 1px solid #2a2f3a;
          border-radius: 6px;
        }

        .system-key {
          color: #9ca3af;
        }

        .system-value {
          color: #d1d5db;
          font-weight: bold;
        }

        .loading, .error {
          text-align: center;
          padding: 40px;
        }

        .error button {
          margin-top: 10px;
          padding: 8px 16px;
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default HealthDashboard;