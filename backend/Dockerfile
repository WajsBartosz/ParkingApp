FROM python:latest

WORKDIR /code

COPY requirements.txt .

RUN pip install --no-cache-dir --upgrade -r requirements.txt

COPY endpoint.py app.py

CMD ["sh", "-c", "sleep 5 && uvicorn app:app --host 0.0.0.0 --port 80"]