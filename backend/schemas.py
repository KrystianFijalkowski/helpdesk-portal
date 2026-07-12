from datetime import date, datetime, timedelta
from typing import Literal, Optional

from pydantic import BaseModel, Field, computed_field

# Dozwolone wartości — Pydantic odrzuci żądanie z czymkolwiek spoza listy
Category = Literal["hardware", "software", "network", "account", "other"]
Priority = Literal["low", "medium", "high", "critical"]
Status = Literal["new", "in_progress", "resolved", "closed"]

# SLA: maksymalny czas reakcji (w godzinach) zależny od priorytetu
SLA_HOURS = {"critical": 1, "high": 4, "medium": 8, "low": 24}


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


class CommentCreate(BaseModel):
    """Nowy komentarz pod zgłoszeniem."""

    author: str = Field(min_length=2, max_length=100)
    content: str = Field(min_length=1)


class CommentOut(BaseModel):
    id: int
    author: str
    content: str
    created_at: datetime

    model_config = {"from_attributes": True}


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

    # computed_field: pola liczone w locie, nie ma ich w bazie
    @computed_field
    @property
    def sla_deadline(self) -> datetime:
        """Termin reakcji: data zgłoszenia + godziny wynikające z priorytetu."""
        return self.created_at + timedelta(hours=SLA_HOURS[self.priority])

    @computed_field
    @property
    def sla_breached(self) -> bool:
        """Czy termin SLA został przekroczony (dla wciąż otwartych zgłoszeń)."""
        if self.status in ("resolved", "closed"):
            return False
        # Baza SQLite zwraca daty "naiwne" (bez strefy), więc porównujemy
        # z aktualnym czasem UTC również pozbawionym strefy
        now = datetime.utcnow()
        deadline = self.sla_deadline
        if deadline.tzinfo is not None:
            deadline = deadline.replace(tzinfo=None)
        return now > deadline


class TicketDetail(TicketOut):
    """Ticket ze szczegółami — razem z komentarzami."""

    comments: list[CommentOut] = []


# --- Zasoby IT (CMDB) ---

AssetType = Literal[
    "laptop", "desktop", "monitor", "printer", "phone",
    "network_device", "license", "other",
]
AssetStatus = Literal["in_use", "in_storage", "repair", "retired"]


class AssetCreate(BaseModel):
    """Nowy zasób w ewidencji."""

    name: str = Field(min_length=2, max_length=200)
    asset_type: AssetType
    serial_number: str = Field(min_length=1, max_length=100)
    assigned_to: Optional[str] = None
    status: AssetStatus = "in_storage"
    purchase_date: Optional[date] = None
    warranty_until: Optional[date] = None
    notes: str = ""


class AssetUpdate(BaseModel):
    """Zmiany w zasobie — wszystkie pola opcjonalne."""

    assigned_to: Optional[str] = None
    status: Optional[AssetStatus] = None
    warranty_until: Optional[date] = None
    notes: Optional[str] = None


class AssetOut(BaseModel):
    id: int
    name: str
    asset_type: AssetType
    serial_number: str
    assigned_to: Optional[str]
    status: AssetStatus
    purchase_date: Optional[date]
    warranty_until: Optional[date]
    notes: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

    @computed_field
    @property
    def warranty_days_left(self) -> Optional[int]:
        """Ile dni gwarancji zostało; ujemne = już wygasła, None = brak danych."""
        if self.warranty_until is None:
            return None
        return (self.warranty_until - date.today()).days
