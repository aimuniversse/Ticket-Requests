import { useState } from "react";
import "../../styles/TicketRequests.css";
import api from "../../api/axios";
const TicketRequestForm = () => {

  const [formData, setFormData] = useState({
    from: "",
    to: "",
    journeyDate: "",
    returnDate: "",
    adults: 1,
    children: 0,
    busType: "",
    boardingPoint: "",
    dropPoint: "",
    budget: "",
    notes: "",
    fullName: "",
    phone: "",
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
    const response = await api.post(
      "customer/request/",
      formData
    );

    console.log("Response :", response.data);

    alert("Ticket Request Submitted Successfully!");

    // Reset Form
    setFormData({
      from: "",
      to: "",
      journeyDate: "",
      returnDate: "",
      adults: 1,
      children: 0,
      busType: "",
      boardingPoint: "",
      dropPoint: "",
      budget: "",
      notes: "",
      fullName: "",
      phone: "",
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

  const increaseAdult = () => {
    setFormData((prev) => ({
      ...prev,
      adults: prev.adults + 1,
    }));
  };

  const decreaseAdult = () => {

    if (formData.adults > 1) {

      setFormData((prev) => ({
        ...prev,
        adults: prev.adults - 1,
      }));

    }

  };

  const increaseChild = () => {

    setFormData((prev) => ({
      ...prev,
      children: prev.children + 1,
    }));

  };

  const decreaseChild = () => {

    if (formData.children > 0) {

      setFormData((prev) => ({
        ...prev,
        children: prev.children - 1,
      }));

    }

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

      <form
        className="ticket-form"
        onSubmit={handleSubmit}
      >

        {/* Journey */}

        <div className="form-card">

          <h2>Journey Details</h2>

          <div className="grid-two">

            <div className="input-group">

              <label>From</label>

              <input
                type="text"
                name="from"
                value={formData.from}
                onChange={handleChange}
                placeholder="Enter departure city"
              />

            </div>

            <div className="input-group">

              <label>To</label>

              <input
                type="text"
                name="to"
                value={formData.to}
                onChange={handleChange}
                placeholder="Enter destination city"
              />

            </div>

            <div className="input-group">

              <label>Journey Date</label>

              <input
                type="date"
                name="journeyDate"
                value={formData.journeyDate}
                onChange={handleChange}
              />

            </div>

            <div className="input-group">

              <label>Return Date</label>

              <input
                type="date"
                name="returnDate"
                value={formData.returnDate}
                onChange={handleChange}
              />

            </div>

          </div>

        </div>

        {/* Passenger */}

        <div className="form-card">

          <h2>Passenger Details</h2>

          <div className="counter-wrapper">

            <div className="counter-box">

              <span>Adults</span>

              <div className="counter">

                <button
                  type="button"
                  onClick={decreaseAdult}
                >
                  -
                </button>

                <strong>{formData.adults}</strong>

                <button
                  type="button"
                  onClick={increaseAdult}
                >
                  +
                </button>

              </div>

            </div>

            <div className="counter-box">

              <span>Children</span>

              <div className="counter">

                <button
                  type="button"
                  onClick={decreaseChild}
                >
                  -
                </button>

                <strong>{formData.children}</strong>

                <button
                  type="button"
                  onClick={increaseChild}
                >
                  +
                </button>

              </div>

            </div>

          </div>

        </div>
                {/* Bus Preference */}

        <div className="form-card">

          <h2>Bus Preference</h2>

          <div className="bus-grid">

            <label className="bus-card">

              <input
                type="radio"
                name="busType"
                value="AC Sleeper"
                checked={formData.busType === "AC Sleeper"}
                onChange={handleChange}
              />

              <span>🛏️ AC Sleeper</span>

            </label>

            <label className="bus-card">

              <input
                type="radio"
                name="busType"
                value="AC Seater"
                checked={formData.busType === "AC Seater"}
                onChange={handleChange}
              />

              <span>💺 AC Seater</span>

            </label>

            <label className="bus-card">

              <input
                type="radio"
                name="busType"
                value="Non AC"
                checked={formData.busType === "Non AC"}
                onChange={handleChange}
              />

              <span>❄️ Non AC</span>

            </label>

            <label className="bus-card">

              <input
                type="radio"
                name="busType"
                value="Volvo"
                checked={formData.busType === "Volvo"}
                onChange={handleChange}
              />

              <span>🚌 Volvo</span>

            </label>

          </div>

        </div>



        {/* Boarding */}

        <div className="form-card">

          <h2>Boarding Details</h2>

          <div className="grid-two">

            <div className="input-group">

              <label>Preferred Boarding Point</label>

              <input
                type="text"
                name="boardingPoint"
                value={formData.boardingPoint}
                onChange={handleChange}
                placeholder="Boarding location"
              />

            </div>

            <div className="input-group">

              <label>Preferred Drop Point</label>

              <input
                type="text"
                name="dropPoint"
                value={formData.dropPoint}
                onChange={handleChange}
                placeholder="Drop location"
              />

            </div>

          </div>

        </div>



        {/* Budget */}

        <div className="form-card">

          <h2>Expected Budget</h2>

          <div className="input-group">

            <label>Budget (₹)</label>

            <input
              type="number"
              name="budget"
              value={formData.budget}
              onChange={handleChange}
              placeholder="Enter expected ticket price"
            />

          </div>

        </div>



        {/* Notes */}

        <div className="form-card">

          <h2>Special Notes</h2>

          <textarea

            name="notes"

            rows="5"

            value={formData.notes}

            onChange={handleChange}

            placeholder="Anything you want the operator to know?"

          />

        </div>



        {/* Contact */}

        <div className="form-card">

          <h2>Contact Details</h2>

          <div className="grid-two">

            <div className="input-group">

              <label>Full Name</label>

              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Your Name"
              />

            </div>

            <div className="input-group">

              <label>Phone Number</label>

              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Phone Number"
              />

            </div>

            <div className="input-group grid-full">

              <label>Email Address</label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email Address"
              />

            </div>

          </div>

        </div>



        {/* Captcha */}

        <div className="form-card">

          <h2>Security Verification</h2>

          <div className="captcha-box">

            <div className="captcha-question">

              {captcha.question} = ?

            </div>

            <input
              type="number"
              name="captcha"
              value={formData.captcha}
              onChange={handleChange}
              placeholder="Enter Answer"
            />

          </div>

        </div>



        {/* Terms */}

        <div className="agree-box">

          <input

            type="checkbox"

            name="agree"

            checked={formData.agree}

            onChange={handleChange}

          />

          <label>

            I agree to the Terms & Conditions.

          </label>

        </div>



        {/* Submit */}

        <button

          type="submit"

          className="submit-btn"

        >

          Submit Ticket Price Request

        </button>

      </form>

    </section>

  );

};

export default TicketRequestForm;