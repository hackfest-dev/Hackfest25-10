import React, { useEffect, useRef } from 'react';
import { 
  Cpu, 
  PieChart, 
  Users, 
  ShieldCheck, 
  Globe, 
  BadgeCheck 
} from 'lucide-react';

const featureItems = [
  {
    icon: 'Cpu',
    title: 'AI-Powered Credit Scoring',
    description: 'Our algorithms analyze wallet history, transaction patterns, and token diversity to create a credit score for users without traditional credit history.'
  },
  {
    icon: 'Users',
    title: 'Peer-to-Peer Lending',
    description: 'Connect borrowers with global lenders directly, removing intermediaries and enabling better rates for both parties.'
  },
  {
    icon: 'ShieldCheck',
    title: 'Smart Contract EMIs',
    description: 'Automated repayments through secure smart contracts ensure transparency and reduced default risk for all participants.'
  },
  {
    icon: 'Globe',
    title: 'Global Access, Local Payments',
    description: 'Access credit globally while making repayments in your preferred currency or cryptocurrency.'
  },
  {
    icon: 'PieChart',
    title: 'Transparent Interest Rates',
    description: 'Clear, upfront interest rates with no hidden fees. Lenders and borrowers always know exactly what to expect.'
  },
  {
    icon: 'BadgeCheck',
    title: 'KYC Integration',
    description: 'Choose to enhance your credit limit with optional KYC through Account Aggregator framework and social signals.'
  }
];

const getIconComponent = (iconName: string, className: string) => {
  switch (iconName) {
    case 'Cpu':
      return <Cpu className={className} />;
    case 'PieChart':
      return <PieChart className={className} />;
    case 'Users':
      return <Users className={className} />;
    case 'ShieldCheck':
      return <ShieldCheck className={className} />;
    case 'Globe':
      return <Globe className={className} />;
    case 'BadgeCheck':
      return <BadgeCheck className={className} />;
    default:
      return <Cpu className={className} />;
  }
};

const Features: React.FC = () => {
  const featuresRef = useRef(null);

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

    const featureElements = document.querySelectorAll('.feature-card');
    featureElements.forEach((el) => observer.observe(el));

    return () => {
      featureElements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Powered by Cutting Edge Technology</h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Our platform leverages the best of blockchain, AI, and smart contracts to create a seamless BNPL experience.
          </p>
        </div>

        <div ref={featuresRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featureItems.map((feature, index) => (
            <div 
              key={index}
              className="feature-card bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-6 opacity-0 translate-y-10"
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-5">
                {getIconComponent(feature.icon, "w-6 h-6 text-indigo-600")}
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;