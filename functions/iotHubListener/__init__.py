import logging
import os
import json
import datetime
from zoneinfo import ZoneInfo
import mysql.connector
from azure.functions import EventHubEvent
from typing import List




def main(events: List[EventHubEvent]):
    currentDate=datetime.datetime.now(ZoneInfo())
    db=mysql.connector.connect(
            host=os.getenv("DB_HOST"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            database=os.getenv("DB_NAME")
    )

    cursor=db.cursor()
    for event in events:
        try:
            message_body=event.get_body().decode("utf-8")
            logging.info(f"received message {message_body}")
            data = json.loads(message_body)
            occupied = data.get('occupied')
            sensor_id = data.get('spot_id')
            parking_place = f"A{int(sensor_id.split("-")[1])}"
            logging.info(parking_place)
            if occupied is not None:
                if not occupied:
                    cursor.execute(f"Select `ID` From `reservations` \
                                   WHERE `start` <= '{currentDate.strftime("%Y-%m-%d %H:%M:%S")}' and `end` >= '{currentDate.strftime("%Y-%m-%d %H:%M:%S")}' and `confirmed-reservation` = 0 and `parking-space` = \"{parking_place}\"")
                    # cursor.execute(f"Select `ID` From `reservations` where `parking-space` = \"A1\"")
                    result=cursor.fetchall()
                    logging.info(result)
                    for ID in result:
                        cursor.execute(f"UPDATE `parking-app`.`reservations` \
                                        SET `confirmed-reservation` = 1 \
                                        WHERE `ID` = {ID[0]}")
                        db.commit()
                        logging.info(f"Reservation with ID: {ID[0]} has been confirmed.")
                    logging.info(f"{result}")
                logging.info(f"Variables: occupied: {occupied}, parking_place: {parking_place}")
            else:
                logging.info("Not all necessary details were sent")
        except Exception as e:
            logging.error(f"Error during reading message: {e}")

