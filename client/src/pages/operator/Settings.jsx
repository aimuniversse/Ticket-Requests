import { useEffect, useState } from "react";
import {
  FaBell,
  FaMoon,
} from "react-icons/fa";

import "../../styles/Settings.css";

const Settings = () => {

  const [settings, setSettings] = useState({

    notifications: true,

    darkMode: false,

  });

  const handleChange = (e) => {

    const { name, value, type, checked } = e.target;

    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

  };

  useEffect(() => {
    if (settings.darkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, [settings.darkMode]);

  return (

    <div className="settings-page">

      <div className="settings-header">

        <h1>Settings</h1>

        <p>

          Manage your account preferences and security.

        </p>

      </div>

      {/* Preferences */}

      <div className="settings-card">

        <h2>Preferences</h2>

        <div className="toggle-item">

          <div>

            <FaBell />

            Notifications

          </div>

          <input

            type="checkbox"

            name="notifications"

            checked={settings.notifications}

            onChange={handleChange}

          />

        </div>

        <div className="toggle-item">

          <div>

            <FaMoon />

            Dark Mode

          </div>

          <input

            type="checkbox"

            name="darkMode"

            checked={settings.darkMode}

            onChange={handleChange}

          />

        </div>

      </div>


    </div>

  );

};

export default Settings;