import { useState } from "react";
import "../../styles/TicketRequests.css";
import api from "../../api/axios";
const TicketRequestForm = () => {

  const [formData, setFormData] = useState({
    name: "",
    phone_number: "",
    from_location: "",
    to_location: "",
    journey_date: "",
    total_tickets: 1,
    bus_type: "",
    boardingPoint: "",
    dropPoint: "",
    expected_price: "",
    notes: "",
    email: "",
    captcha: "",
    agree: false,
  });

  const [captcha] = useState(() => {
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    return { question: `${a} + ${b}`, answer: a + b };
  });

 const handleSubmit = async (e) => {
  e.preventDefault();

  // Captcha Validation
  if (Number(formData.captcha) !== captcha.answer) {
    alert("Invalid captcha");
    return;
  }

  // Terms Validation
  if (!formData.agree) {
    alert("Please accept Terms & Conditions");
    return;
  }

  try {
    const payload = {
      name: formData.name,
      phone_number: formData.phone_number,
      from_location: formData.from_location,
      to_location: formData.to_location,
      journey_date: formData.journey_date,
      total_tickets: Number(formData.total_tickets) || 1,
      bus_type: formData.bus_type || "",
      expected_price: formData.expected_price ? String(formData.expected_price) : "",
    };

    if (!payload.name || !payload.phone_number || !payload.from_location || !payload.to_location || !payload.journey_date || !payload.bus_type || !payload.expected_price) {
      alert("Please fill in all required fields before submitting.");
      return;
    }

    console.debug("API Payload:", payload);
    const response = await api.post("customer/request/", payload);

    console.log("Response :", response.data);

    alert("Ticket Request Submitted Successfully!");

    // Reset Form
    setFormData({
      name: "",
      phone_number: "",
      from_location: "",
      to_location: "",
      journey_date: "",
      total_tickets: 1,
      bus_type: "",
      boardingPoint: "",
      dropPoint: "",
      expected_price: "",
      notes: "",
      email: "",
      captcha: "",
      agree: false,
    });

  } catch (error) {
    console.error(error.response?.data || error);

    alert(
      error.response?.data?.message ||
      "Failed to submit ticket request."
    );
  }
};

  const handleChange = (e) => {

    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // total_tickets handlers
  const increaseTickets = () => {
    setFormData((prev) => ({ ...prev, total_tickets: Number(prev.total_tickets) + 1 }));
  };

  const decreaseTickets = () => {
    setFormData((prev) => ({
      ...prev,
      total_tickets: Math.max(1, Number(prev.total_tickets) - 1),
    }));
  };

  return (

    <section className="ticket-wrapper">

      <div className="ticket-header">

        <h1>Request Best Ticket Price</h1>

        <p>

          Submit your travel request.

          Operators will review it and respond within 5 minutes.

        </p>

      </div>

      <form className="ticket-form" onSubmit={handleSubmit}>
        <div className="form-card form-panel">
          <div className="form-head full-width">
            <h2>Quick Ticket Request</h2>
            <p>Submit the request in one view for both desktop and mobile.</p>
          </div>

          <div className="form-grid">
            <div className="input-group">
              <label>From Location</label>
              <input
                type="text"
                name="from_location"
                value={formData.from_location}
                onChange={handleChange}
                placeholder="Enter departure city"
                required
              />
            </div>

            <div className="input-group">
              <label>To Location</label>
              <input
                type="text"
                name="to_location"
                value={formData.to_location}
                onChange={handleChange}
                placeholder="Enter destination city"
                required
              />
            </div>

            <div className="input-group">
              <label>Journey Date</label>
              <input
                type="date"
                name="journey_date"
                value={formData.journey_date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label>Total Tickets</label>
              <div className="ticket-counter">
                <button type="button" onClick={decreaseTickets}>-</button>
                <strong>{formData.total_tickets}</strong>
                <button type="button" onClick={increaseTickets}>+</button>
              </div>
            </div>

            <div className="input-group">
              <label>Bus Type</label>
              <select name="bus_type" value={formData.bus_type} onChange={handleChange} required>
                <option value="">Select bus type</option>
                <option value="AC_SLEEPER">AC_SLEEPER</option>
                <option value="NON_AC_SLEEPER">NON_AC_SLEEPER</option>
                <option value="AC_SEATER">AC_SEATER</option>
                <option value="NON_AC_SEATER">NON_AC_SEATER</option>
                <option value="SEMI_SLEEPER">SEMI_SLEEPER</option>
              </select>
            </div>

            <div className="input-group">
              <label>Expected Price (₹)</label>
              <input
                type="number"
                name="expected_price"
                value={formData.expected_price}
                onChange={handleChange}
                placeholder="Enter expected ticket price"
                required
              />
            </div>

            <div className="input-group">
              <label>Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your Name"
                required
              />
            </div>

            <div className="input-group">
              <label>Phone Number</label>
              <input
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                placeholder="Phone Number"
                required
              />
            </div>

            <div className="input-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email Address"
              />
            </div>

            <div className="input-group">
              <label>Boarding Point</label>
              <input
                type="text"
                name="boardingPoint"
                value={formData.boardingPoint}
                onChange={handleChange}
                placeholder="Preferred boarding point"
              />
            </div>

            <div className="input-group">
              <label>Drop Point</label>
              <input
                type="text"
                name="dropPoint"
                value={formData.dropPoint}
                onChange={handleChange}
                placeholder="Preferred drop point"
              />
            </div>

            <div className="input-group full-width">
              <label>Special Notes</label>
              <textarea
                name="notes"
                rows="3"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Anything you want the operator to know?"
              />
            </div>

            <div className="input-group full-width">
              <label>Security Verification</label>
              <div className="captcha-box compact">
                <div className="captcha-question">{captcha.question} = ?</div>
                <input
                  type="number"
                  name="captcha"
                  value={formData.captcha}
                  onChange={handleChange}
                  placeholder="Answer"
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-actions">
            <label className="agree-box">
              <input
                type="checkbox"
                name="agree"
                checked={formData.agree}
                onChange={handleChange}
              />
              <span>I agree to the Terms & Conditions.</span>
            </label>
            <button type="submit" className="submit-btn full-width">
              Submit Ticket Price Request
            </button>
          </div>
        </div>
      </form>

    </section>

  );

};

export default TicketRequestForm;