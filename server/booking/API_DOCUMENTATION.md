# Ticket Booking Backend API Documentation

Base URL: http://127.0.0.1:8000

## Authentication

Use JWT authentication for protected endpoints.

After login, include the access token in the header:

```http
Authorization: Bearer <access_token>
```

---

## 1. Login

### Endpoint
POST /api/auth/login/

### Request Body
```json
{
  "phone_number": "9000000001",
  "password": "StrongPass123"
}
```

### Success Response
```json
{
  "message": "Login successful",
  "access": "<jwt_access_token>",
  "refresh": "<jwt_refresh_token>",
  "user": {
    "id": 1,
    "phone_number": "9000000001",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

---

## 2. Register Operator

### Endpoint
POST /api/auth/register/

### Request Body
```json
{
  "name": "Rahul Sharma",
  "phone_number": "9000000002",
  "email": "rahul@example.com",
  "password": "StrongPass123",
  "company_name": "City Travel",
  "services": [
    {
      "from_location": "Delhi",
      "to_location": "Jaipur"
    }
  ]
}
```

### Success Response
```json
{
  "message": "Operator registration successful. Waiting for admin approval."
}
```

---

## 3. Logout

### Endpoint
POST /api/auth/logout/

### Authentication
Required: Any authenticated user

### Success Response
```json
{
  "message": "Logout successful"
}
```

---

## 4. Refresh Token

### Endpoint
POST /api/auth/refresh/

### Request Body
```json
{
  "refresh": "<refresh_token>"
}
```

### Success Response
```json
{
  "access": "<new_access_token>"
}
```

---

## 5. Current User

### Endpoint
GET /api/auth/me/

### Authentication
Required: Any authenticated user

### Success Response
```json
{
  "id": 1,
  "phone_number": "9000000001",
  "email": "admin@example.com",
  "role": "admin",
  "approval_status": "approved"
}
```

---

## 6. Get Pending Operators

### Endpoint
GET /api/auth/admin/operators/pending/

### Authentication
Required: Admin

### Success Response
```json
[
  {
    "id": 2,
    "company_name": "City Travel",
    "name": "Rahul Sharma",
    "phone_number": "9000000002",
    "email": "rahul@example.com",
    "approval_status": "pending"
  }
]
```

---

## 7. List Operators

### Endpoint
GET /api/operators/

### Authentication
Required: Admin

### Success Response
```json
[
  {
    "id": 2,
    "company_name": "City Travel",
    "name": "Rahul Sharma",
    "phone_number": "9000000002",
    "email": "rahul@example.com",
    "approval_status": "approved"
  }
]
```

---

## 8. Approve Operator

### Endpoint
POST /api/auth/admin/operators/<operator_id>/approve/

### Authentication
Required: Admin

### Success Response
```json
{
  "message": "Operator approved successfully."
}
```

---

## 9. Reject Operator

### Endpoint
POST /api/auth/admin/operators/<operator_id>/reject/

### Authentication
Required: Admin

### Success Response
```json
{
  "message": "Operator rejected successfully."
}
```

---

## 10. Activate Operator

### Endpoint
POST /api/auth/admin/operators/<operator_id>/activate/

### Authentication
Required: Admin

### Success Response
```json
{
  "message": "Operator activated successfully."
}
```

---

## 11. Deactivate Operator

### Endpoint
POST /api/auth/admin/operators/<operator_id>/deactivate/

### Authentication
Required: Admin

### Success Response
```json
{
  "message": "Operator deactivated successfully."
}
```

---

## 12. Create Customer Request

### Endpoint
POST /api/customer/request/

### Request Body
```json
{
  "name": "John Doe",
  "phone_number": "9876543210",
  "from_location": "Delhi",
  "to_location": "Jaipur",
  "journey_date": "2026-08-01",
  "journey_time": "10:00 AM",
  "total_tickets": 2,
  "bus_type": "AC_SEATER",
  "expected_price": "1200.00"
}
```

### Success Response
```json
{
  "id": 1,
  "request_id": "REQ-00001",
  "name": "John Doe",
  "phone_number": "9876543210",
  "from_location": "Delhi",
  "to_location": "Jaipur",
  "journey_date": "2026-08-01",
  "journey_time": "10:00 AM",
  "total_tickets": 2,
  "bus_type": "AC_SEATER",
  "expected_price": "1200.00",
  "status": "NEW",
  "assigned_operator": null,
  "created_at": "2026-07-12T10:00:00Z",
  "updated_at": "2026-07-12T10:00:00Z"
}
```

---

## 13. Get Customer Request Detail

### Endpoint
GET /api/customer/requests/<request_id>/

### Authentication
Required: Any authenticated user

### Success Response
```json
{
  "id": 1,
  "request_id": "REQ-00001",
  "name": "Hidden",
  "phone_number": "******3210",
  "from_location": "Delhi",
  "to_location": "Jaipur",
  "journey_date": "2026-08-01",
  "status": "NEW"
}
```

---

## 14. Assign Request to Operator

### Endpoint
POST /api/customer/requests/<request_id>/assign/

### Authentication
Required: Admin

### Request Body
```json
{
  "operator_id": 2
}
```

### Success Response
```json
{
  "message": "Request assigned successfully.",
  "request_id": 1,
  "assigned_operator_id": 2
}
```

### Notes
- Only admins can assign requests.
- A request can be assigned only once.
- After assignment, the request status becomes `ASSIGNED`.

---

## 15. Get All New Leads for Operators

### Endpoint
GET /api/leads/

### Authentication
Required: Operator

### Success Response
```json
[
  {
    "id": 1,
    "request_id": "REQ-00001",
    "name": "Hidden",
    "phone_number": "******3210",
    "from_location": "Delhi",
    "to_location": "Jaipur",
    "journey_date": "2026-08-01",
    "status": "NEW"
  }
]
```

---

## 16. Get My Accepted Leads

### Endpoint
GET /api/leads/my-leads/

### Authentication
Required: Operator

### Success Response
```json
[
  {
    "id": 1,
    "request_id": "REQ-00001",
    "name": "John Doe",
    "phone_number": "9876543210",
    "from_location": "Delhi",
    "to_location": "Jaipur",
    "journey_date": "2026-08-01",
    "status": "ACCEPTED"
  }
]
```

---

## 17. Accept Lead

### Endpoint
POST /api/customer/leads/<request_id>/accept/

### Authentication
Required: Operator

### Success Response
```json
{
  "message": "Lead accepted successfully.",
  "request_id": 1,
  "assigned_operator_id": 2
}
```

### Notes
- Operator must be approved.
- Wallet balance must be greater than zero.
- One credit is deducted on success.
- Lead status becomes `ACCEPTED`.

---

## 18. Add Credits to Operators

### Endpoint
POST /api/auth/wallet/add-credit/

### Authentication
Required: Admin

### Request Body
```json
{
  "operator_ids": [2],
  "credits": 5,
  "description": "Admin credit added"
}
```

### Success Response
```json
{
  "message": "Credits added successfully."
}
```

---

## 19. Get Wallet Balance

### Endpoint
GET /api/wallet/

### Authentication
Required: Operator

### Success Response
```json
{
  "current_balance": 5,
  "updated_at": "2026-07-16T10:00:00Z"
}
```

---

## 20. Get Wallet History

### Endpoint
GET /api/wallet/history/

### Authentication
Required: Operator

### Success Response
```json
[
  {
    "transaction_type": "CREDIT",
    "credits": 5,
    "balance_after_transaction": 5,
    "description": "Admin credit added",
    "created_at": "2026-07-16T10:00:00Z"
  }
]
```

---

## Supported Bus Types

- AC_SLEEPER
- NON_AC_SLEEPER
- AC_SEATER
- NON_AC_SEATER
- SEMI_SLEEPER

---

## Notes

- Operators are created with approval status `pending` by default.
- A request is created with status `NEW` by default.
- A request receives a generated `request_id` such as `REQ-00001` after creation.
- Once accepted, the request status becomes `ACCEPTED`.
- Wallet balance must be greater than zero to accept a lead.
- Every wallet operation creates a transaction record.
                                  