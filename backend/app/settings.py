from pathlib import Path

from pydantic_settings import BaseSettings


PROJECT_ROOT = Path(__file__).resolve().parents[2]
DATA_DIR = PROJECT_ROOT / "data"
EXPORTS_DIR = PROJECT_ROOT / "exports"
DB_PATH = DATA_DIR / "finance.db"


class Settings(BaseSettings):
    app_name: str = "Control Financiero Rubén"
    app_env: str = "local"
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    cors_origins: str = "*"

    @property
    def database_url(self) -> str:
        return f"sqlite:///{DB_PATH.as_posix()}"


settings = Settings()


def ensure_directories() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    EXPORTS_DIR.mkdir(parents=True, exist_ok=True)
