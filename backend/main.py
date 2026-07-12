from typing import Optional

from fastapi import Depends, FastAPI, HTTPException
from sqlalchemy.orm import Session

import models
import schemas
from database import Base, engine, get_db

# Tworzy tabele w bazie przy starcie, jeśli jeszcze nie istnieją
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="IT Helpdesk Portal API",
    description="Backend systemu obsługi zgłoszeń IT",
    version="0.3.0",
)


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
