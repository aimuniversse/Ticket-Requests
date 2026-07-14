import { useState } from "react";
import "../../styles/AcceptQuoteModal.css";


const AcceptQuoteModal = ({
  isOpen,
  onClose,
  request,
  onSubmit,
}) => {

  const [price, setPrice] = useState("");

  const [remarks, setRemarks] = useState("");

  if (!isOpen) return null;

  const handleSubmit = () => {

    onSubmit({
      requestId: request?.requestId,
      quotedPrice: price,
      remarks,
    });

    setPrice("");
    setRemarks("");
  };

  return (

    <div className="modal-overlay">

      <div className="quote-modal">

        <div className="modal-header">

          <h2>Accept Ticket Request</h2>

          <button
            className="close-btn"
            onClick={onClose}
          >
            ×
          </button>

        </div>

        <div className="modal-body">

          <div className="route-box">

            <h3>

              {request?.from}

              →

              {request?.to}

            </h3>

            <p>

              Journey :
              {request?.journeyDate}

            </p>

          </div>

          <div className="input-group">

            <label>

              Your Ticket Price

            </label>

            <input
              type="number"
              placeholder="Enter your price"
              value={price}
              onChange={(e)=>setPrice(e.target.value)}
            />

          </div>

          <div className="input-group">

            <label>

              Remarks (Optional)

            </label>

            <textarea

              rows="4"

              value={remarks}

              onChange={(e)=>setRemarks(e.target.value)}

              placeholder="Example : Boarding point near Bus Stand"

            />

          </div>

          <div className="note">

            Customer details remain hidden until
            wallet verification is completed.

          </div>

        </div>

        <div className="modal-footer">

          <button
            className="cancel-btn"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            className="submit-btn"
            onClick={handleSubmit}
          >
            Send Quote
          </button>

        </div>

      </div>

    </div>

  );

};

export default AcceptQuoteModal;