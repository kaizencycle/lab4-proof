# app/health_config.py
"""
Health Monitoring Configuration for Lab4-Proof
"""

import os
from typing import Dict, Any

# Health monitoring configuration
HEALTH_CONFIG = {
    # Monitoring intervals (in seconds)
    "check_interval": int(os.getenv("HEALTH_CHECK_INTERVAL", "30")),
    "alert_threshold": int(os.getenv("HEALTH_ALERT_THRESHOLD", "3")),
    "alert_cooldown": int(os.getenv("HEALTH_ALERT_COOLDOWN", "300")),  # 5 minutes
    
    # Data storage
    "data_dir": os.getenv("HEALTH_DATA_DIR", "data"),
    "max_history": int(os.getenv("HEALTH_MAX_HISTORY", "1000")),
    
    # Health check thresholds
    "thresholds": {
        "cpu_warning": float(os.getenv("HEALTH_CPU_WARNING", "80.0")),
        "cpu_critical": float(os.getenv("HEALTH_CPU_CRITICAL", "90.0")),
        "memory_warning": float(os.getenv("HEALTH_MEMORY_WARNING", "80.0")),
        "memory_critical": float(os.getenv("HEALTH_MEMORY_CRITICAL", "90.0")),
        "disk_warning": float(os.getenv("HEALTH_DISK_WARNING", "80.0")),
        "disk_critical": float(os.getenv("HEALTH_DISK_CRITICAL", "90.0")),
    },
    
    # API health check
    "api_health_url": os.getenv("HEALTH_API_URL", "http://localhost:8000/health"),
    "api_timeout": int(os.getenv("HEALTH_API_TIMEOUT", "5")),
    
    # Logging
    "log_level": os.getenv("HEALTH_LOG_LEVEL", "INFO"),
    "log_file": os.getenv("HEALTH_LOG_FILE", "health_sentinel.log"),
    
    # Alerting
    "enable_alerts": os.getenv("HEALTH_ENABLE_ALERTS", "true").lower() == "true",
    "alert_file": os.getenv("HEALTH_ALERT_FILE", "health_alerts.jsonl"),
    
    # Custom health checks
    "custom_checks": os.getenv("HEALTH_CUSTOM_CHECKS", "").split(",") if os.getenv("HEALTH_CUSTOM_CHECKS") else [],
}

def get_health_config() -> Dict[str, Any]:
    """Get health monitoring configuration"""
    return HEALTH_CONFIG.copy()

def update_health_config(**kwargs) -> None:
    """Update health monitoring configuration"""
    global HEALTH_CONFIG
    HEALTH_CONFIG.update(kwargs)

def get_threshold(metric: str, level: str) -> float:
    """Get threshold value for a metric and level"""
    key = f"{metric}_{level}"
    return HEALTH_CONFIG["thresholds"].get(key, 80.0)