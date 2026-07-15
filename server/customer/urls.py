from django.urls import path
from .views import CustomerRequestCreateView, AssignRequestAPIView, CustomerRequestStatusAPIView


urlpatterns = [
    path(
        "request/",
        CustomerRequestCreateView.as_view(),
        name="customer-request",
    ),
    path(
        "requests/<int:request_id>/assign/",
        AssignRequestAPIView.as_view(),
        name="assign-request",
    ),
    path("requests/status/<uuid:public_token>/", CustomerRequestStatusAPIView.as_view(), name="customer-request-status"),
]
