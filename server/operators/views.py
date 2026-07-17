from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db import transaction
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .serializers import RegistraionOperatorSerilaizers, PendingOpeartorSerializer, AddCreditSerializer, WalletSerializer, TransactionSerializer
from .models import Operator, Wallet, Transaction
from customer.models import CustomerRequests
from customer.serializers import mask_phone_number


class OperatorRegistrationAPIView(APIView):
    def post(self, request):
        serializer = RegistraionOperatorSerilaizers(data=request.data)

        if serializer.is_valid():
            serializer.save()

            return Response(
                {
                    "message": "Operator registration successful. Waiting for admin approval."
                },
                status=status.HTTP_201_CREATED,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PendingOperatorListAPIView(APIView):
    def get(self, request):
        operators = Operator.objects.filter(user__approval_status="pending")
        serializer = PendingOpeartorSerializer(operators, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)


class OperatorListAPIView(APIView):
    def get(self, request):
        if not request.user.is_authenticated or request.user.role != "admin":
            return Response({"detail": "Only admins can view operators."}, status=status.HTTP_403_FORBIDDEN)

        operators = Operator.objects.all().order_by("-created_at")
        serializer = PendingOpeartorSerializer(operators, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ApproveOperatorAPIView(APIView):
    def post(self, request, operator_id):
        if not request.user.is_authenticated or request.user.role != "admin":
            return Response(
                {"detail": "Only admins can approve operators."},
                status=status.HTTP_403_FORBIDDEN,
            )

        operator = get_object_or_404(Operator, id=operator_id)
        user = operator.user
        user.approval_status = "approved"
        user.is_active = True
        user.approved_by = request.user
        user.approved_at = timezone.now()
        user.save(update_fields=["approval_status", "is_active", "approved_by", "approved_at"])

        return Response(
            {"message": "Operator approved successfully."},
            status=status.HTTP_200_OK,
        )


class RejectOperatorAPIView(APIView):
    def post(self, request, operator_id):
        if not request.user.is_authenticated or request.user.role != "admin":
            return Response({"detail": "Only admins can reject operators."}, status=status.HTTP_403_FORBIDDEN)

        operator = get_object_or_404(Operator, id=operator_id)
        user = operator.user
        user.approval_status = "rejected"
        user.is_active = False
        user.save(update_fields=["approval_status", "is_active"])
        return Response({"message": "Operator rejected successfully."}, status=status.HTTP_200_OK)


class ActivateOperatorAPIView(APIView):
    def post(self, request, operator_id):
        if not request.user.is_authenticated or request.user.role != "admin":
            return Response({"detail": "Only admins can activate operators."}, status=status.HTTP_403_FORBIDDEN)

        operator = get_object_or_404(Operator, id=operator_id)
        user = operator.user
        user.is_active = True
        user.save(update_fields=["is_active"])
        return Response({"message": "Operator activated successfully."}, status=status.HTTP_200_OK)


class DeactivateOperatorAPIView(APIView):
    def post(self, request, operator_id):
        if not request.user.is_authenticated or request.user.role != "admin":
            return Response({"detail": "Only admins can deactivate operators."}, status=status.HTTP_403_FORBIDDEN)

        operator = get_object_or_404(Operator, id=operator_id)
        user = operator.user
        user.is_active = False
        user.save(update_fields=["is_active"])
        return Response({"message": "Operator deactivated successfully."}, status=status.HTTP_200_OK)


class AssignedRequestsAPIView(APIView):
    def get(self, request):
        if not request.user.is_authenticated:
            return Response(
                {"detail": "Authentication credentials were not provided."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        operator = get_object_or_404(Operator, user=request.user)
        requests = CustomerRequests.objects.filter(assigned_operator=operator).order_by("-created_at")

        data = [
            {
                "id": item.id,
                "name": item.name,
                "status": item.status,
                "assigned_operator_id": item.assigned_operator.id if item.assigned_operator else None,
                "phone_number": item.phone_number
                if request.user.role == "admin"
                or (
                    item.assigned_operator is not None
                    and item.assigned_operator.user_id == request.user.id
                )
                else mask_phone_number(item.phone_number),
            }
            for item in requests
        ]

        return Response(data, status=status.HTTP_200_OK)


class AddCreditAPIView(APIView):
    def post(self, request):
        if not request.user.is_authenticated or request.user.role != "admin":
            return Response({"detail": "Only admins can add credits."}, status=status.HTTP_403_FORBIDDEN)

        serializer = AddCreditSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        credits = serializer.validated_data["credits"]
        description = serializer.validated_data["description"]

        for operator_id in serializer.validated_data["operator_ids"]:
            operator = get_object_or_404(Operator, id=operator_id)
            wallet, _ = Wallet.objects.get_or_create(operator=operator)
            wallet.current_balance += credits
            wallet.save(update_fields=["current_balance", "updated_at"])
            Transaction.objects.create(
                operator=operator,
                transaction_type="CREDIT",
                credits=credits,
                balance_after_transaction=wallet.current_balance,
                description=description,
            )

        return Response({"message": "Credits added successfully."}, status=status.HTTP_200_OK)


class WalletAPIView(APIView):
    def get(self, request):
        if not request.user.is_authenticated:
            return Response({"detail": "Authentication credentials were not provided."}, status=status.HTTP_401_UNAUTHORIZED)

        operator = get_object_or_404(Operator, user=request.user)
        wallet, _ = Wallet.objects.get_or_create(operator=operator)
        serializer = WalletSerializer(wallet)
        return Response(serializer.data, status=status.HTTP_200_OK)


class WalletHistoryAPIView(APIView):
    def get(self, request):
        if not request.user.is_authenticated:
            return Response({"detail": "Authentication credentials were not provided."}, status=status.HTTP_401_UNAUTHORIZED)

        operator = get_object_or_404(Operator, user=request.user)
        transactions = Transaction.objects.filter(operator=operator).order_by("-created_at")
        serializer = TransactionSerializer(transactions, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)