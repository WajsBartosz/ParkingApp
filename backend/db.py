import os
from typing import Union
from dotenv import load_dotenv
from mysql.connector import pooling

load_dotenv()

host = os.environ.get("DB_HOST")
port = 3306
user = os.environ.get("DB_USER")
password = os.environ.get("DB_PASSWORD")
database = os.environ.get("DB_NAME")


db_pool: Union[None, pooling.MySQLConnectionPool] = None


def init_pool():
    print("Initializing the db connection pool...")
    global db_pool
    if db_pool is None:
        db_pool = pooling.MySQLConnectionPool(
            pool_name="dbpool",
            pool_size=10,
            pool_reset_session=True,
            host=host,
            database=database,
            user=user,
            password=password,
        )


def get_pool():
    if db_pool is None:
        raise RuntimeError("DB pool not initialized. Call init_pool() first.")
    return db_pool
