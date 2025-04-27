import os

import mysql.connector
from fastapi import FastAPI

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
    cursor = db.cursor()
    query = "SELECT * from `parking-spaces` ORDER BY `ID`"
    cursor.execute(query)
    result = cursor.fetchall()

    json_response = [{"ID": record[0], "parking-space": record[1]} for record in result]

    return json_response


@app.get("/reservations")
def reservations():
    cursor = db.cursor()
    query = "SELECT * from `reservations` ORDER BY `ID`"
    cursor.execute(query)
    result = cursor.fetchall()

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
