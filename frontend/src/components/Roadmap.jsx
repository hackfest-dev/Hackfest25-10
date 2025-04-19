import React, { useEffect, useRef } from 'react';

const timelineItems= [
  {
    quarter: "Q2",
    year: "2025",
    title: "MVP Launch",
    description: "INR Stablecoin + Razorpay Checkout integration with initial merchant partners."
  },
  {
    quarter: "Q3",
    year: "2025",
    title: "AI Rollout",
    description: "Full AI credit scoring system rollout and onboarding 50+ Indian merchants."
  },
  {
    quarter: "Q4",
    year: "2025",
    title: "Cross-border P2P",
    description: "Cross-border P2P lending capabilities and stablecoin expansion to major currencies."
  },
  {
    quarter: "Q1",
    year: "2026",
    title: "Governance Token",
    description: "Governance token and DAO community launch for decentralized decision making."
  }
];

const Roadmap= () => {
  const roadmapRef = useRef(null);
  const itemRefs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('opacity-100', 'translate-y-0');
            entry.target.classList.remove('opacity-0', 'translate-y-10');
          }
        });
      },
      { threshold: 0.1 }
    );

    if (roadmapRef.current) {
      observer.observe(roadmapRef.current);
    }

    itemRefs.current.forEach((item) => {
      if (item) observer.observe(item);
    });

    return () => {
      if (roadmapRef.current) {
        observer.unobserve(roadmapRef.current);
      }
      itemRefs.current.forEach((item) => {
        if (item) observer.unobserve(item);
      });
    };
  }, []);

  return (
    <section id="roadmap" className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 md:px-6">
        <div 
          ref={roadmapRef}
          className="text-center mb-16 transition-all duration-700 opacity-0 translate-y-10"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Roadmap</h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Our strategic plan to revolutionize the BNPL market with blockchain technology
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Timeline line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-indigo-100 transform -translate-x-1/2 hidden md:block"></div>

          {timelineItems.map((item, index) => (
            <div 
              key={index}
              ref={(el) => (itemRefs.current[index] = el)}
              className={`relative md:grid md:grid-cols-2 gap-8 items-center mb-16 transition-all duration-700 opacity-0 translate-y-10`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <div className={`md:text-right ${index % 2 === 0 ? '' : 'md:order-2'}`}>
                <div className="bg-white rounded-xl shadow-md p-6 relative z-10 transform transition-transform duration-300 hover:scale-105 hover:shadow-lg">
                  <div className="absolute -right-3 top-1/2 transform -translate-y-1/2 md:block hidden">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600"></div>
                  </div>
                  <div className="absolute -left-3 top-1/2 transform -translate-y-1/2 md:hidden">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600"></div>
                  </div>
                  <div className="mb-2">
                    <span className="inline-block text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full px-3 py-1">
                      {item.quarter} {item.year}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              </div>
              <div className={`hidden md:block ${index % 2 === 0 ? 'md:order-2' : ''}`}>
                <div className="h-32 flex items-center justify-center">
                  <div className="relative">
                    <div className="absolute -inset-4 bg-indigo-100 rounded-lg opacity-50 transform rotate-3"></div>
                    <div className="relative bg-white p-3 rounded-lg shadow-sm text-center">
                      <div className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        {item.quarter}
                      </div>
                      <div className="text-gray-700">{item.year}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Roadmap;