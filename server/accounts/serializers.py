from rest_framework import serializers
from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from django.core.mail import send_mail
from django.conf import settings
from django.utils.encoding import force_str
from django.utils.http import urlsafe_base64_decode


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
        token = default_token_generator.make_token(user)
        reset_link = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}/"

        send_mail(
            subject="Reset your password",
            message=(
                f"Hello {user.name or user.phone_number},\n\n"
                f"Use the following link to reset your password:\n{reset_link}\n\n"
                "If you did not request this, please ignore this email."
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=False,
        )
        return user


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
       
        uid = self.validated_data["uid"]
        token = self.validated_data["token"]

        try:
            user_id = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=user_id)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            raise serializers.ValidationError({"uid": "Invalid reset link"})

        if not default_token_generator.check_token(user, token):
            raise serializers.ValidationError({"token": "Invalid or expired reset link"})

        user.set_password(self.validated_data["new_password"])
        user.save()
        return user
        