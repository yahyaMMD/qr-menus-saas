// @ts-nocheck
import { Button } from "../ui/button";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "Free",
    description: "Perfect for trying out our platform",
    features: [
      "1 Restaurant Profile",
      "1 Digital Menu",
      "QR Code Generation",
      "Basic Analytics",
      "Email Support",
    ],
  },
  {
    name: "Professional",
    price: "999",
    period: "/month",
    description: "Best for growing restaurants",
    features: [
      "Unlimited Profiles",
      "Unlimited Menus",
      "Custom QR Codes",
      "Advanced Analytics",
      "Priority Support",
      "Multi-language Support",
      "Custom Branding",
    ],
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Contact Us",
    description: "For restaurant chains",
    features: [
      "Everything in Professional",
      "Dedicated Account Manager",
      "API Access",
      "Custom Integrations",
      "White Label Options",
      "24/7 Phone Support",
    ],
  },
];

export const Pricing = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Find Your Perfect Plan
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your restaurant's needs
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`rounded-2xl p-8 border-2 transition-all ${
                plan.highlighted
                  ? "bg-primary text-primary-foreground border-primary shadow-2xl transform md:scale-105"
                  : "bg-card border-border shadow-lg hover:shadow-xl"
              }`}
            >
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <p className={`mb-6 ${plan.highlighted ? "text-primary-foreground/90" : "text-muted-foreground"}`}>
                {plan.description}
              </p>
              
              <div className="mb-6">
                <span className="text-5xl font-bold">
                  {plan.price === "Free" || plan.price === "Contact Us" ? plan.price : `$${plan.price}`}
                </span>
                {plan.period && <span className="text-lg">{plan.period}</span>}
              </div>

              <Button
                className={`w-full mb-6 ${
                  plan.highlighted
                    ? "bg-white text-primary hover:bg-white/90"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                }`}
              >
                {plan.price === "Contact Us" ? "Contact Sales" : "Get Started"}
              </Button>

              <ul className="space-y-3">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <Check className={`h-5 w-5 flex-shrink-0 mt-0.5 ${plan.highlighted ? "text-primary-foreground" : "text-primary"}`} />
                    <span className={plan.highlighted ? "text-primary-foreground" : "text-foreground"}>
                      {feature}
                    </span>
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