from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, Field

# Dozwolone wartości — Pydantic odrzuci żądanie z czymkolwiek spoza listy
Category = Literal["hardware", "software", "network", "account", "other"]
Priority = Literal["low", "medium", "high", "critical"]
Status = Literal["new", "in_progress", "resolved", "closed"]


class TicketCreate(BaseModel):
    """Dane, które pracownik podaje przy zgłoszeniu problemu."""

    title: str = Field(min_length=3, max_length=200)
    description: str = Field(min_length=5)
    category: Category
    priority: Priority = "medium"


class TicketUpdate(BaseModel):
    """Dane, które technik może zmienić — oba pola opcjonalne."""

    status: Optional[Status] = None
    priority: Optional[Priority] = None


class TicketOut(BaseModel):
    """Pełny ticket zwracany przez API."""

    id: int
    title: str
    description: str
    category: Category
    priority: Priority
    status: Status
    created_at: datetime
    updated_at: datetime

    # Pozwala budować ten schemat wprost z obiektu SQLAlchemy
    model_config = {"from_attributes": True}
