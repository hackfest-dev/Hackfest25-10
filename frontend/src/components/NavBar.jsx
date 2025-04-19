import React, { useState, useEffect } from "react";
import { Menu, X, Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-sm shadow-sm py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          <a href="#" className="flex items-center space-x-2">
            <Wallet className="h-7 w-7 text-indigo-600" />
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              CreekPay
            </span>
          </a>

          <nav className="hidden md:flex items-center space-x-8">
            {["How It Works", "Features", "Market"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                className="text-gray-700 hover:text-indigo-600 font-medium transition-colors"
              >
                {item}
              </a>
            ))}
            <button
              onClick={() => navigate("/signin")}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2 rounded-full font-medium hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
            >
              Sign In
            </button>
          </nav>

          <button
            className="md:hidden text-gray-700"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white absolute top-full left-0 w-full shadow-lg py-4 px-4 transition-all duration-300">
          <nav className="flex flex-col space-y-4">
            {["How It Works", "Features", "Market", "Roadmap"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                className="text-gray-700 hover:text-indigo-600 font-medium transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                {item}
              </a>
            ))}
            <button
              onClick={() => navigate("/signin")}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2 rounded-full font-medium w-full"
            >
              Sign In
            </button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
