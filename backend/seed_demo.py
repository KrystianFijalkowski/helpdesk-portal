"""Dane demonstracyjne — wypełnia portal realistycznymi zgłoszeniami i zasobami.

Uruchomienie (jednorazowe, z folderu backend):
    .venv\\Scripts\\python seed_demo.py

Zgłoszenia są rozłożone na ostatnie 7 dni, część rozwiązana (różne czasy),
część przekracza SLA — dzięki temu raporty mają co pokazywać.
"""

from datetime import datetime, timedelta

import models
from database import Base, SessionLocal, engine

Base.metadata.create_all(bind=engine)
now = datetime.utcnow()

# (tytuł, opis, kategoria, priorytet, dni_temu, status, godzin_do_rozwiązania)
TICKETS = [
    ("Komputer nie uruchamia się — czarny ekran",
     "Po włączeniu słychać wentylatory, ale ekran pozostaje czarny.",
     "hardware", "high", 6, "resolved", 3),
    ("Brak dźwięku podczas wideokonferencji",
     "W Teams nikt mnie nie słyszy, mikrofon wybrany poprawnie.",
     "software", "medium", 6, "closed", 5),
    ("Skaner nie zapisuje do folderu sieciowego",
     "Skanowanie kończy się błędem 'destination unreachable'.",
     "hardware", "medium", 5, "resolved", 6),
    ("Telefon służbowy nie synchronizuje poczty",
     "Ostatnie maile na telefonie sprzed dwóch dni.",
     "software", "low", 5, "closed", 20),
    ("Dostęp do systemu kadrowego dla nowego pracownika",
     "Proszę o konto dla P. Adamskiej, start w poniedziałek.",
     "account", "medium", 5, "resolved", 4),
    ("Wolne działanie komputera po aktualizacji",
     "Od wczorajszej aktualizacji wszystko chodzi bardzo wolno.",
     "software", "low", 4, "resolved", 26),   # SLA 24h — przekroczone
    ("Awaria klimatyzacji w serwerowni — alarm temperatury",
     "Czujnik pokazuje 31°C i rośnie. Alarm z monitoringu.",
     "other", "critical", 4, "resolved", 2),  # SLA 1h — przekroczone
    ("Nie działa czytnik kart przy wejściu do biura",
     "Pracownicy nie mogą wejść, czytnik nie reaguje na karty.",
     "hardware", "high", 3, "resolved", 3),
    ("Prośba o dodatkowy monitor",
     "Do pracy z arkuszami przydałby się drugi ekran.",
     "hardware", "low", 3, "in_progress", None),
    ("Excel zawiesza się przy dużych plikach",
     "Plik raportowy 80 MB zawiesza Excela na kilka minut.",
     "software", "medium", 3, "resolved", 7),
    ("Reset hasła po powrocie z urlopu",
     "Konto zablokowane po trzech nieudanych próbach.",
     "account", "medium", 3, "closed", 1),
    ("Drukarka etykiet w magazynie drukuje krzywo",
     "Etykiety wychodzą przesunięte o ok. 5 mm.",
     "hardware", "medium", 2, "in_progress", None),
    ("VPN rozłącza się co kilka minut",
     "Praca zdalna niemożliwa, połączenie pada co 5-10 minut.",
     "network", "high", 2, "resolved", 5),    # SLA 4h — przekroczone
    ("Uprawnienia do folderu Zarząd dla asystentki",
     "Proszę o dostęp do odczytu dla p. Kingi W.",
     "account", "medium", 2, "new", None),    # wisi > 8h — naruszenie SLA
    ("Aktualizacja oprogramowania kasy fiskalnej",
     "Producent wypuścił wymaganą aktualizację, termin do końca miesiąca.",
     "software", "medium", 1, "new", None),
    ("Mysz bezprzewodowa gubi kursor",
     "Kursor skacze i zacina się mimo wymiany baterii.",
     "hardware", "low", 1, "new", None),
    ("Wniosek o służbowy telefon dla handlowca",
     "Nowy pracownik działu handlowego potrzebuje telefonu z abonamentem.",
     "other", "low", 1, "new", None),
]

COMMENTS = {
    "Komputer nie uruchamia się — czarny ekran":
        ("Krystian (IT)", "Poluzowana kość RAM po przeprowadzce biurka. Poprawiłem, działa."),
    "Awaria klimatyzacji w serwerowni — alarm temperatury":
        ("Krystian (IT)", "Serwis klimatyzacji wezwany awaryjnie. Do czasu naprawy wstawiłem wentylator zapasowy, temperatura spadła do 24°C."),
    "VPN rozłącza się co kilka minut":
        ("Krystian (IT)", "Winna wersja klienta VPN po aktualizacji Windows. Wgrałem nowszą wersję, stabilnie."),
    "Drukarka etykiet w magazynie drukuje krzywo":
        ("Krystian (IT)", "Skalibrowałem prowadnice. Obserwujemy do jutra."),
}

# (nazwa, typ, nr seryjny, przypisanie, status, zakup_msc_temu, gwarancja_dni_od_dziś)
ASSETS = [
    ("HP EliteBook 840 G9", "laptop", "HPEB-2024-201", "Marek Zieliński (Handel)", "in_use", 18, 420),
    ("Dell Latitude 5420", "laptop", "DL5420-2021-090", None, "in_storage", 50, -90),
    ("Samsung Galaxy S23", "phone", "SGS23-2024-011", "Marek Zieliński (Handel)", "in_use", 20, 240),
    ("iPhone 14", "phone", "IP14-2023-004", "Jan Kowalczyk (Zarząd)", "in_use", 30, 60),
    ("Dell UltraSharp U2422H", "monitor", "DU24-2024-132", "Anna Nowak (Księgowość)", "in_use", 16, 330),
    ("Brother HL-L2350DW", "printer", "BRHL-2023-021", "Sekretariat", "in_use", 30, 25),
    ("Synology DS923+ (NAS)", "network_device", "SYNAS-SRV-02", None, "in_use", 10, 900),
    ("UPS APC Smart-UPS 1500", "other", "UPS-SRV-01", None, "in_use", 34, 5),
    ("Windows Server 2025 Standard", "license", "WINSRV-2025-STD", None, "in_use", 13, -30),
    ("ESET Endpoint Security (30 stanowisk)", "license", "ESET-2026-30", None, "in_use", 2, 300),
    ("Logitech MX Keys — zestaw klaw.+mysz", "other", "LOGI-MX-044", None, "in_storage", 8, None),
    ("Lenovo ThinkVision P27", "monitor", "LTV27-2019-002", None, "retired", 80, -700),
]

db = SessionLocal()

for title, desc, cat, prio, days_ago, status, res_hours in TICKETS:
    created = now - timedelta(days=days_ago, hours=(hash(title) % 8) + 1)
    updated = created + timedelta(hours=res_hours) if res_hours else created
    t = models.Ticket(
        title=title, description=desc, category=cat, priority=prio,
        status=status, created_at=created, updated_at=updated,
    )
    db.add(t)
    db.flush()  # nadaje id przed dodaniem komentarza
    if title in COMMENTS:
        author, content = COMMENTS[title]
        db.add(models.Comment(
            ticket_id=t.id, author=author, content=content,
            created_at=updated,
        ))

for name, atype, sn, assigned, status, bought_m, warr_days in ASSETS:
    db.add(models.Asset(
        name=name, asset_type=atype, serial_number=sn, assigned_to=assigned,
        status=status,
        purchase_date=(now - timedelta(days=bought_m * 30)).date(),
        warranty_until=(now + timedelta(days=warr_days)).date() if warr_days is not None else None,
    ))

db.commit()
tickets_total = db.query(models.Ticket).count()
assets_total = db.query(models.Asset).count()
db.close()
print(f"Gotowe. Zgłoszeń w bazie: {tickets_total}, zasobów: {assets_total}")
