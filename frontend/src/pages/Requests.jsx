import { useState, useEffect } from "react";
import { Calendar, Clock, User, CheckCircle } from "lucide-react";
import axios from "axios";

export default function Requests() {
  const [moneyRequests, setMoneyRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/buy/getPendingBorrowers`
        );
        setMoneyRequests(response.data.data.requests);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch requests:", error);
        setError("Failed to load money requests");
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);
  console.log(moneyRequests);
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleAccept = async (request) => {
    try {
      const lenderId = localStorage.getItem("id");
      const payload = {
        lenderId,
        borrowerId: request.borrower._id,
        sellerAddress: request.buyerWalletAddress,
        totalAmount: request.amount,
        interestRate: request.interest,
        months: request.months,
      };

      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/contracts/initiateAgreement`,
        payload
      );

      if (response.data.success) {
        // Update UI to reflect the accepted request
        setMoneyRequests((prevRequests) =>
          prevRequests.filter((r) => r.id !== request.id)
        );
      }
    } catch (error) {
      console.error(`Failed to accept request:`, error);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 text-gray-800">
      {/* Header */}
      <header className="bg-white py-4 px-6 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center">
          <div className="border border-gray-300 rounded-lg px-6 py-2 text-2xl font-semibold tracking-wider text-gray-800">
            CreekPay
          </div>
          <span className="ml-4 text-sm text-gray-500">Money Requests</span>
        </div>
        <div className="flex items-center">
          <div className="flex items-center text-gray-700">
            <User className="h-5 w-5 mr-2 text-gray-500" />
            <span>Lender</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Latest Money Requests
        </h2>
        <div className="border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Loading...</div>
          ) : error ? (
            <div className="p-4 text-center text-red-500">{error}</div>
          ) : (
            <table className="w-full text-left">
              <thead className="text-gray-500 text-sm border-b border-gray-200">
                <tr>
                  <th className="p-4 font-normal">Item</th>
                  <th className="p-4 font-normal">Amount</th>
                  <th className="p-4 font-normal">Interest</th>
                  <th className="p-4 font-normal">Months</th>
                  <th className="p-4 font-normal">Actions</th>
                </tr>
              </thead>
              <tbody>
                {moneyRequests.map((request) => (
                  <tr
                    key={request.id}
                    className="border-b border-gray-200 last:border-b-0"
                  >
                    <td className="p-4 text-gray-700">{request.item}</td>
                    <td className="p-4 text-gray-700">
                      {formatCurrency(request.amount)}
                    </td>
                    <td className="p-4 text-gray-700">{request.interest}%</td>
                    <td className="p-4 text-gray-700">{request.months}</td>
                    <td className="p-4">
                      {!request.isClaimed && (
                        <button
                          onClick={() => handleAccept(request)}
                          className="inline-flex items-center px-3 py-1.5 border border-green-400 text-green-400 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Accept
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {moneyRequests.length === 0 && (
                  <tr>
                    <td colSpan="6" className="p-4 text-gray-500 text-center">
                      No new money requests.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white py-3 px-6 border-t border-gray-200 text-gray-500 text-sm">
        <div className="flex justify-between items-center">
          <div>© 2025 CreekPay</div>
          <div className="flex space-x-4">
            <a href="#" className="hover:text-gray-700">
              Help
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
