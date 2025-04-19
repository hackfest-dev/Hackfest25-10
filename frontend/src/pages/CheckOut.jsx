import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
// Assuming you have a function or context to get the primary color
const PRIMARY_COLOR = "indigo"; // Example: Using Indigo

// Add this helper function at the top of your component
const calculateEMIAmount = (principal, annualInterestRate, months) => {
  const PRECISION = BigInt(1e27);
  const principal_bn = BigInt(Math.floor(principal * 1e18));
  const monthlyRate =
    (BigInt(annualInterestRate) * PRECISION) / BigInt(12 * 10000);

  let onePlusR = PRECISION + monthlyRate;
  let powFactor = onePlusR;

  for (let i = 1; i < months; i++) {
    powFactor = (powFactor * onePlusR) / PRECISION;
  }

  const numerator = principal_bn * monthlyRate * powFactor;
  const denominator = (powFactor - PRECISION) * PRECISION;

  return Number(numerator / denominator) / 1e18;
};

export default function CheckoutPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Added error state
  const [selectedPayment, setSelectedPayment] = useState("cod"); // Default selection
  const navigate = useNavigate();
  const [months, setMonths] = useState(6); // Default months for payment
  const [interest, setInterest] = useState(10); // Default interest rate
  const [amount, setAmount] = useState(0); // Default amount for payment

  useEffect(() => {
    setLoading(true);
    setError(null); // Reset error on new ID
    const fetchProduct = async () => {
      try {
        const response = await fetch("/products.json"); // Fetch all products
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const prodData = await response.json();

        // Find the specific product using the id from URL params
        // Ensure 'id' from params is compared correctly (string vs number)
        const foundProduct = prodData.products.find(
          (p) => p.id === parseInt(id, 10)
        );

        if (foundProduct) {
          setProduct(foundProduct);
        } else {
          // Explicitly set an error if product not found
          setError(`Product with ID ${id} not found.`);
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching product:", err);
        setError(err.message || "Failed to load product details.");
        setLoading(false);
      }
    };

    // Only fetch if id is present
    if (id) {
      fetchProduct();
    } else {
      setError("No product ID provided.");
      setLoading(false);
    }
  }, [id]); // Depend only on 'id'

  // Add this useEffect after your existing product fetch useEffect
  useEffect(() => {
    if (product?.discountedPrice) {
      const emiAmount = calculateEMIAmount(
        product.discountedPrice,
        interest,
        parseInt(months)
      );
      const totalAmount = emiAmount * parseInt(months);
      setAmount(totalAmount);
    }
  }, [product, interest, months]);

  const handlePaymentSelect = (method) => {
    setSelectedPayment(method);
  };

  const handleMonthsChange = (e) => {
    setMonths(parseInt(e.target.value));
  };

  const handlePlaceOrder = async () => {
    if (!product || !selectedPayment) {
      alert("Missing product or payment method!");
      return;
    }

    const id = localStorage.getItem("id");

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/buy/create`,
        {
          borrowerId: id, // Replace `user.id` with however you get the current user's ID
          item: product.name,
          amount: product.discountedPrice, // Assuming `product.price` exists
          interest: 10, // Example interest rate, you might want this dynamic
          months: months, //xample duration
          buyerWalletAddress: "0x993CF2505a293CB7362EeC1e353E9EFC1014542B",
        }
      );
      console.log(response);

      alert(`Order placed successfully for ${product.name}!`);
      navigate("/");
    } catch (error) {
      console.error("Error placing order:", error);
      alert(
        `Failed to place order: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  // --- Loading State ---
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <p className="text-gray-500 text-lg">Loading checkout...</p>
        {/* Optional: Add a spinner here */}
      </div>
    );
  }

  // --- Error State ---
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4">
        <p className="text-red-600 text-lg text-center mb-4">{error}</p>
        <button
          onClick={() => navigate("/")}
          className={`bg-${PRIMARY_COLOR}-600 text-white px-6 py-2 rounded-lg hover:bg-${PRIMARY_COLOR}-700 transition duration-300`}
        >
          Go to Homepage
        </button>
      </div>
    );
  }

  // --- Product Not Found State (redundant if error handles it, but kept for clarity) ---
  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <p className="text-gray-500 text-lg">
          Product details could not be loaded.
        </p>
        {/* You might want a button to go back here too */}
      </div>
    );
  }

  // --- Main Checkout Content ---
  return (
    // --- Theme Changes Start ---
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <h1 className="text-3xl font-light text-gray-800 tracking-tight mb-4">
          Checkout
        </h1>
        <div className="h-px w-full bg-gray-200 mb-10"></div>

        {/* Layout: Use lg breakpoint for two columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16">
          {/* Left Column: Product Details Card */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-lg">
            <div className="flex items-center justify-center mb-6 h-72 rounded-lg overflow-hidden">
              {" "}
              {/* Adjusted height */}
              <img
                src={product.image}
                alt={product.name}
                className="max-w-full max-h-full object-contain" // Ensure image fits
              />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              {product.name}
            </h2>
            <p className="text-gray-600 text-sm mb-4">{product.description}</p>
            <div className="flex items-baseline mb-4">
              {" "}
              {/* Use baseline alignment */}
              <span className="text-3xl font-semibold text-gray-900 mr-3">
                ₹{product.discountedPrice.toFixed(2)}
              </span>
              {product.originalPrice > product.discountedPrice && ( // Only show original if different
                <span className="text-gray-400 line-through text-base">
                  ₹{product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
            {/* Optional: Add quantity selector or other details here */}
          </div>

          {/* Right Column: Payment Options & Order Button */}
          {/* Wrap payment options in a card for visual consistency */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-lg flex flex-col">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">
              Select Payment Method
            </h3>
            <div className="flex flex-col space-y-4 flex-grow">
              {/* Payment Option Buttons */}
              {[
                { id: "creekpay", name: "CreekPay Wallet" },
                // Add more methods if needed
              ].map((method) => (
                <div
                  key={method.id}
                  className={`p-4 border rounded-lg flex items-center justify-between cursor-pointer transition-all duration-200 ${
                    selectedPayment === method.id
                      ? `border-${PRIMARY_COLOR}-500 bg-${PRIMARY_COLOR}-50 ring-2 ring-${PRIMARY_COLOR}-300 ring-offset-1` // Enhanced selected style
                      : `border-gray-300 hover:bg-gray-50 hover:border-gray-400`
                  }`}
                  onClick={() => handlePaymentSelect(method.id)}
                >
                  <span
                    className={`font-medium ${
                      selectedPayment === method.id
                        ? `text-${PRIMARY_COLOR}-800`
                        : "text-gray-700"
                    }`}
                  >
                    {method.name}
                  </span>
                  {/* Visual indicator for selection */}
                </div>
              ))}
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-4">
                Payment Details
              </h3>
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Product Price:</span>
                  <span className="text-gray-900 font-semibold">
                    ₹{product.discountedPrice.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Select Months:</span>
                  <select
                    className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
                    value={months}
                    onChange={handleMonthsChange}
                  >
                    {[3, 6, 12, 24].map((month) => (
                      <option key={month} value={month}>
                        {month} Months
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Interest Rate:</span>
                  <span className="text-gray-900 font-semibold">
                    {interest}%
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Monthly EMI:</span>
                  <span className="text-gray-900 font-semibold">
                    ₹{(amount / parseInt(months)).toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between font-semibold">
                  <span className="text-gray-700">
                    Total Amount (with interest):
                  </span>
                  <span className="text-gray-900">₹{amount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Place Order Button - Pushed to bottom */}
            <button
              className={`mt-8 w-full bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-700 transition duration-300 font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900`}
              onClick={handlePlaceOrder}
            >
              Place Order
            </button>
          </div>
        </div>
      </div>
    </div>
    // --- Theme Changes End ---
  );
}
