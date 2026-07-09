from datetime import datetime

from fastapi import HTTPException
from sqlmodel import Session, select

from .models import Budget, Category, CategoryBudget, Movement, now_utc
from .schemas import BudgetCreate, BudgetRead, BudgetUpdate, CategoryBudgetRead, MovementCreate, MovementRead, MovementUpdate

EXPENSE_TYPES = {"expense", "purchase", "adjustment"}


def get_category_or_404(session: Session, category_id: int) -> Category:
    category = session.get(Category, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Categoria no encontrada.")
    return category


def validate_category_for_movement(session: Session, movement_type: str, category_id: int) -> None:
    category = get_category_or_404(session, category_id)
    if movement_type == "income" and category.type not in {"income", "both"}:
        raise HTTPException(status_code=422, detail="Un ingreso debe usar categoria de ingresos o mixta.")
    if movement_type in EXPENSE_TYPES and category.type not in {"expense", "both"}:
        raise HTTPException(status_code=422, detail="Un gasto, compra o ajuste debe usar categoria de gastos o mixta.")


def movement_to_read(session: Session, movement: Movement) -> MovementRead:
    category = session.get(Category, movement.category_id)
    return MovementRead(
        **movement.model_dump(),
        category_name=category.name if category else None,
        category_color=category.color if category else None,
    )


def list_movements(session: Session, year: int | None = None, month: int | None = None) -> list[MovementRead]:
    query = select(Movement).order_by(Movement.date.desc(), Movement.id.desc())
    movements = session.exec(query).all()
    if year:
        movements = [m for m in movements if m.date.year == year]
    if month:
        movements = [m for m in movements if m.date.month == month]
    return [movement_to_read(session, m) for m in movements]


def create_movement(session: Session, payload: MovementCreate) -> MovementRead:
    validate_category_for_movement(session, payload.type, payload.category_id)
    movement = Movement(**payload.model_dump())
    session.add(movement)
    session.commit()
    session.refresh(movement)
    return movement_to_read(session, movement)


def update_movement(session: Session, movement_id: int, payload: MovementUpdate) -> MovementRead:
    movement = session.get(Movement, movement_id)
    if not movement:
        raise HTTPException(status_code=404, detail="Movimiento no encontrado.")
    data = payload.model_dump(exclude_unset=True)
    new_type = data.get("type", movement.type)
    new_category_id = data.get("category_id", movement.category_id)
    validate_category_for_movement(session, new_type, new_category_id)
    for key, value in data.items():
        setattr(movement, key, value)
    movement.updated_at = now_utc()
    session.add(movement)
    session.commit()
    session.refresh(movement)
    return movement_to_read(session, movement)


def budget_to_read(session: Session, budget: Budget) -> BudgetRead:
    rows = session.exec(select(CategoryBudget).where(CategoryBudget.budget_id == budget.id)).all()
    category_budgets: list[CategoryBudgetRead] = []
    for row in rows:
        category = session.get(Category, row.category_id)
        category_budgets.append(
            CategoryBudgetRead(
                **row.model_dump(),
                category_name=category.name if category else None,
            )
        )
    return BudgetRead(**budget.model_dump(), category_budgets=category_budgets)


def upsert_category_budgets(session: Session, budget: Budget, items) -> None:
    existing = session.exec(select(CategoryBudget).where(CategoryBudget.budget_id == budget.id)).all()
    for row in existing:
        session.delete(row)
    for item in items or []:
        get_category_or_404(session, item.category_id)
        session.add(CategoryBudget(budget_id=budget.id, **item.model_dump()))


def create_budget(session: Session, payload: BudgetCreate) -> BudgetRead:
    existing = session.exec(select(Budget).where(Budget.year == payload.year, Budget.month == payload.month)).first()
    if existing:
        raise HTTPException(status_code=409, detail="Ya existe presupuesto para este mes.")
    budget = Budget(**payload.model_dump(exclude={"category_budgets"}))
    session.add(budget)
    session.commit()
    session.refresh(budget)
    upsert_category_budgets(session, budget, payload.category_budgets)
    session.commit()
    session.refresh(budget)
    return budget_to_read(session, budget)


def update_budget(session: Session, budget_id: int, payload: BudgetUpdate) -> BudgetRead:
    budget = session.get(Budget, budget_id)
    if not budget:
        raise HTTPException(status_code=404, detail="Presupuesto no encontrado.")
    data = payload.model_dump(exclude_unset=True)
    category_budgets = data.pop("category_budgets", None)
    for key, value in data.items():
        setattr(budget, key, value)
    budget.updated_at = now_utc()
    session.add(budget)
    session.commit()
    session.refresh(budget)
    if category_budgets is not None:
        upsert_category_budgets(session, budget, category_budgets)
        session.commit()
    return budget_to_read(session, budget)


def month_range_filter(rows: list[Movement], year: int, month: int) -> list[Movement]:
    return [m for m in rows if m.date.year == year and m.date.month == month]
