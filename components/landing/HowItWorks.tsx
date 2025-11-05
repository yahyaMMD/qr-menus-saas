"use client";

import { QrCode, Smartphone, TrendingUp } from "lucide-react";

const steps = [
  {
    icon: QrCode,
    title: "Create Your QR Code",
    description: "Generate a unique QR code for your restaurant in seconds. Place it on tables, posters, or anywhere customers can scan.",
  },
  {
    icon: Smartphone,
    title: "Build Your Menu",
    description: "Design beautiful digital menus with our intuitive drag-and-drop builder. Add photos, descriptions, and prices effortlessly.",
  },
  {
    icon: TrendingUp,
    title: "Track & Optimize",
    description: "Get real-time analytics on menu views, popular items, and customer engagement. Make data-driven decisions.",
  },
];

export const HowItWorks = () => {
  return (
    <section className="py-20 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Three simple steps to modernize your restaurant experience
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {steps.map((step, index) => (
            <div 
              key={index}
              className="bg-card rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                <step.icon className="w-10 h-10 text-primary" strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-bold text-center mb-4 text-foreground">
                {step.title}
              </h3>
              <p className="text-center text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};