from jinja2 import Environment, FileSystemLoader, select_autoescape

jinja = Environment(
    loader=FileSystemLoader("email_templates"),
    autoescape=select_autoescape(["html", "xml"]),
)
