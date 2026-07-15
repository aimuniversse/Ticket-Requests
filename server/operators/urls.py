from django.urls import path
from .views import (
    OperatorRegistrationAPIView,
    PendingOperatorListAPIView,
    ApproveOperatorAPIView,
    RejectOperatorAPIView,
    AdminOverviewAPIView,
    RejectOperatorAPIView,
    AssignedRequestsAPIView,
    AvailableRequestsAPIView,
)


urlpatterns = [
    path(
        "register/",
        OperatorRegistrationAPIView.as_view(),
        name="operator-register",
    ),
    path("admin/operators/<int:operator_id>/reject/", RejectOperatorAPIView.as_view(), name="reject-operator"),
    path("admin/overview/", AdminOverviewAPIView.as_view(), name="admin-overview"),
    path(
        "admin/operators/pending/",
        PendingOperatorListAPIView.as_view(),
        name="pending-operators",
    ),
    path(
        "admin/operators/<int:operator_id>/approve/",
        ApproveOperatorAPIView.as_view(),
        name="approve-operator",
    ),
    path(
        "admin/operators/<int:operator_id>/reject/",
        RejectOperatorAPIView.as_view(),
        name="reject-operator",
    ),
    path(
        "requests/assigned/",
        AssignedRequestsAPIView.as_view(),
        name="assigned-requests",
    ),
    path("requests/available/", AvailableRequestsAPIView.as_view(), name="available-requests"),
]
