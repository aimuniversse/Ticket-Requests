from rest_framework import serializers
from .models import CustomerRequests


def mask_phone_number(phone_number):
    if not phone_number:
        return ""
    if len(phone_number) <= 4:
        return phone_number
    if len(phone_number) >= 10:
        return "*****" + phone_number[-4:]
    return "*" * (len(phone_number) - 4) + phone_number[-4:]


class CustomerRequestSerilaizers(serializers.ModelSerializer):
    contact_unlocked = serializers.SerializerMethodField()

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

    def get_contact_unlocked(self, instance):
        request = self.context.get("request")
        if not request or not getattr(request.user, "is_authenticated", False):
            return False

        if request.user.role == "admin":
            return True

        if instance.assigned_operator and instance.assigned_operator.user_id == request.user.id:
            return True

        return False

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        request = self.context.get("request")

        instance.refresh_status()

        representation["assigned_operator_name"] = (
            instance.assigned_operator.company_name if instance.assigned_operator else None
        )

        if not request or not getattr(request.user, "is_authenticated", False):
            representation["phone_number"] = mask_phone_number(instance.phone_number)
            representation["name"] = "Hidden"
            representation["contact_unlocked"] = False
            return representation

        if request.user.role == "admin":
            representation["phone_number"] = instance.phone_number
            representation["name"] = instance.name
            representation["contact_unlocked"] = True
        elif instance.assigned_operator and instance.assigned_operator.user_id == request.user.id:
            representation["phone_number"] = instance.phone_number
            representation["name"] = instance.name
            representation["contact_unlocked"] = True
        else:
            representation["phone_number"] = mask_phone_number(instance.phone_number)
            representation["name"] = "Hidden"
            representation["contact_unlocked"] = False

        return representation
    