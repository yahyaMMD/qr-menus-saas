// @ts-nocheck
import { Button } from "../ui/button";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "0",
    period: "/Month",
    description: "Get started for free!",
    features: [
      "1 Profile",
      "Basic Customization",
      "Up to 10 Menu Items",
      "QR Code Generation",
      "Maximum of 10 scans",
    ],
    buttonText: "Start For Free",
    buttonVariant: "outline",
  },
  {
    name: "Standard",
    price: "999",
    period: "DZD/Month",
    description: "Best value with all features",
    features: [
      "Unlimited Profiles",
      "Advanced Customization",
      "Unlimited Menu Items",
      "QR Code Generation",
      "Unlimited Scans",
      "Menu Analytics",
      "Advanced Reporting",
    ],
    highlighted: true,
    badge: "Most Popular",
    buttonText: "Subscribe Now",
    buttonVariant: "primary",
  },
  {
    name: "Custom",
    price: "Contact Us",
    period: "",
    description: "For unique and specific operations",
    features: [
      "Custom Standard Plan, plus:",
      "Fully tailored system for your restaurant",
      "Dedicated Account Manager",
    ],
    buttonText: "Contact Achref",
    buttonVariant: "outline",
  },
];

export const Pricing = () => {
  return (
    <section className="py-20 bg-gray-50" id="pricing">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Find Your Perfect Plan
          </h2>
          <p className="text-lg text-gray-600">
            all plans include our core digital menu features. Upgrade for more advanced tools to delight your customers and grow your business
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`rounded-xl p-8 border-2 transition-all relative ${
                plan.highlighted
                  ? "bg-white border-orange-500 shadow-2xl transform md:-translate-y-2"
                  : "bg-white border-gray-200 shadow-lg"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    {plan.badge}
                  </span>
                </div>
              )}
              
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2 text-gray-900">{plan.name}</h3>
                <div className="mb-2">
                  <span className="text-4xl font-bold text-gray-900">{plan.price === "Contact Us" ? "" : plan.price}</span>
                  {plan.price !== "Contact Us" && plan.period && (
                    <span className="text-gray-600 ml-1">{plan.period}</span>
                  )}
                  {plan.price === "Contact Us" && (
                    <span className="text-2xl font-bold text-gray-900">{plan.price}</span>
                  )}
                </div>
                <p className="text-gray-600">{plan.description}</p>
              </div>

              <Button
                className={`w-full mb-6 ${
                  plan.buttonVariant === "primary"
                    ? "bg-orange-500 text-white hover:bg-orange-600"
                    : "bg-white text-orange-500 border-2 border-orange-500 hover:bg-orange-50"
                }`}
              >
                {plan.buttonText}
              </Button>

              <ul className="space-y-3">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <Check className="h-5 w-5 flex-shrink-0 mt-0.5 text-orange-500" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};