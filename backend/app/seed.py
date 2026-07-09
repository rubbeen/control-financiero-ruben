from sqlmodel import Session, select

from .models import Category, now_utc


EXPENSES = [
    ("Alimentacion", "#F97316", "Utensils"),
    ("Transporte", "#2563EB", "Bus"),
    ("Servicios publicos", "#FACC15", "Lightbulb"),
    ("Vivienda", "#0F172A", "Home"),
    ("Salud", "#16A34A", "HeartPulse"),
    ("Educacion", "#7C3AED", "GraduationCap"),
    ("Familia", "#EC4899", "Users"),
    ("Deudas", "#DC2626", "CreditCard"),
    ("Compras personales", "#F97316", "ShoppingBag"),
    ("Ropa", "#14B8A6", "Shirt"),
    ("Tecnologia", "#2563EB", "Laptop"),
    ("Entretenimiento", "#A855F7", "Gamepad2"),
    ("Ahorro", "#16A34A", "PiggyBank"),
    ("Emergencias", "#DC2626", "AlertTriangle"),
    ("Otros gastos", "#6B7280", "Circle"),
]

INCOMES = [
    ("Salario", "#16A34A", "Briefcase"),
    ("Trabajo independiente", "#22C55E", "Laptop"),
    ("Ingreso extra", "#84CC16", "PlusCircle"),
    ("Venta", "#10B981", "Store"),
    ("Reembolso", "#14B8A6", "RefreshCcw"),
    ("Otros ingresos", "#6B7280", "Circle"),
]


def seed_categories(session: Session) -> None:
    existing = session.exec(select(Category).limit(1)).first()
    if existing:
        return

    for name, color, icon in EXPENSES:
        session.add(Category(name=name, type="expense", color=color, icon=icon, active=True))
    for name, color, icon in INCOMES:
        session.add(Category(name=name, type="income", color=color, icon=icon, active=True))
    session.commit()


def seed_demo_data(session: Session) -> None:
    from datetime import date

    from .models import Budget, Movement

    if session.exec(select(Movement).limit(1)).first():
        return

    by_name = {c.name: c for c in session.exec(select(Category)).all()}
    samples = [
        ("income", 3200000, date(2026, 7, 1), "Salario", "Salario mensual", True, False),
        ("income", 450000, date(2026, 7, 8), "Trabajo independiente", "Proyecto corto", True, False),
        ("income", 150000, date(2026, 6, 20), "Ingreso extra", "Venta ocasional", True, False),
        ("expense", 220000, date(2026, 7, 2), "Alimentacion", "Mercado semanal", True, False),
        ("expense", 18000, date(2026, 7, 2), "Transporte", "TransMilenio", True, True),
        ("purchase", 145000, date(2026, 7, 4), "Compras personales", "Zapatos", False, False),
        ("expense", 98000, date(2026, 7, 5), "Servicios publicos", "Energia", True, False),
        ("expense", 75000, date(2026, 7, 6), "Salud", "Medicamentos", True, False),
        ("expense", 62000, date(2026, 7, 7), "Entretenimiento", "Salida", False, False),
        ("expense", 35000, date(2026, 7, 8), "Alimentacion", "Almuerzo", True, False),
        ("expense", 26000, date(2026, 7, 9), "Transporte", "Taxi", False, False),
        ("expense", 110000, date(2026, 7, 10), "Deudas", "Cuota tarjeta", True, False),
        ("expense", 70000, date(2026, 6, 3), "Alimentacion", "Mercado", True, False),
        ("expense", 45000, date(2026, 6, 5), "Transporte", "Gasolina", True, False),
        ("expense", 120000, date(2026, 6, 11), "Tecnologia", "Accesorios", False, False),
        ("expense", 90000, date(2026, 6, 17), "Servicios publicos", "Internet", True, False),
        ("expense", 40000, date(2026, 6, 20), "Entretenimiento", "Cine", False, False),
        ("expense", 85000, date(2026, 6, 22), "Familia", "Regalo", True, False),
    ]
    for item in samples:
        type_, amount, day, category, description, necessary, recurring = item
        session.add(
            Movement(
                type=type_,
                amount=amount,
                date=day,
                category_id=by_name[category].id,
                description=description,
                payment_method="Efectivo",
                is_necessary=necessary,
                is_recurring=recurring,
            )
        )
    session.add(
        Budget(
            year=2026,
            month=7,
            total_budget=1600000,
            saving_goal=600000,
            unnecessary_expense_limit=250000,
        )
    )
    session.commit()
