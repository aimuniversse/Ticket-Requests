from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework import response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView
from .serializers import LoginSerilaizer, ForgotPasswordSerializer, ResetPasswordSerializer
from operators.serializers import RegistraionOperatorSerilaizers
from accounts.models import User

# Create your views here.


class LoginApiView(APIView):
    def post(self,request):
        serializer=LoginSerilaizer(data=request.data,context={'request':request})
        serializer.is_valid(raise_exception=True)
        user=serializer.validated_data['user']
        refresh=RefreshToken.for_user(user)
        return response.Response(
            {
                "message": "Login successful",

                "access": str(refresh.access_token),

                "refresh": str(refresh),

                "user": {
                    "id": user.id,
                    "phone_number": user.phone_number,
                    "email": user.email,
                    "role": user.role,
                },
            },
            status=status.HTTP_200_OK,
        )


class ForgotPasswordApiView(APIView):
    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return response.Response(
            {"message": "Password reset email sent successfully."},
            status=status.HTTP_200_OK,
        )


class ResetPasswordConfirmApiView(APIView):
    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return response.Response(
            {"message": "Password reset successfully."},
            status=status.HTTP_200_OK,
        )


class RegisterApiView(APIView):
    def post(self, request):
        serializer = RegistraionOperatorSerilaizers(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return response.Response(
                {"message": "Operator registration successful. Waiting for admin approval."},
                status=status.HTTP_201_CREATED,
            )
        return response.Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutApiView(APIView):
    def post(self, request):
        return response.Response({"message": "Logout successful"}, status=status.HTTP_200_OK)


class MeApiView(APIView):
    def get(self, request):
        if not request.user.is_authenticated:
            return response.Response({"detail": "Authentication credentials were not provided."}, status=status.HTTP_401_UNAUTHORIZED)
        return response.Response({
            "id": request.user.id,
            "phone_number": request.user.phone_number,
            "email": request.user.email,
            "role": request.user.role,
            "approval_status": request.user.approval_status,
        }, status=status.HTTP_200_OK)
