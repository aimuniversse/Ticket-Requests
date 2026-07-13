from django.urls import path
from .views import (
    OperatorRegistrationAPIView,
    PendingOperatorListAPIView,
    ApproveOperatorAPIView,
    AssignedRequestsAPIView,
)


urlpatterns = [
    path(
        "register/",
        OperatorRegistrationAPIView.as_view(),
        name="operator-register",
    ),
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
        "requests/assigned/",
        AssignedRequestsAPIView.as_view(),
        name="assigned-requests",
    ),
]