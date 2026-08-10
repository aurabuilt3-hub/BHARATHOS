import time
import re
from sqlalchemy.orm import Session
from typing import Dict, Any, List, Optional

from app.models.models import User
from app.agents.schemas import AgentResponse
from app.agents.incident_agent import IncidentAgent
from app.agents.resource_agent import ResourceAgent
from app.agents.alert_agent import AlertAgent
from app.agents.intelligence_agent import IntelligenceAgent

# Multilingual helpers
def has_telugu(text: str) -> bool:
    return any(0x0C00 <= ord(char) <= 0x0C7F for char in text)

def has_hindi(text: str) -> bool:
    return any(0x0900 <= ord(char) <= 0x097F for char in text)

class AIOrchestrator:
    @staticmethod
    def classify_intent(message: str) -> str:
        msg = message.lower().strip()
        
        # Check multilingual matches first
        # Telugu: ఘటన (incident), వనరులు (resources), హెచ్చరిక (alert), పరిస్థితి (situation)
        # Hindi: घटना (incident), संसाधन (resources), चेतावनी (alert), स्थिति (situation)
        if any(kw in msg for kw in ("ఘటన", "incident", "घटना")):
            return "incident_query"
        if any(kw in msg for kw in ("వనరులు", "resource", "ambulance", "patrol", "fire_truck", "संसाधन", "एम्बुलेंस")):
            return "resource_query"
        if any(kw in msg for kw in ("హెచ్చరిక", "alert", "warning", "चेतावनी")):
            return "alert_query"
        if any(kw in msg for kw in ("పరిస్థితి", "status", "situation", "happening", "overview", "summary", "स्थिति", "क्या हो रहा है")):
            return "situational_awareness"
            
        # Default fallback
        return "situational_awareness"

    @classmethod
    def run(
        cls,
        db: Session,
        user: User,
        message: str,
        history: Optional[List[Dict[str, str]]] = None
    ) -> AgentResponse:
        start_time = time.time()
        
        # 1. Bounded conversation context resolving
        # If request has references like "which ones are near hospitals" or "any related alerts?"
        # we can inspect history to resolve context
        query = message
        if history and len(history) > 0:
            last_user_msg = history[-1].get("content", "").lower()
            if "incident" in last_user_msg or "ఘటన" in last_user_msg:
                if any(k in query.lower() for k in ("hospital", "resources", "alerts", "ఆసుపత్రి", "వనరులు")):
                    # Inject context
                    query = f"incidents and resources near hospital in Vizag: {query}"

        # 2. Classify Intent
        intent = cls.classify_intent(query)
        
        # 3. Route to specialized agent
        if intent == "incident_query":
            response = IncidentAgent.run(db, user, query)
        elif intent == "resource_query":
            response = ResourceAgent.run(db, user, query)
        elif intent == "alert_query":
            response = AlertAgent.run(db, user, query)
        else:
            response = IntelligenceAgent.run(db, user, query)
            
        # 4. Formulate multilingual reply if input matches
        if has_telugu(message):
            response = cls._translate_to_telugu(response)
        elif has_hindi(message):
            response = cls._translate_to_hindi(response)
            
        # Add latency/observability info to metadata
        latency_ms = round((time.time() - start_time) * 1000, 2)
        response.data = {
            "retrieved_records": response.data,
            "observability": {
                "user_id": str(user.id) if user.id else "anonymous",
                "intent_detected": intent,
                "latency_ms": latency_ms,
                "model": "Gemini 2.5 Pro (Mock-Reasoning Fallback)"
            }
        }
        
        return response

    @staticmethod
    def _translate_to_telugu(resp: AgentResponse) -> AgentResponse:
        # Translates response answers, recommendations, and warnings to Telugu
        if resp.intent == "incident_query":
            resp.answer = "మీ పరిధిలోని క్రియాశీల అత్యవసర ఘటనల సమాచారం కనుగొనబడింది."
            resp.recommendations = ["క్రియాశీల ఘటనల వద్దకు అత్యవసర సేవలను త్వరగా పంపించండి."]
        elif resp.intent == "resource_query":
            resp.answer = "విశాఖపట్నంలో అందుబాటులో ఉన్న అత్యవసర వనరుల వివరాలు లభించాయి."
            resp.recommendations = ["అత్యంత సమీపంలో ఉన్న అందుబాటులోని అంబులెన్స్ లేదా రెస్క్యూ టీంను సిద్ధం చేయండి."]
        elif resp.intent == "alert_query":
            resp.answer = "సక్రియ హెచ్చరికలు మరియు వాతావరణ నివేదికలు విజయవంతంగా సేకరించబడ్డాయి."
            resp.recommendations = ["ముందస్తు భద్రతా చర్యలను ప్రారంభించండి మరియు హెచ్చరికలను పర్యవేక్షించండి."]
        else:
            resp.answer = "విశాఖపట్నం ప్రస్తుత పరిస్థితి సమీక్ష సమాచారం అందుబాటులో ఉంది."
            resp.recommendations = ["పరిస్థితిని నిశితంగా గమనించండి మరియు సమన్వయ కేంద్రానికి నివేదించండి."]
            
        return resp

    @staticmethod
    def _translate_to_hindi(resp: AgentResponse) -> AgentResponse:
        # Translates response answers, recommendations, and warnings to Hindi
        if resp.intent == "incident_query":
            resp.answer = "आपके भौगोलिक क्षेत्र में सक्रिय आपातकालीन घटनाओं की जानकारी मिली है।"
            resp.recommendations = ["सक्रिय घटनाओं पर आपातकालीन प्रतिक्रिया दल तुरंत भेजें।"]
        elif resp.intent == "resource_query":
            resp.answer = "विशाखापत्तनम में उपलब्ध आपातकालीन संसाधनों का विवरण प्राप्त हुआ है।"
            resp.recommendations = ["निकटतम उपलब्ध एम्बुलेंस या बचाव दल को तैनात करने पर विचार करें।"]
        elif resp.intent == "alert_query":
            resp.answer = "सक्रिय चेतावनी और अलर्ट विवरण सफलतापूर्वक प्राप्त कर लिए गए हैं।"
            resp.recommendations = ["सुरक्षा सावधानियां शुरू करें और गंभीर अलर्ट की स्थिति पर नजर रखें।"]
        else:
            resp.answer = "विशाखापत्तनम की वर्तमान स्थिति और परिचालन सारांश उपलब्ध है।"
            resp.recommendations = ["समग्र नियंत्रण कक्ष को स्थिति की निरंतर रिपोर्ट दें।"]
            
        return resp
