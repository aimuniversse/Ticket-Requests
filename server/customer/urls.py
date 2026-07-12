from django.urls import path
from .views import CustomerRequestCreateView, AssignRequestAPIView


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
]