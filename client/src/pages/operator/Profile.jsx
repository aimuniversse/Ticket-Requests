import { useEffect, useState } from "react";
import { FaUserCircle, FaEnvelope, FaPhone, FaIdBadge, FaBuilding } from "react-icons/fa";
import API from "../../api/axios";
import { useCache } from "../../hooks/useCache";

import "../../styles/Profile.css";

const Profile = () => {
  const cache = useCache();
  const [profile, setProfile] = useState({
    name: "",
    company_name: "",
    email: "",
    phone_number: "",
    role: "Operator",
  });

  useEffect(() => {
    const applyUser = (user) => {
      setProfile({
        name: user.name || user.operatorName || "",
        company_name: user.company_name || "",
        email: user.email || "",
        phone_number: user.phone_number || user.phone || "",
        role: user.role || "Operator",
      });
    };

    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        applyUser(JSON.parse(storedUser));
      } catch {
        // ignore malformed storage data
      }
    }

    // Serve cached profile instantly (30 s TTL)
    const cached = cache.get("operator_profile");
    if (cached) applyUser(cached);

    API.get("auth/me/")
      .then((res) => {
        cache.set("operator_profile", res.data, 30_000);
        applyUser(res.data);
        try {
          localStorage.setItem("user", JSON.stringify(res.data));
        } catch {
          // ignore storage errors
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-avatar-wrapper">
          <FaUserCircle className="profile-avatar" />
        </div>
        <div>
          <h1>{profile.name || profile.company_name || "Operator Profile"}</h1>
          <p>{profile.name ? `${profile.name}'s profile` : "Profile details captured at registration are shown here."}</p>
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
              <FaBuilding /> Company Name
            </span>
            <strong>{profile.company_name || "Not available"}</strong>
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