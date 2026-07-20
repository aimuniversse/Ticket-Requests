import { useEffect, useState } from "react";
import { FaUserCircle, FaEnvelope, FaPhone, FaIdBadge } from "react-icons/fa";

import "../../styles/Profile.css";

const Profile = () => {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone_number: "",
    role: "Operator",
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setProfile({
          name: user.name || user.operatorName || "",
          email: user.email || "",
          phone_number: user.phone_number || user.phone || "",
          role: user.role || "Operator",
        });
      } catch {
        // ignore malformed storage data
      }
    }
  }, []);

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-avatar-wrapper">
          <FaUserCircle className="profile-avatar" />
        </div>
        <div>
          <h1>Operator Profile</h1>
          <p>Profile details captured at registration are shown here.</p>
        </div>
      </div>

      <div className="profile-card">
        <div className="profile-grid">
          <div className="profile-field">
            <span className="field-label">
              <FaIdBadge /> Name
            </span>
            <strong>{profile.name || "Not available"}</strong>
          </div>

          <div className="profile-field">
            <span className="field-label">
              <FaEnvelope /> Email
            </span>
            <strong>{profile.email || "Not available"}</strong>
          </div>

          <div className="profile-field">
            <span className="field-label">
              <FaPhone /> Phone
            </span>
            <strong>{profile.phone_number || "Not available"}</strong>
          </div>

          <div className="profile-field">
            <span className="field-label">
              <FaUserCircle /> Role
            </span>
            <strong>{profile.role || "Operator"}</strong>
          </div>
        </div>
      </div>
    </div>
  );

};

export default Profile;