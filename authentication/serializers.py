from django.contrib.auth import authenticate
from rest_framework import serializers

from authentication.models import Admin
from authentication.validators import (
    validate_password_strength,
    validate_phone_number,
)


class AdminRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password_strength],
        style={"input_type": "password"},
    )

    class Meta:
        model = Admin
        fields = [
            "id",
            "name",
            "email",
            "phone_number",
            "password",
        ]
        read_only_fields = ["id"]

    def validate_email(self, value):
        if Admin.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError(
                "An admin with this email already exists."
            )
        return value.lower()

    def validate_phone_number(self, value):
        validate_phone_number(value)
        if Admin.objects.filter(phone_number=value).exists():
            raise serializers.ValidationError(
                "An admin with this phone number already exists."
            )
        return value

    def create(self, validated_data):
        password = validated_data.pop("password")
        admin = Admin(**validated_data)
        admin.set_password(password)
        admin.save()
        return admin


class AdminLoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(
        required=True, style={"input_type": "password"}, write_only=True
    )

    def validate(self, attrs):
        email = attrs.get("email", "").lower().strip()
        password = attrs.get("password", "")

        admin = authenticate(
            request=self.context.get("request"),
            email=email,
            password=password,
        )

        if not admin:
            raise serializers.ValidationError(
                "Invalid email or password."
            )

        if not admin.is_active:
            raise serializers.ValidationError(
                "This account is inactive."
            )

        attrs["admin"] = admin
        return attrs


class AdminProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Admin
        fields = [
            "id",
            "name",
            "email",
            "phone_number",
        ]
        read_only_fields = ["id", "email"]

    def validate_phone_number(self, value):
        validate_phone_number(value)
        admin = self.instance
        if (
            Admin.objects.filter(phone_number=value)
            .exclude(id=admin.id)
            .exists()
        ):
            raise serializers.ValidationError(
                "An admin with this phone number already exists."
            )
        return value


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(
        required=True, style={"input_type": "password"}, write_only=True
    )
    new_password = serializers.CharField(
        required=True,
        validators=[validate_password_strength],
        style={"input_type": "password"},
        write_only=True,
    )

    def validate_old_password(self, value):
        admin = self.context.get("request").user
        if not admin.check_password(value):
            raise serializers.ValidationError(
                "Old password is incorrect."
            )
        return value

    def validate(self, attrs):
        if attrs["old_password"] == attrs["new_password"]:
            raise serializers.ValidationError(
                "New password must be different from the old password."
            )
        return attrs

    def save(self, **kwargs):
        admin = self.context.get("request").user
        admin.set_password(self.validated_data["new_password"])
        admin.save()
        return admin


class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField(required=True)

    def validate_refresh(self, value):
        from rest_framework_simplejwt.tokens import RefreshToken

        try:
            RefreshToken(value)
        except Exception:
            raise serializers.ValidationError(
                "Invalid or expired refresh token."
            )
        return value
