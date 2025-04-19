import { useState, useEffect } from "react";
import { Wallet, User, AlertCircle } from "lucide-react";
import axios from "axios";

// Assuming a primary color for accents if needed
const PRIMARY_COLOR = "indigo"; // Example

export default function Lender() {
  const [financedItems, setFinancedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLenderDetails = async () => {
      try {
        const lenderId = localStorage.getItem("id");
        const response = await axios.get(
          `${
            import.meta.env.VITE_BASE_URL
          }/api/contracts/getLenderDetails/${lenderId}`
        );

        console.log(response.data.data);

        // Transform API data to match component structure
        const transformedData = response.data.data.map((item) => ({
          id: item.agreementId,
          item: item.itemName,
          loanDate: new Date(item.lastPaymentDate).getTime(),
          loanAmount:
            parseFloat(item.totalPaid) + parseFloat(item.totalRemaining),
          remainingAmount: parseFloat(item.totalRemaining),
          nextEmiDate:
            new Date(item.lastPaymentDate).getTime() + 30 * 24 * 60 * 60 * 1000, // Add 30 days
          emiAmount:
            parseFloat(item.totalRemaining) / parseInt(item.remainingMonths),
          isActive: item.isActive,
        }));

        setFinancedItems(transformedData);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch lender details:", error);
        setError(error.response?.data?.message || "Failed to load data");
        setLoading(false);
      }
    };

    fetchLenderDetails();
  }, []);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format timestamp to a readable date string
  const formatDate = (timestamp) => {
    if (!timestamp || isNaN(timestamp)) return "-"; // Handle invalid timestamps
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat("en-GB", {
      // DD/MM/YYYY format
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone, // Use local timezone
    }).format(date);
  };

  // Check if date (timestamp) is past due (comparing date parts only)
  const isPastDue = (timestamp) => {
    if (!timestamp || isNaN(timestamp)) return false;
    const dueDate = new Date(timestamp);
    const today = new Date();
    // Set time to 00:00:00 to compare dates only
    dueDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return dueDate < today;
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {" "}
      {/* Light gray background */}
      {/* Header: White background, subtle border */}
      <header className="bg-white py-4 px-6 border-b border-gray-200 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center">
          {/* Logo: Dark background for contrast */}
          <div className="bg-gray-800 text-white rounded-lg px-5 py-2 text-xl font-bold tracking-wider">
            CreekPay
          </div>
          {/* Title */}
          <span className="ml-4 text-sm text-gray-500 hidden md:inline">
            Lender Dashboard
          </span>
        </div>
        {/* User Info */}
        <div className="flex items-center text-gray-700 font-medium">
          <User className="h-5 w-5 mr-2 text-gray-500" />
          <span>Lender Admin</span> {/* Example lender name */}
        </div>
      </header>
      {/* Main Content: Scrollable */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading lender details...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-600">
            <AlertCircle className="h-12 w-12 mx-auto mb-4" />
            <p>{error}</p>
          </div>
        ) : (
          <>
            {/* Summary Cards: White background, subtle shadow */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
              {/* Total Financed Card */}
              <div
                className={`border border-gray-200 rounded-xl p-5 flex flex-col bg-white shadow-sm hover:shadow-md hover:border-${PRIMARY_COLOR}-200 transition-all duration-300`}
              >
                <div className="text-gray-500 text-xs font-medium mb-1 uppercase tracking-wider">
                  Total Financed
                </div>
                <div className="flex justify-between items-center mt-1">
                  <p className="text-2xl font-semibold text-gray-800">
                    {formatCurrency(
                      financedItems.reduce(
                        (sum, item) => sum + item.loanAmount,
                        0
                      )
                    )}
                  </p>
                  <div
                    className={`p-2 bg-yellow-50 rounded-lg border border-yellow-100`}
                  >
                    <Wallet className={`h-5 w-5 text-yellow-600`} />
                  </div>
                </div>
              </div>
              {/* Outstanding Balance Card */}
              <div
                className={`border border-gray-200 rounded-xl p-5 flex flex-col bg-white shadow-sm hover:shadow-md hover:border-${PRIMARY_COLOR}-200 transition-all duration-300`}
              >
                <div className="text-gray-500 text-xs font-medium mb-1 uppercase tracking-wider">
                  Outstanding Balance
                </div>
                <div className="flex justify-between items-center mt-1">
                  <p className="text-2xl font-semibold text-gray-800">
                    {formatCurrency(
                      financedItems.reduce(
                        (sum, item) => sum + item.remainingAmount,
                        0
                      )
                    )}
                  </p>
                  <div
                    className={`p-2 bg-blue-50 rounded-lg border border-blue-100`}
                  >
                    <Wallet className={`h-5 w-5 text-blue-600`} />
                  </div>
                </div>
              </div>
            </div>

            {/* Financed Items Table: White background, subtle shadow */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Financed Items Overview
              </h3>
              {/* Container with rounded corners and overflow handling */}
              <div className="border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  {" "}
                  {/* Makes table scrollable horizontally on small screens */}
                  <table className="w-full min-w-[700px] text-left">
                    {" "}
                    {/* min-width ensures columns don't squash too much */}
                    {/* Table Header */}
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-xs text-gray-500 uppercase tracking-wider font-medium">
                          Item
                        </th>
                        <th className="px-4 py-3 text-xs text-gray-500 uppercase tracking-wider font-medium text-right">
                          Loan Amount
                        </th>
                        <th className="px-4 py-3 text-xs text-gray-500 uppercase tracking-wider font-medium text-right">
                          Outstanding
                        </th>
                        <th className="px-4 py-3 text-xs text-gray-500 uppercase tracking-wider font-medium">
                          Next EMI Date
                        </th>
                        <th className="px-4 py-3 text-xs text-gray-500 uppercase tracking-wider font-medium text-right">
                          EMI Amount
                        </th>
                        <th className="px-4 py-3 text-xs text-gray-500 uppercase tracking-wider font-medium">
                          Loan Date
                        </th>
                      </tr>
                    </thead>
                    {/* Table Body */}
                    <tbody className="divide-y divide-gray-200">
                      {financedItems.length > 0 ? (
                        financedItems.map((item) => {
                          const pastDue = isPastDue(item.nextEmiDate);
                          return (
                            <tr
                              key={item.id}
                              className="hover:bg-gray-50/50 transition-colors duration-150"
                            >
                              {/* Item Name */}
                              <td className="px-4 py-3 text-sm text-gray-800 font-medium whitespace-nowrap">
                                {item.item}
                              </td>
                              {/* Loan Amount */}
                              <td className="px-4 py-3 text-sm text-gray-700 text-right whitespace-nowrap">
                                {formatCurrency(item.loanAmount)}
                              </td>
                              {/* Outstanding Balance */}
                              <td className="px-4 py-3 text-sm text-gray-700 text-right whitespace-nowrap">
                                {formatCurrency(item.remainingAmount)}
                              </td>
                              {/* Next EMI Date - with past due indicator */}
                              <td
                                className={`px-4 py-3 text-sm whitespace-nowrap ${
                                  pastDue ? `bg-red-50` : ""
                                }`}
                              >
                                <div
                                  className={`flex items-center ${
                                    pastDue
                                      ? "text-red-600 font-medium"
                                      : "text-gray-700"
                                  }`}
                                >
                                  <span>{formatDate(item.nextEmiDate)}</span>
                                  {pastDue && (
                                    <AlertCircle className="h-4 w-4 ml-1.5 flex-shrink-0" />
                                  )}
                                </div>
                              </td>
                              {/* EMI Amount */}
                              <td className="px-4 py-3 text-sm text-gray-700 text-right whitespace-nowrap">
                                {formatCurrency(item.emiAmount)}
                              </td>
                              {/* Loan Date */}
                              <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                                {formatDate(item.loanDate)}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td
                            colSpan="6"
                            className="text-center text-gray-500 py-8 px-4"
                          >
                            No financed items found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      {/* Footer: White background, subtle top border */}
      <footer className="bg-white py-3 px-6 border-t border-gray-200 text-gray-500 text-xs">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
          <div>© {new Date().getFullYear()} CreekPay. All rights reserved.</div>
          <div className="flex space-x-4">
            {/* Add relevant footer links for lender */}
            <a href="#" className="hover:text-gray-800">
              Support
            </a>
            <a href="#" className="hover:text-gray-800">
              Reports
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
