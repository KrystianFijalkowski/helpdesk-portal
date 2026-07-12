from fastapi import FastAPI

app = FastAPI(
    title="IT Helpdesk Portal API",
    description="Backend systemu obsługi zgłoszeń IT",
    version="0.1.0",
)


@app.get("/")
def read_root():
    return {"message": "IT Helpdesk Portal API działa!"}


@app.get("/api/health")
def health_check():
    # Endpoint "zdrowia" — standard w każdym API; monitoring pyta go,
    # czy serwis żyje
    return {"status": "ok"}
