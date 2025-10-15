# app/health_sentinel.py
"""
Health Sentinel for Lab4-Proof
Monitors application health, system resources, and service availability
"""

import asyncio
import json
import logging
import os
import psutil
import time
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional, Any, Callable
from dataclasses import dataclass, asdict
from enum import Enum

log = logging.getLogger("health_sentinel")

class HealthStatus(Enum):
    """Health status levels"""
    HEALTHY = "healthy"
    WARNING = "warning"
    CRITICAL = "critical"
    UNKNOWN = "unknown"

@dataclass
class HealthCheck:
    """Individual health check result"""
    name: str
    status: HealthStatus
    message: str
    timestamp: datetime
    duration_ms: float
    metadata: Dict[str, Any] = None

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            "name": self.name,
            "status": self.status.value,
            "message": self.message,
            "timestamp": self.timestamp.isoformat() + "Z",
            "duration_ms": self.duration_ms,
            "metadata": self.metadata or {}
        }

@dataclass
class HealthReport:
    """Overall health report"""
    overall_status: HealthStatus
    timestamp: datetime
    checks: List[HealthCheck]
    system_info: Dict[str, Any]
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            "overall_status": self.overall_status.value,
            "timestamp": self.timestamp.isoformat() + "Z",
            "checks": [check.to_dict() for check in self.checks],
            "system_info": self.system_info
        }

class HealthSentinel:
    """Health monitoring service for Lab4-Proof"""
    
    def __init__(self, 
                 check_interval: int = 30,
                 data_dir: str = "data",
                 max_history: int = 1000):
        """
        Initialize health sentinel
        
        Args:
            check_interval: Seconds between health checks
            data_dir: Directory to store health data
            max_history: Maximum number of health reports to keep
        """
        self.check_interval = check_interval
        self.data_dir = Path(data_dir)
        self.max_history = max_history
        self.running = False
        self.task: Optional[asyncio.Task] = None
        self.health_checks: List[Callable] = []
        self.alert_callbacks: List[Callable] = []
        
        # Ensure data directory exists
        self.data_dir.mkdir(parents=True, exist_ok=True)
        
        # Register default health checks
        self._register_default_checks()
        
        log.info(f"Health Sentinel initialized (interval: {check_interval}s)")

    def _register_default_checks(self):
        """Register default health check functions"""
        self.add_health_check("api_health", self._check_api_health)
        self.add_health_check("disk_space", self._check_disk_space)
        self.add_health_check("memory_usage", self._check_memory_usage)
        self.add_health_check("cpu_usage", self._check_cpu_usage)
        self.add_health_check("data_integrity", self._check_data_integrity)
        self.add_health_check("ledger_files", self._check_ledger_files)
        self.add_health_check("database_connectivity", self._check_database_connectivity)

    def add_health_check(self, name: str, check_func: Callable):
        """Add a custom health check function"""
        self.health_checks.append((name, check_func))
        log.info(f"Added health check: {name}")

    def add_alert_callback(self, callback: Callable[[HealthReport], None]):
        """Add alert callback for health issues"""
        self.alert_callbacks.append(callback)
        log.info("Added alert callback")

    async def start(self):
        """Start the health monitoring service"""
        if self.running:
            log.warning("Health Sentinel already running")
            return
            
        self.running = True
        self.task = asyncio.create_task(self._monitor_loop())
        log.info("Health Sentinel started")

    async def stop(self):
        """Stop the health monitoring service"""
        if not self.running:
            return
            
        self.running = False
        if self.task:
            self.task.cancel()
            try:
                await self.task
            except asyncio.CancelledError:
                pass
        log.info("Health Sentinel stopped")

    async def _monitor_loop(self):
        """Main monitoring loop"""
        while self.running:
            try:
                report = await self._run_health_checks()
                await self._save_health_report(report)
                await self._check_alerts(report)
                
                log.debug(f"Health check completed: {report.overall_status.value}")
                
            except Exception as e:
                log.error(f"Error in health monitoring loop: {e}")
            
            await asyncio.sleep(self.check_interval)

    async def _run_health_checks(self) -> HealthReport:
        """Run all registered health checks"""
        checks = []
        overall_status = HealthStatus.HEALTHY
        
        for name, check_func in self.health_checks:
            try:
                start_time = time.time()
                check_result = await self._run_single_check(name, check_func)
                duration_ms = (time.time() - start_time) * 1000
                
                check_result.duration_ms = duration_ms
                checks.append(check_result)
                
                # Update overall status
                if check_result.status == HealthStatus.CRITICAL:
                    overall_status = HealthStatus.CRITICAL
                elif check_result.status == HealthStatus.WARNING and overall_status == HealthStatus.HEALTHY:
                    overall_status = HealthStatus.WARNING
                    
            except Exception as e:
                log.error(f"Health check {name} failed: {e}")
                checks.append(HealthCheck(
                    name=name,
                    status=HealthStatus.CRITICAL,
                    message=f"Check failed: {str(e)}",
                    timestamp=datetime.utcnow(),
                    duration_ms=0
                ))
                overall_status = HealthStatus.CRITICAL

        system_info = await self._get_system_info()
        
        return HealthReport(
            overall_status=overall_status,
            timestamp=datetime.utcnow(),
            checks=checks,
            system_info=system_info
        )

    async def _run_single_check(self, name: str, check_func: Callable) -> HealthCheck:
        """Run a single health check"""
        try:
            if asyncio.iscoroutinefunction(check_func):
                result = await check_func()
            else:
                result = check_func()
            
            if isinstance(result, HealthCheck):
                return result
            elif isinstance(result, dict):
                return HealthCheck(
                    name=name,
                    status=HealthStatus(result.get("status", "unknown")),
                    message=result.get("message", ""),
                    timestamp=datetime.utcnow(),
                    metadata=result.get("metadata", {})
                )
            else:
                return HealthCheck(
                    name=name,
                    status=HealthStatus.HEALTHY if result else HealthStatus.CRITICAL,
                    message="Check completed",
                    timestamp=datetime.utcnow()
                )
        except Exception as e:
            return HealthCheck(
                name=name,
                status=HealthStatus.CRITICAL,
                message=f"Exception: {str(e)}",
                timestamp=datetime.utcnow()
            )

    async def _get_system_info(self) -> Dict[str, Any]:
        """Get system information"""
        try:
            return {
                "cpu_percent": psutil.cpu_percent(interval=1),
                "memory_percent": psutil.virtual_memory().percent,
                "disk_percent": psutil.disk_usage('/').percent,
                "uptime_seconds": time.time() - psutil.boot_time(),
                "process_count": len(psutil.pids()),
                "load_average": os.getloadavg() if hasattr(os, 'getloadavg') else None
            }
        except Exception as e:
            log.error(f"Failed to get system info: {e}")
            return {"error": str(e)}

    async def _save_health_report(self, report: HealthReport):
        """Save health report to file"""
        try:
            report_file = self.data_dir / "health_reports.jsonl"
            
            # Append to JSONL file
            with open(report_file, "a", encoding="utf-8") as f:
                f.write(json.dumps(report.to_dict(), ensure_ascii=False) + "\n")
            
            # Clean up old reports if needed
            await self._cleanup_old_reports()
            
        except Exception as e:
            log.error(f"Failed to save health report: {e}")

    async def _cleanup_old_reports(self):
        """Remove old health reports to prevent disk space issues"""
        try:
            report_file = self.data_dir / "health_reports.jsonl"
            if not report_file.exists():
                return
                
            # Read all reports
            reports = []
            with open(report_file, "r", encoding="utf-8") as f:
                for line in f:
                    if line.strip():
                        reports.append(json.loads(line))
            
            # Keep only the most recent reports
            if len(reports) > self.max_history:
                reports = reports[-self.max_history:]
                
                # Write back the trimmed reports
                with open(report_file, "w", encoding="utf-8") as f:
                    for report in reports:
                        f.write(json.dumps(report, ensure_ascii=False) + "\n")
                        
        except Exception as e:
            log.error(f"Failed to cleanup old reports: {e}")

    async def _check_alerts(self, report: HealthReport):
        """Check if any alerts should be triggered"""
        if report.overall_status in [HealthStatus.WARNING, HealthStatus.CRITICAL]:
            for callback in self.alert_callbacks:
                try:
                    if asyncio.iscoroutinefunction(callback):
                        await callback(report)
                    else:
                        callback(report)
                except Exception as e:
                    log.error(f"Alert callback failed: {e}")

    # Default health check implementations
    async def _check_api_health(self) -> HealthCheck:
        """Check if API is responding"""
        try:
            import aiohttp
            async with aiohttp.ClientSession() as session:
                async with session.get("http://localhost:8000/health", timeout=5) as response:
                    if response.status == 200:
                        return HealthCheck(
                            name="api_health",
                            status=HealthStatus.HEALTHY,
                            message="API is responding",
                            timestamp=datetime.utcnow()
                        )
                    else:
                        return HealthCheck(
                            name="api_health",
                            status=HealthStatus.CRITICAL,
                            message=f"API returned status {response.status}",
                            timestamp=datetime.utcnow()
                        )
        except Exception as e:
            return HealthCheck(
                name="api_health",
                status=HealthStatus.CRITICAL,
                message=f"API health check failed: {str(e)}",
                timestamp=datetime.utcnow()
            )

    async def _check_disk_space(self) -> HealthCheck:
        """Check available disk space"""
        try:
            disk_usage = psutil.disk_usage('/')
            percent_used = (disk_usage.used / disk_usage.total) * 100
            
            if percent_used > 90:
                status = HealthStatus.CRITICAL
                message = f"Disk usage critical: {percent_used:.1f}%"
            elif percent_used > 80:
                status = HealthStatus.WARNING
                message = f"Disk usage high: {percent_used:.1f}%"
            else:
                status = HealthStatus.HEALTHY
                message = f"Disk usage normal: {percent_used:.1f}%"
                
            return HealthCheck(
                name="disk_space",
                status=status,
                message=message,
                timestamp=datetime.utcnow(),
                metadata={
                    "percent_used": percent_used,
                    "free_gb": disk_usage.free / (1024**3),
                    "total_gb": disk_usage.total / (1024**3)
                }
            )
        except Exception as e:
            return HealthCheck(
                name="disk_space",
                status=HealthStatus.CRITICAL,
                message=f"Disk space check failed: {str(e)}",
                timestamp=datetime.utcnow()
            )

    async def _check_memory_usage(self) -> HealthCheck:
        """Check memory usage"""
        try:
            memory = psutil.virtual_memory()
            percent_used = memory.percent
            
            if percent_used > 90:
                status = HealthStatus.CRITICAL
                message = f"Memory usage critical: {percent_used:.1f}%"
            elif percent_used > 80:
                status = HealthStatus.WARNING
                message = f"Memory usage high: {percent_used:.1f}%"
            else:
                status = HealthStatus.HEALTHY
                message = f"Memory usage normal: {percent_used:.1f}%"
                
            return HealthCheck(
                name="memory_usage",
                status=status,
                message=message,
                timestamp=datetime.utcnow(),
                metadata={
                    "percent_used": percent_used,
                    "available_gb": memory.available / (1024**3),
                    "total_gb": memory.total / (1024**3)
                }
            )
        except Exception as e:
            return HealthCheck(
                name="memory_usage",
                status=HealthStatus.CRITICAL,
                message=f"Memory check failed: {str(e)}",
                timestamp=datetime.utcnow()
            )

    async def _check_cpu_usage(self) -> HealthCheck:
        """Check CPU usage"""
        try:
            cpu_percent = psutil.cpu_percent(interval=1)
            
            if cpu_percent > 90:
                status = HealthStatus.CRITICAL
                message = f"CPU usage critical: {cpu_percent:.1f}%"
            elif cpu_percent > 80:
                status = HealthStatus.WARNING
                message = f"CPU usage high: {cpu_percent:.1f}%"
            else:
                status = HealthStatus.HEALTHY
                message = f"CPU usage normal: {cpu_percent:.1f}%"
                
            return HealthCheck(
                name="cpu_usage",
                status=status,
                message=message,
                timestamp=datetime.utcnow(),
                metadata={"cpu_percent": cpu_percent}
            )
        except Exception as e:
            return HealthCheck(
                name="cpu_usage",
                status=HealthStatus.CRITICAL,
                message=f"CPU check failed: {str(e)}",
                timestamp=datetime.utcnow()
            )

    async def _check_data_integrity(self) -> HealthCheck:
        """Check data directory integrity"""
        try:
            if not self.data_dir.exists():
                return HealthCheck(
                    name="data_integrity",
                    status=HealthStatus.CRITICAL,
                    message="Data directory does not exist",
                    timestamp=datetime.utcnow()
                )
            
            # Check if we can read/write to data directory
            test_file = self.data_dir / ".health_test"
            test_file.write_text("test")
            test_file.unlink()
            
            return HealthCheck(
                name="data_integrity",
                status=HealthStatus.HEALTHY,
                message="Data directory is accessible",
                timestamp=datetime.utcnow()
            )
        except Exception as e:
            return HealthCheck(
                name="data_integrity",
                status=HealthStatus.CRITICAL,
                message=f"Data integrity check failed: {str(e)}",
                timestamp=datetime.utcnow()
            )

    async def _check_ledger_files(self) -> HealthCheck:
        """Check ledger files health"""
        try:
            from app.storage import DATA_DIR, today_files
            from datetime import date
            
            today = date.today().isoformat()
            files = today_files(today)
            
            missing_files = []
            for file_type, file_path in files.items():
                if not (DATA_DIR / file_path).exists():
                    missing_files.append(file_type)
            
            if missing_files:
                status = HealthStatus.WARNING
                message = f"Missing ledger files: {', '.join(missing_files)}"
            else:
                status = HealthStatus.HEALTHY
                message = "All ledger files present"
                
            return HealthCheck(
                name="ledger_files",
                status=status,
                message=message,
                timestamp=datetime.utcnow(),
                metadata={"missing_files": missing_files}
            )
        except Exception as e:
            return HealthCheck(
                name="ledger_files",
                status=HealthStatus.CRITICAL,
                message=f"Ledger files check failed: {str(e)}",
                timestamp=datetime.utcnow()
            )

    async def _check_database_connectivity(self) -> HealthCheck:
        """Check database connectivity (placeholder for future database integration)"""
        try:
            # For now, just check if we can access the data directory
            # In the future, this could check actual database connectivity
            if self.data_dir.exists() and self.data_dir.is_dir():
                return HealthCheck(
                    name="database_connectivity",
                    status=HealthStatus.HEALTHY,
                    message="Data storage accessible",
                    timestamp=datetime.utcnow()
                )
            else:
                return HealthCheck(
                    name="database_connectivity",
                    status=HealthStatus.CRITICAL,
                    message="Data storage not accessible",
                    timestamp=datetime.utcnow()
                )
        except Exception as e:
            return HealthCheck(
                name="database_connectivity",
                status=HealthStatus.CRITICAL,
                message=f"Database connectivity check failed: {str(e)}",
                timestamp=datetime.utcnow()
            )

    async def get_latest_report(self) -> Optional[HealthReport]:
        """Get the latest health report"""
        try:
            report_file = self.data_dir / "health_reports.jsonl"
            if not report_file.exists():
                return None
                
            # Read the last line
            with open(report_file, "r", encoding="utf-8") as f:
                lines = f.readlines()
                if not lines:
                    return None
                    
                latest_data = json.loads(lines[-1])
                
                # Convert back to HealthReport object
                checks = []
                for check_data in latest_data["checks"]:
                    checks.append(HealthCheck(
                        name=check_data["name"],
                        status=HealthStatus(check_data["status"]),
                        message=check_data["message"],
                        timestamp=datetime.fromisoformat(check_data["timestamp"].replace("Z", "+00:00")),
                        duration_ms=check_data["duration_ms"],
                        metadata=check_data.get("metadata", {})
                    ))
                
                return HealthReport(
                    overall_status=HealthStatus(latest_data["overall_status"]),
                    timestamp=datetime.fromisoformat(latest_data["timestamp"].replace("Z", "+00:00")),
                    checks=checks,
                    system_info=latest_data["system_info"]
                )
        except Exception as e:
            log.error(f"Failed to get latest report: {e}")
            return None

    async def get_health_history(self, limit: int = 100) -> List[HealthReport]:
        """Get health report history"""
        try:
            report_file = self.data_dir / "health_reports.jsonl"
            if not report_file.exists():
                return []
                
            reports = []
            with open(report_file, "r", encoding="utf-8") as f:
                lines = f.readlines()
                
                # Get the last 'limit' lines
                for line in lines[-limit:]:
                    if line.strip():
                        report_data = json.loads(line)
                        
                        # Convert back to HealthReport object
                        checks = []
                        for check_data in report_data["checks"]:
                            checks.append(HealthCheck(
                                name=check_data["name"],
                                status=HealthStatus(check_data["status"]),
                                message=check_data["message"],
                                timestamp=datetime.fromisoformat(check_data["timestamp"].replace("Z", "+00:00")),
                                duration_ms=check_data["duration_ms"],
                                metadata=check_data.get("metadata", {})
                            ))
                        
                        reports.append(HealthReport(
                            overall_status=HealthStatus(report_data["overall_status"]),
                            timestamp=datetime.fromisoformat(report_data["timestamp"].replace("Z", "+00:00")),
                            checks=checks,
                            system_info=report_data["system_info"]
                        ))
                        
            return reports
        except Exception as e:
            log.error(f"Failed to get health history: {e}")
            return []

# Global health sentinel instance
health_sentinel = HealthSentinel()