from datetime import datetime, timedelta
from typing import Optional

from fastapi import Depends, FastAPI, HTTPException
from sqlalchemy.orm import Session

import models
import schemas
from database import Base, engine, get_db
from monitoring import POLL_INTERVAL, start_poller

# Tworzy tabele w bazie przy starcie, jeśli jeszcze nie istnieją
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="IT Helpdesk Portal API",
    description="Backend systemu obsługi zgłoszeń IT",
    version="0.6.0",
)


@app.on_event("startup")
def startup():
    start_poller()


@app.get("/")
def read_root():
    return {"message": "IT Helpdesk Portal API działa!"}


@app.get("/api/health")
def health_check():
    return {"status": "ok"}


@app.post("/api/tickets", response_model=schemas.TicketOut, status_code=201)
def create_ticket(data: schemas.TicketCreate, db: Session = Depends(get_db)):
    """Nowe zgłoszenie — wypełnia pracownik."""
    ticket = models.Ticket(**data.model_dump())
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    return ticket


@app.get("/api/tickets", response_model=list[schemas.TicketOut])
def list_tickets(
    status: Optional[schemas.Status] = None,
    db: Session = Depends(get_db),
):
    """Lista zgłoszeń, opcjonalnie filtrowana po statusie (?status=new)."""
    query = db.query(models.Ticket).order_by(models.Ticket.created_at.desc())
    if status is not None:
        query = query.filter(models.Ticket.status == status)
    return query.all()


@app.get("/api/tickets/{ticket_id}", response_model=schemas.TicketDetail)
def get_ticket(ticket_id: int, db: Session = Depends(get_db)):
    """Szczegóły jednego zgłoszenia razem z komentarzami."""
    ticket = db.get(models.Ticket, ticket_id)
    if ticket is None:
        raise HTTPException(status_code=404, detail="Zgłoszenie nie istnieje")
    return ticket


@app.post(
    "/api/tickets/{ticket_id}/comments",
    response_model=schemas.CommentOut,
    status_code=201,
)
def add_comment(
    ticket_id: int,
    data: schemas.CommentCreate,
    db: Session = Depends(get_db),
):
    """Nowy komentarz pod zgłoszeniem — pisze technik albo pracownik."""
    ticket = db.get(models.Ticket, ticket_id)
    if ticket is None:
        raise HTTPException(status_code=404, detail="Zgłoszenie nie istnieje")

    comment = models.Comment(ticket_id=ticket_id, **data.model_dump())
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment


# --- Zasoby IT (CMDB) ---


@app.post("/api/assets", response_model=schemas.AssetOut, status_code=201)
def create_asset(data: schemas.AssetCreate, db: Session = Depends(get_db)):
    """Dodanie zasobu do ewidencji."""
    asset = models.Asset(**data.model_dump())
    db.add(asset)
    db.commit()
    db.refresh(asset)
    return asset


@app.get("/api/assets", response_model=list[schemas.AssetOut])
def list_assets(
    status: Optional[schemas.AssetStatus] = None,
    asset_type: Optional[schemas.AssetType] = None,
    db: Session = Depends(get_db),
):
    """Ewidencja zasobów, opcjonalnie filtrowana po statusie lub typie."""
    query = db.query(models.Asset).order_by(models.Asset.name)
    if status is not None:
        query = query.filter(models.Asset.status == status)
    if asset_type is not None:
        query = query.filter(models.Asset.asset_type == asset_type)
    return query.all()


@app.get("/api/assets/{asset_id}", response_model=schemas.AssetOut)
def get_asset(asset_id: int, db: Session = Depends(get_db)):
    asset = db.get(models.Asset, asset_id)
    if asset is None:
        raise HTTPException(status_code=404, detail="Zasób nie istnieje")
    return asset


@app.patch("/api/assets/{asset_id}", response_model=schemas.AssetOut)
def update_asset(
    asset_id: int,
    data: schemas.AssetUpdate,
    db: Session = Depends(get_db),
):
    """Zmiana przypisania, statusu, gwarancji lub notatek."""
    asset = db.get(models.Asset, asset_id)
    if asset is None:
        raise HTTPException(status_code=404, detail="Zasób nie istnieje")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(asset, field, value)

    db.commit()
    db.refresh(asset)
    return asset


# --- Baza wiedzy ---


@app.post("/api/kb", response_model=schemas.KbArticleOut, status_code=201)
def create_article(data: schemas.KbArticleCreate, db: Session = Depends(get_db)):
    article = models.KbArticle(**data.model_dump())
    db.add(article)
    db.commit()
    db.refresh(article)
    return article


@app.get("/api/kb", response_model=list[schemas.KbArticleOut])
def list_articles(search: Optional[str] = None, db: Session = Depends(get_db)):
    """Lista artykułów, opcjonalnie filtrowana po tytule/treści."""
    query = db.query(models.KbArticle).order_by(models.KbArticle.created_at.desc())
    if search:
        pattern = f"%{search}%"
        query = query.filter(
            models.KbArticle.title.ilike(pattern)
            | models.KbArticle.content.ilike(pattern)
        )
    return query.all()


@app.get("/api/kb/{article_id}", response_model=schemas.KbArticleOut)
def get_article(article_id: int, db: Session = Depends(get_db)):
    article = db.get(models.KbArticle, article_id)
    if article is None:
        raise HTTPException(status_code=404, detail="Artykuł nie istnieje")
    return article


# --- Raporty ---


@app.get("/api/reports/summary")
def reports_summary(db: Session = Depends(get_db)):
    """Statystyki zgłoszeń do modułu raportów."""
    tickets = db.query(models.Ticket).all()

    def count_by(field):
        result = {}
        for t in tickets:
            key = getattr(t, field)
            result[key] = result.get(key, 0) + 1
        return result

    # Czas rozwiązania liczymy z updated_at zgłoszeń zamkniętych/rozwiązanych —
    # przybliżenie: ostatnia zmiana to zwykle moment rozwiązania
    done = [t for t in tickets if t.status in ("resolved", "closed")]
    avg_hours = None
    if done:
        total = sum((t.updated_at - t.created_at).total_seconds() for t in done)
        avg_hours = round(total / len(done) / 3600, 1)

    # Naruszenia SLA: otwarte po terminie + rozwiązane po terminie
    breached = 0
    now = datetime.utcnow()
    for t in tickets:
        deadline = t.created_at + timedelta(hours=schemas.SLA_HOURS[t.priority])
        moment = t.updated_at if t.status in ("resolved", "closed") else now
        if moment > deadline:
            breached += 1

    # Zgłoszenia z ostatnich 7 dni, pogrupowane po dniu
    last7 = {}
    for i in range(6, -1, -1):
        day = (now - timedelta(days=i)).date()
        last7[day.isoformat()] = 0
    for t in tickets:
        key = t.created_at.date().isoformat()
        if key in last7:
            last7[key] += 1

    return {
        "total": len(tickets),
        "open": sum(1 for t in tickets if t.status in ("new", "in_progress")),
        "avg_resolution_hours": avg_hours,
        "sla_breached": breached,
        "by_status": count_by("status"),
        "by_category": count_by("category"),
        "by_priority": count_by("priority"),
        "last_7_days": last7,
    }


# --- Monitoring ---


@app.get("/api/monitoring/status", response_model=schemas.MonitoringStatus)
def monitoring_status(db: Session = Depends(get_db)):
    """Aktualny stan serwera: online, jeśli ostatnia próbka jest świeża."""
    sample = (
        db.query(models.MetricSample)
        .order_by(models.MetricSample.created_at.desc())
        .first()
    )
    online = False
    if sample is not None:
        age = (datetime.utcnow() - sample.created_at).total_seconds()
        # tolerancja: dwa nieudane odpytania z rzędu = offline
        online = age < POLL_INTERVAL * 2 + 15
    return {
        "online": online,
        "hostname": sample.hostname if sample else None,
        "sample": sample,
    }


@app.get("/api/monitoring/history", response_model=list[schemas.MetricSampleOut])
def monitoring_history(hours: int = 3, db: Session = Depends(get_db)):
    """Historia metryk z ostatnich N godzin (do wykresów)."""
    cutoff = datetime.utcnow() - timedelta(hours=hours)
    return (
        db.query(models.MetricSample)
        .filter(models.MetricSample.created_at >= cutoff)
        .order_by(models.MetricSample.created_at.asc())
        .all()
    )


@app.patch("/api/tickets/{ticket_id}", response_model=schemas.TicketOut)
def update_ticket(
    ticket_id: int,
    data: schemas.TicketUpdate,
    db: Session = Depends(get_db),
):
    """Zmiana statusu lub priorytetu — robi to technik."""
    ticket = db.get(models.Ticket, ticket_id)
    if ticket is None:
        raise HTTPException(status_code=404, detail="Zgłoszenie nie istnieje")

    # exclude_unset: aktualizujemy tylko pola, które klient faktycznie przysłał
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(ticket, field, value)

    db.commit()
    db.refresh(ticket)
    return ticket
