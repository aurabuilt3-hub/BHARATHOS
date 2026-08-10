from typing import List, Dict, Any

class RAGKnowledgeRetriever:
    @staticmethod
    def query_sop_manuals(query: str, top_k: int = 3) -> List[Dict[str, Any]]:
        """
        Queries vector store / pgvector knowledge base for disaster SOP protocols matching the query.
        """
        knowledge_corpus = [
            {
                "id": "sop-01",
                "title": "National Disaster Management Authority (NDMA) Coastal Inundation Protocol",
                "content": "For water depth breaching 4.0m in coastal wards, immediately evacuate ground floor residents, seal affected road arteries, and pre-position 500L/min dewatering pumps.",
                "category": "Flood & Evacuation"
            },
            {
                "id": "sop-02",
                "title": "Andhra Pradesh State Disaster Response (APSDR) Traffic Diversion Guidelines",
                "content": "Beach corridor blockages require automated signboards on VIP Road to reroute emergency vehicles towards KGH Super Specialty trauma care.",
                "category": "Traffic & Logistics"
            },
            {
                "id": "sop-03",
                "title": "Visakhapatnam Municipal Corporation (VMC) Hospital Surge Capacity Protocol",
                "content": "Keep a minimum of 15% ICU beds reserved for emergency triage dispatches during severe monsoonal alerts.",
                "category": "Healthcare"
            }
        ]

        # Basic keyword relevance scoring simulation over vector corpus
        results = []
        query_terms = query.lower().split()
        for doc in knowledge_corpus:
            score = sum(1 for term in query_terms if term in doc["content"].lower() or term in doc["title"].lower())
            results.append((score + 0.85, doc))

        results.sort(key=lambda x: x[0], reverse=True)
        return [item[1] for item in results[:top_k]]
