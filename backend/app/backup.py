import csv
import json
from datetime import datetime
from pathlib import Path

from fastapi import HTTPException, UploadFile
from sqlmodel import Session, select

from .crud import validate_category_for_movement
from .models import Budget, Category, Movement
from .schemas import ImportSummary
from .settings import EXPORTS_DIR


def export_json(session: Session) -> str:
    data = {
        "version": 1,
        "generated_at": datetime.now().isoformat(),
        "categories": [c.model_dump(mode="json") for c in session.exec(select(Category)).all()],
        "movements": [m.model_dump(mode="json") for m in session.exec(select(Movement)).all()],
        "budgets": [b.model_dump(mode="json") for b in session.exec(select(Budget)).all()],
    }
    path = EXPORTS_DIR / "control-financiero-backup.json"
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    return str(path)


def export_csv(session: Session) -> str:
    path = EXPORTS_DIR / "movimientos-control-financiero.csv"
    movements = session.exec(select(Movement)).all()
    with path.open("w", newline="", encoding="utf-8") as fh:
        writer = csv.DictWriter(
            fh,
            fieldnames=[
                "id",
                "type",
                "amount",
                "date",
                "category_id",
                "description",
                "payment_method",
                "is_necessary",
                "is_recurring",
            ],
        )
        writer.writeheader()
        for movement in movements:
            writer.writerow({key: getattr(movement, key) for key in writer.fieldnames})
    return str(path)


async def import_json(session: Session, file: UploadFile) -> ImportSummary:
    try:
        data = json.loads((await file.read()).decode("utf-8"))
    except Exception as exc:
        raise HTTPException(status_code=400, detail="El archivo JSON no es valido.") from exc
    if not isinstance(data, dict) or "categories" not in data or "movements" not in data:
        raise HTTPException(status_code=400, detail="El respaldo no tiene la estructura esperada.")

    imported_categories = 0
    imported_movements = 0
    imported_budgets = 0
    skipped = 0

    existing_categories = {c.name.lower(): c for c in session.exec(select(Category)).all()}
    id_map: dict[int, int] = {}
    for item in data.get("categories", []):
        name = str(item.get("name", "")).strip()
        if not name or item.get("type") not in {"income", "expense", "both"}:
            skipped += 1
            continue
        if name.lower() in existing_categories:
            id_map[int(item.get("id", 0) or 0)] = existing_categories[name.lower()].id
            skipped += 1
            continue
        category = Category(name=name, type=item["type"], color=item.get("color"), icon=item.get("icon"), active=bool(item.get("active", True)))
        session.add(category)
        session.commit()
        session.refresh(category)
        id_map[int(item.get("id", category.id) or category.id)] = category.id
        existing_categories[name.lower()] = category
        imported_categories += 1

    existing_movements = {
        (m.type, float(m.amount), m.date.isoformat(), m.category_id, m.description.lower())
        for m in session.exec(select(Movement)).all()
    }
    for item in data.get("movements", []):
        try:
            category_id = id_map.get(int(item["category_id"]), int(item["category_id"]))
            signature = (item["type"], float(item["amount"]), item["date"], category_id, str(item["description"]).lower())
            if signature in existing_movements:
                skipped += 1
                continue
            validate_category_for_movement(session, item["type"], category_id)
            movement = Movement(
                type=item["type"],
                amount=float(item["amount"]),
                date=item["date"],
                category_id=category_id,
                payment_method=item.get("payment_method"),
                description=item["description"],
                notes=item.get("notes"),
                tag=item.get("tag"),
                place=item.get("place"),
                is_necessary=bool(item.get("is_necessary", True)),
                is_recurring=bool(item.get("is_recurring", False)),
            )
        except Exception:
            skipped += 1
            continue
        session.add(movement)
        existing_movements.add(signature)
        imported_movements += 1

    for item in data.get("budgets", []):
        try:
            exists = session.exec(select(Budget).where(Budget.year == int(item["year"]), Budget.month == int(item["month"]))).first()
            if exists:
                skipped += 1
                continue
            session.add(
                Budget(
                    year=int(item["year"]),
                    month=int(item["month"]),
                    total_budget=float(item.get("total_budget") or 0),
                    saving_goal=float(item.get("saving_goal") or 0),
                    unnecessary_expense_limit=float(item.get("unnecessary_expense_limit") or 0),
                )
            )
            imported_budgets += 1
        except Exception:
            skipped += 1
    session.commit()
    return ImportSummary(imported_categories=imported_categories, imported_movements=imported_movements, imported_budgets=imported_budgets, skipped_duplicates=skipped)
