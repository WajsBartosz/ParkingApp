from contextlib import asynccontextmanager
import os

from fastapi.responses import JSONResponse
import mysql.connector
from fastapi import Body, Depends, FastAPI, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import mailtrap as mt
from dotenv import load_dotenv
from pydantic import BaseModel


from auth import get_jwt_user, login
from db import init_pool
from mail import EmailValidationException, send_verification_email

load_dotenv()


def queryDB(db, query):
    cursor = db.cursor()
    cursor.execute(query)
    result = cursor.fetchall()

    return result


def insertIntoDB(db, query, params):
    cursor = db.cursor()
    cursor.execute(query, params)
    db.commit()


def connectToDB(host, port, user, password, database):
    db = mysql.connector.connect(
        host=host,
        port=port,
        user=user,
        password=password,
        database=database,
    )

    return db


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

origins = ["http://localhost:3000", "http://localhost:5173"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/login")
def login_route(email: str = Body(), password: str = Body()):
    token = None

    try:
        token = login(email, password)
    except Exception as e:
        raise HTTPException(status_code=400, detail=e)

    return {"success": True, "jwt": token}


@app.get("/parking-spaces")
def parkingspaces(user=Depends(get_jwt_user)):
    try:
        db = connectToDB(host, port, user, password, database)
        result = queryDB(db, "SELECT * FROM `parking-spaces` ORDER BY `ID`")

        jsonResponse = [
            {"ID": record[0], "parking-space": record[1]} for record in result
        ]

        return jsonResponse
    except:
        return "There was an issue with connection to database. Please try again later."


@app.get("/reservations")
def reservations():
    result = []

    try:
        db = connectToDB(host, port, user, password, database)
        result = queryDB(db, "SELECT * FROM `reservations` ORDER BY `ID`")
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Database connection error")

    reservations = [
        {
            "ID": reservation[0],
            "start": reservation[1],
            "end": reservation[2],
            "parking-space": reservation[3],
            "confirmed-reservation": reservation[4],
        }
        for reservation in result
    ]

    return {"success": True, "reservations": reservations}


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
        db = connectToDB(host, port, user, password, database)
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


@app.post("/make-reservation")
def makereservation(
    parkingSpot: str = Body("Parking spot which you would like to reserve"),
    startTime: datetime = Body(
        description="Start time of reservation (YYYY-MM-DD HH:MM:SS format)"
    ),
    endTime: datetime = Body(
        description="End time of your reservation (YYYY-MM-DD HH:MM:SS format)"
    ),
):
    try:
        db = connectToDB(host, port, user, password, database)
        checkParkingSpace = queryDB(
            db,
            f'SELECT `parking-space` FROM `parking-app`.`parking-spaces` \
            WHERE `parking-space` NOT IN ( \
            SELECT `parking-space` FROM `parking-app`.`reservations` \
            WHERE NOT (end <= "{startTime}" OR start >= "{endTime}") \
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
                    (`start`, `end`, `parking-space`, `confirmed-reservation`) \
                    VALUES(%s, %s, %s, %s)",
            (startTime, endTime, parkingSpot, 0),
        )

    except:
        return {
            "success": False,
            "message": "There was an issue with connection to database. Please try again later.",
        }

    return {
        "success": True,
        "message": f"Confirmed reservation for parking space {parkingSpot}. Start time: {startTime}, end time: {endTime}.",
    }


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
