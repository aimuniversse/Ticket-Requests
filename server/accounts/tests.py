import time
from django.test import TestCase, override_settings
from django.core import mail
from django.contrib.auth import get_user_model
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.core import signing

User = get_user_model()


class PasswordResetTests(TestCase):
    def setUp(self):
        self.operator = User.objects.create_user(
            phone_number="9000000005",
            email="operator@example.com",
            password="StrongPass123",
            name="Test Operator",
            role="operator",
            approval_status="approved",
            is_active=True,
        )
        self.admin = User.objects.create_user(
            phone_number="9000000006",
            email="admin@example.com",
            password="AdminPass123",
            name="Test Admin",
            role="admin",
            is_active=True,
        )

    def _forgot(self, email, **extra):
        return self.client.post(
            "/api/auth/password/forgot/",
            {"email": email},
            content_type="application/json",
            **extra,
        )

    def _reset(self, uid, token, new_password, confirm_password):
        return self.client.post(
            "/api/auth/password/reset/confirm/",
            {"uid": uid, "token": token, "new_password": new_password, "confirm_password": confirm_password},
            content_type="application/json",
        )

    def _generate_token(self, user):
        return signing.dumps(user.pk)

    def _generate_uid(self, user):
        return urlsafe_base64_encode(force_bytes(user.pk))

    def _wait_for_email(self, timeout=200):
        for _ in range(timeout):
            if mail.outbox:
                break
            time.sleep(0.05)

    # ── Forgot password: success cases ───────────────────────────────

    @override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
    def test_forgot_password_sends_email_for_operator(self):
        response = self._forgot(self.operator.email)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["message"], "Password reset email sent successfully.")
        self._wait_for_email()
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn("reset", mail.outbox[0].subject.lower())
        self.assertIn(self.operator.email, mail.outbox[0].recipients())

    @override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
    def test_forgot_password_sends_email_for_admin(self):
        response = self._forgot(self.admin.email)

        self.assertEqual(response.status_code, 200)
        self._wait_for_email()
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn(self.admin.email, mail.outbox[0].recipients())

    @override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
    def test_forgot_password_email_contains_reset_link(self):
        self._forgot(self.operator.email)
        self._wait_for_email()
        body = mail.outbox[0].body
        self.assertIn("/reset-password/", body)

    @override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
    def test_forgot_password_email_contains_user_name(self):
        self._forgot(self.operator.email)
        self._wait_for_email()
        body = mail.outbox[0].body
        self.assertIn(self.operator.name, body)

    # ── Forgot password: rejection cases ─────────────────────────────

    def test_forgot_password_rejects_unknown_email(self):
        response = self._forgot("missing@example.com")

        self.assertEqual(response.status_code, 400)
        self.assertIn("email", response.json())

    def test_forgot_password_rejects_inactive_user(self):
        self.operator.is_active = False
        self.operator.save(update_fields=["is_active"])

        response = self._forgot(self.operator.email)

        self.assertEqual(response.status_code, 400)
        self.assertIn("email", response.json())

    def test_forgot_password_rejects_empty_body(self):
        response = self.client.post(
            "/api/auth/password/forgot/",
            {},
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 400)

    def test_forgot_password_rejects_invalid_email_format(self):
        response = self._forgot("not-an-email")
        self.assertEqual(response.status_code, 400)

    def test_forgot_password_includes_cors_header_for_vercel_origin(self):
        with self.settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend"):
            response = self._forgot(
                self.operator.email,
                HTTP_ORIGIN="https://ticekt-requests.vercel.app",
            )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response["Access-Control-Allow-Origin"], "https://ticekt-requests.vercel.app")

    # ── Reset password: success cases ────────────────────────────────

    def test_reset_password_confirms_new_password(self):
        uid = self._generate_uid(self.operator)
        token = self._generate_token(self.operator)

        response = self._reset(uid, token, "NewStrongPass123", "NewStrongPass123")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["message"], "Password reset successfully.")
        self.operator.refresh_from_db()
        self.assertTrue(self.operator.check_password("NewStrongPass123"))

    def test_reset_password_old_password_no_longer_works(self):
        uid = self._generate_uid(self.operator)
        token = self._generate_token(self.operator)

        self._reset(uid, token, "NewStrongPass123", "NewStrongPass123")

        self.operator.refresh_from_db()
        self.assertFalse(self.operator.check_password("StrongPass123"))

    # ── Reset password: rejection cases ──────────────────────────────

    def test_reset_password_rejects_mismatched_passwords(self):
        uid = self._generate_uid(self.operator)
        token = self._generate_token(self.operator)

        response = self._reset(uid, token, "NewStrongPass123", "DifferentPass123")

        self.assertEqual(response.status_code, 400)
        self.operator.refresh_from_db()
        self.assertTrue(self.operator.check_password("StrongPass123"))

    def test_reset_password_rejects_short_password(self):
        uid = self._generate_uid(self.operator)
        token = self._generate_token(self.operator)

        response = self._reset(uid, token, "short", "short")

        self.assertEqual(response.status_code, 400)

    def test_reset_password_rejects_invalid_token(self):
        uid = self._generate_uid(self.operator)

        response = self._reset(uid, "invalid-token-value", "NewStrongPass123", "NewStrongPass123")

        self.assertEqual(response.status_code, 400)
        self.operator.refresh_from_db()
        self.assertTrue(self.operator.check_password("StrongPass123"))

    def test_reset_password_rejects_tampered_token(self):
        uid = self._generate_uid(self.operator)
        token = self._generate_token(self.operator)
        tampered = token[:-5] + "XXXXX"

        response = self._reset(uid, tampered, "NewStrongPass123", "NewStrongPass123")

        self.assertEqual(response.status_code, 400)

    def test_reset_password_rejects_invalid_uid(self):
        token = self._generate_token(self.operator)

        response = self._reset("AAAA", token, "NewStrongPass123", "NewStrongPass123")

        self.assertEqual(response.status_code, 400)

    def test_reset_password_rejects_nonexistent_uid(self):
        token = self._generate_token(self.operator)

        response = self._reset(
            urlsafe_base64_encode(force_bytes(999999)),
            token,
            "NewStrongPass123",
            "NewStrongPass123",
        )

        self.assertEqual(response.status_code, 400)

    def test_reset_password_rejects_empty_body(self):
        response = self.client.post(
            "/api/auth/password/reset/confirm/",
            {},
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 400)

    def test_reset_password_rejects_missing_fields(self):
        response = self.client.post(
            "/api/auth/password/reset/confirm/",
            {"uid": "abc"},
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 400)

    # ── Full end-to-end flow ─────────────────────────────────────────

    @override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
    def test_full_forgot_reset_login_flow(self):
        forgot_resp = self._forgot(self.operator.email)
        self.assertEqual(forgot_resp.status_code, 200)
        self._wait_for_email()
        self.assertEqual(len(mail.outbox), 1)

        uid = self._generate_uid(self.operator)
        token = self._generate_token(self.operator)

        reset_resp = self._reset(uid, token, "BrandNewPass123", "BrandNewPass123")
        self.assertEqual(reset_resp.status_code, 200)

        self.operator.refresh_from_db()
        self.assertTrue(self.operator.check_password("BrandNewPass123"))

        login_resp = self.client.post(
            "/api/auth/login/",
            {"phone_number": self.operator.phone_number, "password": "BrandNewPass123"},
            content_type="application/json",
        )
        self.assertEqual(login_resp.status_code, 200)
        self.assertIn("access", login_resp.json())
        self.assertIn("refresh", login_resp.json())

    @override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
    def test_full_forgot_reset_old_password_rejected(self):
        self._forgot(self.operator.email)
        self._wait_for_email()

        uid = self._generate_uid(self.operator)
        token = self._generate_token(self.operator)
        self._reset(uid, token, "BrandNewPass123", "BrandNewPass123")

        login_resp = self.client.post(
            "/api/auth/login/",
            {"phone_number": self.operator.phone_number, "password": "StrongPass123"},
            content_type="application/json",
        )
        self.assertEqual(login_resp.status_code, 400)

    @override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
    def test_full_forgot_reset_admin_flow(self):
        forgot_resp = self._forgot(self.admin.email)
        self.assertEqual(forgot_resp.status_code, 200)
        self._wait_for_email()

        uid = self._generate_uid(self.admin)
        token = self._generate_token(self.admin)

        reset_resp = self._reset(uid, token, "NewAdminPass123", "NewAdminPass123")
        self.assertEqual(reset_resp.status_code, 200)

        login_resp = self.client.post(
            "/api/auth/login/",
            {"phone_number": self.admin.phone_number, "password": "NewAdminPass123"},
            content_type="application/json",
        )
        self.assertEqual(login_resp.status_code, 200)
