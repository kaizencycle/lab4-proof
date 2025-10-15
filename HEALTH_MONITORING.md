# Health Monitoring System for Lab4-Proof

This document describes the health monitoring system (Health Sentinel) implemented for Lab4-Proof, similar to the one created for Lab7-proof.

## Overview

The Health Sentinel is a comprehensive monitoring system that continuously tracks the health of the Lab4-Proof application, including:

- API availability and response times
- System resource usage (CPU, memory, disk)
- Data integrity and file system health
- Ledger file completeness
- Database connectivity
- Custom health checks

## Architecture

### Components

1. **Health Sentinel** (`app/health_sentinel.py`)
   - Core health monitoring engine
   - Performs health checks at configurable intervals
   - Stores health reports and metrics

2. **Health Service** (`app/health_service.py`)
   - Background service that manages the health monitoring
   - Handles alerting and notifications
   - Provides health status API

3. **Health Router** (`app/routers/health.py`)
   - REST API endpoints for health monitoring
   - Provides health status, metrics, and history

4. **Health Dashboard** (`reflections/src/components/HealthDashboard.tsx`)
   - React component for real-time health monitoring
   - Displays health status, checks, and system information

5. **Admin Health Page** (`reflections/src/app/admin/health/page.tsx`)
   - Comprehensive health monitoring dashboard
   - Shows metrics, alerts, and system information

## Features

### Health Checks

The system performs the following health checks:

- **API Health**: Verifies API endpoints are responding
- **Disk Space**: Monitors available disk space
- **Memory Usage**: Tracks memory consumption
- **CPU Usage**: Monitors CPU utilization
- **Data Integrity**: Verifies data directory accessibility
- **Ledger Files**: Checks for required ledger files
- **Database Connectivity**: Verifies data storage access

### Alerting

- Configurable alert thresholds
- Alert cooldown periods to prevent spam
- Alert history and logging
- Multiple alert levels (warning, critical)

### Metrics and Reporting

- Real-time health status
- Historical health data
- System performance metrics
- Response time tracking
- Uptime calculations

## Configuration

Health monitoring can be configured using environment variables:

```bash
# Monitoring intervals
HEALTH_CHECK_INTERVAL=30          # Seconds between checks
HEALTH_ALERT_THRESHOLD=3          # Consecutive failures before alert
HEALTH_ALERT_COOLDOWN=300         # Seconds between alerts

# Data storage
HEALTH_DATA_DIR=data              # Directory for health data
HEALTH_MAX_HISTORY=1000           # Maximum health reports to keep

# Thresholds
HEALTH_CPU_WARNING=80.0           # CPU usage warning threshold
HEALTH_CPU_CRITICAL=90.0          # CPU usage critical threshold
HEALTH_MEMORY_WARNING=80.0        # Memory usage warning threshold
HEALTH_MEMORY_CRITICAL=90.0       # Memory usage critical threshold
HEALTH_DISK_WARNING=80.0          # Disk usage warning threshold
HEALTH_DISK_CRITICAL=90.0         # Disk usage critical threshold

# API health check
HEALTH_API_URL=http://localhost:8000/health
HEALTH_API_TIMEOUT=5              # API timeout in seconds

# Logging
HEALTH_LOG_LEVEL=INFO
HEALTH_LOG_FILE=health_sentinel.log

# Alerting
HEALTH_ENABLE_ALERTS=true
HEALTH_ALERT_FILE=health_alerts.jsonl
```

## API Endpoints

### Health Status
- `GET /health/status` - Current health status
- `GET /health/check` - Force immediate health check
- `GET /health/ping` - Simple ping endpoint

### Health History
- `GET /health/history?limit=100&hours=24` - Health history
- `GET /health/alerts?limit=50` - Alert history
- `GET /health/metrics?hours=24` - Health metrics and statistics

### Health Checks
- `GET /health/checks` - Available health checks
- `POST /health/checks/custom` - Add custom health check (admin)

### Dashboard
- `GET /health/dashboard` - Health dashboard data

## Usage

### Starting the Health Service

The health service starts automatically when the main application starts. It runs in the background and performs health checks at the configured interval.

### Viewing Health Status

1. **API**: Access health endpoints directly
2. **Admin Dashboard**: Visit `/admin/health` for comprehensive monitoring
3. **Health Component**: Use the `HealthDashboard` component in your React app

### Custom Health Checks

You can add custom health checks by implementing a function that returns a `HealthCheck` object:

```python
from app.health_sentinel import HealthCheck, HealthStatus
from datetime import datetime

def custom_health_check():
    # Your custom health check logic here
    if some_condition:
        return HealthCheck(
            name="custom_check",
            status=HealthStatus.HEALTHY,
            message="Custom check passed",
            timestamp=datetime.utcnow()
        )
    else:
        return HealthCheck(
            name="custom_check",
            status=HealthStatus.CRITICAL,
            message="Custom check failed",
            timestamp=datetime.utcnow()
        )

# Add to health service
health_service.add_custom_health_check("custom_check", custom_health_check)
```

## Data Storage

Health data is stored in JSONL format:

- `data/health_reports.jsonl` - Health check reports
- `data/health_alerts.jsonl` - Alert history

## Monitoring and Alerting

### Health Status Levels

- **HEALTHY**: All checks passing
- **WARNING**: Some checks failing but not critical
- **CRITICAL**: Critical checks failing
- **UNKNOWN**: Unable to determine status

### Alert Conditions

Alerts are triggered when:
- Health status is WARNING or CRITICAL
- Consecutive failures exceed the threshold
- Alert cooldown period has passed

### Alert Actions

Currently, alerts are:
- Logged to the console
- Written to alert files
- Can be extended to send emails, Slack messages, etc.

## Integration

The health monitoring system is integrated into the main application:

1. **Startup**: Health service starts automatically
2. **Shutdown**: Health service stops gracefully
3. **API**: Health endpoints are available at `/health/*`
4. **Admin**: Health monitoring accessible via admin interface

## Dependencies

The health monitoring system requires:

- `psutil` - System resource monitoring
- `aiohttp` - HTTP client for API health checks
- `fastapi` - API framework
- `asyncio` - Asynchronous programming

## Troubleshooting

### Common Issues

1. **Health service not starting**: Check logs for startup errors
2. **Missing health data**: Verify data directory permissions
3. **API health checks failing**: Ensure API is running and accessible
4. **High resource usage**: Adjust check intervals and thresholds

### Logs

Health monitoring logs are written to:
- Application logs (console)
- Health-specific log file (if configured)
- Alert log file

## Future Enhancements

Potential improvements to the health monitoring system:

1. **Email/Slack Notifications**: Send alerts via external services
2. **Grafana Integration**: Export metrics to Grafana dashboards
3. **Prometheus Metrics**: Expose metrics in Prometheus format
4. **Health Check Plugins**: Plugin system for custom checks
5. **Distributed Monitoring**: Monitor multiple instances
6. **Machine Learning**: Anomaly detection and predictive alerting

## Security Considerations

- Health endpoints may expose sensitive system information
- Consider authentication for health endpoints in production
- Limit access to health data and logs
- Sanitize health check metadata before logging

## Performance Impact

The health monitoring system is designed to have minimal performance impact:

- Configurable check intervals
- Asynchronous execution
- Efficient data storage
- Automatic cleanup of old data

Monitor the health monitoring system itself to ensure it's not impacting application performance.