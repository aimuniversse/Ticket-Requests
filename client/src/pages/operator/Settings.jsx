import { useState } from "react";
import {
  FaBell,
  FaMoon,
  FaGlobe,
  FaLock,
  FaMobileAlt,
  FaSave,
} from "react-icons/fa";

import "../../styles/Settings.css";

const Settings = () => {

  const [settings, setSettings] = useState({

    notifications: true,

    darkMode: false,

    language: "English",

    twoFactor: false,

    oldPassword: "",

    newPassword: "",

    confirmPassword: "",

  });

  const handleChange = (e) => {

    const { name, value, type, checked } = e.target;

    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

  };

  const handleSave = () => {

    console.log(settings);

    // Backend API

  };

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

        <div className="toggle-item">

          <div>

            <FaMobileAlt />

            Two Factor Authentication

          </div>

          <input

            type="checkbox"

            name="twoFactor"

            checked={settings.twoFactor}

            onChange={handleChange}

          />

        </div>

        <div className="input-group">

          <label>

            <FaGlobe />

            Language

          </label>

          <select

            name="language"

            value={settings.language}

            onChange={handleChange}

          >

            <option>English</option>

            <option>Tamil</option>

            <option>Hindi</option>

          </select>

        </div>

      </div>

      {/* Password */}

      <div className="settings-card">

        <h2>

          <FaLock />

          Change Password

        </h2>

        <div className="input-group">

          <label>Current Password</label>

          <input

            type="password"

            name="oldPassword"

            value={settings.oldPassword}

            onChange={handleChange}

          />

        </div>

        <div className="input-group">

          <label>New Password</label>

          <input

            type="password"

            name="newPassword"

            value={settings.newPassword}

            onChange={handleChange}

          />

        </div>

        <div className="input-group">

          <label>Confirm Password</label>

          <input

            type="password"

            name="confirmPassword"

            value={settings.confirmPassword}

            onChange={handleChange}

          />

        </div>

      </div>

      <button

        className="save-settings"

        onClick={handleSave}

      >

        <FaSave />

        Save Settings

      </button>

    </div>

  );

};

export default Settings;