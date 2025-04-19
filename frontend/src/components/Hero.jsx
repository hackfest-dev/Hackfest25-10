import React, { useEffect, useRef } from 'react';
import { ChevronRight, ShieldCheck, Zap, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const navigate = useNavigate();
  const heroRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('opacity-100', 'translate-y-0');
          entry.target.classList.remove('opacity-0', 'translate-y-10');
        }
      },
      { threshold: 0.1 }
    );

    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    return () => {
      if (heroRef.current) {
        observer.unobserve(heroRef.current);
      }
    };
  }, []);

  return (
    <div className="relative min-h-screen flex items-center bg-gradient-to-b from-gray-50 to-white pt-16">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-indigo-100 rounded-full filter blur-3xl opacity-30"></div>
        <div className="absolute top-40 -right-20 w-80 h-80 bg-purple-100 rounded-full filter blur-3xl opacity-30"></div>
      </div>

      <div 
        ref={heroRef}
        className="container mx-auto px-4 md:px-6 py-12 md:py-20 transition-all duration-700 opacity-0 translate-y-10"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center px-3 py-1 bg-indigo-50 rounded-full">
              <span className="text-indigo-600 text-sm font-medium">Web3 Financial Revolution</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                Decentralized P2P
              </span>
              <br />
              <span className='text-black'>Buy Now, Pay Later</span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-600 max-w-xl">
              Reimagined for the Web3 era. Powered by AI, Crypto, and Smart Contracts. Making credit accessible to everyone.
            </p>
            
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <button 
                onClick={()=>navigate('/register')}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-full font-medium hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center">
                Get Started
                <ChevronRight className="ml-2 h-5 w-5" />
              </button>
              <button className="bg-white text-indigo-600 border border-indigo-200 px-8 py-4 rounded-full font-medium hover:shadow transition-all duration-300">
                Learn More
              </button>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute -bottom-10 -left-10 w-full h-full bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl transform rotate-2"></div>
            <div className="relative z-10 bg-white p-8 rounded-2xl shadow-xl">
              <img 
                src="https://images.pexels.com/photos/8370752/pexels-photo-8370752.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                alt="Online shopping with BNPL" 
                className="w-full h-auto rounded-xl mb-8"
              />
              <div className="grid grid-cols-3 gap-4 text-black">
                <div className="flex flex-col items-center p-4 bg-indigo-50 rounded-lg">
                  <ShieldCheck className="h-8 w-8 text-indigo-600 mb-2" />
                  <span className="text-sm text-center font-medium">Secure Smart Contracts</span>
                </div>
                <div className="flex flex-col items-center p-4 bg-purple-50 rounded-lg">
                  <Zap className="h-8 w-8 text-purple-600 mb-2" />
                  <span className="text-sm text-center font-medium">AI Credit Scoring</span>
                </div>
                <div className="flex flex-col items-center p-4 bg-blue-50 rounded-lg">
                  <Globe className="h-8 w-8 text-blue-600 mb-2" />
                  <span className="text-sm text-center font-medium">Global P2P Network</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;