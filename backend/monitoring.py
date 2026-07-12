"""Poller monitoringu — odpytuje agenta na VPS i zapisuje historię metryk.

Adres serwera i klucz API są w pliku .env (poza repozytorium!),
wzór w .env.example.
"""

import os
import threading
import time
from datetime import datetime, timedelta
from pathlib import Path

import requests
from dotenv import load_dotenv

import models
from database import SessionLocal

# Jawna ścieżka do .env obok tego pliku — serwer może startować z innego folderu
load_dotenv(Path(__file__).resolve().parent / ".env")

MONITOR_URL = os.environ.get("MONITOR_URL", "")
MONITOR_API_KEY = os.environ.get("MONITOR_API_KEY", "")
POLL_INTERVAL = 30  # sekundy między odpytaniami
HISTORY_HOURS = 24  # ile historii trzymamy w bazie


def poll_once():
    """Jedno odpytanie agenta i zapis próbki do bazy."""
    resp = requests.get(
        MONITOR_URL, headers={"X-API-Key": MONITOR_API_KEY}, timeout=10
    )
    resp.raise_for_status()
    data = resp.json()

    db = SessionLocal()
    try:
        db.add(
            models.MetricSample(
                hostname=data["hostname"],
                cpu_percent=data["cpu_percent"],
                ram_percent=data["ram_percent"],
                disk_percent=data["disk_percent"],
                uptime_seconds=data["uptime_seconds"],
            )
        )
        # sprzątanie: kasujemy próbki starsze niż HISTORY_HOURS
        cutoff = datetime.utcnow() - timedelta(hours=HISTORY_HOURS)
        db.query(models.MetricSample).filter(
            models.MetricSample.created_at < cutoff
        ).delete()
        db.commit()
    finally:
        db.close()


def _loop():
    while True:
        try:
            poll_once()
        except Exception:
            # serwer nie odpowiada — brak nowej próbki oznacza "offline",
            # co pokaże endpoint statusu
            pass
        time.sleep(POLL_INTERVAL)


def start_poller():
    """Startuje pętlę odpytywania w tle (wątek-daemon)."""
    if not MONITOR_URL:
        print("Monitoring wyłączony — brak MONITOR_URL w .env")
        return
    threading.Thread(target=_loop, daemon=True).start()
