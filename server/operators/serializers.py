from rest_framework import serializers
from .models import Operator, OperatorService, Wallet, Transaction
from accounts.models import User
from django.db import transaction


class OperatorServiceSerializers(serializers.Serializer):

    class Mets:
        model=OperatorService
        fields=[
            "from_location",
            "to_location",
        ]

class RegistraionOperatorSerilaizers(serializers.Serializer):


    name = serializers.CharField(max_length=100)

    phone_number = serializers.CharField(max_length=15)

    email = serializers.EmailField()

    password = serializers.CharField(
        write_only=True
    )

    company_name = serializers.CharField(
        max_length=200
    )
    services = OperatorServiceSerializers(
        many=True
    )


    @transaction.atomic
    def create(self, validated_data):
        services=validated_data.pop("services")
        company_name = validated_data.pop("company_name")
        user = User.objects.create_user(
                    **validated_data,
                    role="operator",
                    approval_status="pending",
                    is_active=True
                        )
        operator = Operator.objects.create(
        user=user,
        company_name=company_name
    )
        operator.service_count = len(services)
        operator.save()

        return operator


class PendingOpeartorSerializer(serializers.ModelSerializer):
    name = serializers.CharField(
        source="user.name"
    )

    phone_number = serializers.CharField(
        source="user.phone_number"
    )

    email = serializers.EmailField(
        source="user.email"
    )

    approval_status = serializers.CharField(
        source="user.approval_status"
    )


    class Meta:
        model = Operator

        fields = [
            "id",
            "company_name",
            "name",
            "phone_number",
            "email",
            "approval_status",
        ]


class AddCreditSerializer(serializers.Serializer):
    operator_ids = serializers.ListField(child=serializers.IntegerField(), required=True)
    credits = serializers.IntegerField(min_value=1)
    description = serializers.CharField(required=False, allow_blank=True, default="Admin credit added")

    def validate_operator_ids(self, value):
        if not value:
            raise serializers.ValidationError("At least one operator must be selected")
        return value


class WalletSerializer(serializers.ModelSerializer):
    class Meta:
        model = Wallet
        fields = ["current_balance", "updated_at"]


class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ["transaction_type", "credits", "balance_after_transaction", "description", "created_at"]