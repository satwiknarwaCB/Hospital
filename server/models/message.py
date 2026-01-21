from datetime import datetime, timezone
from typing import Optional, List
from pydantic import BaseModel, Field

class DirectMessage(BaseModel):
    id: str = Field(alias="_id")
    thread_id: str
    sender_id: str
    sender_name: str
    sender_role: str
    recipient_id: str
    child_id: str
    content: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    read: bool = False
    type: str = "message"
    attachments: List[str] = []

class MessageCreate(BaseModel):
    thread_id: str
    sender_id: str
    sender_name: str
    sender_role: str
    recipient_id: str
    child_id: str
    content: str
    type: str = "message"
    attachments: Optional[List[str]] = []
