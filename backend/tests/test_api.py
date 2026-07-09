import sys
from pathlib import Path

from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.database import init_db
from app.main import app


client = TestClient(app)
init_db()


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_categories_seeded():
    response = client.get("/categories")
    assert response.status_code == 200
    assert len(response.json()) >= 21
