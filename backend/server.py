from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import logging
from datetime import datetime, timezone, timedelta
from typing import Optional

import bcrypt
import jwt
from bson import ObjectId
from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr, Field

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

JWT_ALGORITHM = "HS256"
MAX_FAILED = 5
LOCKOUT_MINUTES = 15


# ---------- helpers ----------
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def get_jwt_secret() -> str:
    return os.environ["JWT_SECRET"]


def create_access_token(user_id: str, email: str) -> str:
    payload = {"sub": user_id, "email": email,
               "exp": datetime.now(timezone.utc) + timedelta(minutes=15), "type": "access"}
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)


def create_refresh_token(user_id: str) -> str:
    payload = {"sub": user_id,
               "exp": datetime.now(timezone.utc) + timedelta(days=7), "type": "refresh"}
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)


def set_auth_cookies(response: Response, access: str, refresh: str):
    response.set_cookie(key="access_token", value=access, httponly=True, secure=True,
                        samesite="none", max_age=900, path="/")
    response.set_cookie(key="refresh_token", value=refresh, httponly=True, secure=True,
                        samesite="none", max_age=604800, path="/")


def public_user(user: dict) -> dict:
    return {
        "id": str(user["_id"]),
        "email": user["email"],
        "name": user.get("name", ""),
        "role": user.get("role", "user"),
    }


async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Non authentifié")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Type de jeton invalide")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="Utilisateur introuvable")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Session expirée")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Jeton invalide")


# ---------- models ----------
class RegisterInput(BaseModel):
    email: str = Field(..., min_length=3)
    password: str = Field(..., min_length=6)
    name: Optional[str] = ""


class LoginInput(BaseModel):
    email: str
    password: str


class ForgotPasswordInput(BaseModel):
    email: str


# ---------- brute force ----------
async def check_lockout(identifier: str):
    rec = await db.login_attempts.find_one({"identifier": identifier})
    if rec and rec.get("count", 0) >= MAX_FAILED:
        last = rec.get("last_attempt")
        if last:
            if isinstance(last, str):
                last = datetime.fromisoformat(last)
            if datetime.now(timezone.utc) - last < timedelta(minutes=LOCKOUT_MINUTES):
                raise HTTPException(status_code=429,
                                    detail="Trop de tentatives. Réessayez dans quelques minutes.")


async def record_failure(identifier: str):
    await db.login_attempts.update_one(
        {"identifier": identifier},
        {"$inc": {"count": 1}, "$set": {"last_attempt": datetime.now(timezone.utc).isoformat()}},
        upsert=True,
    )


async def clear_failures(identifier: str):
    await db.login_attempts.delete_one({"identifier": identifier})


# ---------- routes ----------
@api_router.get("/")
async def root():
    return {"message": "Bouygues clone API"}


@api_router.post("/auth/register")
async def register(payload: RegisterInput, response: Response):
    email = payload.email.strip().lower()
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="Un compte existe déjà avec cet identifiant.")
    doc = {
        "email": email,
        "password_hash": hash_password(payload.password),
        "name": payload.name or "",
        "role": "user",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    result = await db.users.insert_one(doc)
    doc["_id"] = result.inserted_id
    access = create_access_token(str(result.inserted_id), email)
    refresh = create_refresh_token(str(result.inserted_id))
    set_auth_cookies(response, access, refresh)
    return {"message": "Compte créé avec succès", "user": public_user(doc)}


@api_router.post("/auth/login")
async def login(payload: LoginInput, request: Request, response: Response):
    email = payload.email.strip().lower()
    ip = request.client.host if request.client else "unknown"
    identifier = f"{ip}:{email}"
    await check_lockout(identifier)

    user = await db.users.find_one({"email": email})
    if not user or not verify_password(payload.password, user["password_hash"]):
        await record_failure(identifier)
        raise HTTPException(status_code=401, detail="Identifiant ou mot de passe incorrect.")

    await clear_failures(identifier)
    access = create_access_token(str(user["_id"]), email)
    refresh = create_refresh_token(str(user["_id"]))
    set_auth_cookies(response, access, refresh)
    return {"message": "Connexion réussie", "user": public_user(user)}


@api_router.post("/auth/logout")
async def logout(response: Response, user: dict = Depends(get_current_user)):
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    return {"message": "Déconnecté"}


@api_router.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return {"user": public_user(user)}


@api_router.post("/auth/refresh")
async def refresh_token(request: Request, response: Response):
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status_code=401, detail="Aucun jeton de rafraîchissement")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Type de jeton invalide")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="Utilisateur introuvable")
        access = create_access_token(str(user["_id"]), user["email"])
        response.set_cookie(key="access_token", value=access, httponly=True, secure=True,
                            samesite="none", max_age=900, path="/")
        return {"message": "Jeton rafraîchi"}
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Jeton invalide")


@api_router.post("/auth/forgot-password")
async def forgot_password(payload: ForgotPasswordInput):
    import secrets
    email = payload.email.strip().lower()
    user = await db.users.find_one({"email": email})
    # Always return success to avoid user enumeration
    if user:
        token = secrets.token_urlsafe(32)
        await db.password_reset_tokens.insert_one({
            "email": email,
            "token": token,
            "used": False,
            "expires_at": datetime.now(timezone.utc) + timedelta(hours=1),
        })
        logger.info(f"Password reset link: /reset-password?token={token}")
    return {"message": "Si un compte existe, un lien de réinitialisation a été envoyé."}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=[os.environ.get("FRONTEND_URL", "http://localhost:3000"),
                   "http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await db.password_reset_tokens.create_index("expires_at", expireAfterSeconds=0)
    await db.login_attempts.create_index("identifier")
    # seed admin
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@example.com").lower()
    admin_password = os.environ.get("ADMIN_PASSWORD", "admin123")
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        await db.users.insert_one({
            "email": admin_email,
            "password_hash": hash_password(admin_password),
            "name": "Admin",
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one({"email": admin_email},
                                  {"$set": {"password_hash": hash_password(admin_password)}})


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
