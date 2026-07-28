import { useEffect } from "react";
import "../../styles/Notifications.css";

import {
  FaBell,
  FaCheckCircle,
  FaTimesCircle,
  FaWallet,
  FaClock,
  FaTicketAlt,
} from "react-icons/fa";

const typeIcons = {
  request: FaTicketAlt,
  accepted: FaCheckCircle,
  rejected: FaTimesCircle,
  wallet: FaWallet,
  expired: FaClock,
};

const Notifications = ({ notifications = [], onClear }) => {

  useEffect(() => {
    if (onClear) onClear();
  }, [onClear]);

  return (

    <div className="notification-page">

      <div className="notification-header">

        <FaBell />

        <div>

          <h2>Notifications</h2>

          <p>

            Stay updated with ticket requests and customer actions.

          </p>

        </div>

      </div>

      {

        notifications.length === 0 ?

        (

          <div className="empty-notification">

            <FaBell className="empty-icon"/>

            <h3>No Notifications</h3>

            <p>

              New notifications will appear here.

            </p>

          </div>

        )

        :

        (

          notifications.map((item, idx) => {

            const Icon = typeIcons[item.type] || FaBell;

            return (

              <div

                key={item.id}

                className="notification-card notification-card--animate"

                style={{ animationDelay: `${idx * 0.06}s` }}

              >

                <div className="notification-icon">

                  <Icon/>

                </div>

                <div className="notification-content">

                  <h4>

                    {item.title}

                  </h4>

                  <p>

                    {item.message}

                  </p>

                  <small>

                    {item.time}

                  </small>

                </div>

              </div>

            );

          })

        )

      }

    </div>

  );

};

export default Notifications;
