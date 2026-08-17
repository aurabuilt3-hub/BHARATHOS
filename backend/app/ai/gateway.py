import time
from typing import Dict, Any
from app.ai.graph.orchestrator import LangGraphAIOrchestrator
from app.ai.memory.session_memory import session_memory_store
from app.core.logging import logger

class AIGateway:
    @staticmethod
    def process_triage_request(
        incident_description: str,
        session_id: str = "default_session",
        max_retries: int = 2
    ) -> Dict[str, Any]:
        """
        AI Gateway central entrypoint:
        1. Validates input
        2. Prepares session context
        3. Executes LangGraph multi-agent pipeline with automatic retries
        4. Formats standardized output with safety guarantees
        """
        if not incident_description or len(incident_description.strip()) == 0:
            raise ValueError("Incident description cannot be empty.")

        # Save session context
        session_memory_store.set_session_data(session_id, "last_input", incident_description)

        attempts = 0
        last_error = None

        while attempts <= max_retries:
            try:
                logger.info(f"AI Gateway processing triage request (Attempt {attempts + 1}): '{incident_description[:40]}...'")
                
                # Execute LangGraph pipeline
                response = LangGraphAIOrchestrator.run_triage_graph(incident_description)
                
                # Ensure Mandatory Human Approval Flag is explicitly set
                response["human_approval_required"] = True
                
                return response
            except Exception as e:
                attempts += 1
                last_error = e
                logger.warning(f"AI Gateway triage attempt {attempts} failed: {str(e)}")
                time.sleep(0.2)

        # Fallback response if max retries exceeded
        return {
            "summary": "AI Gateway operational fallback: Triage pipeline encountered temporary timeout.",
            "confidence": 50.0,
            "reasoning": f"Max retries ({max_retries}) reached. Error: {str(last_error)}",
            "evidence": "Gateway retry logs",
            "assumptions": ["Manual officer inspection required"],
            "missing_information": ["Full agent graph telemetry"],
            "recommended_departments": ["Disaster Management"],
            "priority": "high",
            "next_steps": ["1. Dispatch field officer to inspect site manually."],
            "human_approval_required": True,
            "status": "awaiting_human_approval",
            "metadata": {"gateway_fallback": True, "attempts": attempts}
        }

ai_gateway = AIGateway()
