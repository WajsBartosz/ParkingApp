import os
import secrets
import string

from db import get_pool
from datetime import datetime, timedelta
import bcrypt
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials


JWT_SECRET = os.environ.get("JWT_SECRET")
ALGORITHM = "HS256"
EMAIL_WHITELIST = [
    "bkazmierczak@edu.cdv.pl",
    "bwajs@edu.cdv.pl",
    "pdachowski@edu.cdv.pl",
]

bearer_scheme = HTTPBearer()


def get_jwt_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    try:
        payload = jwt.decode(
            credentials.credentials, JWT_SECRET, algorithms=[ALGORITHM]
        )
        return payload
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token"
        )


def hash_password(password: str):
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode(), salt)

    return hashed


def verify_password(plain_pw: bytes, hashed_pw: bytes):
    return bcrypt.checkpw(plain_pw, hashed_pw)


def login(email: str, password: str):

    if not email.endswith("cdv.pl"):
        raise Exception("Niepoprawne dane logowania")

    if email not in EMAIL_WHITELIST:
        raise Exception("Adresu nie ma na białej liście")

    conn = get_pool().get_connection()
    cursor = conn.cursor()

    current_time = datetime.now()

    sql = "SELECT * FROM otp WHERE email = %s AND expires_at > %s AND used = 0 ORDER BY id DESC LIMIT 1"
    cursor.execute(sql, (email, current_time))

    result = cursor.fetchone()

    if result is None:
        raise Exception("Hasło wygasło lub zostało już wykorzystane")

    stored_password = result[3]

    if not verify_password(password.encode(), stored_password.encode()):
        raise Exception("Niepoprawne dane logowania")

    try:
        sql = "UPDATE otp SET used = 1 WHERE id = %s"
        cursor.execute(sql, (result[0],))
        conn.commit()
    except Exception:
        raise Exception("Nie udało się zalogować. Spróbuj ponownie później")
    finally:
        cursor.close()
        conn.close()

    expires_at = datetime.now() + timedelta(days=1)

    user = {"email": email}

    payload = {"exp": expires_at, **user}

    token = jwt.encode(payload, JWT_SECRET, algorithm=ALGORITHM)

    return user, token


def generate_otp(email: str) -> str:

    characters = string.ascii_letters + string.digits

    otp = "".join(secrets.choice(characters) for _ in range(16))
    otp_hash = hash_password(otp)

    conn = get_pool().get_connection()

    cursor = conn.cursor()

    expires_at = datetime.now() + timedelta(minutes=5)

    sql = "INSERT INTO otp (expires_at, password, email) VALUES (%s, %s, %s)"
    cursor.execute(sql, (expires_at, otp_hash, email))
    conn.commit()

    cursor.close()
    conn.close()

    return otp
