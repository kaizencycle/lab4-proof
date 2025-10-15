// reflections/src/app/admin/health/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import HealthDashboard from '@/components/HealthDashboard';

interface HealthMetrics {
  period_hours: number;
  total_checks: number;
  uptime_percentage: number;
  status_counts: {
    healthy: number;
    warning: number;
    critical: number;
  };
  latest_system_info: Record<string, any>;
  average_response_times_ms: Record<string, number>;
  first_check: string;
  last_check: string;
}

interface Alert {
  timestamp: string;
  status: string;
  message: string;
  checks: any[];
  system_info: Record<string, any>;
}

const HealthPage: React.FC = () => {
  const [metrics, setMetrics] = useState<HealthMetrics | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState(24);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/health/metrics?hours=${timeRange}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setMetrics(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch metrics');
    } finally {
      setLoading(false);
    }
  };

  const fetchAlerts = async () => {
    try {
      const response = await fetch('/api/health/alerts?limit=20');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setAlerts(data.alerts || []);
    } catch (err) {
      console.error('Failed to fetch alerts:', err);
    }
  };

  useEffect(() => {
    fetchMetrics();
    fetchAlerts();
  }, [timeRange]);

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getUptimeColor = (percentage: number) => {
    if (percentage >= 99) return '#10b981';
    if (percentage >= 95) return '#f59e0b';
    return '#ef4444';
  };

  if (loading && !metrics) {
    return (
      <div className="health-page">
        <div className="loading">Loading health metrics...</div>
      </div>
    );
  }

  return (
    <div className="health-page">
      <div className="page-header">
        <h1>Health Monitoring</h1>
        <div className="controls">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(Number(e.target.value))}
          >
            <option value={1}>Last Hour</option>
            <option value={6}>Last 6 Hours</option>
            <option value={24}>Last 24 Hours</option>
            <option value={72}>Last 3 Days</option>
            <option value={168}>Last Week</option>
          </select>
          <button onClick={fetchMetrics} disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {error && (
        <div className="error">
          <h3>Error</h3>
          <p>{error}</p>
          <button onClick={fetchMetrics}>Retry</button>
        </div>
      )}

      {metrics && (
        <>
          <div className="metrics-overview">
            <div className="metric-card">
              <h3>Uptime</h3>
              <div 
                className="uptime-display"
                style={{ color: getUptimeColor(metrics.uptime_percentage) }}
              >
                {metrics.uptime_percentage.toFixed(2)}%
              </div>
              <p>Over {metrics.period_hours} hours</p>
            </div>

            <div className="metric-card">
              <h3>Total Checks</h3>
              <div className="metric-value">{metrics.total_checks}</div>
              <p>Health checks performed</p>
            </div>

            <div className="metric-card">
              <h3>Status Distribution</h3>
              <div className="status-breakdown">
                <div className="status-item healthy">
                  <span>Healthy: {metrics.status_counts.healthy}</span>
                </div>
                <div className="status-item warning">
                  <span>Warning: {metrics.status_counts.warning}</span>
                </div>
                <div className="status-item critical">
                  <span>Critical: {metrics.status_counts.critical}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="system-info">
            <h3>System Information</h3>
            <div className="system-grid">
              {Object.entries(metrics.latest_system_info).map(([key, value]) => (
                <div key={key} className="system-item">
                  <span className="system-key">{key}:</span>
                  <span className="system-value">
                    {typeof value === 'number' ? value.toFixed(2) : String(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {Object.keys(metrics.average_response_times_ms).length > 0 && (
            <div className="response-times">
              <h3>Average Response Times</h3>
              <div className="response-grid">
                {Object.entries(metrics.average_response_times_ms).map(([check, time]) => (
                  <div key={check} className="response-item">
                    <span className="response-check">{check}:</span>
                    <span className="response-time">{time.toFixed(1)}ms</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <div className="alerts-section">
        <h3>Recent Alerts</h3>
        {alerts.length === 0 ? (
          <p className="no-alerts">No recent alerts</p>
        ) : (
          <div className="alerts-list">
            {alerts.map((alert, index) => (
              <div key={index} className="alert-item">
                <div className="alert-header">
                  <span className="alert-status">{alert.status.toUpperCase()}</span>
                  <span className="alert-time">
                    {formatTimestamp(alert.timestamp)}
                  </span>
                </div>
                <div className="alert-message">{alert.message}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="live-dashboard">
        <h3>Live Health Dashboard</h3>
        <HealthDashboard apiBaseUrl="/api" />
      </div>

      <style jsx>{`
        .health-page {
          padding: 20px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .controls {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .controls select {
          padding: 8px 12px;
          background: #1a1d24;
          border: 1px solid #2a2f3a;
          color: #cfd7e3;
          border-radius: 6px;
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

        .metrics-overview {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .metric-card {
          background: #1a1d24;
          border: 1px solid #2a2f3a;
          border-radius: 12px;
          padding: 20px;
        }

        .metric-card h3 {
          margin: 0 0 15px 0;
          color: #d1d5db;
        }

        .uptime-display {
          font-size: 36px;
          font-weight: bold;
          margin-bottom: 5px;
        }

        .metric-value {
          font-size: 28px;
          font-weight: bold;
          color: #10b981;
          margin-bottom: 5px;
        }

        .metric-card p {
          margin: 0;
          color: #9ca3af;
          font-size: 14px;
        }

        .status-breakdown {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .status-item {
          display: flex;
          justify-content: space-between;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 14px;
        }

        .status-item.healthy {
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .status-item.warning {
          background: rgba(245, 158, 11, 0.1);
          border: 1px solid rgba(245, 158, 11, 0.3);
        }

        .status-item.critical {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
        }

        .system-info, .response-times, .alerts-section, .live-dashboard {
          margin-bottom: 30px;
        }

        .system-grid, .response-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 10px;
        }

        .system-item, .response-item {
          display: flex;
          justify-content: space-between;
          padding: 8px 12px;
          background: #1a1d24;
          border: 1px solid #2a2f3a;
          border-radius: 6px;
        }

        .system-key, .response-check {
          color: #9ca3af;
        }

        .system-value, .response-time {
          color: #d1d5db;
          font-weight: bold;
        }

        .alerts-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .alert-item {
          background: #1a1d24;
          border: 1px solid #2a2f3a;
          border-radius: 8px;
          padding: 15px;
        }

        .alert-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .alert-status {
          font-weight: bold;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
        }

        .alert-time {
          color: #9ca3af;
          font-size: 12px;
        }

        .alert-message {
          color: #d1d5db;
          font-size: 14px;
          white-space: pre-line;
        }

        .no-alerts {
          color: #9ca3af;
          font-style: italic;
          text-align: center;
          padding: 20px;
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

export default HealthPage;