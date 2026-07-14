import { useState } from "react";
import {
  FaClock,
  FaBus,
  FaUsers,
  FaMapMarkerAlt,
  FaRupeeSign,
  FaCheck,
  FaTimes,
} from "react-icons/fa";

import "../../styles/ActiveRequests.css";

const ActiveRequests = () => {

  // Backend will replace this
  const [requests] = useState([]);

  const handleAccept = (request) => {
    console.log("Accept", request);
  };

  const handleReject = (request) => {
    console.log("Reject", request);
  };

  return (

    <div className="active-page">

      <div className="page-header">

        <div>

          <h1>Active Ticket Requests</h1>

          <p>

            Respond within 5 minutes.

            Customer information remains hidden.

          </p>

        </div>

      </div>

      {

        requests.length === 0 ?

        (

          <div className="empty-card">

            <FaBus className="empty-icon"/>

            <h2>No Active Requests</h2>

            <p>

              New customer requests will appear here automatically.

            </p>

          </div>

        )

        :

        (

          <div className="request-grid">

            {

              requests.map((request)=>(

                <div
                  className="request-card"
                  key={request.id}
                >

                  <div className="request-top">

                    <h2>

                      {request.from}

                      →

                      {request.to}

                    </h2>

                    <div className="timer">

                      <FaClock/>

                      {request.remainingTime}

                    </div>

                  </div>

                  <div className="request-info">

                    <div>

                      <FaMapMarkerAlt/>

                      <span>

                        Journey

                      </span>

                      <strong>

                        {request.journeyDate}

                      </strong>

                    </div>

                    <div>

                      <FaUsers/>

                      <span>

                        Passengers

                      </span>

                      <strong>

                        {request.passengers}

                      </strong>

                    </div>

                    <div>

                      <FaBus/>

                      <span>

                        Bus Type

                      </span>

                      <strong>

                        {request.busType}

                      </strong>

                    </div>

                    <div>

                      <FaRupeeSign/>

                      <span>

                        Budget

                      </span>

                      <strong>

                        ₹ {request.budget}

                      </strong>

                    </div>

                  </div>

                  <div className="privacy-box">

                    🔒

                    Customer Name, Phone and Email

                    remain hidden until payment.

                  </div>

                  <div className="action-buttons">

                    <button

                      className="accept"

                      onClick={()=>handleAccept(request)}

                    >

                      <FaCheck/>

                      Accept

                    </button>

                    <button

                      className="reject"

                      onClick={()=>handleReject(request)}

                    >

                      <FaTimes/>

                      Reject

                    </button>

                  </div>

                </div>

              ))

            }

          </div>

        )

      }

    </div>

  );

};

export default ActiveRequests;