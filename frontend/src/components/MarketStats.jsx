import React, { useEffect, useRef, useState } from 'react';

const stats = [
  {
    value: "34.31",
    label: "BNPL Market by 2030",
    suffix: "B"
  },
  {
    value: "36.1",
    label: "CAGR Growth Rate",
    suffix: "%"
  },
  {
    value: "560",
    label: "Crypto Users Worldwide",
    suffix: "M+"
  },
  {
    value: "220",
    label: "Indians Lack Credit Access",
    suffix: "M+"
  }
];

const MarketStats = () => {
  const sectionRef = useRef(null);
  const [hasAnimated, setHasAnimated] = useState(stats.map(() => false));

  // Animation for counter
  const animateValue = (
    start,
    end,
    duration,
    setter
  ) => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const value = Math.floor(progress * (end - start) + start);
      setter(value);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setter(end);
      }
    };
    window.requestAnimationFrame(step);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('opacity-100', 'translate-y-0');
            entry.target.classList.remove('opacity-0', 'translate-y-10');
            
            // Trigger stat counters animation
            setHasAnimated(stats.map(() => true));
          }
        });
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section id="market" className="py-20 bg-gradient-to-b from-indigo-900 to-purple-900 text-white">
      <div 
        ref={sectionRef}
        className="container mx-auto px-4 md:px-6 transition-all duration-700 opacity-0 translate-y-10"
      >
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Market Opportunity</h2>
          <p className="text-indigo-100 max-w-2xl mx-auto text-lg">
            The BNPL market is experiencing explosive growth, especially in emerging markets with high smartphone penetration and low credit access.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const [displayValue, setDisplayValue] = useState(0);
            
            useEffect(() => {
              if (hasAnimated[index]) {
                animateValue(0, parseFloat(stat.value), 2000, setDisplayValue);
              }
            }, [hasAnimated, index]);

            return (
              <div 
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center transform transition-transform hover:scale-105 duration-300"
              >
                <div className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">
                  {hasAnimated[index] ? displayValue.toFixed(displayValue % 1 === 0 ? 0 : 1) : "0"}
                  <span className="text-white text-opacity-90">{stat.suffix}</span>
                </div>
                <p className="text-indigo-100">{stat.label}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-16 bg-white/5 backdrop-blur-sm rounded-xl p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-4">India: The Perfect Market</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="bg-indigo-500 rounded-full h-5 w-5 flex items-center justify-center text-white text-xs mr-3 mt-1">✓</span>
                  <span>India ranks #1 in global crypto adoption</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-indigo-500 rounded-full h-5 w-5 flex items-center justify-center text-white text-xs mr-3 mt-1">✓</span>
                  <span>Digital India & UPI pushing financial inclusion</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-indigo-500 rounded-full h-5 w-5 flex items-center justify-center text-white text-xs mr-3 mt-1">✓</span>
                  <span>Regulators opening up to stablecoins</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-indigo-500 rounded-full h-5 w-5 flex items-center justify-center text-white text-xs mr-3 mt-1">✓</span>
                  <span>560M+ smartphone users with limited credit access</span>
                </li>
              </ul>
            </div>
            <div>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 rounded-lg blur"></div>
                <img 
                  src="https://images.pexels.com/photos/7876708/pexels-photo-7876708.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                  alt="India's digital revolution" 
                  className="relative rounded-lg w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MarketStats;