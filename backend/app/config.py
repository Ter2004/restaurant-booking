from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    supabase_url: str = ""
    supabase_service_key: str = ""
    supabase_jwt_secret: str = ""
    # Store as string to avoid pydantic-settings JSON-parsing an empty env var.
    # Use the `cors_origins` property to get the parsed list.
    allowed_origins: str = "http://localhost:3000"
    app_env: str = "development"

    @property
    def cors_origins(self) -> list[str]:
        value = self.allowed_origins.strip()
        if not value:
            return ["http://localhost:3000"]
        if value.startswith("["):
            import json
            return json.loads(value)
        return [o.strip() for o in value.split(",")]

    @property
    def is_production(self) -> bool:
        return self.app_env == "production"


settings = Settings()
