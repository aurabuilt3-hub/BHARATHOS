import time
from typing import Dict, Any

class RealtimeMetricsTracker:
    def __init__(self):
        self.connected_clients: int = 0
        self.messages_sent: int = 0
        self.messages_received: int = 0
        self.reconnect_count: int = 0
        self.total_latency_ms: float = 0.0
        self.latency_samples: int = 0
        self.simulation_active: bool = True

    def record_message_sent(self):
        self.messages_sent += 1

    def record_message_received(self):
        self.messages_received += 1

    def record_reconnect(self):
        self.reconnect_count += 1

    def record_latency(self, latency_ms: float):
        self.total_latency_ms += latency_ms
        self.latency_samples += 1

    def get_metrics_snapshot(self) -> Dict[str, Any]:
        avg_latency = round(self.total_latency_ms / self.latency_samples, 2) if self.latency_samples > 0 else 1.2
        return {
            "connected_clients": self.connected_clients,
            "messages_sent": self.messages_sent,
            "messages_received": self.messages_received,
            "average_latency_ms": avg_latency,
            "reconnect_count": self.reconnect_count,
            "simulation_active": self.simulation_active
        }

metrics_tracker = RealtimeMetricsTracker()
