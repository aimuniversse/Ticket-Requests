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

## 2. Operator Registration

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

## 3. Get Pending Operators

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

## 4. Approve Operator

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

## 5. Create Customer Request

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
  "total_tickets": 2,
  "bus_type": "AC_SEATER",
  "expected_price": "1200.00"
}
```

### Success Response
```json
{
  "id": 1,
  "request_id": "",
  "name": "John Doe",
  "phone_number": "9876543210",
  "from_location": "Delhi",
  "to_location": "Jaipur",
  "journey_date": "2026-08-01",
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

## 6. Assign Request to Operator

### Endpoint
POST /api/customer/requests/<request_id>/assign/

### Authentication
Recommended: Admin

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

---

## 7. Get Assigned Requests for Operator

### Endpoint
GET /api/auth/requests/assigned/

### Authentication
Required: Operator

### Success Response
```json
[
  {
    "id": 1,
    "name": "John Doe",
    "status": "ASSIGNED",
    "assigned_operator_id": 2
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
- Once assigned, the request status becomes `ASSIGNED`.
- The API is currently focused on the core backend workflow for registration, approval, request submission, and assignment.
