from datetime import timedelta

from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient

from accounts.models import User
from customer.models import CustomerRequests
from operators.models import Operator
from operators.models import Wallet, Transaction


class BackendWorkflowTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.admin_user = User.objects.create_user(
            phone_number="9000000001",
            email="admin@example.com",
            password="StrongPass123",
            role="admin",
            is_staff=True,
            is_active=True,
            approval_status="approved",
        )

        self.operator_user = User.objects.create_user(
            phone_number="9000000002",
            email="operator@example.com",
            password="StrongPass123",
            role="operator",
            is_active=True,
            approval_status="approved",
        )
        self.operator = Operator.objects.create(
            user=self.operator_user,
            company_name="City Travel",
        )

    def test_operator_approval_flow(self):
        self.client.force_authenticate(self.admin_user)

        pending_user = User.objects.create_user(
            phone_number="9000000003",
            email="pending@example.com",
            password="StrongPass123",
            role="operator",
            is_active=True,
            approval_status="pending",
        )
        pending_operator = Operator.objects.create(
            user=pending_user,
            company_name="Pending Travel",
        )

        pending_response = self.client.get("/api/auth/admin/operators/pending/")
        self.assertEqual(pending_response.status_code, 200)
        self.assertEqual(len(pending_response.json()), 1)

        approve_response = self.client.post(
            f"/api/auth/admin/operators/{pending_operator.id}/approve/"
        )
        self.assertEqual(approve_response.status_code, 200)

        pending_user.refresh_from_db()
        self.assertEqual(pending_user.approval_status, "approved")

    def test_request_assignment_and_operator_dashboard(self):
        self.client.force_authenticate(self.admin_user)

        request = CustomerRequests.objects.create(
            name="John Doe",
            phone_number="9876543210",
            from_location="Delhi",
            to_location="Jaipur",
            journey_date="2026-08-01",
            total_tickets=2,
            bus_type="AC_SEATER",
            expected_price="1200.00",
        )

        assign_response = self.client.post(
            f"/api/customer/requests/{request.id}/assign/",
            {"operator_id": self.operator.id},
            format="json",
        )
        self.assertEqual(assign_response.status_code, 200)

        request.refresh_from_db()
        self.assertEqual(request.assigned_operator, self.operator)

        self.client.force_authenticate(self.operator_user)
        assigned_response = self.client.get("/api/auth/requests/assigned/")
        self.assertEqual(assigned_response.status_code, 200)
        self.assertEqual(len(assigned_response.json()), 1)

    def test_phone_number_visibility_is_masked_for_non_assigned_operators(self):
        self.client.force_authenticate(self.admin_user)

        request = CustomerRequests.objects.create(
            name="Jane Doe",
            phone_number="9876543210",
            from_location="Mumbai",
            to_location="Pune",
            journey_date="2026-08-02",
            total_tickets=1,
            bus_type="AC_SEATER",
            expected_price="800.00",
        )

        self.client.post(
            f"/api/customer/requests/{request.id}/assign/",
            {"operator_id": self.operator.id},
            format="json",
        )

        other_operator_user = User.objects.create_user(
            phone_number="9000000004",
            email="other@example.com",
            password="StrongPass123",
            role="operator",
            is_active=True,
            approval_status="approved",
        )
        other_operator = Operator.objects.create(
            user=other_operator_user,
            company_name="Other Travel",
        )

        self.client.force_authenticate(other_operator_user)
        detail_response = self.client.get(f"/api/customer/requests/{request.id}/")

        self.assertEqual(detail_response.status_code, 200)
        self.assertEqual(detail_response.json()["phone_number"], "*****3210")

        self.client.force_authenticate(self.operator_user)
        assigned_detail_response = self.client.get(f"/api/customer/requests/{request.id}/")

        self.assertEqual(assigned_detail_response.status_code, 200)
        self.assertEqual(assigned_detail_response.json()["phone_number"], "9876543210")

    def test_operator_can_accept_lead_if_wallet_has_balance(self):
        wallet = Wallet.objects.create(operator=self.operator, current_balance=5)
        request = CustomerRequests.objects.create(
            name="Leo Stone",
            phone_number="9999999999",
            from_location="Chennai",
            to_location="Bengaluru",
            journey_date="2026-08-03",
            total_tickets=3,
            bus_type="NON_AC_SEATER",
            expected_price="950.00",
        )

        self.client.force_authenticate(self.operator_user)
        response = self.client.post(
            f"/api/customer/leads/{request.id}/accept/",
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        request.refresh_from_db()
        wallet.refresh_from_db()
        self.assertEqual(request.status, "ACCEPTED")
        self.assertEqual(wallet.current_balance, 4)
        self.assertEqual(Transaction.objects.filter(operator=self.operator).count(), 1)

    def test_operator_can_accept_lead_when_wallet_is_created_on_the_fly(self):
        request = CustomerRequests.objects.create(
            name="Nina Park",
            phone_number="8888888888",
            from_location="Kolkata",
            to_location="Dhanbad",
            journey_date="2026-08-04",
            total_tickets=2,
            bus_type="AC_SEATER",
            expected_price="760.00",
        )

        self.client.force_authenticate(self.operator_user)
        response = self.client.post(
            f"/api/customer/leads/{request.id}/accept/",
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        request.refresh_from_db()
        self.assertEqual(request.status, "ACCEPTED")
        wallet = Wallet.objects.get(operator=self.operator)
        self.assertEqual(wallet.current_balance, 4)
        self.assertEqual(Transaction.objects.filter(operator=self.operator).count(), 1)

    def test_expired_request_marks_status_as_expired(self):
        request = CustomerRequests.objects.create(
            name="Mina Ray",
            phone_number="8888888888",
            from_location="Hyderabad",
            to_location="Vizag",
            journey_date="2026-08-04",
            total_tickets=2,
            bus_type="AC_SLEEPER",
            expected_price="1400.00",
            expires_at=timezone.now() - timedelta(minutes=1),
        )

        self.assertEqual(request.refresh_status(), "EXPIRED")
        request.refresh_from_db()
        self.assertEqual(request.status, "EXPIRED")

    def test_expired_request_cannot_be_accepted(self):
        request = CustomerRequests.objects.create(
            name="Ravi Kumar",
            phone_number="7777777777",
            from_location="Bangalore",
            to_location="Mysore",
            journey_date="2026-08-05",
            total_tickets=1,
            bus_type="NON_AC_SEATER",
            expected_price="650.00",
            expires_at=timezone.now() - timedelta(minutes=1),
        )
        wallet = Wallet.objects.create(operator=self.operator, current_balance=3)

        self.client.force_authenticate(self.operator_user)
        response = self.client.post(
            f"/api/customer/leads/{request.id}/accept/",
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        wallet.refresh_from_db()
        self.assertEqual(wallet.current_balance, 3)
