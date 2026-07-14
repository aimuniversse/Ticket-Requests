import "../../styles/CustomerDetailsUnlock.css";

import {
  FaUser,
  FaPhone,
  FaEnvelope,
  FaTicketAlt,
  FaCheckCircle,
} from "react-icons/fa";

const CustomerDetailsUnlock = ({
  unlocked,
  customer,
}) => {

  return (

    <div className="unlock-container">

      <div className="unlock-card">

        <div className="unlock-header">

          <FaCheckCircle className="success-icon"/>

          <h2>Customer Details</h2>

          <p>

            Customer information becomes available
            after successful wallet verification.

          </p>

        </div>

        {

          !unlocked ?

          (

            <div className="locked-state">

              <div className="lock-icon">

                🔒

              </div>

              <h3>

                Details Locked

              </h3>

              <p>

                Waiting for customer payment.

              </p>

            </div>

          )

          :

          (

            <div className="customer-details">

              <div className="detail-row">

                <FaUser/>

                <div>

                  <span>Name</span>

                  <h4>

                    {customer.name}

                  </h4>

                </div>

              </div>

              <div className="detail-row">

                <FaPhone/>

                <div>

                  <span>Phone</span>

                  <h4>

                    {customer.phone}

                  </h4>

                </div>

              </div>

              <div className="detail-row">

                <FaEnvelope/>

                <div>

                  <span>Email</span>

                  <h4>

                    {customer.email}

                  </h4>

                </div>

              </div>

              <div className="detail-row">

                <FaTicketAlt/>

                <div>

                  <span>Booking Code</span>

                  <h4>

                    {customer.bookingCode}

                  </h4>

                </div>

              </div>

            </div>

          )

        }

      </div>

    </div>

  );

};

export default CustomerDetailsUnlock;