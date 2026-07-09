from __future__ import annotations

from datetime import date as date_type
from datetime import datetime, timezone
from typing import Optional

from sqlmodel import Field, SQLModel


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


class Category(SQLModel, table=True):
    __tablename__ = "categories"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True, nullable=False)
    type: str = Field(nullable=False, index=True)
    color: Optional[str] = None
    icon: Optional[str] = None
    active: bool = Field(default=True, nullable=False)
    created_at: datetime = Field(default_factory=now_utc, nullable=False)
    updated_at: datetime = Field(default_factory=now_utc, nullable=False)


class Movement(SQLModel, table=True):
    __tablename__ = "movements"

    id: Optional[int] = Field(default=None, primary_key=True)
    type: str = Field(nullable=False, index=True)
    amount: float = Field(nullable=False)
    date: date_type = Field(nullable=False, index=True)
    category_id: int = Field(foreign_key="categories.id", nullable=False, index=True)
    payment_method: Optional[str] = None
    description: str = Field(nullable=False)
    notes: Optional[str] = None
    tag: Optional[str] = None
    place: Optional[str] = None
    is_necessary: bool = Field(default=True, nullable=False)
    is_recurring: bool = Field(default=False, nullable=False)
    created_at: datetime = Field(default_factory=now_utc, nullable=False)
    updated_at: datetime = Field(default_factory=now_utc, nullable=False)


class Budget(SQLModel, table=True):
    __tablename__ = "budgets"

    id: Optional[int] = Field(default=None, primary_key=True)
    year: int = Field(nullable=False, index=True)
    month: int = Field(nullable=False, index=True)
    total_budget: Optional[float] = 0
    saving_goal: Optional[float] = 0
    unnecessary_expense_limit: Optional[float] = 0
    created_at: datetime = Field(default_factory=now_utc, nullable=False)
    updated_at: datetime = Field(default_factory=now_utc, nullable=False)


class CategoryBudget(SQLModel, table=True):
    __tablename__ = "category_budgets"

    id: Optional[int] = Field(default=None, primary_key=True)
    budget_id: int = Field(foreign_key="budgets.id", nullable=False, index=True)
    category_id: int = Field(foreign_key="categories.id", nullable=False, index=True)
    amount_limit: float = Field(nullable=False)
    created_at: datetime = Field(default_factory=now_utc, nullable=False)
    updated_at: datetime = Field(default_factory=now_utc, nullable=False)


class AppSetting(SQLModel, table=True):
    __tablename__ = "settings"

    id: Optional[int] = Field(default=None, primary_key=True)
    key: str = Field(unique=True, nullable=False, index=True)
    value: Optional[str] = None
    updated_at: datetime = Field(default_factory=now_utc, nullable=False)


class MonthlySnapshot(SQLModel, table=True):
    __tablename__ = "monthly_snapshots"

    id: Optional[int] = Field(default=None, primary_key=True)
    year: int = Field(nullable=False, index=True)
    month: int = Field(nullable=False, index=True)
    total_income: float = 0
    total_expense: float = 0
    balance: float = 0
    saving_amount: float = 0
    saving_rate: float = 0
    generated_at: datetime = Field(default_factory=now_utc, nullable=False)
