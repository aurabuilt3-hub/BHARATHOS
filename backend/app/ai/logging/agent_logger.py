import time
from typing import Dict, Any, Optional
from app.core.logging import logger

class AILogger:
    @staticmethod
    def log_agent_execution(
        agent_name: str,
        prompt_version: str,
        latency_ms: float,
        model: str,
        status: str,
        tool_calls: Optional[list] = None,
        error: Optional[str] = None
    ) -> None:
        log_payload = {
            "agent": agent_name,
            "prompt_version": prompt_version,
            "latency_ms": round(latency_ms, 2),
            "model": model,
            "status": status,
            "tool_calls": tool_calls or [],
            "error": error
        }
        if status == "success":
            logger.info(f"AI Agent Executed: {log_payload}")
        else:
            logger.error(f"AI Agent Failed: {log_payload}")
