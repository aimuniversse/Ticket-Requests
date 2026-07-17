from django.urls import path
from .views import LoginApiView, ForgotPasswordApiView, ResetPasswordConfirmApiView, RegisterApiView, LogoutApiView, MeApiView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('register/', RegisterApiView.as_view(), name='register'),
    path('login/', LoginApiView.as_view(), name='login'),
    path('logout/', LogoutApiView.as_view(), name='logout'),
    path('refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('me/', MeApiView.as_view(), name='me'),
    path('password/forgot/', ForgotPasswordApiView.as_view(), name='forgot-password'),
    path('password/reset/confirm/', ResetPasswordConfirmApiView.as_view(), name='reset-password-confirm'),
]