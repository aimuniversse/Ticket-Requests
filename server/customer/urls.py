from django.urls import path
from .views import CustomerRequestCreateView, CustomerRequestDetailView, AssignRequestAPIView, AcceptLeadAPIView, LeadListAPIView, MyLeadsAPIView


urlpatterns = [
    path("", LeadListAPIView.as_view(), name="lead-list"),
    path("my-leads/", MyLeadsAPIView.as_view(), name="my-leads"),
    path(
        "request/",
        CustomerRequestCreateView.as_view(),
        name="customer-request",
    ),
    path(
        "requests/<int:request_id>/",
        CustomerRequestDetailView.as_view(),
        name="customer-request-detail",
    ),
    path(
        "requests/<int:request_id>/assign/",
        AssignRequestAPIView.as_view(),
        name="assign-request",
    ),
    path(
        "leads/<int:request_id>/accept/",
        AcceptLeadAPIView.as_view(),
        name="accept-lead",
    ),
]