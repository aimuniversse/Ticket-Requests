import { useState } from "react";
import {
  FaMoneyBillWave,
  FaSearch,
  FaArrowDown,
  FaArrowUp,
} from "react-icons/fa";

import "../../styles/Transactions.css";

const Transactions = () => {

  // Backend will populate this
  const [transactions] = useState([]);

  return (

    <div className="transactions-page">

      {/* Header */}

      <div className="transactions-header">

        <div>

          <h1>Transactions</h1>

          <p>

            View wallet recharges, unlock charges and payment history.

          </p>

        </div>

      </div>

      {/* Filters */}

      <div className="transaction-filters">

        <div className="search-box">

          <FaSearch />

          <input
            type="text"
            placeholder="Search transaction..."
          />

        </div>

        <select>

          <option>All Types</option>

          <option>Wallet Recharge</option>

          <option>Unlock Charge</option>

          <option>Refund</option>

        </select>

        <select>

          <option>All Status</option>

          <option>Success</option>

          <option>Pending</option>

          <option>Failed</option>

        </select>

      </div>

      {

        transactions.length === 0 ?

        (

          <div className="empty-transaction">

            <FaMoneyBillWave className="empty-icon"/>

            <h2>No Transactions Found</h2>

            <p>

              Your wallet transactions will appear here.

            </p>

          </div>

        )

        :

        (

          <div className="transaction-table">

            <table>

              <thead>

                <tr>

                  <th>ID</th>

                  <th>Date</th>

                  <th>Type</th>

                  <th>Amount</th>

                  <th>Status</th>

                </tr>

              </thead>

              <tbody>

                {

                  transactions.map((item)=>(

                    <tr key={item.id}>

                      <td>

                        {item.transactionId}

                      </td>

                      <td>

                        {item.date}

                      </td>

                      <td>

                        {item.type}

                      </td>

                      <td>

                        {

                          item.mode==="credit"

                          ?

                          <span className="credit">

                            <FaArrowDown />

                            ₹ {item.amount}

                          </span>

                          :

                          <span className="debit">

                            <FaArrowUp />

                            ₹ {item.amount}

                          </span>

                        }

                      </td>

                      <td>

                        <span

                          className={`status ${item.status.toLowerCase()}`}

                        >

                          {item.status}

                        </span>

                      </td>

                    </tr>

                  ))

                }

              </tbody>

            </table>

          </div>

        )

      }

    </div>

  );

};

export default Transactions;