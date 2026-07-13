from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from authentication.models import Admin


class AdminAuthAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.register_url = "/api/admin/register/"
        self.login_url = "/api/admin/login/"
        self.profile_url = "/api/admin/profile/"
        self.change_password_url = "/api/admin/change-password/"
        self.logout_url = "/api/admin/logout/"
        self.token_refresh_url = "/api/admin/token/refresh/"

        self.admin_data = {
            "name": "John Doe",
            "email": "john@gmail.com",
            "phone_number": "9876543210",
            "password": "Password@123",
        }

    def test_1_registration_success(self):
        response = self.client.post(
            self.register_url, self.admin_data, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(
            response.data["message"], "Admin registered successfully."
        )

    def test_2_registration_duplicate_email(self):
        self.client.post(self.register_url, self.admin_data, format="json")
        response = self.client.post(
            self.register_url, self.admin_data, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("email", str(response.data).lower())

    def test_3_registration_weak_password(self):
        data = {
            **self.admin_data,
            "email": "weak@test.com",
            "password": "weak",
        }
        response = self.client.post(
            self.register_url, data, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_4_login_success(self):
        self.client.post(self.register_url, self.admin_data, format="json")
        response = self.client.post(
            self.login_url,
            {
                "email": self.admin_data["email"],
                "password": self.admin_data["password"],
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)
        self.assertIn("admin", response.data)
        self.assertEqual(
            response.data["admin"]["email"], self.admin_data["email"]
        )

    def test_5_login_invalid_credentials(self):
        self.client.post(self.register_url, self.admin_data, format="json")
        response = self.client.post(
            self.login_url,
            {"email": self.admin_data["email"], "password": "WrongPass123"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_6_profile_authenticated(self):
        self.client.post(self.register_url, self.admin_data, format="json")
        login_res = self.client.post(
            self.login_url,
            {
                "email": self.admin_data["email"],
                "password": self.admin_data["password"],
            },
            format="json",
        )
        token = login_res.data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["email"], self.admin_data["email"])
        self.assertNotIn("password", response.data)

    def test_7_profile_unauthenticated(self):
        response = self.client.get(self.profile_url)
        self.assertEqual(
            response.status_code, status.HTTP_401_UNAUTHORIZED
        )

    def test_8_update_profile(self):
        self.client.post(self.register_url, self.admin_data, format="json")
        login_res = self.client.post(
            self.login_url,
            {
                "email": self.admin_data["email"],
                "password": self.admin_data["password"],
            },
            format="json",
        )
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {login_res.data['access']}"
        )

        response = self.client.patch(
            self.profile_url,
            {"name": "John Updated"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], "John Updated")

    def test_9_change_password(self):
        self.client.post(self.register_url, self.admin_data, format="json")
        login_res = self.client.post(
            self.login_url,
            {
                "email": self.admin_data["email"],
                "password": self.admin_data["password"],
            },
            format="json",
        )
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {login_res.data['access']}"
        )

        response = self.client.post(
            self.change_password_url,
            {
                "old_password": "Password@123",
                "new_password": "NewPass@1234",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data["message"], "Password changed successfully."
        )

        # Verify can login with new password
        self.client.credentials()
        login_res = self.client.post(
            self.login_url,
            {
                "email": self.admin_data["email"],
                "password": "NewPass@1234",
            },
            format="json",
        )
        self.assertEqual(login_res.status_code, status.HTTP_200_OK)

    def test_10_change_password_wrong_old(self):
        self.client.post(self.register_url, self.admin_data, format="json")
        login_res = self.client.post(
            self.login_url,
            {
                "email": self.admin_data["email"],
                "password": self.admin_data["password"],
            },
            format="json",
        )
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {login_res.data['access']}"
        )

        response = self.client.post(
            self.change_password_url,
            {
                "old_password": "WrongOld@123",
                "new_password": "NewPass@1234",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_11_logout(self):
        self.client.post(self.register_url, self.admin_data, format="json")
        login_res = self.client.post(
            self.login_url,
            {
                "email": self.admin_data["email"],
                "password": self.admin_data["password"],
            },
            format="json",
        )
        refresh_token = login_res.data["refresh"]
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {login_res.data['access']}"
        )

        response = self.client.post(
            self.logout_url,
            {"refresh": refresh_token},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data["message"], "Logged out successfully."
        )

    def test_12_token_refresh(self):
        self.client.post(self.register_url, self.admin_data, format="json")
        login_res = self.client.post(
            self.login_url,
            {
                "email": self.admin_data["email"],
                "password": self.admin_data["password"],
            },
            format="json",
        )
        refresh_token = login_res.data["refresh"]

        response = self.client.post(
            self.token_refresh_url,
            {"refresh": refresh_token},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

        # Old refresh token should be blacklisted now
        response = self.client.post(
            self.token_refresh_url,
            {"refresh": refresh_token},
            format="json",
        )
        self.assertEqual(
            response.status_code, status.HTTP_401_UNAUTHORIZED
        )
