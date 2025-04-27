import os

import mysql.connector
from fastapi import FastAPI

def queryDB(db, query):
    cursor = db.cursor()
    cursor.execute(query)
    result = cursor.fetchall()

    return result

db = mysql.connector.connect(
    host="mysql",
    port=3306,
    user=os.environ.get("DB_USER"),
    password=os.environ.get("DB_PASSWORD"),
    database="parking-app",
)

app = FastAPI()


@app.get("/parking-spaces")
def parkingspaces():
    result = queryDB(db, "SELECT * FROM `parking-spaces` ORDER BY `ID`")

    json_response = [
        {
            "ID": record[0], 
            "parking-space": record[1]
        } 
        for record in result
    ]

    return json_response


@app.get("/reservations")
def reservations():
    result = queryDB(db, "SELECT * FROM `reservations` ORDER BY `ID`")

    json_response = [
        {
            "ID": reservation[0],
            "start": reservation[1],
            "end": reservation[2],
            "parking-space": reservation[3],
            "confirmed-reservation": reservation[4],
        }
        for reservation in result
    ]

    return json_response


@app.get("/get-available-spaces")
def availablespaces(start_time, end_time):
    result = queryDB(db, 
        f"SELECT `parking-space` fROM `parking-app`.`parking-spaces` \
        WHERE `parking-space` NOT IN ( \
        SELECT `parking-space` fROM `parking-app`.`reservations` \
        WHERE NOT (end <= \"{start_time}\" OR start >= \"{end_time}\") \
        ) \
        ORDER BY `ID`"
    )

    json_response = [
        {
            "parking-space": record[0]
        }
        for record in result
    ]

    return json_response
