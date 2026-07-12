from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Ścieżka do pliku bazy budowana względem tego pliku, a nie folderu,
# z którego uruchomiono serwer — inaczej baza lądowałaby w losowym miejscu
BASE_DIR = Path(__file__).resolve().parent
DATABASE_URL = f"sqlite:///{BASE_DIR / 'helpdesk.db'}"

# check_same_thread=False jest wymagane przez SQLite przy pracy z FastAPI
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, autoflush=False)
Base = declarative_base()


def get_db():
    """Otwiera sesję bazy na czas jednego żądania i zamyka ją po nim."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
