import React, { useEffect, useRef } from "react";
import { Check, X } from "lucide-react";

const comparisonItems = [
  {
    feature: "AI-based credit scoring",
    yourBrand: true,
    competitors: {
      zestMoney: false,
      defiLending: false,
    },
  },
  {
    feature: "P2P Lending Model",
    yourBrand: true,
    competitors: {
      zestMoney: false,
      defiLending: true,
    },
  },
  {
    feature: "Real-world BNPL",
    yourBrand: true,
    competitors: {
      zestMoney: true,
      defiLending: false,
    },
  },
  {
    feature: "Smart Contract EMI",
    yourBrand: true,
    competitors: {
      zestMoney: false,
      defiLending: true,
    },
  },
  {
    feature: "Indian stablecoin support",
    yourBrand: true,
    competitors: {
      zestMoney: true,
      defiLending: false,
    },
  },
];

const ComparisonTable = () => {
  const tableRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("opacity-100", "translate-y-0");
            entry.target.classList.remove("opacity-0", "translate-y-10");

            // Animate rows
            const rows = entry.target.querySelectorAll("tr");
            rows.forEach((row, index) => {
              setTimeout(() => {
                row.classList.add("opacity-100");
                row.classList.remove("opacity-0");
              }, 100 * index);
            });
          }
        });
      },
      { threshold: 0.1 }
    );

    if (tableRef.current) {
      observer.observe(tableRef.current);
    }

    return () => {
      if (tableRef.current) {
        observer.unobserve(tableRef.current);
      }
    };
  }, []);

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Us</h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            See how our platform compares to traditional BNPL and DeFi lending
            solutions
          </p>
        </div>

        <div
          ref={tableRef}
          className="max-w-4xl mx-auto rounded-xl overflow-hidden shadow-lg transition-all duration-700 opacity-0 translate-y-10"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium">
                    Feature
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-medium">
                    CreekPay
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-medium">
                    Traditional BNPL
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-medium">
                    DeFi Lending
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {comparisonItems.map((item, index) => (
                  <tr
                    key={index}
                    className="transition-opacity duration-300 opacity-0"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.feature}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {item.yourBrand ? (
                        <div className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-green-100">
                          <Check className="h-5 w-5 text-green-600" />
                        </div>
                      ) : (
                        <div className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-red-100">
                          <X className="h-5 w-5 text-red-600" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {item.competitors.zestMoney ? (
                        <div className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-green-100">
                          <Check className="h-5 w-5 text-green-600" />
                        </div>
                      ) : (
                        <div className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-red-100">
                          <X className="h-5 w-5 text-red-600" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {item.competitors.defiLending ? (
                        <div className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-green-100">
                          <Check className="h-5 w-5 text-green-600" />
                        </div>
                      ) : (
                        <div className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-red-100">
                          <X className="h-5 w-5 text-red-600" />
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ComparisonTable;
