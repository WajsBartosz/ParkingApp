import os
from dotenv import load_dotenv
import mailtrap as mt

from auth import generate_otp
from jinja import jinja

load_dotenv()

mailtrap_api_key = os.environ.get("MAILTRAP_API_KEY")


def get_otp_email(otp: str):
    template = jinja.get_template("otp-email.html")
    rendered = template.render(otp=otp)

    return rendered


class EmailValidationException(Exception):
    def __init__(self, name: str):
        self.name = name


def send_verification_email(email: str):
    if mailtrap_api_key is None:
        raise Exception("Email error: API KEY NOT SPECIFIED")

    if not email.endswith("cdv.pl"):
        raise EmailValidationException("Podany adres email nie jest z domeny cdv.pl")

    otp = generate_otp(email)

    mail = mt.Mail(
        sender=mt.Address(email="accounts@galacticode.dev"),
        to=[mt.Address(email=email)],
        subject="Jednorazowy kod logowania",
        html=get_otp_email(otp),
    )

    client = mt.MailtrapClient(token=mailtrap_api_key)
    client.send(mail)
