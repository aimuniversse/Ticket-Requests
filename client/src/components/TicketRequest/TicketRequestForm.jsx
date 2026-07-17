import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/TicketRequests.css";
import api from "../../api/axios";
import TurnstileCaptcha from "../Security/TurnstileCaptcha";
import Header from "../Header";

const CITY_NAMES = [
  // Andhra Pradesh, Telangana, Karnataka, Kerala and Tamil Nadu
  "Adoni", "Anantapur", "Chittoor", "Guntur", "Kadapa", "Kakinada", "Kurnool", "Nellore", "Ongole", "Rajahmundry", "Tirupati", "Vijayawada", "Visakhapatnam", "Vizianagaram",
  "Hyderabad", "Karimnagar", "Khammam", "Mahbubnagar", "Nalgonda", "Nizamabad", "Ramagundam", "Secunderabad", "Siddipet", "Suryapet", "Warangal",
  "Ballari", "Bengaluru", "Belagavi", "Bidar", "Chikkamagaluru", "Davanagere", "Gadag", "Hubballi", "Kalaburagi", "Kolar", "Mandya", "Mangaluru", "Mysuru", "Raichur", "Shivamogga", "Tumakuru", "Udupi", "Vijayapura",
  "Alappuzha", "Ernakulam", "Kannur", "Kasaragod", "Kochi", "Kollam", "Kottayam", "Kozhikode", "Malappuram", "Palakkad", "Pathanamthitta", "Thiruvananthapuram", "Thrissur", "Wayanad",
  "Ariyalur", "Chengalpattu", "Chennai", "Chidambaram", "Coimbatore", "Cuddalore", "Dharmapuri", "Dindigul", "Erode", "Hosur", "Kanchipuram", "Kanyakumari", "Karur", "Krishnagiri", "Kumbakonam", "Madurai", "Mayiladuthurai", "Nagapattinam", "Nagercoil", "Namakkal", "Ooty", "Perambalur", "Pollachi", "Pudukkottai", "Ramanathapuram", "Salem", "Sivaganga", "Tenkasi", "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli", "Tirunelveli", "Tirupattur", "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur", "Vellore", "Viluppuram", "Virudhunagar",

  // Western and central India
  "Ahmedabad", "Amreli", "Anand", "Bhavnagar", "Bhuj", "Gandhinagar", "Godhra", "Jamnagar", "Junagadh", "Mehsana", "Morbi", "Nadiad", "Navsari", "Palanpur", "Patan", "Porbandar", "Rajkot", "Surat", "Surendranagar", "Vadodara", "Valsad",
  "Akola", "Amravati", "Aurangabad", "Baramati", "Bhandara", "Chandrapur", "Dhule", "Jalgaon", "Jalna", "Kolhapur", "Latur", "Mumbai", "Nagpur", "Nanded", "Nashik", "Navi Mumbai", "Osmanabad", "Parbhani", "Pune", "Ratnagiri", "Sangli", "Satara", "Solapur", "Thane", "Wardha", "Yavatmal",
  "Bhopal", "Burhanpur", "Chhatarpur", "Chhindwara", "Dewas", "Gwalior", "Indore", "Jabalpur", "Khandwa", "Mandsaur", "Morena", "Ratlam", "Rewa", "Sagar", "Satna", "Shivpuri", "Ujjain", "Vidisha",
  "Ahmednagar", "Ambikapur", "Bhilai", "Bilaspur", "Dhamtari", "Durg", "Jagdalpur", "Korba", "Raigarh", "Raipur", "Rajnandgaon",
  "Panaji", "Margao", "Mapusa", "Vasco da Gama",

  // North and east India
  "Ajmer", "Alwar", "Barmer", "Bharatpur", "Bhilwara", "Bikaner", "Chittorgarh", "Jaipur", "Jaisalmer", "Jodhpur", "Kota", "Pali", "Sikar", "Sri Ganganagar", "Udaipur",
  "Agra", "Aligarh", "Allahabad", "Ayodhya", "Bareilly", "Basti", "Deoria", "Etawah", "Farrukhabad", "Fatehpur", "Firozabad", "Ghaziabad", "Gonda", "Gorakhpur", "Greater Noida", "Hapur", "Jhansi", "Kanpur", "Lucknow", "Mathura", "Meerut", "Mirzapur", "Moradabad", "Muzaffarnagar", "Noida", "Prayagraj", "Raebareli", "Saharanpur", "Sitapur", "Sultanpur", "Varanasi",
  "Dehradun", "Haldwani", "Haridwar", "Kashipur", "Nainital", "Roorkee", "Rudrapur",
  "Ambala", "Bhiwani", "Faridabad", "Gurugram", "Hisar", "Karnal", "Kurukshetra", "Panipat", "Panchkula", "Rewari", "Rohtak", "Sonipat", "Yamunanagar",
  "Chandigarh", "Delhi", "New Delhi", "Faridkot", "Firozpur", "Jalandhar", "Ludhiana", "Mohali", "Pathankot", "Patiala", "Sangrur",
  "Amritsar", "Barnala", "Bathinda", "Hoshiarpur", "Kapurthala", "Moga", "Muktsar",
  "Shimla", "Dharamshala", "Mandi", "Solan", "Una",
  "Jammu", "Kathua", "Srinagar", "Udhampur", "Anantnag", "Baramulla", "Leh", "Kargil",
  "Patna", "Arrah", "Begusarai", "Bettiah", "Bhagalpur", "Bihar Sharif", "Darbhanga", "Gaya", "Hajipur", "Katihar", "Madhubani", "Motihari", "Muzaffarpur", "Purnia", "Saharsa", "Samastipur", "Sasaram", "Siwan",
  "Bokaro", "Deoghar", "Dhanbad", "Hazaribagh", "Jamshedpur", "Ramgarh", "Ranchi", "Giridih",
  "Bhubaneswar", "Balasore", "Baripada", "Berhampur", "Cuttack", "Jharsuguda", "Puri", "Rourkela", "Sambalpur",
  "Kolkata", "Asansol", "Bardhaman", "Durgapur", "Haldia", "Howrah", "Kharagpur", "Malda", "Siliguri",
  "Gangtok", "Darjeeling", "Jalpaiguri", "Cooch Behar",
  "Agartala", "Aizawl", "Imphal", "Kohima", "Shillong", "Itanagar", "Naharlagun", "Pasighat", "Dibrugarh", "Guwahati", "Jorhat", "Nagaon", "Silchar", "Tezpur",

  // Union territories
  "Puducherry", "Karaikal", "Mahe", "Yanam", "Port Blair", "Daman", "Diu", "Kavaratti", "Silvassa"
].sort((firstCity, secondCity) => firstCity.localeCompare(secondCity));

const TicketRequestForm = () => {
  const navigate = useNavigate();
  const [captchaToken, setCaptchaToken] = useState("");
  const [openCityField, setOpenCityField] = useState(null);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const closeCityDropdownTimer = useRef(null);

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
    agree: false,
  });

 const handleSubmit = async (e) => {
  e.preventDefault();

  if (!captchaToken) {
    alert("Please complete the security verification.");
    return;
  }

  // Terms Validation
  if (!formData.agree) {
    alert("Please accept Terms & Conditions");
    return;
  }

  if (
    formData.from_location.trim().toLocaleLowerCase() ===
    formData.to_location.trim().toLocaleLowerCase()
  ) {
    alert("From and To locations must be different.");
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
      turnstile_token: captchaToken,
    };

    if (!payload.name || !payload.phone_number || !payload.from_location || !payload.to_location || !payload.journey_date || !payload.bus_type || !payload.expected_price) {
      alert("Please fill in all required fields before submitting.");
      return;
    }

    console.debug("API Payload:", payload);
    const response = await api.post("customer/request/", payload, {
      skipAuth: true,
    });

    console.log("Response :", response.data);

    if (response.data?.public_token) {
      navigate(`/ticket-request/status/${response.data.public_token}`);
      return;
    }
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
      agree: false,
    });
    setCaptchaToken("");

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

  const getCitySuggestions = (field) => {
    const searchText = formData[field].trim().toLocaleLowerCase();
    const otherField = field === "from_location" ? "to_location" : "from_location";
    const selectedOtherCity = formData[otherField].trim().toLocaleLowerCase();

    return CITY_NAMES.filter((city) =>
      city.toLocaleLowerCase().startsWith(searchText) &&
      city.toLocaleLowerCase() !== selectedOtherCity
    );
  };

  const selectCity = (field, city) => {
    setFormData((prev) => ({ ...prev, [field]: city }));
    setOpenCityField(null);
    setActiveSuggestion(-1);
  };

  const handleCityChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setOpenCityField(name);
    setActiveSuggestion(-1);
  };

  const handleCityKeyDown = (e, field) => {
    const suggestions = getCitySuggestions(field);

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpenCityField(field);
      setActiveSuggestion((current) => Math.min(current + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveSuggestion((current) => Math.max(current - 1, 0));
    } else if (e.key === "Enter" && activeSuggestion >= 0) {
      e.preventDefault();
      selectCity(field, suggestions[activeSuggestion]);
    } else if (e.key === "Escape") {
      setOpenCityField(null);
      setActiveSuggestion(-1);
    }
  };

  const renderCityAutocomplete = (field, label, placeholder) => {
    const suggestions = getCitySuggestions(field);
    const isOpen = openCityField === field;
    const listId = `${field}-suggestions`;

    return (
      <div className="input-group city-autocomplete">
        <label htmlFor={field}>{label}</label>
        <input
          id={field}
          type="text"
          name={field}
          value={formData[field]}
          onChange={handleCityChange}
          onFocus={() => {
            clearTimeout(closeCityDropdownTimer.current);
            setOpenCityField(field);
            setActiveSuggestion(-1);
          }}
          onBlur={() => {
            closeCityDropdownTimer.current = setTimeout(() => setOpenCityField(null), 150);
          }}
          onKeyDown={(e) => handleCityKeyDown(e, field)}
          placeholder={placeholder}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls={listId}
          aria-activedescendant={activeSuggestion >= 0 ? `${field}-option-${activeSuggestion}` : undefined}
          autoComplete="off"
          required
        />
        {isOpen && suggestions.length > 0 && (
          <ul id={listId} className="city-suggestions" role="listbox">
            {suggestions.map((city, index) => (
              <li
                id={`${field}-option-${index}`}
                key={city}
                className={index === activeSuggestion ? "is-active" : ""}
                role="option"
                aria-selected={index === activeSuggestion}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => selectCity(field, city)}
              >
                {city}
              </li>
            ))}
          </ul>
        )}
        {isOpen && formData[field] && suggestions.length === 0 && (
          <div className="city-suggestions city-suggestions-empty" role="status">
            No matching cities
          </div>
        )}
      </div>
    );
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
      <Header />
      
      <div className="ticket-page-layout">
        <aside className="journey-promo" aria-label="Ticket booking benefits">
          <h2>Your Journey <span>Starts Here</span></h2>
          <p>Book your bus tickets in just a few simple steps.</p>
          <ul>
            <li><span>✦</span> Best Prices Guaranteed</li>
            <li><span>✓</span> Secure &amp; Easy Booking</li>
            <li><span>◉</span> 24/7 Customer Support</li>
            <li><span>⌖</span> Live Tracking</li>
          </ul>
        </aside>
        <div className="ticket-booking-area">

      <form className="ticket-form" onSubmit={handleSubmit}>
        <div className="form-card form-panel">
          <div className="form-card-intro">
            <span className="form-card-icon">✦</span>
            <div>
              <strong>Ticket Booking</strong>
              <p>Fill in your travel details. It only takes a minute.</p>
            </div>
            <span className="secure-badge">● Secure Booking</span>
          </div>
          {/* <div className="form-head full-width">
            <h2>Quick Ticket Request</h2>
            <p>Submit the request in one view for both desktop and mobile.</p>
          </div> */}

          <div className="form-grid">
            {renderCityAutocomplete("from_location", "From Location", "Enter departure city")}

            {renderCityAutocomplete("to_location", "To Location", "Enter destination city")}

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
            <div className="input-group full-width">
             
              <label>Security Verification</label>
              <TurnstileCaptcha setToken={setCaptchaToken} />
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
        </div>
      </div>

      <div className="booking-benefits" aria-label="Booking benefits">
        <div><span>⌁</span><p><strong>Zero Booking Fee</strong>No hidden charges</p></div>
        <div><span>▣</span><p><strong>Instant Confirmation</strong>Get ticket in seconds</p></div>
        <div><span>▤</span><p><strong>Multiple Payment Options</strong>UPI, card, and net banking</p></div>
        <div><span>✦</span><p><strong>Trusted by Millions</strong>Safe and reliable booking</p></div>
      </div>

    </section>

  );

};

export default TicketRequestForm;
