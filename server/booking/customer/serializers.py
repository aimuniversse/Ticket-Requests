from rest_framework import serializers
from .models import CustomerRequests


def mask_phone_number(phone_number):
    if not phone_number:
        return ""
    if len(phone_number) <= 4:
        return "*" * len(phone_number)
    return "*" * (len(phone_number) - 4) + phone_number[-4:]


class CustomerRequestSerilaizers(serializers.ModelSerializer):

    class Meta:
        model = CustomerRequests
        fields = "__all__"
        read_only_fields = ("request_id", "status", "assigned_operator", "created_at", "updated_at")

    def validate_phone_number(self, value):
        if not value.isdigit():
            raise serializers.ValidationError(
                "phone number Should contain only numbers"
            )
        if len(value) != 10:
            raise serializers.ValidationError(
                "phone number must be exaactly 10 digits."
            )
        return value

    def validate_total_tickets(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                "Total tickets must be greater than 0."
            )

        return value

    def validate_expected_price(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                "Expected price must be greater than 0."
            )

        return value

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        request = self.context.get("request")

        if not request or not getattr(request.user, "is_authenticated", False):
            representation["phone_number"] = mask_phone_number(instance.phone_number)
            representation["name"] = "Hidden"
            return representation

        if instance.status == "ACCEPTED" and request.user.role == "operator":
            if instance.assigned_operator and instance.assigned_operator.user_id == request.user.id:
                representation["phone_number"] = instance.phone_number
                representation["name"] = instance.name
                return representation

        if request.user.role == "admin":
            representation["phone_number"] = instance.phone_number
            representation["name"] = instance.name
        elif instance.assigned_operator and instance.assigned_operator.user_id == request.user.id:
            representation["phone_number"] = instance.phone_number
            representation["name"] = instance.name
        else:
            representation["phone_number"] = mask_phone_number(instance.phone_number)
            representation["name"] = "Hidden"

        return representation
    