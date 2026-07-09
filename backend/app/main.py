from datetime import date

from fastapi import Depends, FastAPI, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from sqlmodel import Session, select

from . import analytics
from .backup import export_csv, export_json, import_json
from .crud import budget_to_read, create_budget, create_movement, list_movements, movement_to_read, update_budget, update_movement
from .database import get_session, init_db
from .models import AppSetting, Budget, Category, CategoryBudget, Movement, now_utc
from .reports import monthly_pdf
from .schemas import BudgetCreate, BudgetRead, BudgetUpdate, CategoryCreate, CategoryRead, CategoryUpdate, MovementCreate, MovementRead, MovementUpdate, SettingRead, SettingUpdate
from .seed import seed_demo_data
from .settings import settings

app = FastAPI(title="Control Financiero Rubén", version="1.0.0")

origins = ["*"] if settings.cors_origins == "*" else [item.strip() for item in settings.cors_origins.split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    init_db()


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "app": settings.app_name, "database": "local-sqlite"}


@app.post("/seed/demo")
def seed_demo(session: Session = Depends(get_session)) -> dict:
    seed_demo_data(session)
    return {"message": "Datos de prueba cargados."}


@app.get("/movements", response_model=list[MovementRead])
def get_movements(year: int | None = None, month: int | None = None, session: Session = Depends(get_session)):
    return list_movements(session, year, month)


@app.get("/movements/{movement_id}", response_model=MovementRead)
def get_movement(movement_id: int, session: Session = Depends(get_session)):
    movement = session.get(Movement, movement_id)
    if not movement:
        raise HTTPException(status_code=404, detail="Movimiento no encontrado.")
    return movement_to_read(session, movement)


@app.post("/movements", response_model=MovementRead)
def post_movement(payload: MovementCreate, session: Session = Depends(get_session)):
    return create_movement(session, payload)


@app.put("/movements/{movement_id}", response_model=MovementRead)
def put_movement(movement_id: int, payload: MovementUpdate, session: Session = Depends(get_session)):
    return update_movement(session, movement_id, payload)


@app.delete("/movements/{movement_id}")
def delete_movement(movement_id: int, session: Session = Depends(get_session)):
    movement = session.get(Movement, movement_id)
    if not movement:
        raise HTTPException(status_code=404, detail="Movimiento no encontrado.")
    session.delete(movement)
    session.commit()
    return {"message": "Movimiento eliminado correctamente."}


@app.get("/categories", response_model=list[CategoryRead])
def get_categories(include_inactive: bool = False, session: Session = Depends(get_session)):
    rows = session.exec(select(Category).order_by(Category.type, Category.name)).all()
    if not include_inactive:
        rows = [row for row in rows if row.active]
    return rows


@app.get("/categories/{category_id}", response_model=CategoryRead)
def get_category(category_id: int, session: Session = Depends(get_session)):
    category = session.get(Category, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Categoria no encontrada.")
    return category


@app.post("/categories", response_model=CategoryRead)
def post_category(payload: CategoryCreate, session: Session = Depends(get_session)):
    category = Category(**payload.model_dump())
    session.add(category)
    session.commit()
    session.refresh(category)
    return category


@app.put("/categories/{category_id}", response_model=CategoryRead)
def put_category(category_id: int, payload: CategoryUpdate, session: Session = Depends(get_session)):
    category = session.get(Category, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Categoria no encontrada.")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(category, key, value)
    category.updated_at = now_utc()
    session.add(category)
    session.commit()
    session.refresh(category)
    return category


@app.delete("/categories/{category_id}")
def delete_category(category_id: int, session: Session = Depends(get_session)):
    category = session.get(Category, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Categoria no encontrada.")
    has_movements = session.exec(select(Movement).where(Movement.category_id == category_id).limit(1)).first()
    if has_movements:
        category.active = False
        category.updated_at = now_utc()
        session.add(category)
        session.commit()
        return {"message": "La categoria tiene movimientos y fue desactivada para conservar el historial."}
    session.delete(category)
    session.commit()
    return {"message": "Categoria eliminada correctamente."}


@app.get("/budgets", response_model=list[BudgetRead])
def get_budgets(session: Session = Depends(get_session)):
    budgets = session.exec(select(Budget).order_by(Budget.year.desc(), Budget.month.desc())).all()
    return [budget_to_read(session, budget) for budget in budgets]


@app.get("/budgets/{year}/{month}", response_model=BudgetRead)
def get_budget(year: int, month: int, session: Session = Depends(get_session)):
    budget = session.exec(select(Budget).where(Budget.year == year, Budget.month == month)).first()
    if not budget:
        raise HTTPException(status_code=404, detail="No se ha definido presupuesto para este mes.")
    return budget_to_read(session, budget)


@app.post("/budgets", response_model=BudgetRead)
def post_budget(payload: BudgetCreate, session: Session = Depends(get_session)):
    return create_budget(session, payload)


@app.put("/budgets/{budget_id}", response_model=BudgetRead)
def put_budget(budget_id: int, payload: BudgetUpdate, session: Session = Depends(get_session)):
    return update_budget(session, budget_id, payload)


@app.delete("/budgets/{budget_id}")
def delete_budget(budget_id: int, session: Session = Depends(get_session)):
    budget = session.get(Budget, budget_id)
    if not budget:
        raise HTTPException(status_code=404, detail="Presupuesto no encontrado.")
    for row in session.exec(select(CategoryBudget).where(CategoryBudget.budget_id == budget_id)).all():
        session.delete(row)
    session.delete(budget)
    session.commit()
    return {"message": "Presupuesto eliminado correctamente."}


@app.get("/analytics/summary")
def analytics_summary(year: int, month: int, session: Session = Depends(get_session)):
    return analytics.monthly_summary(session, year, month)


@app.get("/analytics/monthly")
def analytics_monthly(year: int, month: int, session: Session = Depends(get_session)):
    return analytics.monthly_data(session, year, month)


@app.get("/analytics/comparison")
def analytics_comparison(year: int, month: int, session: Session = Depends(get_session)):
    return analytics.comparison(session, year, month)


@app.get("/analytics/trends")
def analytics_trends(months: int = 6, session: Session = Depends(get_session)):
    return analytics.trends(session, months)


@app.get("/analytics/recommendations")
def analytics_recommendations(year: int, month: int, session: Session = Depends(get_session)):
    return analytics.recommendations(session, year, month)


@app.get("/reports/monthly/data")
def reports_data(year: int, month: int, session: Session = Depends(get_session)):
    return analytics.monthly_data(session, year, month)


@app.get("/reports/monthly/pdf")
def reports_pdf(year: int, month: int, session: Session = Depends(get_session)):
    path = monthly_pdf(session, year, month)
    return FileResponse(path, filename=f"reporte-financiero-{year}-{month:02d}.pdf", media_type="application/pdf")


@app.get("/backup/export/json")
def backup_json(session: Session = Depends(get_session)):
    return FileResponse(export_json(session), filename="control-financiero-backup.json", media_type="application/json")


@app.get("/backup/export/csv")
def backup_csv(session: Session = Depends(get_session)):
    return FileResponse(export_csv(session), filename="movimientos-control-financiero.csv", media_type="text/csv")


@app.post("/backup/import/json")
async def backup_import(file: UploadFile, session: Session = Depends(get_session)):
    return await import_json(session, file)


@app.get("/settings", response_model=list[SettingRead])
def get_settings(session: Session = Depends(get_session)):
    return session.exec(select(AppSetting).order_by(AppSetting.key)).all()


@app.put("/settings/{key}", response_model=SettingRead)
def put_setting(key: str, payload: SettingUpdate, session: Session = Depends(get_session)):
    setting = session.exec(select(AppSetting).where(AppSetting.key == key)).first()
    if not setting:
        setting = AppSetting(key=key, value=payload.value)
    else:
        setting.value = payload.value
        setting.updated_at = now_utc()
    session.add(setting)
    session.commit()
    session.refresh(setting)
    return setting
