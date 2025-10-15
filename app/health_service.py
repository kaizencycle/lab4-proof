# app/health_service.py
"""
Health Service for Lab4-Proof
Background service that manages health monitoring and alerting
"""

import asyncio
import logging
import os
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from pathlib import Path

from app.health_sentinel import HealthSentinel, HealthReport, HealthStatus

log = logging.getLogger("health_service")

class HealthService:
    """Background health monitoring service"""
    
    def __init__(self, 
                 check_interval: int = 30,
                 alert_threshold: int = 3,
                 data_dir: str = "data"):
        """
        Initialize health service
        
        Args:
            check_interval: Seconds between health checks
            alert_threshold: Number of consecutive failures before alerting
            data_dir: Directory to store health data
        """
        self.check_interval = check_interval
        self.alert_threshold = alert_threshold
        self.data_dir = Path(data_dir)
        self.sentinel = HealthSentinel(
            check_interval=check_interval,
            data_dir=str(data_dir)
        )
        self.running = False
        self.consecutive_failures = 0
        self.last_alert_time = None
        self.alert_cooldown = 300  # 5 minutes between alerts
        
        # Register alert callbacks
        self.sentinel.add_alert_callback(self._handle_health_alert)
        
        log.info(f"Health Service initialized (interval: {check_interval}s, threshold: {alert_threshold})")

    async def start(self):
        """Start the health service"""
        if self.running:
            log.warning("Health Service already running")
            return
            
        self.running = True
        await self.sentinel.start()
        log.info("Health Service started")

    async def stop(self):
        """Stop the health service"""
        if not self.running:
            return
            
        self.running = False
        await self.sentinel.stop()
        log.info("Health Service stopped")

    async def _handle_health_alert(self, report: HealthReport):
        """Handle health alerts"""
        try:
            current_time = datetime.utcnow()
            
            # Check if we should send an alert (cooldown period)
            if (self.last_alert_time and 
                (current_time - self.last_alert_time).total_seconds() < self.alert_cooldown):
                log.debug("Alert cooldown active, skipping alert")
                return
            
            # Count consecutive failures
            if report.overall_status in [HealthStatus.WARNING, HealthStatus.CRITICAL]:
                self.consecutive_failures += 1
            else:
                self.consecutive_failures = 0
            
            # Send alert if threshold reached
            if self.consecutive_failures >= self.alert_threshold:
                await self._send_alert(report)
                self.last_alert_time = current_time
                self.consecutive_failures = 0  # Reset after alert
                
        except Exception as e:
            log.error(f"Error handling health alert: {e}")

    async def _send_alert(self, report: HealthReport):
        """Send health alert"""
        try:
            alert_message = self._format_alert_message(report)
            log.warning(f"HEALTH ALERT: {alert_message}")
            
            # Write alert to file
            await self._write_alert_log(report)
            
            # In a real implementation, you might send emails, Slack messages, etc.
            # For now, we'll just log and write to file
            
        except Exception as e:
            log.error(f"Failed to send alert: {e}")

    def _format_alert_message(self, report: HealthReport) -> str:
        """Format alert message"""
        status_emoji = {
            HealthStatus.HEALTHY: "✅",
            HealthStatus.WARNING: "⚠️",
            HealthStatus.CRITICAL: "🚨",
            HealthStatus.UNKNOWN: "❓"
        }
        
        emoji = status_emoji.get(report.overall_status, "❓")
        
        message = f"{emoji} Health Status: {report.overall_status.value.upper()}\n"
        message += f"Time: {report.timestamp.isoformat()}Z\n"
        message += f"Failed Checks: {len([c for c in report.checks if c.status in [HealthStatus.WARNING, HealthStatus.CRITICAL]])}\n\n"
        
        for check in report.checks:
            if check.status in [HealthStatus.WARNING, HealthStatus.CRITICAL]:
                message += f"• {check.name}: {check.status.value.upper()} - {check.message}\n"
        
        return message

    async def _write_alert_log(self, report: HealthReport):
        """Write alert to log file"""
        try:
            alert_file = self.data_dir / "health_alerts.jsonl"
            
            alert_data = {
                "timestamp": report.timestamp.isoformat() + "Z",
                "status": report.overall_status.value,
                "message": self._format_alert_message(report),
                "checks": [check.to_dict() for check in report.checks],
                "system_info": report.system_info
            }
            
            with open(alert_file, "a", encoding="utf-8") as f:
                f.write(json.dumps(alert_data, ensure_ascii=False) + "\n")
                
        except Exception as e:
            log.error(f"Failed to write alert log: {e}")

    async def get_health_status(self) -> Dict[str, Any]:
        """Get current health status"""
        try:
            latest_report = await self.sentinel.get_latest_report()
            if not latest_report:
                return {
                    "status": "unknown",
                    "message": "No health data available",
                    "timestamp": datetime.utcnow().isoformat() + "Z"
                }
            
            return {
                "status": latest_report.overall_status.value,
                "timestamp": latest_report.timestamp.isoformat() + "Z",
                "checks": [check.to_dict() for check in latest_report.checks],
                "system_info": latest_report.system_info,
                "consecutive_failures": self.consecutive_failures,
                "last_alert": self.last_alert_time.isoformat() + "Z" if self.last_alert_time else None
            }
        except Exception as e:
            log.error(f"Failed to get health status: {e}")
            return {
                "status": "error",
                "message": f"Failed to get health status: {str(e)}",
                "timestamp": datetime.utcnow().isoformat() + "Z"
            }

    async def get_health_history(self, limit: int = 100) -> List[Dict[str, Any]]:
        """Get health history"""
        try:
            reports = await self.sentinel.get_health_history(limit)
            return [report.to_dict() for report in reports]
        except Exception as e:
            log.error(f"Failed to get health history: {e}")
            return []

    async def get_alert_history(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Get alert history"""
        try:
            alert_file = self.data_dir / "health_alerts.jsonl"
            if not alert_file.exists():
                return []
            
            alerts = []
            with open(alert_file, "r", encoding="utf-8") as f:
                lines = f.readlines()
                
                # Get the last 'limit' lines
                for line in lines[-limit:]:
                    if line.strip():
                        alerts.append(json.loads(line))
            
            return alerts
        except Exception as e:
            log.error(f"Failed to get alert history: {e}")
            return []

    async def force_health_check(self) -> Dict[str, Any]:
        """Force an immediate health check"""
        try:
            report = await self.sentinel._run_health_checks()
            await self.sentinel._save_health_report(report)
            await self.sentinel._check_alerts(report)
            
            return report.to_dict()
        except Exception as e:
            log.error(f"Failed to force health check: {e}")
            return {
                "status": "error",
                "message": f"Failed to force health check: {str(e)}",
                "timestamp": datetime.utcnow().isoformat() + "Z"
            }

    def add_custom_health_check(self, name: str, check_func):
        """Add a custom health check"""
        self.sentinel.add_health_check(name, check_func)
        log.info(f"Added custom health check: {name}")

    def set_alert_callback(self, callback):
        """Set custom alert callback"""
        self.sentinel.add_alert_callback(callback)
        log.info("Added custom alert callback")

# Global health service instance
health_service = HealthService()

# Import json at module level
import json