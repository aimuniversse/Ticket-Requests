from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from authentication.views import (
    AdminLoginView,
    AdminProfileView,
    AdminRegistrationView,
    ChangePasswordView,
    LogoutView,
)

urlpatterns = [
    path("register/", AdminRegistrationView.as_view(), name="admin-register"),
    path("login/", AdminLoginView.as_view(), name="admin-login"),
    path(
        "token/refresh/",
        TokenRefreshView.as_view(),
        name="token-refresh",
    ),
    path("logout/", LogoutView.as_view(), name="admin-logout"),
    path("profile/", AdminProfileView.as_view(), name="admin-profile"),
    path(
        "change-password/",
        ChangePasswordView.as_view(),
        name="admin-change-password",
    ),
]
