from typing import Dict, Set, Any

class PresenceManager:
    def __init__(self):
        # Maps user_id -> set of active channel names
        self.user_channels: Dict[str, Set[str]] = {}

    def track_user(self, user_id: str, channel: str):
        if user_id not in self.user_channels:
            self.user_channels[user_id] = set()
        self.user_channels[user_id].add(channel)

    def untrack_user(self, user_id: str, channel: str):
        if user_id in self.user_channels:
            self.user_channels[user_id].discard(channel)
            if not self.user_channels[user_id]:
                del self.user_channels[user_id]

    def get_online_users_count(() -> int:
        return len(self.user_channels)

    def get_presence_snapshot(self) -> Dict[str, Any]:
        return {
            "online_users": len(self.user_channels),
            "channels_active": list(set(c for channels in self.user_channels.values() for c in channels))
        }

presence_manager = PresenceManager()
