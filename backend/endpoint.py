from contextlib import asynccontextmanager
import os
from typing import Any, Dict, Union

from fastapi.responses import JSONResponse
from fastapi import Body, Depends, FastAPI, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv
from pydantic import BaseModel


from auth import get_jwt_user, login
from db import get_pool, init_pool
from mail import EmailValidationException, send_verification_email

load_dotenv()


def queryDB(db, query):
    cursor = db.cursor()
    cursor.execute(query)
    result = cursor.fetchall()
    cursor.close()

    return result


def insertIntoDB(db, query, params):
    cursor = db.cursor()
    cursor.execute(query, params)
    db.commit()
    cursor.close()


def connectToDB():
    # db = mysql.connector.connect(
    #     host=host,
    #     port=port,
    #     user=user,
    #     password=password,
    #     database=database,
    # )

    db = get_pool().get_connection()

    return db


def query_active_reservation(email: str) -> Union[Dict[str, Any], None]:
    sql = "SELECT * FROM reservations WHERE email = %s AND CURRENT_TIMESTAMP BETWEEN start AND end"
    db = get_pool().get_connection()
    cursor = db.cursor(buffered=True)

    cursor.execute(sql, (email,))
    result = cursor.fetchone()

    if result is not None:
        result = {
            "ID": result[0],
            "start": result[1].replace(tzinfo=timezone.utc),
            "end": result[2].replace(tzinfo=timezone.utc),
            "parking-space": result[3],
            "confirmed-reservation": result[4],
            "email": result[5],
        }

    print(f"Active reservation: {result}")

    cursor.close()
    db.close()

    return result


host = "localhost"
port = 3306
user = os.environ.get("DB_USER")
password = os.environ.get("DB_PASSWORD")
database = "parking-app"


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_pool()
    yield


app = FastAPI(lifespan=lifespan)

origins = ["http://localhost:3000", "http://localhost:5173", "http://localhost:4173"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# @app.exception_handler(Exception)
# async def global_exception_handler(request: Request, exc: Exception):
#     return JSONResponse(status_code=500, content={"detail": exc})


@app.post("/login")
def login_route(email: str = Body(), password: str = Body()):
    token = None

    try:
        payload, token = login(email, password)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    return {"success": True, "user": payload, "token": token}


@app.exception_handler(EmailValidationException)
async def unicorn_exception_handler(request: Request, exc: EmailValidationException):
    return JSONResponse(
        status_code=400,
        content={"message": "Test"},
    )


class VerifyEmailBody(BaseModel):
    email: str


@app.post("/verify-email")
def verify_email(body: VerifyEmailBody):
    try:
        send_verification_email(body.email)
    except EmailValidationException as e:
        raise HTTPException(
            status_code=400, detail="Email nie pochodzi z domeny cdv.pl"
        )
    except Exception as e:
        print("Mail error:", e)
        raise HTTPException(status_code=500, detail="Unable to send verification email")

    return {"success": True}


@app.get("/parking-spaces")
def parkingspaces(user=Depends(get_jwt_user)):
    try:
        db = connectToDB()
        result = queryDB(db, "SELECT * FROM `parking-spaces` ORDER BY `ID`")

        jsonResponse = [
            {"ID": record[0], "parking-space": record[1]} for record in result
        ]

        db.close()

        return jsonResponse
    except Exception as e:
        print(f"Db exception: {e}")
        return "There was an issue with connection to database. Please try again later."


@app.get("/reservations")
def reservations():
    result = []

    db = connectToDB()
    try:
        result = queryDB(db, "SELECT * FROM `reservations` ORDER BY `ID`")

    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Database connection error")
    finally:
        db.close()

    reservations = [
        {
            "ID": reservation[0],
            "start": reservation[1].replace(tzinfo=timezone.utc),
            "end": reservation[2].replace(tzinfo=timezone.utc),
            "parking-space": reservation[3],
            "confirmed-reservation": reservation[4],
        }
        for reservation in result
    ]

    return {"success": True, "reservations": reservations}


@app.post("/reservations")
def make_reservation(
    parkingSpot: str = Body("Parking spot which you would like to reserve"),
    startTime: datetime = Body(
        description="Start time of reservation (YYYY-MM-DD HH:MM:SS format)"
    ),
    user=Depends(get_jwt_user),
):
    end_time = startTime + timedelta(minutes=30)

    active = query_active_reservation(user["email"])

    if active is not None:
        raise HTTPException(status_code=400, detail="Posiadasz już aktywną rezerwację")

    db = connectToDB()

    try:

        checkParkingSpace = queryDB(
            db,
            f'SELECT `parking-space` FROM `parking-app`.`parking-spaces` \
            WHERE `parking-space` NOT IN ( \
            SELECT `parking-space` FROM `parking-app`.`reservations` \
            WHERE NOT (end <= "{startTime}" OR start >= "{end_time}") \
            ) \
            ORDER BY `ID`',
        )

        availableSpace = False
        for parkingSpace in checkParkingSpace:
            if parkingSpot == str(parkingSpace[0]):
                availableSpace = True
                break

        if not availableSpace:
            return {
                "success": False,
                "message": "The parking spot that you have selected is not available during specified time.",
            }

        insertIntoDB(
            db,
            f"INSERT INTO `parking-app`.`reservations` \
                    (`start`, `end`, `parking-space`, `confirmed-reservation`, `email`) \
                    VALUES(%s, %s, %s, %s, %s)",
            (startTime, end_time, parkingSpot, 0, user["email"]),
        )

    except:
        raise HTTPException(status_code=500, detail="Database connection error")
    finally:
        db.close()

    return {
        "success": True,
        "message": f"Confirmed reservation for parking space {parkingSpot}. Start time: {startTime}, end time: {end_time}.",
    }


@app.get("/reservations/active")
def get_active_reservation(user=Depends(get_jwt_user)):
    active = query_active_reservation(user["email"])

    return {"success": True, "reservation": active}


@app.get("/get-available-spaces")
def availablespaces(
    startTime: datetime = Query(
        description="Start time of reservation (YYYY-MM-DD HH:MM:SS format)"
    ),
    endTime: datetime = Query(
        description="End time of your reservation (YYYY-MM-DD HH:MM:SS format)"
    ),
):
    try:
        db = connectToDB()
        result = queryDB(
            db,
            f'SELECT `parking-space` FROM `parking-app`.`parking-spaces` \
            WHERE `parking-space` NOT IN ( \
            SELECT `parking-space` FROM `parking-app`.`reservations` \
            WHERE NOT (end <= "{startTime}" OR start >= "{endTime}") \
            ) \
            ORDER BY `ID`',
        )

        jsonResponse = [{"parking-space": record[0]} for record in result]

        return jsonResponse
    except:
        return "There was an issue with connection to database. Please try again later."
