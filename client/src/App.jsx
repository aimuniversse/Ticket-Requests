import { Routes, Route } from "react-router-dom";

import Home from "./components/Home";
import About from "./pages/About";
import OperatorLogin from "./pages/OperatorLogin";
import OperatorRegister from "./pages/OperatorRegister";
import OperatorDashboard from "./pages/operator/OperatorDashboard";
import TicketRequestForm from "./components/TicketRequest/TicketRequestForm";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/operator-login" element={<OperatorLogin />} />
      <Route path="/operator-register" element={<OperatorRegister />} />
      <Route path="/operator/dashboard" element={<OperatorDashboard />} />
      <Route path="ticket-request" element={<TicketRequestForm />} />
    </Routes>
  );
}

export default App;