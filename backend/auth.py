import os
import secrets
import string
from db import get_pool
from datetime import datetime, timedelta
from hashlib import sha256
import jwt
from fastapi import Request, HTTPException, status
from functools import wraps


JWT_SECRET = os.environ.get("JWT_SECRET")


def jwt_required(func):
    @wraps(func)
    async def wrapper(*args, **kwargs):
        request = None
        for arg in args:
            if isinstance(arg, Request):
                request = arg
                break
        if not request:
            request = kwargs.get("request")
        if not request:
            raise RuntimeError("Request parameter not found.")

        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Missing or invalid Authorization header",
            )
        token = auth_header.split(" ")[1]
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=401, detail="Token expired")
        except jwt.InvalidTokenError:
            raise HTTPException(status_code=401, detail="Invalid token")

        kwargs["jwt_payload"] = payload
        return await func(*args, **kwargs)

    return wrapper


def hash_password(password: str):
    return sha256(password.encode("utf-8")).hexdigest()


def login(email: str, password: str):

    if not email.endswith("cdv.pl"):
        raise Exception("Niepoprawne dane logowania")

    conn = get_pool().get_connection()
    cursor = conn.cursor()

    current_time = datetime.now()

    sql = "SELECT * FROM otp WHERE email = %s AND expires_at > %s AND used = 0"
    cursor.execute(sql, (email, current_time))

    result = cursor.fetchone()

    if result is None:
        raise Exception("Hasło wygasło lub zostało już wykorzystane")

    stored_password = result[3]

    password_hash = hash_password(password)

    print(f"stored password: {stored_password}")
    print(f"hashed password: {password_hash}")

    if stored_password != password_hash:
        raise Exception("Niepoprawne dane logowania")

    print(f"result:{result}")

    expires_at = datetime.now() + timedelta(days=1)

    payload = {
        "exp": expires_at,
        "user": email,
    }

    token = jwt.encode(payload, JWT_SECRET, algorithm="HS256")

    return token


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

    return otp
