import logging

from rest_framework import serializers
from django.contrib.auth import authenticate, get_user_model
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from django.core.mail import send_mail
from django.conf import settings
from django.core import signing


logger = logging.getLogger(__name__)


User = get_user_model()


class LoginSerilaizer(serializers.Serializer):

    phone_number = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        phone_number = data.get("phone_number")
        password = data.get("password")

        user = authenticate(
            request=self.context.get('request'),
            phone_number=phone_number,
            password=password
        )

        if not user:
            raise serializers.ValidationError(
                "Invalid phone number or password"
            )

        if not user.is_active:
            raise serializers.ValidationError(
                "Account is inactive"
            )

        if user.role == "operator" and user.approval_status != "approved":
            raise serializers.ValidationError(
                "Operator account is not approved"
            )

        data["user"] = user

        return data


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        user = User.objects.filter(email=value).first()
        if not user:
            raise serializers.ValidationError("No account found with this email")
        if not user.is_active:
            raise serializers.ValidationError("This account is inactive")
        if user.role not in ["admin", "operator"]:
            raise serializers.ValidationError("Only admin/operator accounts can reset password")
        return value

    def save(self):
        email = self.validated_data["email"]
        user = User.objects.get(email=email)

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = signing.dumps(user.pk)

        reset_link = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}/"

        print("RESET LINK:", reset_link)

        return user, reset_link, False


class ResetPasswordSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True, min_length=8)

    def validate(self, data):
        if data["new_password"] != data["confirm_password"]:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match"})
        return data

    def save(self):
        token = self.validated_data["token"]

        try:
            user_pk = signing.loads(token, max_age=getattr(settings, 'PASSWORD_RESET_TIMEOUT', 86400))
        except signing.BadSignature:
            raise serializers.ValidationError({"token": "Invalid or expired reset link"})

        try:
            user = User.objects.get(pk=user_pk)
        except User.DoesNotExist:
            raise serializers.ValidationError({"uid": "Invalid reset link"})

        user.set_password(self.validated_data["new_password"])
        user.save()
        return user
        