from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .serializers import RegistraionOperatorSerilaizers, PendingOpeartorSerializer
from .models import Operator
from customer.models import CustomerRequests


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
        user.approved_by = request.user
        user.approved_at = timezone.now()
        user.save(update_fields=["approval_status", "approved_by", "approved_at"])

        return Response(
            {"message": "Operator approved successfully."},
            status=status.HTTP_200_OK,
        )


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
            }
            for item in requests
        ]

        return Response(data, status=status.HTTP_200_OK)
