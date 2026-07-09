from sqlmodel import Session, SQLModel, create_engine

from .settings import ensure_directories, settings

ensure_directories()
engine = create_engine(settings.database_url, connect_args={"check_same_thread": False})


def create_db_and_tables() -> None:
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session


def init_db() -> None:
    create_db_and_tables()
    from .seed import seed_categories

    with Session(engine) as session:
        seed_categories(session)
