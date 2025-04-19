import { useState } from 'react';
import { Mail, User, Home, MapPin, Globe, Key, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function RegistrationForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    street: '',
    city: '',
    state: '',
    country: '',
    email: '',
    password: '',
    otp: '',
  });

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    if (error) setError('');
  };

  const requestOtp = async () => {
    // Validate email and password first
    if (!formData.email) {
      setError('Please enter your email address.');
      return;
    }
    if (!formData.password) {
      setError('Please enter your password.');
      return;
    }

    try {
      setLoading(true);
      console.log(import.meta.env.VITE_BASE_URL);
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/users/register`, // Replace with your actual API endpoint
        {
          fullName: formData.name,
          address: formData.street,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          email: formData.email,
          password: formData.password,
        },
        {
          headers:{
            "ngrok-skip-browser-warning": true
          }
        }
      );

      if (response.status === 201) {
        setOtpSent(true);
        setMessage('OTP sent to your email address.');
        setError('');
      }
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.message || 'Error during registration.');
      } else {
        setError('Network error. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!formData.otp) {
      setError('Please enter the OTP received in your email.');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/users/verifyEmail`, 
        {
          email: formData.email,
          otp: formData.otp,
        },{
          headers:{
            "ngrok-skip-browser-warning": true
          }
        }
      );

      if (response.status === 200) {
        console.log(response.data)
        localStorage.setItem('id',response.data.data);
        console.log(localStorage.getItem('id'));
        
        setMessage('Registration successful! Redirecting...');
        navigate('/verify');
      }
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.message || 'Invalid OTP.');
      } else {
        setError('Network error. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (otpSent) {
      verifyOtp();
    } else {
      requestOtp();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-black">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create your account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {message && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
              {message}
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Full Name
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Mahesh Kumar"
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">
                Address Information
              </h3>

              <div>
                <label
                  htmlFor="street"
                  className="block text-sm font-medium text-gray-700"
                >
                  Street Address
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Home className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="street"
                    id="street"
                    value={formData.street}
                    onChange={handleChange}
                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
                    placeholder="123 Main Street"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="city"
                    className="block text-sm font-medium text-gray-700"
                  >
                    City
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="city"
                      id="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Bengaluru"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="state"
                    className="block text-sm font-medium text-gray-700"
                  >
                    State
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="state"
                      id="state"
                      value={formData.state}
                      onChange={handleChange}
                      className="focus:ring-indigo-500 focus:border-indigo-500 block w-full py-2 px-3 border border-gray-300 rounded-md"
                      placeholder="Karnataka"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="country"
                  className="block text-sm font-medium text-gray-700"
                >
                  Country
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Globe className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="country"
                    id="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
                    placeholder="India"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
                  placeholder="mahesh@gmail.com"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  name="password"
                  id="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
                  placeholder="********"
                  required
                />
              </div>
            </div>

            {/* OTP section - always visible but only enabled after OTP is sent */}
            <div>
              <label
                htmlFor="otp"
                className="block text-sm font-medium text-gray-700"
              >
                OTP Verification
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="otp"
                  id="otp"
                  value={formData.otp}
                  onChange={handleChange}
                  className={`focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 pr-3 py-2 border rounded-md ${
                    otpSent ? 'border-indigo-300' : 'border-gray-300 bg-gray-50'
                  }`}
                  placeholder="Enter OTP"
                  disabled={!otpSent}
                  required={otpSent}
                />
              </div>
              <div className="mt-1 text-right">
                <button
                  type="button"
                  onClick={requestOtp}
                  disabled={loading}
                  className={`text-sm font-medium ${
                    otpSent ? 'text-gray-400 hover:text-indigo-500' : 'text-indigo-800'
                  }`}
                >
                  {otpSent ? 'Resend OTP' : 'Request OTP'}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full cursor-pointer flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  loading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
              >
                {loading ? 'Processing...' : otpSent ? 'Complete Registration' : 'Register'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Already have an account?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => navigate('/signin')}
                type="button"
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-indigo-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Sign in
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}