import httpx
from fastapi import HTTPException, Security, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from app.config import settings

bearer_scheme = HTTPBearer(auto_error=False)

_jwks_cache: dict | None = None


def _get_jwks() -> dict:
    global _jwks_cache
    if _jwks_cache is None:
        url = f"{settings.supabase_url}/auth/v1/.well-known/jwks.json"
        resp = httpx.get(url, timeout=5)
        resp.raise_for_status()
        _jwks_cache = resp.json()
    return _jwks_cache


def decode_jwt(token: str) -> dict:
    # Try HS256 with legacy secret first
    try:
        payload = jwt.decode(
            token,
            settings.supabase_jwt_secret,
            algorithms=["HS256"],
            options={"verify_aud": False},
        )
        return payload
    except JWTError:
        pass

    # Fallback: try ES256 with JWKS public keys
    try:
        jwks = _get_jwks()
        for key in jwks.get("keys", []):
            try:
                payload = jwt.decode(
                    token,
                    key,
                    algorithms=["ES256", "RS256"],
                    options={"verify_aud": False},
                )
                return payload
            except JWTError:
                continue
    except Exception:
        pass

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token",
        headers={"WWW-Authenticate": "Bearer"},
    )


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Security(bearer_scheme),
) -> dict:
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return decode_jwt(credentials.credentials)


async def require_owner(user: dict = Security(get_current_user)) -> dict:
    role = user.get("user_metadata", {}).get("role", "customer")
    if role not in ("owner", "admin"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Owner access required")
    return user


async def require_admin(user: dict = Security(get_current_user)) -> dict:
    role = user.get("user_metadata", {}).get("role", "customer")
    if role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return user
