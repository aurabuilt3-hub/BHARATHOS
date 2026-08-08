from typing import Dict, List, Any

class ConversationMemory:
    def __init__(self):
        self._chats: Dict[str, List[Dict[str, str]]] = {}

    def append_message(self, chat_id: str, sender: str, text: str) -> None:
        if chat_id not in self._chats:
            self._chats[chat_id] = []
        self._chats[chat_id].append({"sender": sender, "text": text})

    def get_chat_history(self, chat_id: str) -> List[Dict[str, str]]:
        return self._chats.get(chat_id, [])

conversation_memory_store = ConversationMemory()
