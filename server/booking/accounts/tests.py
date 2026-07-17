from django.test import TestCase
from django.core import mail
from django.contrib.auth import get_user_model
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.contrib.auth.tokens import default_token_generator

User = get_user_model()


class PasswordResetTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            phone_number="9000000005",
            email="operator@example.com",
            password="StrongPass123",
            role="operator",
            approval_status="approved",
            is_active=True,
        )

    def test_forgot_password_sends_email_for_operator(self):
        with self.settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend"):
            response = self.client.post(
                "/api/auth/password/forgot/",
                {"email": self.user.email},
                content_type="application/json",
            )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn("reset password", mail.outbox[0].subject.lower())

    def test_reset_password_confirms_new_password(self):
        uid = urlsafe_base64_encode(force_bytes(self.user.pk))
        token = default_token_generator.make_token(self.user)

        response = self.client.post(
            "/api/auth/password/reset/confirm/",
            {
                "uid": uid,
                "token": token,
                "new_password": "NewStrongPass123",
                "confirm_password": "NewStrongPass123",
            },
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 200)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("NewStrongPass123"))
