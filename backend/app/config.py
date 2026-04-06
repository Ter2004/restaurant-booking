from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    supabase_url: str = ""
    supabase_service_key: str = ""
    supabase_jwt_secret: str = ""
    allowed_origins: list[str] = ["http://localhost:3000"]
    app_env: str = "development"

    @property
    def is_production(self) -> bool:
        return self.app_env == "production"


settings = Settings()
