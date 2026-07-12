from rest_framework import serializers
from django.contrib.auth import authenticate

class LoginSerilaizer(serializers.Serializer):
    
    phone_number=serializers.CharField()
    password=serializers.CharField(
        write_only=True
    )

    def validate(self, data):
        phone_number = data.get("phone_number")
        password = data.get("password")

        user = authenticate(
            request=self.context.get('request'),
            phone_number=phone_number,
            password=password
        )
        print(user)

        if not user:
            raise serializers.ValidationError(
                "Invalid phone number or password"
            )
        

        if not user.is_active:
            raise serializers.ValidationError(
                "Account is inactive"
            )


        if user.role == "operator" and user.approval_status != "approved":
            raise serializers.ValidationError(
                "Operator account is not approved"
            )


        data["user"] = user

        return data
    

# class LoginSerilaizers(serializers.Serializer):
#     phone_number = serializers.CharField()
#     password = serializers.CharField(write_only=True)

#     def validate(self, attrs):
#         phone_number = attrs.get("phone_number")
#         password = attrs.get("password")

#         user = authenticate(
#             phone_number=phone_number,
#             password=password
#         )

#         if user is None:
#             raise serializers.ValidationError(
#                 "Invalid phone number or password."
#             )

#         if not user.is_active:
#             raise serializers.ValidationError(
#                 "Your account is inactive."
#             )

#         if (
#             user.role == "operator"
#             and user.approval_status != "approved"
#         ):
#             raise serializers.ValidationError(
#                 "Your account is waiting for admin approval."
#             )

#         attrs["user"] = user
#         return attrs


        