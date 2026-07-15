from django.shortcuts import get_object_or_404
from django.db import transaction
from django.utils import timezone
from rest_framework.generics import CreateAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .serializers import CustomerRequestSerilaizers
from .models import CustomerRequests
from operators.models import Operator


class CustomerRequestCreateView(CreateAPIView):
    queryset = CustomerRequests.objects.all()
    serializer_class = CustomerRequestSerilaizers


class AssignRequestAPIView(APIView):
    def post(self, request, request_id):
        if not request.user.is_authenticated or request.user.role != "operator":
            return Response({"detail": "Only authenticated operators can accept requests."}, status=status.HTTP_403_FORBIDDEN)
        operator = get_object_or_404(Operator, user=request.user)
        with transaction.atomic():
            customer_request = get_object_or_404(CustomerRequests.objects.select_for_update(), id=request_id)
            if customer_request.is_expired:
                customer_request.status = "EXPIRED"
                customer_request.save(update_fields=["status", "updated_at"])
            if customer_request.status != "PENDING":
                return Response({"detail": "This request is no longer available."}, status=status.HTTP_409_CONFLICT)
            customer_request.assigned_operator = operator
            customer_request.status = "ACCEPTED"
            customer_request.save(update_fields=["assigned_operator", "status", "updated_at"])

        return Response(
            {
                "message": "Request assigned successfully.",
                "request_id": customer_request.id,
                "assigned_operator_id": operator.id,
            },
            status=status.HTTP_200_OK,
        )


class CustomerRequestStatusAPIView(APIView):
    permission_classes = []

    def get(self, request, public_token):
        customer_request = get_object_or_404(CustomerRequests, public_token=public_token)
        if customer_request.is_expired:
            customer_request.status = "EXPIRED"
            customer_request.save(update_fields=["status", "updated_at"])
        return Response({
            "request_id": customer_request.request_id or str(customer_request.id),
            "status": customer_request.status,
            "expires_at": customer_request.expires_at,
            "accepted_at": customer_request.updated_at if customer_request.status == "ACCEPTED" else None,
        })
