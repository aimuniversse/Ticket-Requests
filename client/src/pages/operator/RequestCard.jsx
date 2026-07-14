import "../../styles/RequestCard.css";
import {
  FaMapMarkerAlt,
  FaBus,
  FaUsers,
  FaRupeeSign,
  FaClock,
} from "react-icons/fa";

const RequestCard = ({
  request,
  onAccept,
  onReject,
}) => {

  return (

    <div className="request-card">

      {/* Header */}

      <div className="request-header">

        <div>

          <h3>

            {request.from}

            →

            {request.to}

          </h3>

          <small>

            Request ID :
            {request.requestId}

          </small>

        </div>

        <span className="time">

          <FaClock />

          {request.remainingTime}

        </span>

      </div>

      {/* Body */}

      <div className="request-body">

        <div className="info">

          <FaMapMarkerAlt />

          <span>

            Journey Date

          </span>

          <strong>

            {request.journeyDate}

          </strong>

        </div>

        <div className="info">

          <FaUsers />

          <span>

            Passengers

          </span>

          <strong>

            {request.passengers}

          </strong>

        </div>

        <div className="info">

          <FaBus />

          <span>

            Bus Type

          </span>

          <strong>

            {request.busType}

          </strong>

        </div>

        <div className="info">

          <FaRupeeSign />

          <span>

            Customer Budget

          </span>

          <strong>

            ₹ {request.budget}

          </strong>

        </div>

      </div>

      {/* Hidden */}

      <div className="locked-box">

        🔒

        Customer information will be available
        after wallet verification.

      </div>

      {/* Footer */}

      <div className="request-footer">

        <button

          className="accept-btn"

          onClick={() => onAccept(request)}

        >

          Accept

        </button>

        <button

          className="reject-btn"

          onClick={() => onReject(request)}

        >

          Reject

        </button>

      </div>

    </div>

  );

};

export default RequestCard;