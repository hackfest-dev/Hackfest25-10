import React, { useEffect, useRef } from "react";
import {
  ShoppingCart,
  Brain,
  Wallet,
  FileCheck,
  CreditCard,
  ArrowUpRight,
} from "lucide-react";

const steps = [
  {
    number: 1,
    title: "Select BNPL at Checkout",
    description:
      "Choose CreekPay as your payment option when shopping online at any of our partner merchants.",
    icon: "ShoppingCart",
  },
  {
    number: 2,
    title: "AI Evaluation",
    description:
      "Our AI engine evaluates your wallet behavior and optional KYC data to determine your credit limit.",
    icon: "Brain",
  },
  {
    number: 3,
    title: "P2P Funding",
    description:
      "P2P lenders from our global network fund your purchase via cryptocurrency.",
    icon: "Wallet",
  },
  {
    number: 4,
    title: "Smart Contract Creation",
    description:
      "A smart contract is generated to govern the EMI and repayment schedule transparently.",
    icon: "FileCheck",
  },
  {
    number: 5,
    title: "EMI Repayments",
    description:
      "Repay in easy EMIs using stablecoins or crypto of your choice according to the schedule.",
    icon: "CreditCard",
  },
];

const getIconComponent = (iconName, className) => {
  switch (iconName) {
    case "ShoppingCart":
      return <ShoppingCart className={className} />;
    case "Brain":
      return <Brain className={className} />;
    case "Wallet":
      return <Wallet className={className} />;
    case "FileCheck":
      return <FileCheck className={className} />;
    case "CreditCard":
      return <CreditCard className={className} />;
    default:
      return null;
  }
};

const HowItWorks = () => {
  const sectionRef = useRef(null);
  const stepRefs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("opacity-100");
            entry.target.classList.remove("opacity-0");
          }
        });
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    stepRefs.current.forEach((step) => {
      if (step) observer.observe(step);
    });

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
      stepRefs.current.forEach((step) => {
        if (step) observer.unobserve(step);
      });
    };
  }, []);

  return (
    <section id="how-it-works" className="py-20 bg-white overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <div
          ref={sectionRef}
          className="text-center mb-16 transition-opacity duration-700 opacity-0"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            A seamless journey from checkout to repayment, powered by blockchain
            and AI
          </p>
        </div>

        <div className="relative">
          {/* Connecting line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-indigo-100 transform -translate-x-1/2 hidden md:block"></div>

          <div className="space-y-12 md:space-y-0">
            {steps.map((step, index) => (
              <div
                key={index}
                ref={(el) => (stepRefs.current[index] = el)}
                className={`relative md:grid md:grid-cols-2 md:gap-8 items-center transition-opacity duration-700 opacity-0 delay-${
                  index * 200
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <div
                  className={`
                    md:px-12 ${
                      index % 2 === 0
                        ? "md:text-right md:order-1"
                        : "md:order-2"
                    }
                  `}
                >
                  <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 relative transform transition-transform hover:scale-105 duration-300">
                    <div
                      className={`
                        absolute top-1/2 transform -translate-y-1/2 hidden md:block
                        ${
                          index % 2 === 0
                            ? "right-0 translate-x-1/2"
                            : "left-0 -translate-x-1/2"
                        }
                      `}
                    >
                      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-md">
                        {step.number}
                      </div>
                    </div>
                    <div className="md:hidden bg-gradient-to-r from-indigo-600 to-purple-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg mb-4">
                      {step.number}
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                    <p className="text-gray-600">{step.description}</p>
                  </div>
                </div>

                <div
                  className={`hidden md:flex md:justify-center ${
                    index % 2 === 0 ? "md:order-2" : "md:order-1"
                  }`}
                >
                  <div className="bg-indigo-50 rounded-full w-32 h-32 flex items-center justify-center">
                    {getIconComponent(step.icon, "w-16 h-16 text-indigo-600")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-16">
          <button className="inline-flex items-center text-indigo-600 font-medium hover:text-indigo-800 transition-colors">
            Learn more about our technology
            <ArrowUpRight className="ml-2 h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
