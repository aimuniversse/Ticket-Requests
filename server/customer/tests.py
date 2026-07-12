from django.test import TestCase
from rest_framework.test import APIClient

from accounts.models import User
from customer.models import CustomerRequests
from operators.models import Operator


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
