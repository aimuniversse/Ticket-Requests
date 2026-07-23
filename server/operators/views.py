from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db import transaction
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .serializers import RegistraionOperatorSerilaizers, PendingOpeartorSerializer, AddCreditSerializer, WalletSerializer, TransactionSerializer, PointRequestSerializer, PointRequestActionSerializer
from .models import Operator, Wallet, Transaction, PointRequest
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
        if not request.user.is_authenticated:
            return Response({"detail": "Authentication credentials were not provided."}, status=status.HTTP_401_UNAUTHORIZED)
        if request.user.role != "admin":
            return Response({"detail": "Only admins can view pending operators."}, status=status.HTTP_403_FORBIDDEN)

        operators = Operator.objects.filter(user__approval_status="pending")
        serializer = PendingOpeartorSerializer(operators, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)


class OperatorListAPIView(APIView):
    def get(self, request):
        if not request.user.is_authenticated:
            return Response({"detail": "Authentication credentials were not provided."}, status=status.HTTP_401_UNAUTHORIZED)
        if request.user.role != "admin":
            return Response({"detail": "Only admins can view operators."}, status=status.HTTP_403_FORBIDDEN)

        operators = Operator.objects.all().order_by("-created_at")
        serializer = PendingOpeartorSerializer(operators, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ApproveOperatorAPIView(APIView):
    def post(self, request, operator_id):
        if not request.user.is_authenticated:
            return Response({"detail": "Authentication credentials were not provided."}, status=status.HTTP_401_UNAUTHORIZED)
        if request.user.role != "admin":
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
        if not request.user.is_authenticated:
            return Response({"detail": "Authentication credentials were not provided."}, status=status.HTTP_401_UNAUTHORIZED)
        if request.user.role != "admin":
            return Response({"detail": "Only admins can reject operators."}, status=status.HTTP_403_FORBIDDEN)

        operator = get_object_or_404(Operator, id=operator_id)
        user = operator.user
        user.approval_status = "rejected"
        user.is_active = False
        user.save(update_fields=["approval_status", "is_active"])
        return Response({"message": "Operator rejected successfully."}, status=status.HTTP_200_OK)


class ActivateOperatorAPIView(APIView):
    def post(self, request, operator_id):
        if not request.user.is_authenticated:
            return Response({"detail": "Authentication credentials were not provided."}, status=status.HTTP_401_UNAUTHORIZED)
        if request.user.role != "admin":
            return Response({"detail": "Only admins can activate operators."}, status=status.HTTP_403_FORBIDDEN)

        operator = get_object_or_404(Operator, id=operator_id)
        user = operator.user
        user.is_active = True
        user.save(update_fields=["is_active"])
        return Response({"message": "Operator activated successfully."}, status=status.HTTP_200_OK)


class DeactivateOperatorAPIView(APIView):
    def post(self, request, operator_id):
        if not request.user.is_authenticated:
            return Response({"detail": "Authentication credentials were not provided."}, status=status.HTTP_401_UNAUTHORIZED)
        if request.user.role != "admin":
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

        data = []
        for item in requests:
            item.refresh_status()
            contact_unlocked = request.user.role == "admin" or (
                item.assigned_operator is not None
                and item.assigned_operator.user_id == request.user.id
            )
            data.append(
                {
                    "id": item.id,
                    "name": item.name if contact_unlocked else "Hidden",
                    "status": item.status,
                    "assigned_operator_id": item.assigned_operator.id if item.assigned_operator else None,
                    "phone_number": item.phone_number if contact_unlocked else mask_phone_number(item.phone_number),
                    "contact_unlocked": contact_unlocked,
                    "from_location": item.from_location,
                    "to_location": item.to_location,
                    "journey_date": item.journey_date,
                    "journey_time": item.journey_time,
                    "total_tickets": item.total_tickets,
                    "bus_type": item.bus_type,
                    "expected_price": item.expected_price,
                    "request_id": item.request_id,
                    "expires_at": item.expires_at,
                    "created_at": item.created_at,
                }
            )

        return Response(data, status=status.HTTP_200_OK)


class AddCreditAPIView(APIView):
    def post(self, request):
        if not request.user.is_authenticated:
            return Response({"detail": "Authentication credentials were not provided."}, status=status.HTTP_401_UNAUTHORIZED)
        if request.user.role != "admin":
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


class AdminOperatorTransactionsAPIView(APIView):
    def get(self, request, operator_id):
        if not request.user.is_authenticated:
            return Response({"detail": "Authentication credentials were not provided."}, status=status.HTTP_401_UNAUTHORIZED)
        if request.user.role != "admin":
            return Response({"detail": "Only admins can view operator transactions."}, status=status.HTTP_403_FORBIDDEN)

        operator = get_object_or_404(Operator, id=operator_id)
        wallet, _ = Wallet.objects.get_or_create(operator=operator)
        transactions = Transaction.objects.filter(operator=operator).order_by("-created_at")
        return Response({
            "wallet": WalletSerializer(wallet).data,
            "transactions": TransactionSerializer(transactions, many=True).data,
        }, status=status.HTTP_200_OK)


class AdminTransactionsAPIView(APIView):
<<<<<<< HEAD
=======
    def get(self, request):
        if not request.user.is_authenticated:
            return Response({"detail": "Authentication credentials were not provided."}, status=status.HTTP_401_UNAUTHORIZED)
        if request.user.role != "admin":
            return Response({"detail": "Only admins can view transaction history."}, status=status.HTTP_403_FORBIDDEN)

        credits = Transaction.objects.filter(transaction_type="CREDIT").order_by("-created_at")
        serializer = TransactionSerializer(credits, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class OperatorPointRequestCreateView(APIView):
    def post(self, request):
        if not request.user.is_authenticated:
            return Response({"detail": "Authentication credentials were not provided."}, status=status.HTTP_401_UNAUTHORIZED)
        if request.user.role != "operator":
            return Response({"detail": "Only operators can request points."}, status=status.HTTP_403_FORBIDDEN)

        operator = get_object_or_404(Operator, user=request.user)
        serializer = PointRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        serializer.save(operator=operator)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class OperatorPointRequestListView(APIView):
    def get(self, request):
        if not request.user.is_authenticated:
            return Response({"detail": "Authentication credentials were not provided."}, status=status.HTTP_401_UNAUTHORIZED)

        operator = get_object_or_404(Operator, user=request.user)
        point_requests = PointRequest.objects.filter(operator=operator).order_by("-created_at")
        serializer = PointRequestSerializer(point_requests, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class AdminPointRequestListView(APIView):
>>>>>>> 332fab01927346c87f0b547ac4c9f0dce9bbf7af
    def get(self, request):
        if not request.user.is_authenticated:
            return Response({"detail": "Authentication credentials were not provided."}, status=status.HTTP_401_UNAUTHORIZED)
        if request.user.role != "admin":
<<<<<<< HEAD
            return Response({"detail": "Only admins can view transaction history."}, status=status.HTTP_403_FORBIDDEN)

        credits = Transaction.objects.filter(transaction_type="CREDIT").order_by("-created_at")
        serializer = TransactionSerializer(credits, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
=======
            return Response({"detail": "Only admins can view point requests."}, status=status.HTTP_403_FORBIDDEN)

        point_requests = PointRequest.objects.all().order_by("-created_at")
        serializer = PointRequestSerializer(point_requests, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class AdminPointRequestActionView(APIView):
    def post(self, request, request_id, action):
        if not request.user.is_authenticated:
            return Response({"detail": "Authentication credentials were not provided."}, status=status.HTTP_401_UNAUTHORIZED)
        if request.user.role != "admin":
            return Response({"detail": "Only admins can act on point requests."}, status=status.HTTP_403_FORBIDDEN)
        if action not in ("approve", "reject"):
            return Response({"detail": "Invalid action."}, status=status.HTTP_400_BAD_REQUEST)

        point_request = get_object_or_404(PointRequest, id=request_id)
        if point_request.status != "PENDING":
            return Response({"detail": "This request has already been processed."}, status=status.HTTP_400_BAD_REQUEST)

        serializer = PointRequestActionSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        admin_response = serializer.validated_data.get("admin_response", "")

        if action == "approve":
            point_request.status = "APPROVED"
            point_request.admin_response = admin_response or "Approved by admin"
            point_request.save(update_fields=["status", "admin_response", "updated_at"])

            operator = point_request.operator
            wallet, _ = Wallet.objects.get_or_create(operator=operator)
            wallet.current_balance += point_request.points_requested
            wallet.save(update_fields=["current_balance", "updated_at"])
            Transaction.objects.create(
                operator=operator,
                transaction_type="CREDIT",
                credits=point_request.points_requested,
                balance_after_transaction=wallet.current_balance,
                description=f"Points approved: {point_request.reason or 'Operator request'}",
            )
        else:
            point_request.status = "REJECTED"
            point_request.admin_response = admin_response or "Rejected by admin"
            point_request.save(update_fields=["status", "admin_response", "updated_at"])

        return Response({"message": f"Request {action}d successfully."}, status=status.HTTP_200_OK)
>>>>>>> 332fab01927346c87f0b547ac4c9f0dce9bbf7af
