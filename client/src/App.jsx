import { Routes, Route, Navigate } from "react-router-dom";

import Home from "./components/Home";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import OperatorLogin from "./pages/OperatorLogin";
import OperatorRegister from "./pages/OperatorRegister";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
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
import Notifications from "./pages/operator/Notifications";
import Profile from "./pages/operator/Profile";
import Settings from "./pages/operator/Settings";

//Admin
import Admin from "./pages/Admin/Admin";

//Auth Guard
import ProtectedRoute from "./components/routing/ProtectedRoute";

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/operator-login" element={<OperatorLogin />} />
      <Route path="/operator-register" element={<OperatorRegister />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />
      <Route path="/ticket-request" element={<TicketRequestForm />} />
      <Route path="/ticket-request/status/:token" element={<CustomerRequestStatus />} />

      {/* Operator protected routes */}
      <Route path="/operator/dashboard" element={<ProtectedRoute role="operator"><OperatorDashboard /></ProtectedRoute>} />
      <Route path="/operator/request-card" element={<ProtectedRoute role="operator"><RequestCard /></ProtectedRoute>} />
      <Route path="/operator/accept-quote" element={<ProtectedRoute role="operator"><AcceptQuoteModal /></ProtectedRoute>} />
      <Route path="/operator/customer-details-unlock" element={<ProtectedRoute role="operator"><CustomerDetailsUnlock /></ProtectedRoute>} />
      <Route path="/operator/active-requests" element={<ProtectedRoute role="operator"><ActiveRequests /></ProtectedRoute>} />
      <Route path="/operator/accepted-requests" element={<ProtectedRoute role="operator"><AcceptedRequests /></ProtectedRoute>} />
      <Route path="/operator/wallet" element={<ProtectedRoute role="operator"><Wallet /></ProtectedRoute>} />
      <Route path="/operator/notifications" element={<ProtectedRoute role="operator"><Notifications /></ProtectedRoute>} />
      <Route path="/operator/profile" element={<ProtectedRoute role="operator"><Profile /></ProtectedRoute>} />
      <Route path="/operator/settings" element={<ProtectedRoute role="operator"><Settings /></ProtectedRoute>} />

      {/* Admin protected routes */}
      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><Admin /></ProtectedRoute>} />

      {/* Fallback: unknown paths show 404 page */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
