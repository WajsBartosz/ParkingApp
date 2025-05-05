import os

import mysql.connector
from fastapi import FastAPI, Query
from datetime import datetime

def queryDB(db, query):
    cursor = db.cursor()
    cursor.execute(query)
    result = cursor.fetchall()

    return result

def connectToDB(host, port, user, password, database):
    db = mysql.connector.connect(
        host=host,
        port=port,
        user=user,
        password=password,
        database=database,
    )
    
    return db

host="mysql"
port=3306
user=os.environ.get("DB_USER")
password=os.environ.get("DB_PASSWORD")
database="parking-app"
app = FastAPI()


@app.get("/parking-spaces")
def parkingspaces():
    try:
        db=connectToDB(host, port, user, password, database)
        result=queryDB(db, "SELECT * FROM `parking-spaces` ORDER BY `ID`")

        json_response=[
            {
                "ID": record[0], 
                "parking-space": record[1]
            } 
            for record in result
        ]

        return json_response
    except:
        return "There was an issue with connection to database. Please try again later."

@app.get("/reservations")
def reservations():
    try:
        db=connectToDB(host, port, user, password, database)
        result=queryDB(db, "SELECT * FROM `reservations` ORDER BY `ID`")

        json_response=[
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
    except:
        return "There was an issue with connection to database. Please try again later."


@app.get("/get-available-spaces")
def availablespaces(start_time: datetime = Query(description="Start time of reservation (YYYY-MM-DD HH:MM:SS format)"), end_time: datetime = Query(description="End time of your reservation (YYYY-MM-DD HH:MM:SS format)")):
    try:
        db=connectToDB(host, port, user, password, database)
        result=queryDB(db, 
            f"SELECT `parking-space` FROM `parking-app`.`parking-spaces` \
            WHERE `parking-space` NOT IN ( \
            SELECT `parking-space` FROM `parking-app`.`reservations` \
            WHERE NOT (end <= \"{start_time}\" OR start >= \"{end_time}\") \
            ) \
            ORDER BY `ID`"
        )

        json_response=[
            {
                "parking-space": record[0]
            }
            for record in result
        ]

        return json_response
    except:
        return "There was an issue with connection to database. Please try again later."