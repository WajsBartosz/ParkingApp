import os

import mysql.connector
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime


def queryDB(db, query, params=None):
    cursor = db.cursor()
    cursor.execute(query, params)
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


def checkDate(date, format):
    try:
        datetime.strptime(date, format)
        return True
    except:
        return False


host="mysql"
port=3306
user=os.environ.get("DB_USER")
password=os.environ.get("DB_PASSWORD")
database="parking-app"
datetimeFormat="%Y-%m-%d %H:%M:%S"

app = FastAPI()

origins = ["http://localhost:3000", "http://localhost:5173"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/parking-spaces")
def parkingspaces():
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
    try:
        db = connectToDB(host, port, user, password, database)
        result = queryDB(db, "SELECT * FROM `reservations` ORDER BY `ID`")

        jsonResponse = [
            {
                "ID": reservation[0],
                "start": reservation[1],
                "end": reservation[2],
                "parking-space": reservation[3],
                "confirmed-reservation": reservation[4],
            }
            for reservation in result
        ]

        return jsonResponse
    except:
        return "There was an issue with connection to database. Please try again later."


@app.get("/get-available-spaces")
def availablespaces(startTime: str = Query(description="Start time of reservation (YYYY-MM-DD HH:MM:SS format)"), endTime: str = Query(description="End time of your reservation (YYYY-MM-DD HH:MM:SS format)")):
    if checkDate(startTime, datetimeFormat) and checkDate(endTime, datetimeFormat):
        try:
            db=connectToDB(host, port, user, password, database)
            print("dupa")
            result=queryDB(db, 
                f"SELECT `parking-space` FROM `parking-app`.`parking-spaces` \
                WHERE `parking-space` NOT IN ( \
                SELECT `parking-space` FROM `parking-app`.`reservations` \
                WHERE NOT (end <= %s OR start >= %s) \
                ) \
                ORDER BY `ID`",
                (startTime, endTime)
            )
            print(result)
            jsonResponse=[
                {
                    "parking-space": record[0]
                }
                for record in result
            ]

            return jsonResponse
        except:
            return "There was an issue with connection to database. Please try again later."
    else:
        return "Start time and end time must be in YYYY-MM-DD HH:MM:SS format."
    
@app.post("/make-reservation")
def makereservation(parkingSpot: str = Query("Parking spot which you would like to reserve"), startTime: str = Query(description="Start time of reservation (YYYY-MM-DD HH:MM:SS format)"), endTime: str = Query(description="End time of your reservation (YYYY-MM-DD HH:MM:SS format)")):
    if checkDate(startTime, datetimeFormat) and checkDate(endTime, datetimeFormat):
        try:
            db=connectToDB(host, port, user, password, database)
            checkParkingSpace=queryDB(db,
                f"SELECT `parking-space` FROM `parking-app`.`parking-spaces` \
                WHERE `parking-space` NOT IN ( \
                SELECT `parking-space` FROM `parking-app`.`reservations` \
                WHERE NOT (end <= %s OR start >= %s) \
                ) \
                ORDER BY `ID`",
                (startTime, endTime)
            )

            for parkingSpace in checkParkingSpace:
                if parkingSpot == str(parkingSpace[0]):
                    availableSpace = True
                    break
                else:
                    availableSpace = False

            if availableSpace:
                insertIntoDB(db,
                        f"INSERT INTO `parking-app`.`reservations` \
                        (`start`, `end`, `parking-space`, `confirmed-reservation`) \
                        VALUES(%s, %s, %s, %s)",
                        (startTime, endTime, parkingSpot, 0)          
                )
                return f"Confirmed reservation for parking space {parkingSpot}. Start time: {startTime}, end time: {endTime}."
            else:
                return "The parking spot that you have selected is not available during specified time."
        except:
            return "There was an issue with connection to database. Please try again later."
    else:
        return "Start time and end time must be in YYYY-MM-DD HH:MM:SS format."