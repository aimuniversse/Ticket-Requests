import { useState } from "react";
import {
  FaBus,
  FaLock,
  FaUnlock,
  FaPhone,
  FaEnvelope,
  FaUser,
  FaTicketAlt,
  FaMapMarkerAlt,
} from "react-icons/fa";

import "../../styles/AcceptedRequests.css";

const AcceptedRequests = () => {

  // Backend will populate this
  const [acceptedRequests] = useState([]);

  return (

    <div className="accepted-page">

      <div className="accepted-header">

        <h1>Accepted Requests</h1>

        <p>

          Customer details will be unlocked
          after successful wallet verification.

        </p>

      </div>

      {

        acceptedRequests.length === 0 ?

        (

          <div className="empty-card">

            <FaBus className="empty-icon"/>

            <h2>No Accepted Requests</h2>

            <p>

              Accepted requests will appear here.

            </p>

          </div>

        )

        :

        (

          <div className="accepted-grid">

            {

              acceptedRequests.map((request)=>(

                <div
                  className="accepted-card"
                  key={request.id}
                >

                  <div className="route">

                    <h2>

                      {request.from}

                      →

                      {request.to}

                    </h2>

                    <span>

                      #{request.requestId}

                    </span>

                  </div>

                  <div className="journey">

                    <FaMapMarkerAlt/>

                    <span>

                      {request.journeyDate}

                    </span>

                  </div>

                  <div className="price">

                    Your Quote

                    <strong>

                      ₹ {request.quotedPrice}

                    </strong>

                  </div>

                  {

                    request.unlocked ?

                    (

                      <div className="customer-box">

                        <div className="customer-row">

                          <FaUser/>

                          <span>

                            {request.customer.name}

                          </span>

                        </div>

                        <div className="customer-row">

                          <FaPhone/>

                          <span>

                            {request.customer.phone}

                          </span>

                        </div>

                        <div className="customer-row">

                          <FaEnvelope/>

                          <span>

                            {request.customer.email}

                          </span>

                        </div>

                        <div className="customer-row">

                          <FaTicketAlt/>

                          <span>

                            Booking Code :

                            {request.customer.bookingCode}

                          </span>

                        </div>

                        <button
                          className="contact-btn"
                        >

                          Contact Customer

                        </button>

                      </div>

                    )

                    :

                    (

                      <div className="locked-box">

                        <FaLock className="lock"/>

                        <h3>

                          Customer Details Locked

                        </h3>

                        <p>

                          Waiting for customer payment.

                        </p>

                      </div>

                    )

                  }

                </div>

              ))

            }

          </div>

        )

      }

    </div>

  );

};

export default AcceptedRequests;