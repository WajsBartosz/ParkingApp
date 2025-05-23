import datetime
import logging
import os
import mysql.connector
import azure.functions as func

def main(mytimer: func.TimerRequest) -> None:
    logging.info("Starting function for removing unconfirmed reservations")
    try:
        currentDate=datetime.datetime.now()
        subMinutes=datetime.timedelta(minutes = 30)
        newDate=currentDate-subMinutes
        db=mysql.connector.connect(
            host=os.getenv("DB_HOST"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            database=os.getenv("DB_NAME")
        )
        logging.info(newDate)
        cursor=db.cursor()

        cursor.execute(f"Select * from `reservations` \
                        where `start` <= '{newDate.strftime("%Y-%m-%d %H:%M:%S")}' and `confirmed-reservation` = 0")
        result=cursor.fetchall()

        for reservation in result:
            cursor.execute(f"Delete from `reservations` \
                            where ID = {reservation[0]}")
            db.commit()
            logging.info(f"Reservation with ID: {reservation[0]} has been removed.")
        
    except mysql.connector.Error as err:
        logging.error(f"MySQL error: {err}")
    finally:
        if db.is_connected():
            cursor.close()
            db.close()