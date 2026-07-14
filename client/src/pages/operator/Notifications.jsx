import "../../styles/Notifications.css";

import {
  FaBell,
  FaCheckCircle,
  FaTimesCircle,
  FaWallet,
  FaClock,
} from "react-icons/fa";

const Notifications = ({ notifications = [] }) => {

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

          notifications.map((item)=>(

            <div
              key={item.id}
              className="notification-card"
            >

              <div className="notification-icon">

                {

                  item.type==="request" &&

                  <FaBell/>

                }

                {

                  item.type==="accepted" &&

                  <FaCheckCircle/>

                }

                {

                  item.type==="rejected" &&

                  <FaTimesCircle/>

                }

                {

                  item.type==="wallet" &&

                  <FaWallet/>

                }

                {

                  item.type==="expired" &&

                  <FaClock/>

                }

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

          ))

        )

      }

    </div>

  );

};

export default Notifications;