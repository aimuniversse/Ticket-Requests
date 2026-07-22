from rest_framework import serializers
from .models import Operator, OperatorService, Wallet, Transaction, PointRequest
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
    id = serializers.IntegerField(read_only=True)
    operator_id = serializers.IntegerField(source="operator.id", read_only=True)
    operator_name = serializers.CharField(source="operator.user.name", read_only=True)
    operator_email = serializers.EmailField(source="operator.user.email", read_only=True)
    operator_company = serializers.CharField(source="operator.company_name", read_only=True)
    customer_request_id = serializers.IntegerField(source="customer_request.id", read_only=True)
    customer_name = serializers.SerializerMethodField()
    customer_from = serializers.SerializerMethodField()
    customer_to = serializers.SerializerMethodField()
    request_date = serializers.SerializerMethodField()

    class Meta:
        model = Transaction
        fields = [
            "id",
            "transaction_type",
            "credits",
            "balance_after_transaction",
            "description",
            "created_at",
            "operator_id",
            "operator_name",
            "operator_email",
            "operator_company",
            "customer_request_id",
            "customer_name",
            "customer_from",
            "customer_to",
            "request_date",
        ]

    def get_customer_name(self, obj):
        return obj.customer_request.name if obj.customer_request else None

    def get_customer_from(self, obj):
        return obj.customer_request.from_location if obj.customer_request else None

    def get_customer_to(self, obj):
        return obj.customer_request.to_location if obj.customer_request else None

    def get_request_date(self, obj):
        if obj.customer_request and obj.customer_request.journey_date:
            return obj.customer_request.journey_date
        return None


class PointRequestSerializer(serializers.ModelSerializer):
    operator_name = serializers.CharField(source="operator.user.name", read_only=True)
    company_name = serializers.CharField(source="operator.company_name", read_only=True)

    class Meta:
        model = PointRequest
        fields = ["id", "operator", "operator_name", "company_name", "points_requested", "reason", "status", "admin_response", "created_at", "updated_at"]
        read_only_fields = ["id", "operator", "status", "admin_response", "created_at", "updated_at"]


class PointRequestActionSerializer(serializers.Serializer):
    admin_response = serializers.CharField(required=False, allow_blank=True, default="")
