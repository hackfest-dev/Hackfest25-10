import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Sample data structure (Ensure you have this file or logic)
// const prodData = {
//   products: [
//     { id: 1, name: "Elegant Wireless Mouse", description: "Smooth tracking, ergonomic design for comfort.", image: "/placeholder-mouse.png", originalPrice: 49.99, discountedPrice: 34.99 },
//     { id: 2, name: "Minimalist Mechanical Keyboard", description: "Tactile keys, compact layout, white backlight.", image: "/placeholder-keyboard.png", originalPrice: 119.99, discountedPrice: 89.99 },
//     { id: 3, name: "4K UHD Monitor", description: "Crisp visuals, thin bezels, wide color gamut.", image: "/placeholder-monitor.png", originalPrice: 399.99, discountedPrice: 319.99 },
//   ]
// };

export default function Ecommerce() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const fetchProducts = async () => {
      try {
        // Assuming products.json is in the public folder
        const response = await fetch('/products.json');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const prodData = await response.json();
        setProducts(prodData.products || []); // Ensure products is an array
        setLoading(false);
      } catch (error) {
        console.error("Error fetching products:", error);
        // Optionally set some error state here to show the user
        setProducts([]); // Set to empty array on error
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('id');
    navigate('/signin');
  };

  return (
    // --- Theme Changes Start ---
    // Main background: Light gray for a soft feel instead of stark white
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          {/* Title: Darker text, slightly adjusted font weight/tracking for elegance */}
          <h1 className="text-3xl font-light text-gray-800 tracking-tight">
            CreekPay
          </h1>
          {/* Logout Button: Subtle, clean look */}
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition duration-300 border border-gray-300 rounded-full px-4 py-1 hover:bg-gray-100"
          >
            Log Out
          </button>
        </div>
        {/* Separator: Lighter, subtle line */}
        <div className="h-px w-full bg-gray-200 mb-10"></div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            {/* Loading Text: Appropriate color for the light theme */}
            <p className="text-gray-500">Loading premium products...</p>
          </div>
        ) : products.length === 0 ? ( // Handle case where products array is empty after fetch/error
           <div className="flex justify-center items-center h-64">
             <p className="text-gray-500">No products found.</p>
           </div>
        ) : (
          <>
            {/* Products grid */}
            {/* Increased gap for more breathing room */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {products.map((product) => (
                // Card Styling: White background, subtle border, soft shadow on hover
                <div
                  key={product.id}
                  className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col" // Added flex flex-col for button alignment
                >
                  {/* Image Container: No background needed, center content */}
                  <div className="flex items-center justify-center mb-6 h-52"> {/* Increased height slightly */}
                    <img
                      src={product.image}
                      alt={product.name}
                      className="max-w-full max-h-full object-contain" // Ensure image fits container
                    />
                  </div>
                  {/* Product Info Area - takes remaining space */}
                  <div className="flex flex-col flex-grow">
                    {/* Product Name: Slightly bolder, darker text */}
                    <h2 className="text-lg font-semibold text-gray-800 mb-2">{product.name}</h2>
                    {/* Description: Lighter gray, standard text size */}
                    <p className="text-gray-600 text-sm mb-4 h-12 overflow-hidden">{product.description}</p>

                    {/* Price Section */}
                    <div className="flex items-baseline mb-5"> {/* Adjusted margin */}
                      {/* Discounted Price: Prominent, dark */}
                      <span className="text-2xl font-semibold text-gray-900 mr-2">₹{product.discountedPrice.toFixed(2)}</span>
                      {/* Original Price: Lighter, smaller */}
                      <span className="text-gray-400 line-through text-sm">₹{product.originalPrice.toFixed(2)}</span>
                    </div>

                    {/* Buy Button: Pushes to the bottom */}
                    <button
                      className="mt-auto w-full bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-700 transition duration-300 font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900" // Added focus styles
                      onClick={() => navigate(`/checkout/${product.id}`)}
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
    // --- Theme Changes End ---
  );
}