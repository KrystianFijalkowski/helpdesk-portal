from datetime import datetime, timezone

from sqlalchemy import Column, Date, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from database import Base


def utc_now():
    return datetime.now(timezone.utc)


class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(30), nullable=False)
    priority = Column(String(20), nullable=False, default="medium")
    status = Column(String(20), nullable=False, default="new")
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    # Usunięcie ticketu kasuje też jego komentarze (cascade)
    comments = relationship(
        "Comment", back_populates="ticket", cascade="all, delete-orphan"
    )


class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    # ForeignKey wiąże komentarz z konkretnym ticketem
    ticket_id = Column(Integer, ForeignKey("tickets.id"), nullable=False)
    author = Column(String(100), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=utc_now)

    ticket = relationship("Ticket", back_populates="comments")


class Asset(Base):
    """Zasób IT: sprzęt lub licencja w ewidencji firmy (CMDB)."""

    __tablename__ = "assets"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)          # np. "Dell Latitude 5540"
    asset_type = Column(String(30), nullable=False)     # laptop, monitor, license...
    serial_number = Column(String(100), nullable=False)
    assigned_to = Column(String(100), nullable=True)    # pracownik; None = w magazynie
    status = Column(String(20), nullable=False, default="in_storage")
    purchase_date = Column(Date, nullable=True)
    warranty_until = Column(Date, nullable=True)
    notes = Column(Text, nullable=False, default="")
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)


class KbArticle(Base):
    """Artykuł bazy wiedzy — instrukcja rozwiązania typowego problemu."""

    __tablename__ = "kb_articles"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    category = Column(String(30), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)


class MetricSample(Base):
    """Jedna próbka metryk z monitorowanego serwera (co ~30 s)."""

    __tablename__ = "metric_samples"

    id = Column(Integer, primary_key=True, index=True)
    hostname = Column(String(100), nullable=False)
    cpu_percent = Column(Float, nullable=False)
    ram_percent = Column(Float, nullable=False)
    disk_percent = Column(Float, nullable=False)
    uptime_seconds = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=utc_now, index=True)
