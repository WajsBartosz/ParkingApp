import os
from fastapi.exceptions import ValidationException
import mailtrap as mt
from pydantic import ValidationError

mailtrap_api_key = os.environ.get("MAILTRAP_API_KEY")


class EmailValidationException(Exception):
    def __init__(self, name: str):
        self.name = name


def send_verification_email(email: str):
    if mailtrap_api_key is None:
        raise Exception("Email error: API KEY NOT SPECIFIED")

    if not email.endswith("cdv.pl"):
        raise EmailValidationException("Podany adres email nie jest z domeny cdv.pl")

    mail = mt.Mail(
        sender=mt.Address(email="hello@demomailtrap.co"),
        to=[mt.Address(email=email)],
        subject="Weryfikacja konta",
        text="AAAAAAAAAAAAAAAAAAAAAA",
    )

    client = mt.MailtrapClient(token=mailtrap_api_key)
    client.send(mail)
