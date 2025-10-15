# app/routers/health.py
"""
Health API Router for Lab4-Proof
Provides endpoints for health monitoring and status
"""

import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from fastapi import APIRouter, HTTPException, Query, Header
from fastapi.responses import JSONResponse

from app.health_service import health_service

log = logging.getLogger("health_router")

router = APIRouter(prefix="/health", tags=["health"])

@router.get("/status")
async def get_health_status():
    """Get current health status"""
    try:
        status = await health_service.get_health_status()
        return JSONResponse(content=status)
    except Exception as e:
        log.error(f"Failed to get health status: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get health status: {str(e)}")

@router.get("/check")
async def force_health_check():
    """Force an immediate health check"""
    try:
        result = await health_service.force_health_check()
        return JSONResponse(content=result)
    except Exception as e:
        log.error(f"Failed to force health check: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to force health check: {str(e)}")

@router.get("/history")
async def get_health_history(
    limit: int = Query(default=100, ge=1, le=1000, description="Number of health reports to return"),
    hours: int = Query(default=24, ge=1, le=168, description="Number of hours to look back")
):
    """Get health history"""
    try:
        # Calculate limit based on hours (assuming 30s intervals)
        reports_per_hour = 120  # 3600s / 30s
        max_reports = hours * reports_per_hour
        actual_limit = min(limit, max_reports)
        
        history = await health_service.get_health_history(actual_limit)
        return JSONResponse(content={
            "history": history,
            "count": len(history),
            "limit": actual_limit,
            "hours": hours
        })
    except Exception as e:
        log.error(f"Failed to get health history: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get health history: {str(e)}")

@router.get("/alerts")
async def get_alert_history(
    limit: int = Query(default=50, ge=1, le=500, description="Number of alerts to return")
):
    """Get alert history"""
    try:
        alerts = await health_service.get_alert_history(limit)
        return JSONResponse(content={
            "alerts": alerts,
            "count": len(alerts),
            "limit": limit
        })
    except Exception as e:
        log.error(f"Failed to get alert history: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get alert history: {str(e)}")

@router.get("/metrics")
async def get_health_metrics(
    hours: int = Query(default=24, ge=1, le=168, description="Number of hours to analyze")
):
    """Get health metrics and statistics"""
    try:
        # Get health history for the specified period
        reports_per_hour = 120  # 3600s / 30s
        limit = hours * reports_per_hour
        
        history = await health_service.get_health_history(limit)
        
        if not history:
            return JSONResponse(content={
                "message": "No health data available",
                "period_hours": hours,
                "metrics": {}
            })
        
        # Calculate metrics
        total_checks = len(history)
        healthy_count = sum(1 for report in history if report["overall_status"] == "healthy")
        warning_count = sum(1 for report in history if report["overall_status"] == "warning")
        critical_count = sum(1 for report in history if report["overall_status"] == "critical")
        
        # Calculate uptime percentage
        uptime_percentage = (healthy_count / total_checks) * 100 if total_checks > 0 else 0
        
        # Get latest system info
        latest_report = history[-1] if history else {}
        latest_system_info = latest_report.get("system_info", {})
        
        # Calculate average response times
        avg_response_times = {}
        if history:
            check_names = set()
            for report in history:
                for check in report.get("checks", []):
                    check_names.add(check["name"])
            
            for check_name in check_names:
                times = []
                for report in history:
                    for check in report.get("checks", []):
                        if check["name"] == check_name:
                            times.append(check.get("duration_ms", 0))
                
                if times:
                    avg_response_times[check_name] = sum(times) / len(times)
        
        metrics = {
            "period_hours": hours,
            "total_checks": total_checks,
            "uptime_percentage": round(uptime_percentage, 2),
            "status_counts": {
                "healthy": healthy_count,
                "warning": warning_count,
                "critical": critical_count
            },
            "latest_system_info": latest_system_info,
            "average_response_times_ms": avg_response_times,
            "first_check": history[0]["timestamp"] if history else None,
            "last_check": history[-1]["timestamp"] if history else None
        }
        
        return JSONResponse(content=metrics)
    except Exception as e:
        log.error(f"Failed to get health metrics: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get health metrics: {str(e)}")

@router.get("/checks")
async def get_available_checks():
    """Get list of available health checks"""
    try:
        # Get the latest health report to see what checks are available
        latest_report = await health_service.get_health_status()
        
        checks = []
        if "checks" in latest_report:
            for check in latest_report["checks"]:
                checks.append({
                    "name": check["name"],
                    "status": check["status"],
                    "message": check["message"],
                    "duration_ms": check.get("duration_ms", 0)
                })
        
        return JSONResponse(content={
            "available_checks": checks,
            "count": len(checks)
        })
    except Exception as e:
        log.error(f"Failed to get available checks: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get available checks: {str(e)}")

@router.post("/checks/custom")
async def add_custom_check(
    name: str,
    check_function: str,  # This would be a function name or reference
    x_admin_token: Optional[str] = Header(None)
):
    """Add a custom health check (admin only)"""
    # This is a placeholder - in a real implementation, you'd need to handle
    # the function registration more carefully for security
    try:
        # For now, just return a message that this feature is not fully implemented
        return JSONResponse(content={
            "message": "Custom health check addition not fully implemented",
            "name": name,
            "status": "placeholder"
        })
    except Exception as e:
        log.error(f"Failed to add custom check: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to add custom check: {str(e)}")

@router.get("/dashboard")
async def get_health_dashboard():
    """Get health dashboard data"""
    try:
        # Get current status
        current_status = await health_service.get_health_status()
        
        # Get recent history (last 24 hours)
        history = await health_service.get_health_history(limit=2880)  # 24 hours * 120 checks/hour
        
        # Get recent alerts (last 24 hours)
        alerts = await health_service.get_alert_history(limit=100)
        
        # Calculate summary statistics
        total_checks = len(history)
        healthy_count = sum(1 for report in history if report["overall_status"] == "healthy")
        uptime_percentage = (healthy_count / total_checks) * 100 if total_checks > 0 else 0
        
        # Get system info from latest report
        latest_system_info = current_status.get("system_info", {})
        
        dashboard_data = {
            "current_status": current_status,
            "summary": {
                "uptime_percentage": round(uptime_percentage, 2),
                "total_checks_24h": total_checks,
                "healthy_checks_24h": healthy_count,
                "alerts_24h": len(alerts),
                "last_check": current_status.get("timestamp"),
                "service_running": health_service.running
            },
            "recent_alerts": alerts[-10:] if alerts else [],  # Last 10 alerts
            "system_info": latest_system_info,
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
        
        return JSONResponse(content=dashboard_data)
    except Exception as e:
        log.error(f"Failed to get health dashboard: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get health dashboard: {str(e)}")

@router.get("/ping")
async def health_ping():
    """Simple ping endpoint for health checks"""
    return JSONResponse(content={
        "status": "ok",
        "message": "Health service is running",
        "timestamp": datetime.utcnow().isoformat() + "Z"
    })