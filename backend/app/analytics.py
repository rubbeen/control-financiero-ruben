from calendar import monthrange
from datetime import date

from sqlmodel import Session, select

from .models import Budget, Category, CategoryBudget, Movement
from .schemas import Recommendation

EXPENSE_TYPES = {"expense", "purchase", "adjustment"}


def money(value: float) -> str:
    return "$" + f"{round(value):,}".replace(",", ".")


def previous_month(year: int, month: int) -> tuple[int, int]:
    return (year - 1, 12) if month == 1 else (year, month - 1)


def movements_for_month(session: Session, year: int, month: int) -> list[Movement]:
    rows = session.exec(select(Movement)).all()
    return [m for m in rows if m.date.year == year and m.date.month == month]


def income_total(rows: list[Movement]) -> float:
    return sum(m.amount for m in rows if m.type == "income")


def expense_total(rows: list[Movement]) -> float:
    return sum(m.amount for m in rows if m.type in EXPENSE_TYPES)


def category_expenses(session: Session, rows: list[Movement]) -> list[dict]:
    totals: dict[int, float] = {}
    for movement in rows:
        if movement.type in EXPENSE_TYPES:
            totals[movement.category_id] = totals.get(movement.category_id, 0) + movement.amount
    result = []
    for category_id, amount in sorted(totals.items(), key=lambda item: item[1], reverse=True):
        category = session.get(Category, category_id)
        result.append(
            {
                "category_id": category_id,
                "category": category.name if category else "Sin categoria",
                "color": category.color if category else "#6B7280",
                "amount": amount,
            }
        )
    return result


def top_category(session: Session, rows: list[Movement]) -> dict | None:
    categories = category_expenses(session, rows)
    return categories[0] if categories else None


def monthly_summary(session: Session, year: int, month: int) -> dict:
    rows = movements_for_month(session, year, month)
    total_income = income_total(rows)
    total_expense = expense_total(rows)
    balance = total_income - total_expense
    expense_days = {m.date for m in rows if m.type in EXPENSE_TYPES}
    by_category = category_expenses(session, rows)
    top = by_category[0] if by_category else None
    necessary = sum(m.amount for m in rows if m.type in EXPENSE_TYPES and m.is_necessary)
    unnecessary = sum(m.amount for m in rows if m.type in EXPENSE_TYPES and not m.is_necessary)
    top_expenses = sorted([m for m in rows if m.type in EXPENSE_TYPES], key=lambda m: m.amount, reverse=True)[:10]
    budget = session.exec(select(Budget).where(Budget.year == year, Budget.month == month)).first()

    return {
        "year": year,
        "month": month,
        "total_income": total_income,
        "total_expense": total_expense,
        "balance": balance,
        "saving_amount": balance,
        "saving_rate": (balance / total_income * 100) if total_income else None,
        "expense_rate": (total_expense / total_income * 100) if total_income else None,
        "average_daily_expense": (total_expense / len(expense_days)) if expense_days else 0,
        "highest_expense_day": highest_expense_day(rows),
        "top_expense_category": top,
        "necessary_expenses": necessary,
        "unnecessary_expenses": unnecessary,
        "category_expenses": by_category,
        "top_expenses": [
            {
                "id": m.id,
                "date": m.date.isoformat(),
                "description": m.description,
                "amount": m.amount,
                "category_id": m.category_id,
            }
            for m in top_expenses
        ],
        "budget": budget.model_dump() if budget else None,
        "messages": empty_messages(rows, budget),
    }


def highest_expense_day(rows: list[Movement]) -> dict | None:
    totals: dict[date, float] = {}
    for movement in rows:
        if movement.type in EXPENSE_TYPES:
            totals[movement.date] = totals.get(movement.date, 0) + movement.amount
    if not totals:
        return None
    day, amount = max(totals.items(), key=lambda item: item[1])
    return {"date": day.isoformat(), "amount": amount}


def empty_messages(rows: list[Movement], budget: Budget | None) -> list[str]:
    messages = []
    if not rows:
        messages.append("No existen movimientos registrados en este periodo.")
    if not budget:
        messages.append("No se ha definido presupuesto para este mes.")
        messages.append("No se ha definido meta de ahorro.")
    elif not budget.saving_goal:
        messages.append("No se ha definido meta de ahorro.")
    return messages


def comparison(session: Session, year: int, month: int) -> dict:
    current = monthly_summary(session, year, month)
    prev_year, prev_month = previous_month(year, month)
    previous_rows = movements_for_month(session, prev_year, prev_month)
    previous = monthly_summary(session, prev_year, prev_month)
    if not previous_rows:
        return {
            "current": current,
            "previous": previous,
            "message": "No existe mes anterior para comparar.",
            "expense_variation": None,
            "income_variation": None,
            "largest_category_increase": None,
        }
    return {
        "current": current,
        "previous": previous,
        "message": None,
        "expense_variation": variation(current["total_expense"], previous["total_expense"]),
        "income_variation": variation(current["total_income"], previous["total_income"]),
        "balance_variation": variation(current["balance"], previous["balance"]),
        "largest_category_increase": largest_category_increase(session, year, month, prev_year, prev_month),
    }


def variation(current: float, previous: float) -> dict:
    absolute = current - previous
    percent = (absolute / previous * 100) if previous else None
    return {"absolute": absolute, "percent": percent}


def largest_category_increase(session: Session, year: int, month: int, prev_year: int, prev_month: int) -> dict | None:
    current = {x["category_id"]: x for x in category_expenses(session, movements_for_month(session, year, month))}
    previous = {x["category_id"]: x for x in category_expenses(session, movements_for_month(session, prev_year, prev_month))}
    increases = []
    for category_id, item in current.items():
        diff = item["amount"] - previous.get(category_id, {"amount": 0})["amount"]
        increases.append({**item, "increase": diff})
    positive = [x for x in increases if x["increase"] > 0]
    return max(positive, key=lambda item: item["increase"]) if positive else None


def trends(session: Session, months: int = 6) -> list[dict]:
    today = date.today()
    result = []
    year, month = today.year, today.month
    for _ in range(max(1, min(months, 24))):
        summary = monthly_summary(session, year, month)
        result.append(
            {
                "year": year,
                "month": month,
                "label": f"{year}-{month:02d}",
                "income": summary["total_income"],
                "expense": summary["total_expense"],
                "saving": summary["saving_amount"],
                "balance": summary["balance"],
            }
        )
        year, month = previous_month(year, month)
    return list(reversed(result))


def recommendations(session: Session, year: int, month: int) -> list[Recommendation]:
    summary = monthly_summary(session, year, month)
    comp = comparison(session, year, month)
    recs: list[Recommendation] = []
    total_expense = summary["total_expense"]
    total_income = summary["total_income"]
    top = summary["top_expense_category"]

    if total_expense > total_income and top:
        recs.append(
            Recommendation(
                title="Gastos por encima de ingresos",
                explanation=f"Este mes tus gastos superaron tus ingresos por {money(total_expense - total_income)}. Revisa principalmente la categoria {top['category']}.",
                affected_value=total_expense - total_income,
                suggested_action="Reduce o aplaza gastos no necesarios antes de registrar nuevos compromisos.",
                level="critico",
            )
        )

    if top and total_expense:
        percent = top["amount"] / total_expense * 100
        if percent > 30:
            recs.append(
                Recommendation(
                    title="Alta concentracion por categoria",
                    explanation=f"La categoria {top['category']} representa el {percent:.1f}% de tus gastos del mes. Es tu mayor concentracion de consumo.",
                    affected_value=top["amount"],
                    suggested_action="Define un limite concreto para esta categoria y revisalo semanalmente.",
                    level="advertencia",
                )
            )

    expense_var = comp.get("expense_variation")
    largest = comp.get("largest_category_increase")
    if expense_var and expense_var["percent"] is not None:
        if expense_var["absolute"] > 0:
            category = largest["category"] if largest else "sin categoria identificada"
            recs.append(
                Recommendation(
                    title="Aumento frente al mes anterior",
                    explanation=f"Tus gastos aumentaron {expense_var['percent']:.1f}% frente al mes anterior. La mayor variacion estuvo en la categoria {category}.",
                    affected_value=expense_var["absolute"],
                    suggested_action="Compara los movimientos de esa categoria y decide cuales no se repiten.",
                    level="advertencia",
                )
            )
        elif expense_var["absolute"] < 0:
            recs.append(
                Recommendation(
                    title="Reduccion de gastos",
                    explanation=f"Tus gastos disminuyeron {abs(expense_var['percent']):.1f}% frente al mes anterior.",
                    affected_value=abs(expense_var["absolute"]),
                    suggested_action="Mantén las decisiones que redujeron el gasto este mes.",
                    level="positivo",
                )
            )

    budget = summary["budget"]
    if budget and budget.get("saving_goal"):
        diff = summary["saving_amount"] - budget["saving_goal"]
        if diff < 0:
            recs.append(
                Recommendation(
                    title="Meta de ahorro pendiente",
                    explanation=f"No alcanzaste tu meta de ahorro. Te faltaron {money(abs(diff))} para cumplirla.",
                    affected_value=abs(diff),
                    suggested_action="Separa primero el ahorro al recibir ingresos y ajusta gastos variables.",
                    level="advertencia",
                )
            )
        else:
            recs.append(
                Recommendation(
                    title="Meta de ahorro cumplida",
                    explanation=f"Cumpliste tu meta de ahorro. Superaste la meta por {money(diff)}.",
                    affected_value=diff,
                    suggested_action="Conserva este excedente como ahorro o fondo de emergencia.",
                    level="positivo",
                )
            )

    if budget and budget.get("unnecessary_expense_limit"):
        extra = summary["unnecessary_expenses"] - budget["unnecessary_expense_limit"]
        if extra > 0:
            recs.append(
                Recommendation(
                    title="Gastos no necesarios sobre el limite",
                    explanation=f"Tus gastos no necesarios superaron el limite definido por {money(extra)}.",
                    affected_value=extra,
                    suggested_action="Congela compras no necesarias hasta volver al limite.",
                    level="advertencia",
                )
            )

    small = [m for m in movements_for_month(session, year, month) if m.type in EXPENSE_TYPES and m.amount <= 30000]
    small_total = sum(m.amount for m in small)
    if len(small) >= 5:
        recs.append(
            Recommendation(
                title="Gastos pequenos acumulados",
                explanation=f"Detecte {len(small)} gastos pequenos que acumulados representan {money(small_total)}. Revisa si alguno puede reducirse.",
                affected_value=small_total,
                suggested_action="Agrupa compras pequeñas en un solo presupuesto semanal.",
                level="advertencia",
            )
        )

    if not recs and total_income:
        recs.append(
            Recommendation(
                title="Mes bajo control",
                explanation=f"Tu balance actual es {money(summary['balance'])} con ingresos reales por {money(total_income)}.",
                affected_value=summary["balance"],
                suggested_action="Continua registrando movimientos para mejorar el analisis.",
                level="positivo",
            )
        )
    return recs


def monthly_data(session: Session, year: int, month: int) -> dict:
    return {
        "summary": monthly_summary(session, year, month),
        "comparison": comparison(session, year, month),
        "recommendations": [r.model_dump() for r in recommendations(session, year, month)],
    }
