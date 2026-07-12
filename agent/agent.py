"""Agent monitoringu — działa NA SERWERZE (VPS).

Wystawia endpoint /metrics z podstawowymi metrykami maszyny.
Portal odpytuje go co minutę. Dostęp chroniony kluczem API,
przekazywanym w nagłówku X-API-Key.
"""

import os
import time

import psutil
from fastapi import FastAPI, Header, HTTPException

# Klucz wstrzykiwany przez systemd (Environment=AGENT_API_KEY=...) —
# nigdy nie trzymamy go w kodzie
API_KEY = os.environ.get("AGENT_API_KEY", "")

app = FastAPI(title="Helpdesk Monitoring Agent", version="1.0.0")


@app.get("/metrics")
def metrics(x_api_key: str = Header(default="")):
    if not API_KEY or x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Nieprawidłowy klucz API")

    disk = psutil.disk_usage("/")
    return {
        "hostname": os.uname().nodename,
        "cpu_percent": psutil.cpu_percent(interval=0.5),
        "ram_percent": psutil.virtual_memory().percent,
        "disk_percent": disk.percent,
        "uptime_seconds": int(time.time() - psutil.boot_time()),
    }
