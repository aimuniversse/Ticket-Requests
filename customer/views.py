from django.shortcuts import render
from rest_framework.generics import CreateAPIView
from .serializers import CustomerRequestSerilaizers
from .models import CustomerRequests

# Create your views here.

class CustomerRequestCreateView(CreateAPIView):
    queryset = CustomerRequests.objects.all()
    serializer_class= CustomerRequestSerilaizers
    