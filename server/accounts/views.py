from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework import response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import LoginSerilaizer

# Create your views here.


class LoginApiView(APIView):
    # Login must be reachable even if the browser has retained an expired JWT.
    authentication_classes = []
    permission_classes = [AllowAny]

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
