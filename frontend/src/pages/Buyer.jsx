import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  CreditCard,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Wallet,
  User,
} from "lucide-react";
import axios from "axios";

// Assuming a primary color for accents if needed (e.g., for hover or active states)
const PRIMARY_COLOR = "indigo"; // Example

export default function CreekPayDashboard() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [user, setUser] = useState(null);
  const [paymentSummary, setPaymentSummary] = useState(null);
  const [upcomingInstallments, setUpcomingInstallments] = useState([]);
  const [processingPaymentId, setProcessingPaymentId] = useState(null);

  const borrowerId = localStorage.getItem("id");

  useEffect(() => {
    const fetchAgreementDetails = async () => {
      try {
        const response = await axios.get(
          `${
            import.meta.env.VITE_BASE_URL
          }/api/contracts/getBorrowerDetails/${borrowerId}`
        );
        console.log();
        const agreements = response.data.data; // Adjust based on your ApiResponse format
        console.log("Agreements:", agreements);
        if (agreements.length > 0) {
          // Mock user data from first agreement (update this if user details come separately)
          setUser({
            name: "Alex Johnson", // Replace with real name if available
            email: "alex.johnson@example.com", // Replace with real email if available
            creditScore: 780, // Replace if available
            memberSince: new Date(agreements[0].startTime).toLocaleDateString(),
          });

          // Payment summary
          const totalRemainingBalance = agreements.reduce(
            (sum, a) => sum + parseFloat(a.totalRemaining),
            0
          );
          const totalPaidAmount = agreements.reduce(
            (sum, a) => sum + parseFloat(a.totalPaid),
            0
          );
          const totalRemainingEMIs = agreements.reduce(
            (sum, a) => sum + parseInt(a.remainingEMIs),
            0
          );
          const totalPaymentsMade = agreements.reduce(
            (sum, a) => sum + parseInt(a.paymentsMade),
            0
          );

          setPaymentSummary({
            installmentsRemaining: totalRemainingEMIs,
            installmentsPaid: totalPaymentsMade,
            remainingBalance: totalRemainingBalance,
            amountPaid: totalPaidAmount,
            nextDueDate: agreements[0].nextPaymentDue, // Assume from the first agreement for now
          });

          // Build upcoming installments
          const installments = agreements.map((agreement) => ({
            id: agreement.agreementId,
            dueDate: new Date(agreement.nextPaymentDue).getTime(),
            item: "Loan EMI Payment",
            amount: parseFloat(agreement.emiAmount),
            description: `Installment for ${agreement.itemName}`,
            isPaid: false, // Assume not paid, or use database record if needed
          }));

          const sortedInstallments = installments.sort(
            (a, b) => a.dueDate - b.dueDate
          );
          setUpcomingInstallments(sortedInstallments);
        }
      } catch (error) {
        console.error("Failed to fetch agreement details:", error);
      }
    };

    fetchAgreementDetails();
  }, []);

  const processPayment = async (id) => {
    setProcessingPaymentId(id);
    try {
      const borrowerId = localStorage.getItem("id");
      await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/contracts/payEmi`,
        { borrowerId }
      );

      setUpcomingInstallments(
        upcomingInstallments.map((item) =>
          item.id === id ? { ...item, isPaid: true } : item
        )
      );
    } catch (error) {
      console.error("Payment processing failed:", error);
    } finally {
      setProcessingPaymentId(null);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }).format(date);
  };

  const isPastDue = (timestamp) => {
    const dueDate = new Date(timestamp);
    const today = new Date();
    dueDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return dueDate < today;
  };

  // --- White Theme Transformation Starts ---
  return (
    // Use light gray background for the main content area
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header: White background, subtle bottom border */}
      <header className="bg-white py-4 px-6 border-b border-gray-200 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center">
          {/* Logo: Dark background for contrast */}
          <div className="bg-gray-800 text-white rounded-lg px-5 py-2 text-xl font-bold tracking-wider">
            CreekPay
          </div>
          {/* Title: Lighter text */}
          <span className="ml-4 text-sm text-gray-500 hidden md:inline">
            Finance Dashboard
          </span>
        </div>
      </header>

      {/* Main Content: Scrollable */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        {/* User Summary Card: White background, subtle shadow */}
        <div className="mb-8 bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex flex-wrap justify-between items-start gap-4">
            {" "}
            {/* Use items-start for better alignment */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-1">
                Welcome back
              </h2>
            </div>
            {/* Right side info blocks */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-2 sm:mt-0">
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 min-w-[180px]">
                {" "}
                {/* Added min-width */}
                <div className="text-gray-500 text-xs mb-1 uppercase tracking-wider">
                  Max Limit
                </div>
                <div className="text-gray-800 font-medium flex items-center text-sm">
                  {formatCurrency(1000000)}
                </div>
              </div>
              {/* Credit Score */}
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 min-w-[180px]">
                {" "}
                {/* Added min-width */}
                <div className="text-gray-500 text-xs mb-1 uppercase tracking-wider">
                  Credit Score
                </div>
                <div className="text-gray-800 font-medium flex items-center text-sm">
                  <TrendingUp className="h-4 w-4 mr-1.5 text-green-600" />
                  {user?.creditScore}{" "}
                  <span className="text-green-600 text-xs ml-1 font-semibold">
                    (Excellent)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards Grid: White background, subtle shadow */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {/* Card Template */}
          {[
            {
              label: "INSTALLMENTS REMAINING",
              value: paymentSummary?.installmentsRemaining,
              Icon: Clock,
              color: "blue",
            },
            {
              label: "INSTALLMENTS COMPLETED",
              value: paymentSummary?.installmentsPaid,
              Icon: CheckCircle,
              color: "green",
            },
            {
              label: "REMAINING BALANCE",
              value: formatCurrency(paymentSummary?.remainingBalance),
              Icon: Wallet,
              color: "yellow",
            },
            {
              label: "TOTAL PAID TO DATE",
              value: formatCurrency(paymentSummary?.amountPaid),
              Icon: CreditCard,
              color: "purple",
            },
          ].map(({ label, value, Icon, color }) => (
            <div
              key={label}
              className={`border border-gray-200 rounded-xl p-5 flex flex-col bg-white shadow-sm hover:shadow-md hover:border-${PRIMARY_COLOR}-200 transition-all duration-300`}
            >
              <div className="text-gray-500 text-xs font-medium mb-1 uppercase tracking-wider">
                {label}
              </div>
              <div className="flex justify-between items-center mt-1">
                <p className="text-2xl font-semibold text-gray-800">{value}</p>
                <div
                  className={`p-2 bg-${color}-50 rounded-lg border border-${color}-100`}
                >
                  {" "}
                  {/* Lighter icon background */}
                  <Icon className={`h-5 w-5 text-${color}-600`} />{" "}
                  {/* Adjusted icon size and color */}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Upcoming Installments Section: White background, subtle shadow */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Upcoming Installments
            </h3>
            <div className="text-sm text-gray-500">
              Total: {upcomingInstallments?.length} items
            </div>
          </div>
          {/* Container for installments */}
          <div className="border border-gray-200 rounded-xl p-4 md:p-6 bg-white shadow-sm">
            {upcomingInstallments?.length > 0 ? (
              upcomingInstallments.map((installment) => {
                const pastDue =
                  !installment.isPaid && isPastDue(installment.dueDate);
                const paid = installment.isPaid;

                return (
                  <div
                    key={installment.id}
                    className={`border rounded-lg p-4 mb-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300
                          ${paid ? "border-gray-200 bg-gray-50 opacity-70" : ""}
                          ${
                            pastDue
                              ? `border-red-300 bg-red-50`
                              : "border-gray-200"
                          }
                          ${
                            !paid && !pastDue
                              ? `hover:border-${PRIMARY_COLOR}-300 hover:bg-gray-50`
                              : ""
                          }
                          `}
                  >
                    {/* Left side: Date, Item Info */}
                    <div className="flex-1">
                      <div className="flex items-center mb-1">
                        <p
                          className={`font-semibold text-sm ${
                            pastDue ? "text-red-600" : "text-gray-800"
                          }`}
                        >
                          {formatDate(installment?.dueDate)}
                        </p>
                        {/* Status Badges */}
                        {pastDue && (
                          <span className="ml-2 flex items-center text-red-600 bg-red-100 px-2 py-0.5 rounded text-xs font-medium">
                            <AlertCircle className="h-3.5 w-3.5 mr-1" />
                            Past due
                          </span>
                        )}
                        {paid && (
                          <span className="ml-2 flex items-center text-green-700 bg-green-100 px-2 py-0.5 rounded text-xs font-medium">
                            <CheckCircle className="h-3.5 w-3.5 mr-1" />
                            Paid
                          </span>
                        )}
                      </div>
                      <p
                        className={`text-base font-medium ${
                          paid ? "text-gray-600" : "text-gray-800"
                        }`}
                      >
                        {installment?.item}
                      </p>
                      <p className="text-gray-500 text-sm mt-0.5">
                        {installment?.description}
                      </p>
                    </div>

                    {/* Middle: Amount */}
                    <div className="text-left md:text-center px-0 md:px-4 w-full md:w-auto">
                      <p className="text-gray-500 text-xs uppercase tracking-wider mb-1 md:mb-0">
                        Amount
                      </p>
                      <p
                        className={`font-semibold ${
                          paid ? "text-gray-600" : "text-gray-800"
                        }`}
                      >
                        {formatCurrency(installment?.amount)}
                      </p>
                    </div>

                    {/* Right side: Pay Button */}
                    <div className="w-full md:w-auto flex justify-end">
                      <button
                        onClick={() => processPayment(installment?.id)}
                        disabled={
                          paid || processingPaymentId === installment?.id
                        }
                        className={`w-full md:w-auto border rounded-md px-4 py-2 transition-colors duration-200 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-offset-1
                                ${
                                  paid
                                    ? "border-gray-300 bg-gray-200 text-gray-500 cursor-not-allowed"
                                    : `border-gray-300 bg-white text-gray-700 hover:bg-gray-800 hover:text-white focus:ring-gray-800`
                                }`}
                      >
                        {paid
                          ? "Paid"
                          : processingPaymentId === installment?.id
                          ? "Paying..."
                          : "Pay Now"}
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-gray-500 py-8">
                No upcoming installments found.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer: White background, subtle top border */}
      <footer className="bg-white py-3 px-6 border-t border-gray-200 text-gray-500 text-xs">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
          <div>© {new Date().getFullYear()} CreekPay. All rights reserved.</div>
          <div className="flex space-x-4">
            <a href="#" className="hover:text-gray-800">
              Terms
            </a>
            <a href="#" className="hover:text-gray-800">
              Privacy
            </a>
            <a href="#" className="hover:text-gray-800">
              Help
            </a>
          </div>
        </div>
      </footer>
    </div>
    // --- White Theme Transformation Ends ---
  );
}
