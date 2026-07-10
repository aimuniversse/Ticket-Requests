from rest_framework import serializers
from .models import CustomerRequests

class CustomerRequestSerilaizers(serializers.ModelSerializer):

    class Meta :
        model = CustomerRequests
        fields= "__all__"

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
    
    