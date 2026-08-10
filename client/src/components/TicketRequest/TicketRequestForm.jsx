import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/TicketRequests.css";
import api from "../../api/axios";
import TurnstileCaptcha from "../Security/TurnstileCaptcha";
import Header from "../Header";
import logo from "../../assets/logo.jpeg";

const CITY_NAMES = [
  // Andhra Pradesh, Telangana, Karnataka, Kerala and Tamil Nadu
  "Adoni", "Anantapur", "Chittoor", "Guntur", "Kadapa", "Kakinada", "Kurnool", "Nellore", "Ongole", "Rajahmundry", "Tirupati", "Vijayawada", "Visakhapatnam", "Vizianagaram",
  "Hyderabad", "Karimnagar", "Khammam", "Mahbubnagar", "Nalgonda", "Nizamabad", "Ramagundam", "Secunderabad", "Siddipet", "Suryapet", "Warangal",
  "Ballari", "Bengaluru", "Belagavi", "Bidar", "Chikkamagaluru", "Davanagere", "Gadag", "Hubballi", "Kalaburagi", "Kolar", "Mandya", "Mangaluru", "Mysuru", "Raichur", "Shivamogga", "Tumakuru", "Udupi", "Vijayapura",
  "Alappuzha", "Ernakulam", "Kannur", "Kasaragod", "Kochi", "Kollam", "Kottayam", "Kozhikode", "Malappuram", "Palakkad", "Pathanamthitta", "Thiruvananthapuram", "Thrissur", "Wayanad",
  "Ariyalur", "Chengalpattu", "Chennai", "Chidambaram", "Coimbatore", "Cuddalore", "Dharmapuri", "Dindigul", "Erode", "Hosur", "Kanchipuram", "Kanyakumari", "Karur", "Krishnagiri", "Kumbakonam", "Madurai", "Mayiladuthurai", "Nagapattinam", "Nagercoil", "Namakkal", "Ooty", "Perambalur", "Pollachi", "Pudukkottai", "Ramanathapuram", "Salem", "Sivaganga", "Tenkasi", "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli", "Tirunelveli", "Tirupattur", "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur", "Vellore", "Viluppuram", "Virudhunagar",
    "Avinashi",
  // Western and central India
  "Ahmedabad", "Amreli", "Anand", "Bhavnagar", "Bhuj", "Gandhinagar", "Godhra", "Jamnagar", "Junagadh", "Mehsana", "Morbi", "Nadiad", "Navsari", "Palanpur", "Patan", "Porbandar", "Rajkot", "Surat", "Surendranagar", "Vadodara", "Valsad",
  "Akola", "Amravati", "Aurangabad", "Baramati", "Bhandara", "Chandrapur", "Dhule", "Jalgaon", "Jalna", "Kolhapur", "Latur", "Mumbai", "Nagpur", "Nanded", "Nashik", "Navi Mumbai", "Osmanabad", "Parbhani", "Pune", "Ratnagiri", "Sangli", "Satara", "Solapur", "Thane", "Wardha", "Yavatmal",
  "Bhopal", "Burhanpur", "Chhatarpur", "Chhindwara", "Dewas", "Gwalior", "Indore", "Jabalpur", "Khandwa", "Mandsaur", "Morena", "Ratlam", "Rewa", "Sagar", "Satna", "Shivpuri", "Ujjain", "Vidisha",
  "Ahmednagar", "Ambikapur", "Bhilai", "Bilaspur", "Dhamtari", "Durg", "Jagdalpur", "Korba", "Raigarh", "Raipur", "Rajnandgaon",
  "Panaji", "Margao", "Mapusa", "Vasco da Gama", "Goa", "ponda", "Pernem", "Bicholim", "Curchorem", "Avinashi", 
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
  "Agartala", "Aizawl", "Imphal", "Kohima", "Shillong", "Itanagar", "Naharlagun", "Pasighat", "Dibrugarh", "Guwahati", "Jorhat", "Nagaon", "Silchar", "Tezpur", "Goa", "ponda", "Pernem", "Bicholim", "Curchorem",
  // North and east India

  // Union territories
  "Puducherry", "Karaikal", "Mahe", "Yanam", "Port Blair", "Daman", "Diu", "Kavaratti", "Silvassa"
].sort((firstCity, secondCity) => firstCity.localeCompare(secondCity));

const INITIAL_FORM_DATA = {
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
  Gender: "",
  notes: "",
  email: "",
  agree: false,
};

const REQUEST_STORAGE_KEY = "latestTicketRequest";

const buildRequestSnapshot = (responseData) => {
  const fallbackExpiresAt = new Date(Date.now() + 2 * 60 * 1000).toISOString();

  return {
    ...responseData,
    id: responseData?.id ?? responseData?.request_id,
    request_id: responseData?.request_id || responseData?.id,
    expires_at: responseData?.expires_at || fallbackExpiresAt,
    status: responseData?.status || "PENDING",
  };
};

const persistLatestRequest = (requestData) => {
  if (!requestData) return;

  try {
    localStorage.setItem(REQUEST_STORAGE_KEY, JSON.stringify(requestData));
  } catch (error) {
    console.warn("Unable to persist ticket request snapshot", error);
  }
};

const TicketRequestForm = () => {
  const navigate = useNavigate();
  const [captchaToken, setCaptchaToken] = useState("");
  const [openCityField, setOpenCityField] = useState(null);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const closeCityDropdownTimer = useRef(null);
  const [phoneError, setPhoneError] = useState("");

  const [formData, setFormData] = useState(INITIAL_FORM_DATA);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!captchaToken) {
      alert("Please complete the security verification.");
      return;
    }

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

    if (!/^\d{10}$/.test(formData.phone_number)) {
      setPhoneError("Please enter a valid 10-digit mobile number.");
      return;
    }

    const parsedPrice = parseFloat(formData.expected_price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      alert("Expected price must be a valid number greater than 0.");
      return;
    }

    const parsedTickets = parseInt(formData.total_tickets, 10);
    if (isNaN(parsedTickets) || parsedTickets <= 0) {
      alert("Total tickets must be at least 1.");
      return;
    }

    try {
      const payload = {
        name: formData.name.trim(),
        phone_number: formData.phone_number.trim(),
        from_location: formData.from_location.trim(),
        to_location: formData.to_location.trim(),
        journey_date: formData.journey_date,
        total_tickets: parsedTickets,
        bus_type: formData.bus_type || "",
        Gender: formData.Gender || "",
        expected_price: parsedPrice,
        turnstile_token: captchaToken,
      };

      if (
        !payload.name ||
        !payload.phone_number ||
        !payload.from_location ||
        !payload.to_location ||
        !payload.journey_date ||
        !payload.bus_type ||
        !payload.Gender ||
        !payload.expected_price ||
        payload.expected_price <= 0
      ) {
        alert("Please fill in all required fields before submitting.");
        return;
      }

      console.debug("API Payload:", payload);
      const response = await api.post("customer/request/", payload, {
        skipAuth: true,
      });

      console.log("Response :", response.data);

      const requestSnapshot = buildRequestSnapshot(response.data);
      persistLatestRequest(requestSnapshot);

      setFormData(INITIAL_FORM_DATA);
      setCaptchaToken("");

      const requestIdentifier = requestSnapshot.id ?? response.data?.id ?? response.data?.public_token;
      navigate(`/ticket-request/status/${requestIdentifier}`, { state: { request: requestSnapshot } });
      return;

    } catch (error) {
      console.error(error.response?.data || error);

      let errorMessage = "Failed to submit ticket request.";
      const errData = error.response?.data;
      if (errData) {
        if (typeof errData === "string") {
          errorMessage = errData;
        } else if (errData.message) {
          errorMessage = errData.message;
        } else if (errData.detail) {
          errorMessage = errData.detail;
        } else if (errData.error) {
          errorMessage = errData.error;
        } else if (typeof errData === "object") {
          const fieldErrors = Object.entries(errData)
            .map(([field, msgs]) => {
              const label = field.replace(/_/g, " ");
              const msgText = Array.isArray(msgs) ? msgs.join(", ") : String(msgs);
              return `${label}: ${msgText}`;
            })
            .join("\n");
          if (fieldErrors) {
            errorMessage = fieldErrors;
          }
        }
      }

      alert(errorMessage);
    }
  };

  const handleChange = (e) => {

    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handlePhoneChange = (e) => {
    const raw = e.target.value;
    const digits = raw.replace(/\D/g, "").slice(0, 10);

    setFormData((prev) => ({ ...prev, phone_number: digits }));

    if (digits.length === 0) {
      setPhoneError("");
    } else if (digits.length !== 10) {
      setPhoneError("Please enter a valid 10-digit mobile number.");
    } else {
      setPhoneError("");
    }
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
      <a href="https://demo.tickmybus.com/" target="_blank" rel="noopener noreferrer" className="mobile-logo-link">
        <img src={logo} alt="TickMyBus" className="mobile-logo-img" />
        <p className="mobile-logo-text">For more information, click the logo to visit our official website.</p>
      </a>
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
            {renderCityAutocomplete("from_location", "From ", "Enter departure city")}

            {renderCityAutocomplete("to_location", "To ", "Enter destination city")}

            <div className="input-group">
              <label>Date OF Journey </label>
              <input
                type="date"
                name="journey_date"
                value={formData.journey_date}
                onChange={handleChange}
                required                 
              />
            </div>
           

            <div className="input-group">
              {/* <label>Total Tickets</label>
              <div className="ticket-counter">
                <button type="button" onClick={decreaseTickets}>-</button>
                <strong>{formData.total_tickets}</strong>
                <button type="button" onClick={increaseTickets}>+</button>
                
              </div> */}
              <label>Total Tickets</label>
              <input
                type="number"
                name="total_tickets"
                min="1"
                step="1"
                value={formData.total_tickets}
                onChange={handleChange}
                placeholder="Total tickets"
                required
              />
            </div>

            <div className="input-group">
              <label>Bus Type</label>
              <select name="bus_type" value={formData.bus_type} onChange={handleChange} required>
                <option value="">Select bus type</option>
                <option value="AC_SLEEPER">AC SLEEPER</option>
                <option value="NON_AC_SLEEPER">NON AC SLEEPER</option>
                <option value="AC_SEATER">AC SEATER</option>
                <option value="NON_AC_SEATER">NON AC SEATER</option>
                <option value="SEMI_SLEEPER">UPPER SINGLE SLEEPER</option>
                 <option value="SEMI_SLEEPER">LOWER SINGLE SLEEPER</option>
                  <option value="SEMI_SLEEPER">FEMALE SLEEPER</option>
              </select>
            </div>

            
            <div className="input-group">
              <label>Gender</label>
              <select name="Gender" value={formData.Gender} onChange={handleChange} required>
                <option value="">Select Gender</option>
                <option value="Male">Male</option> 
                <option value="Female">Female</option>               
              </select>
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
                onChange={handlePhoneChange}
                placeholder="Phone Number"
                inputMode="numeric"
                pattern="\d{10}"
                maxLength={10}
                required
              />
              {phoneError && <span className="field-error">{phoneError}</span>}
            </div>

            
            <div className="input-group">
              <label>Expected Price (₹)</label>
              <input
                type="number"
                name="expected_price"
                min="1"
                step="any"
                value={formData.expected_price}
                onChange={handleChange}
                placeholder="Enter expected ticket price"
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

     

    </section>

  );

};

export default TicketRequestForm;
