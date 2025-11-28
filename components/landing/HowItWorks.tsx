// @ts-nocheck
"use client";
import { Menu, Settings, Scan } from "lucide-react";

const steps = [
  {
    icon: Menu,
    title: "Create a Menu",
    description: "Add your dishes, prices and images using our simple interface to build your menu.",
  },
  {
    icon: Settings,
    title: "Build Your Menu",
    description: "Generate and download your restaurant's unique QR code to display anywhere.",
  },
  {
    icon: Scan,
    title: "Customers Scan & View",
    description: "Your guests scan the QR code and instantly enjoy your digital menu on their devices.",
  },
];

export const HowItWorks = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-lg text-gray-600">
            simple steps to your digital menu
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <div 
              key={index}
              className="bg-orange-50 rounded-lg p-8 text-center hover:shadow-lg transition-shadow"
            >
              <div className="w-16 h-16 mx-auto mb-6 rounded-lg bg-orange-100 flex items-center justify-center">
                <step.icon className="w-8 h-8 text-orange-500" strokeWidth={2} />
              </div>
              <h3 className="text-xl font-bold mb-4 text-orange-500">
                {step.title}
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};