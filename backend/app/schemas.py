from datetime import date, datetime
from typing import Literal, Optional

from pydantic import BaseModel, Field, field_validator


CategoryType = Literal["income", "expense", "both"]
MovementType = Literal["income", "expense", "purchase", "transfer", "adjustment"]
RecommendationLevel = Literal["positivo", "advertencia", "critico"]


class CategoryBase(BaseModel):
    name: str = Field(min_length=1)
    type: CategoryType
    color: Optional[str] = None
    icon: Optional[str] = None
    active: bool = True


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1)
    type: Optional[CategoryType] = None
    color: Optional[str] = None
    icon: Optional[str] = None
    active: Optional[bool] = None


class CategoryRead(CategoryBase):
    id: int
    created_at: datetime
    updated_at: datetime


class MovementBase(BaseModel):
    type: MovementType
    amount: float = Field(gt=0)
    date: date
    category_id: int
    payment_method: Optional[str] = None
    description: str = Field(min_length=1)
    notes: Optional[str] = None
    tag: Optional[str] = None
    place: Optional[str] = None
    is_necessary: bool = True
    is_recurring: bool = False

    @field_validator("description")
    @classmethod
    def clean_description(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("La descripcion no puede estar vacia.")
        return value


class MovementCreate(MovementBase):
    pass


class MovementUpdate(BaseModel):
    type: Optional[MovementType] = None
    amount: Optional[float] = Field(default=None, gt=0)
    date: Optional[date] = None
    category_id: Optional[int] = None
    payment_method: Optional[str] = None
    description: Optional[str] = Field(default=None, min_length=1)
    notes: Optional[str] = None
    tag: Optional[str] = None
    place: Optional[str] = None
    is_necessary: Optional[bool] = None
    is_recurring: Optional[bool] = None


class MovementRead(MovementBase):
    id: int
    category_name: Optional[str] = None
    category_color: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class CategoryBudgetInput(BaseModel):
    category_id: int
    amount_limit: float = Field(ge=0)


class CategoryBudgetRead(CategoryBudgetInput):
    id: int
    budget_id: int
    category_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class BudgetBase(BaseModel):
    year: int = Field(ge=2000, le=2100)
    month: int = Field(ge=1, le=12)
    total_budget: Optional[float] = Field(default=0, ge=0)
    saving_goal: Optional[float] = Field(default=0, ge=0)
    unnecessary_expense_limit: Optional[float] = Field(default=0, ge=0)


class BudgetCreate(BudgetBase):
    category_budgets: list[CategoryBudgetInput] = []


class BudgetUpdate(BaseModel):
    year: Optional[int] = Field(default=None, ge=2000, le=2100)
    month: Optional[int] = Field(default=None, ge=1, le=12)
    total_budget: Optional[float] = Field(default=None, ge=0)
    saving_goal: Optional[float] = Field(default=None, ge=0)
    unnecessary_expense_limit: Optional[float] = Field(default=None, ge=0)
    category_budgets: Optional[list[CategoryBudgetInput]] = None


class BudgetRead(BudgetBase):
    id: int
    category_budgets: list[CategoryBudgetRead] = []
    created_at: datetime
    updated_at: datetime


class SettingRead(BaseModel):
    key: str
    value: Optional[str] = None
    updated_at: datetime


class SettingUpdate(BaseModel):
    value: Optional[str] = None


class Recommendation(BaseModel):
    title: str
    explanation: str
    affected_value: float
    suggested_action: str
    level: RecommendationLevel


class ImportSummary(BaseModel):
    imported_categories: int
    imported_movements: int
    imported_budgets: int
    skipped_duplicates: int
