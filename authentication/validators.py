import re

from django.core.exceptions import ValidationError


def validate_password_strength(password):
    if len(password) < 8:
        raise ValidationError("Password must be at least 8 characters long.")

    if not re.search(r"[A-Z]", password):
        raise ValidationError(
            "Password must contain at least one uppercase letter."
        )

    if not re.search(r"[a-z]", password):
        raise ValidationError(
            "Password must contain at least one lowercase letter."
        )

    if not re.search(r"\d", password):
        raise ValidationError("Password must contain at least one digit.")

    if not re.search(r"[!@#$%^&*(),.?\":{}|<>_\-+=\[\]\\;'/`~]", password):
        raise ValidationError(
            "Password must contain at least one special character."
        )


def validate_phone_number(value):
    pattern = r"^\+?1?\d{10,15}$"
    if not re.match(pattern, value):
        raise ValidationError(
            "Phone number must be between 10 and 15 digits, "
            "and may start with '+' or '1'."
        )
