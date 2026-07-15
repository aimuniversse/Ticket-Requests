from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from .serializers import RegistraionOperatorSerilaizers, PendingOpeartorSerializer
from .models import Operator
from customer.models import CustomerRequests


class OperatorRegistrationAPIView(APIView):
    permission_classes = [AllowAny]

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


class RejectOperatorAPIView(APIView):
    def post(self, request, operator_id):
        if not request.user.is_authenticated or request.user.role != "admin":
            return Response(
                {"detail": "Only admins can reject operators."},
                status=status.HTTP_403_FORBIDDEN,
            )

        operator = get_object_or_404(Operator, id=operator_id)
        user = operator.user
        rejection_reason = request.data.get("rejection_reason", "")
        
        user.approval_status = "rejected"
        user.rejection_reason = rejection_reason
        user.is_active = False
        user.save(update_fields=["approval_status", "rejection_reason", "is_active"])

        return Response(
            {"message": "Operator rejected successfully."},
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
                "phone_number": item.phone_number,
                "from_location": item.from_location,
                "to_location": item.to_location,
                "status": item.status,
                "assigned_operator_id": item.assigned_operator.id if item.assigned_operator else None,
                "contact_unlocked": item.contact_unlocked,
            }
            for item in requests
        ]

        for item, payload in zip(requests, data):
            payload.update({
                "request_id": item.request_id,
                "from_location": item.from_location,
                "to_location": item.to_location,
                "journey_date": item.journey_date,
                "total_tickets": item.total_tickets,
                "bus_type": item.bus_type,
                "expected_price": item.expected_price,
            })
            if item.contact_unlocked:
                payload["name"] = item.name
                payload["phone_number"] = item.phone_number
            else:
                payload.pop("phone_number", None)

        return Response(data, status=status.HTTP_200_OK)


class AvailableRequestsAPIView(APIView):
    def get(self, request):
        if not request.user.is_authenticated or request.user.role != "operator":
            return Response({"detail": "Only operators can view available requests."}, status=status.HTTP_403_FORBIDDEN)
        now = timezone.now()
        CustomerRequests.objects.filter(status="PENDING", expires_at__lte=now).update(status="EXPIRED")
        requests = CustomerRequests.objects.filter(status="PENDING", expires_at__gt=now).order_by("created_at")
        # Contact details deliberately never leave this endpoint.
        return Response([{
            "id": item.id, "request_id": item.request_id or str(item.id),
            "from_location": item.from_location, "to_location": item.to_location,
            "journey_date": item.journey_date, "total_tickets": item.total_tickets,
            "bus_type": item.bus_type, "expected_price": item.expected_price,
            "expires_at": item.expires_at,
        } for item in requests])
