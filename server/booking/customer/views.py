from django.shortcuts import get_object_or_404
from django.db import transaction
from rest_framework.generics import CreateAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .serializers import CustomerRequestSerilaizers
from .models import CustomerRequests
from operators.models import Operator, Wallet, Transaction


class CustomerRequestCreateView(CreateAPIView):
    queryset = CustomerRequests.objects.all()
    serializer_class = CustomerRequestSerilaizers

    def perform_create(self, serializer):
        instance = serializer.save()
        instance.request_id = f"REQ-{instance.id:05d}"
        instance.save(update_fields=["request_id", "updated_at"])


class CustomerRequestDetailView(APIView):
    def get(self, request, request_id):
        if not request.user.is_authenticated:
            return Response(
                {"detail": "Authentication credentials were not provided."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        customer_request = get_object_or_404(CustomerRequests, id=request_id)
        serializer = CustomerRequestSerilaizers(
            customer_request,
            context={"request": request},
        )
        return Response(serializer.data, status=status.HTTP_200_OK)


class LeadListAPIView(APIView):
    def get(self, request):
        if not request.user.is_authenticated:
            return Response({"detail": "Authentication credentials were not provided."}, status=status.HTTP_401_UNAUTHORIZED)

        if request.user.role != "operator":
            return Response({"detail": "Only operators can view leads."}, status=status.HTTP_403_FORBIDDEN)

        operator = get_object_or_404(Operator, user=request.user)
        if operator.user.approval_status != "approved":
            return Response({"detail": "Operator is not approved yet."}, status=status.HTTP_400_BAD_REQUEST)

        leads = CustomerRequests.objects.filter(status="NEW").order_by("-created_at")
        serializer = CustomerRequestSerilaizers(leads, many=True, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class MyLeadsAPIView(APIView):
    def get(self, request):
        if not request.user.is_authenticated:
            return Response({"detail": "Authentication credentials were not provided."}, status=status.HTTP_401_UNAUTHORIZED)

        if request.user.role != "operator":
            return Response({"detail": "Only operators can view their leads."}, status=status.HTTP_403_FORBIDDEN)

        operator = get_object_or_404(Operator, user=request.user)
        leads = CustomerRequests.objects.filter(assigned_operator=operator).order_by("-created_at")
        serializer = CustomerRequestSerilaizers(leads, many=True, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class AssignRequestAPIView(APIView):
    def post(self, request, request_id):
        if not request.user.is_authenticated or request.user.role != "admin":
            return Response(
                {"detail": "Only admins can assign requests."},
                status=status.HTTP_403_FORBIDDEN,
            )

        customer_request = get_object_or_404(CustomerRequests, id=request_id)
        operator_id = request.data.get("operator_id")

        if not operator_id:
            return Response(
                {"operator_id": ["This field is required."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        operator = get_object_or_404(Operator, id=operator_id)
        if operator.user.approval_status != "approved":
            return Response(
                {"operator_id": ["This operator is not approved yet."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if customer_request.assigned_operator_id is not None:
            return Response(
                {"detail": "This request has already been assigned."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        customer_request.assigned_operator = operator
        customer_request.status = "ASSIGNED"
        customer_request.save(update_fields=["assigned_operator", "status", "updated_at"])

        return Response(
            {
                "message": "Request assigned successfully.",
                "request_id": customer_request.id,
                "assigned_operator_id": operator.id,
            },
            status=status.HTTP_200_OK,
        )


class AcceptLeadAPIView(APIView):
    def post(self, request, request_id):
        if not request.user.is_authenticated:
            return Response({"detail": "Authentication credentials were not provided."}, status=status.HTTP_401_UNAUTHORIZED)

        if request.user.role != "operator":
            return Response({"detail": "Only operators can accept leads."}, status=status.HTTP_403_FORBIDDEN)

        operator = get_object_or_404(Operator, user=request.user)
        if operator.user.approval_status != "approved":
            return Response({"detail": "Operator is not approved yet."}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            customer_request = CustomerRequests.objects.select_for_update().get(id=request_id)
            if customer_request.status == "ACCEPTED":
                return Response({"detail": "This lead has already been accepted."}, status=status.HTTP_400_BAD_REQUEST)

            wallet, _ = Wallet.objects.get_or_create(operator=operator)
            if wallet.current_balance <= 0:
                return Response({"detail": "Insufficient wallet balance to accept this lead."}, status=status.HTTP_400_BAD_REQUEST)

            wallet.current_balance -= 1
            wallet.save(update_fields=["current_balance", "updated_at"])
            Transaction.objects.create(
                operator=operator,
                transaction_type="DEBIT",
                credits=1,
                balance_after_transaction=wallet.current_balance,
                description="Lead accepted",
            )

            customer_request.assigned_operator = operator
            customer_request.status = "ACCEPTED"
            customer_request.save(update_fields=["assigned_operator", "status", "updated_at"])

        return Response(
            {
                "message": "Lead accepted successfully.",
                "request_id": customer_request.id,
                "assigned_operator_id": operator.id,
            },
            status=status.HTTP_200_OK,
        )
