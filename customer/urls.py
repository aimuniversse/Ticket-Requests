from django.urls import path
from .views import CustomerRequestCreateView


urlpatterns = [
    path(
        "request/",
        CustomerRequestCreateView.as_view(),name="customer-request"
    ),
]