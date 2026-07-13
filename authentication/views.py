from rest_framework import status
from rest_framework.generics import CreateAPIView, RetrieveUpdateAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from authentication.models import Admin
from authentication.serializers import (
    AdminLoginSerializer,
    AdminProfileSerializer,
    AdminRegistrationSerializer,
    ChangePasswordSerializer,
    LogoutSerializer,
)
from authentication.services import (
    blacklist_refresh_token,
    get_tokens_for_admin,
)


class AdminRegistrationView(CreateAPIView):
    queryset = Admin.objects.all()
    serializer_class = AdminRegistrationSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(
            {"message": "Admin registered successfully."},
            status=status.HTTP_201_CREATED,
        )


class AdminLoginView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response(
            {"error": "Method not allowed. Use POST with email and password."},
            status=status.HTTP_405_METHOD_NOT_ALLOWED,
        )

    def post(self, request):
        serializer = AdminLoginSerializer(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)

        admin = serializer.validated_data["admin"]
        tokens = get_tokens_for_admin(admin)

        return Response(
            {
                "access": tokens["access"],
                "refresh": tokens["refresh"],
                "admin": AdminProfileSerializer(admin).data,
            },
            status=status.HTTP_200_OK,
        )


class AdminProfileView(RetrieveUpdateAPIView):
    queryset = Admin.objects.all()
    serializer_class = AdminProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {"message": "Password changed successfully."},
            status=status.HTTP_200_OK,
        )


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = LogoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        refresh_token = serializer.validated_data["refresh"]
        blacklisted = blacklist_refresh_token(refresh_token)

        if not blacklisted:
            return Response(
                {"message": "Invalid or expired refresh token."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {"message": "Logged out successfully."},
            status=status.HTTP_200_OK,
        )
