FROM python:3.12

WORKDIR /code

COPY requirements.txt .

RUN pip install --no-cache-dir --upgrade -r requirements.txt

COPY . . 

EXPOSE 80:80

CMD ["sh", "-c", "sleep 5 && uvicorn endpoint:app --host 0.0.0.0 --port 80"]
