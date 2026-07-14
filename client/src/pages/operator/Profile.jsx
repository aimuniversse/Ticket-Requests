import { useState } from "react";
import {
  FaUserCircle,
  FaEnvelope,
  FaPhone,
  FaBus,
  FaMapMarkerAlt,
  FaEdit,
  FaSave,
} from "react-icons/fa";

import "../../styles/Profile.css";

const Profile = () => {

  // Backend API will populate this
  const [profile, setProfile] = useState({
    operatorName: "",
    companyName: "",
    email: "",
    phone: "",
    address: "",
  });

  const handleChange = (e) => {

    const { name, value } = e.target;

    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {

    console.log(profile);

    // API Call

  };

  return (

    <div className="profile-page">

      <div className="profile-header">

        <FaUserCircle className="profile-avatar"/>

        <div>

          <h1>Operator Profile</h1>

          <p>

            Manage your company and contact information.

          </p>

        </div>

      </div>

      <div className="profile-card">

        <div className="input-group">

          <label>

            <FaUserCircle />

            Operator Name

          </label>

          <input
            type="text"
            name="operatorName"
            value={profile.operatorName}
            onChange={handleChange}
          />

        </div>

        <div className="input-group">

          <label>

            <FaBus />

            Company Name

          </label>

          <input
            type="text"
            name="companyName"
            value={profile.companyName}
            onChange={handleChange}
          />

        </div>

        <div className="input-group">

          <label>

            <FaEnvelope />

            Email

          </label>

          <input
            type="email"
            name="email"
            value={profile.email}
            onChange={handleChange}
          />

        </div>

        <div className="input-group">

          <label>

            <FaPhone />

            Phone Number

          </label>

          <input
            type="tel"
            name="phone"
            value={profile.phone}
            onChange={handleChange}
          />

        </div>

        <div className="input-group">

          <label>

            <FaMapMarkerAlt />

            Address

          </label>

          <textarea
            rows="4"
            name="address"
            value={profile.address}
            onChange={handleChange}
          />

        </div>

        <button
          className="save-btn"
          onClick={handleSave}
        >

          <FaSave />

          Save Changes

        </button>

      </div>

    </div>

  );

};

export default Profile;