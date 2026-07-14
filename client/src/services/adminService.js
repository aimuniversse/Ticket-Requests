const operators = [
  {
    id: "OP-101",
    name: "Vijay Kumar",
    email: "vijay@example.com",
    mobile: "+91 98765 43210",
    status: "Active",
    role: "Operator",
  },
  {
    id: "OP-118",
    name: "Priya Reddy",
    email: "priya@example.com",
    mobile: "+91 91234 56789",
    status: "Pending",
    role: "Operator",
  },
  {
    id: "OP-124",
    name: "Suresh Nair",
    email: "suresh@example.com",
    mobile: "+91 99887 77665",
    status: "Blocked",
    role: "Operator",
  },
];

const customers = [
  {
    id: "CU-215",
    name: "Anjali Sharma",
    email: "anjali@example.com",
    mobile: "+91 94444 11111",
    status: "Active",
    role: "Customer",
  },
  {
    id: "CU-230",
    name: "Karthik Menon",
    email: "karthik@example.com",
    mobile: "+91 93333 22222",
    status: "Active",
    role: "Customer",
  },
  {
    id: "CU-246",
    name: "Meena Joshi",
    email: "meena@example.com",
    mobile: "+91 92222 33333",
    status: "Blocked",
    role: "Customer",
  },
];

const approvals = [
  {
    id: "REQ-502",
    name: "Naveen R",
    email: "naveen@example.com",
    submitted: "2026-07-12",
    status: "Pending",
  },
  {
    id: "REQ-508",
    name: "Leena Mathew",
    email: "leena@example.com",
    submitted: "2026-07-13",
    status: "Pending",
  },
];

const wallets = [
  {
    name: "Operator Wallets",
    amount: 158400,
    users: 18,
    type: "Operator",
  },
  {
    name: "Customer Wallets",
    amount: 245700,
    users: 94,
    type: "Customer",
  },
];

const walletHistory = [
  {
    id: "WLT-001",
    user: "Vijay Kumar",
    type: "Operator",
    balance: 7800,
    status: "Active",
  },
  {
    id: "WLT-002",
    user: "Anjali Sharma",
    type: "Customer",
    balance: 1500,
    status: "Active",
  },
  {
    id: "WLT-003",
    user: "Priya Reddy",
    type: "Operator",
    balance: 4200,
    status: "Pending",
  },
];

const transcripts = [
  {
    id: "TR-701",
    user: "Anjali Sharma",
    type: "Chat",
    summary: "Booking confirmation delay",
    status: "Review",
  },
  {
    id: "TR-702",
    user: "Vijay Kumar",
    type: "Call",
    summary: "Operator registration query",
    status: "Completed",
  },
];

const tickets = [
  {
    id: "TK-901",
    customer: "Karthik Menon",
    issue: "Payment failure",
    priority: "High",
    status: "Open",
  },
  {
    id: "TK-902",
    customer: "Meena Joshi",
    issue: "Ticket cancellation request",
    priority: "Medium",
    status: "Pending",
  },
];

export const getAdminData = () =>
  Promise.resolve({
    operators,
    customers,
    approvals,
    wallets,
    walletHistory,
    transcripts,
    tickets,
  });
