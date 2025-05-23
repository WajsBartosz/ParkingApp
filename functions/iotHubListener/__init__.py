import logging
import os
import json
import datetime
import mysql.connector
from azure.functions import EventHubEvent
from typing import List




def main(events: List[EventHubEvent]):
    currentDate=datetime.datetime.now()
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
            parking_place = data.get('spot_id')
            logging.info(parking_place)
            if occupied:
                logging.info(f"Parking place: {parking_place} is occupied, changing status")
                cursor.execute(f"Select `ID` From `reservations` \
                                WHERE `start` <= '{currentDate.strftime("%Y-%m-%d %H:%M:%S")}' and `end` >= '{currentDate.strftime("%Y-%m-%d %H:%M:%S")}' and `confirmed-reservation` = 0 and `parking-space` = \"{parking_place}\"")
                result=cursor.fetchall()
                logging.info(result)
                for ID in result:
                    cursor.execute(f"UPDATE `parking-app`.`reservations` \
                                    SET `confirmed-reservation` = 1 \
                                    WHERE `ID` = {ID[0]}")
                    db.commit()
                    logging.info(f"Reservation with ID: {ID[0]} has been confirmed.")
            else:
                logging.info(f"Parking place: {parking_place} is not occupied, changing status")
                cursor.execute(f"Select `ID` From `reservations` \
                                WHERE `start` <= '{currentDate.strftime("%Y-%m-%d %H:%M:%S")}' and `end` >= '{currentDate.strftime("%Y-%m-%d %H:%M:%S")}' and `confirmed-reservation` = 1 and `parking-space` = \"{parking_place}\"")
                result=cursor.fetchall()
                logging.info(result)
                for ID in result:
                    cursor.execute(f"UPDATE `parking-app`.`reservations` \
                                    SET `confirmed-reservation` = 0 \
                                    WHERE `ID` = {ID[0]}")
                    db.commit()
                    logging.info(f"Reservation with ID: {ID[0]} has confirmation set to 0.")

        except Exception as e:
            logging.error(f"Error during reading message: {e}")

