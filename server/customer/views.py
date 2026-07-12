from django.shortcuts import get_object_or_404
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
        customer_request = get_object_or_404(CustomerRequests, id=request_id)
        operator_id = request.data.get("operator_id")

        if not operator_id:
            return Response(
                {"operator_id": ["This field is required."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        operator = get_object_or_404(Operator, id=operator_id)
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
