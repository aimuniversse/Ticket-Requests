import { Routes, Route, Navigate } from "react-router-dom";

import Home from "./components/Home";
import About from "./pages/About";
import OperatorLogin from "./pages/OperatorLogin";
import OperatorRegister from "./pages/OperatorRegister";
import OperatorDashboard from "./pages/operator/OperatorDashboardNew";
import TicketRequestForm from "./components/TicketRequest/TicketRequestForm";
import CustomerRequestStatus from "./pages/CustomerRequestStatus";

//Operator
import RequestCard from "./pages/operator/RequestCard";
import AcceptQuoteModal from "./pages/operator/AcceptQuoteModal";
import CustomerDetailsUnlock from "./pages/operator/CustomerDetailsUnlock";
import ActiveRequests from "./pages/operator/ActiveRequests";
import AcceptedRequests from "./pages/operator/AcceptedRequests";
import Wallet from "./pages/operator/Wallet";
import Transactions from "./pages/operator/Transactions";
import Notifications from "./pages/operator/Notifications";
import Profile from "./pages/operator/Profile";
import Settings from "./pages/operator/Settings";

//Admin
import Admin from "./pages/Admin/Admin";
//import AdminLogin from "./pages/Admin/AdminLogin";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/operator-login" element={<OperatorLogin />} />
      <Route path="/operator-register" element={<OperatorRegister />} />
      <Route path="/operator/dashboard" element={<OperatorDashboard />} />
      <Route path="/ticket-request" element={<TicketRequestForm />} />
      <Route path="/ticket-request/status/:token" element={<CustomerRequestStatus />} />

      <Route path="/operator/request-card" element={<RequestCard />} />
      <Route path="/operator/accept-quote" element={<AcceptQuoteModal />} />
      <Route path="/operator/customer-details-unlock" element={<CustomerDetailsUnlock />} />
        <Route path="/operator/active-requests" element={<ActiveRequests />} />
        <Route path="/operator/accepted-requests" element={<AcceptedRequests />} />
        <Route path="/operator/wallet" element={<Wallet />} />
        <Route path="/operator/transactions" element={<Transactions />} />
        <Route path="/operator/notifications" element={<Notifications />} />
        <Route path="/operator/profile" element={<Profile />} />
        <Route path="/operator/settings" element={<Settings />} />

        {/* //Admin */}
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/dashboard" element={<Admin />} />
    </Routes>
  );
}

export default App;
