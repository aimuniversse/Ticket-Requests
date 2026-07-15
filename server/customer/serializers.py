from rest_framework import serializers
from datetime import timedelta
from django.utils import timezone
from .models import CustomerRequests

class CustomerRequestSerilaizers(serializers.ModelSerializer):

    class Meta :
        model = CustomerRequests
        fields = [
            "id", "request_id", "public_token", "name", "phone_number",
            "from_location", "to_location", "journey_date", "total_tickets",
            "bus_type", "expected_price", "status", "created_at", "expires_at",
        ]
        read_only_fields = ["id", "request_id", "public_token", "status", "created_at", "expires_at"]

    def create(self, validated_data):
        validated_data["expires_at"] = timezone.now() + timedelta(minutes=5)
        return super().create(validated_data)

    def validate_phone_number(self,value):
        if not value.isdigit():
            raise serializers.ValidationError(
                "phone number Should contain only numbers"
            )
        if len(value)!=10:
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
    
