// @ts-nocheck
"use client";
import { Button } from "../ui/button";
import { Check, X, Menu as MenuIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from 'next/navigation';
import { PaymentMethod } from '@/lib/chargily';

const faqs = [
  {
    question: "Can I upgrade or downgrade my plan anytime?",
    answer: "Yes! You can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, bank transfers, and local payment methods including CIB and BaridiMob.",
  },
  {
    question: "Is there a setup fee?",
    answer: "No setup fees for any plan. You only pay the monthly subscription price.",
  },
  {
    question: "Can I cancel my subscription?",
    answer: "Yes, you can cancel your subscription at any time. Your account will remain active until the end of your billing period.",
  },
];

export const PricingPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan');
  
  const [selectedPlan, setSelectedPlan] = useState(plan || 'STANDARD');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('edahabia');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Check auth on component mount
  useEffect(() => {
    const checkAuth = () => {
      try {
        const authRaw = localStorage.getItem('auth');
        console.log('Payment page - Auth raw:', authRaw ? authRaw.substring(0, 100) + '...' : 'null');
        if (authRaw) {
          const auth = JSON.parse(authRaw);
          console.log('Payment page - Auth parsed:', { 
            hasTokens: !!auth?.tokens,
            hasAccessToken: !!auth?.tokens?.accessToken,
            tokenStart: auth?.tokens?.accessToken?.substring(0, 30)
          });
          const token = auth?.tokens?.accessToken || null;
          if (token) {
            console.log('Payment page - Token found:', token.substring(0, 30) + '...');
            setAccessToken(token);
            setIsCheckingAuth(false);
            return;
          }
        }
      } catch (err) {
        console.warn('Could not read auth from localStorage', err);
      }
      // No token found, redirect to login
      console.warn('Payment page - No token found, redirecting to login');
      setIsCheckingAuth(false);
      router.push('/auth/login?callbackUrl=/pricing');
    };

    checkAuth();
  }, [router]);

  const handlePayment = async (planId: string) => {
    if (!accessToken) {
      setError('You must be logged in to proceed with payment');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('Payment request - Sending token:', accessToken.substring(0, 20) + '...');
      const response = await fetch('/api/payment/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          plan: planId,
          paymentMethod: paymentMethod
        }),
      });

      console.log('Payment response status:', response.status);

      // Handle authentication errors returned from server
      if (response.status === 401) {
        console.error('Payment API returned 401 Unauthorized');
        setIsLoading(false);
        router.push('/auth/login?callbackUrl=/pricing');
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment session');
      }

      // Handle free plan activation
      if (data.isFreePlan) {
        alert('Free plan activated successfully!');
        router.push('/dashboard');
        return;
      }

      // Redirect to Chargily checkout for paid plans
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error('No checkout URL received');
      }

    } catch (err: any) {
      setError(err.message);
      console.error('Payment error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const pricingPlans = [
    {
      name: "Free Plan",
      id: "FREE",
      price: "Free",
      period: "Forever",
      description: "Perfect for small restaurants or testing the platform",
      features: [
        { text: "1 restaurant profile", included: true },
        { text: "1 menu per profile", included: true },
        { text: "Up to 10 menu items", included: true },
        { text: "5 QR code scans per day", included: true },
        { text: "Basic analytics", included: true },
        { text: "QR code generation", included: true },
        { text: "Community support", included: true },
        { text: "Menu customization", included: false },
        { text: "Priority support", included: false },
      ],
      buttonText: "Get Started",
      buttonVariant: "outline",
    },
    {
      name: "Standard Plan",
      id: "STANDARD",
      price: "2500",
      currency: "DZD",
      period: "per month",
      description: "Ideal for growing restaurants and small chains",
      features: [
        { text: "3 restaurant profiles", included: true },
        { text: "3 menus per profile", included: true },
        { text: "Up to 50 menu items", included: true },
        { text: "100 QR code scans per day", included: true },
        { text: "Advanced analytics dashboard", included: true },
        { text: "QR code generation", included: true },
        { text: "Priority email support", included: true },
        { text: "Basic menu customization", included: true },
        { text: "Customer feedback collection", included: true },
      ],
      buttonText: "Subscribe Now",
      buttonVariant: "primary",
      popular: true,
    },
    {
      name: "Custom Plan",
      id: "CUSTOM",
      price: "Custom",
      period: "pricing",
      description: "For enterprises and restaurant chains",
      features: [
        { text: "Unlimited restaurant profiles", included: true },
        { text: "Unlimited menus", included: true },
        { text: "Unlimited menu items", included: true },
        { text: "Unlimited QR code scans", included: true },
        { text: "Advanced analytics & reporting", included: true },
        { text: "Custom website development", included: true },
        { text: "Dedicated account manager", included: true },
        { text: "Full brand customization", included: true },
        { text: "24/7 phone & email support", included: true },
      ],
      buttonText: "Contact Sales",
      buttonVariant: "outline",
    },
  ];

  // Show loading while checking auth
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <button
                className="md:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <MenuIcon className="h-6 w-6" />
              </button>
              <a href="/" className="text-2xl font-bold text-gray-900">
                MenuMaster
              </a>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a href="/" className="text-gray-700 hover:text-orange-500 transition-colors">
                Home
              </a>
              <a href="/pricing" className="text-gray-700 hover:text-orange-500 transition-colors">
                Pricing
              </a>
              <a href="#" className="text-gray-700 hover:text-orange-500 transition-colors">
                About
              </a>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <Button variant="ghost" className="text-gray-700">
                Sign in
              </Button>
              <Button className="bg-gray-900 hover:bg-gray-800 text-white">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Start with our free plan and upgrade as your restaurant grows. No hidden fees, cancel anytime.
          </p>
        </div>
      </section>

      {/* Error Message */}
      {error && (
        <div className="container mx-auto px-4 mb-6 max-w-2xl">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Pricing Cards */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <div
                key={index}
                className={`bg-white rounded-2xl p-8 shadow-lg relative ${
                  plan.popular ? "border-2 border-orange-500 transform md:-translate-y-4" : "border border-gray-200"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-orange-500 text-white px-6 py-1.5 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="mb-3">
                    {plan.price === "Free" || plan.price === "Custom" ? (
                      <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    ) : (
                      <>
                        <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                        <span className="text-lg text-gray-600 ml-2">{plan.currency}</span>
                      </>
                    )}
                  </div>
                  <p className="text-gray-600">{plan.period}</p>
                  <p className="text-sm text-gray-500 mt-2">{plan.description}</p>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      {feature.included ? (
                        <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <X className="h-5 w-5 text-gray-300 flex-shrink-0 mt-0.5" />
                      )}
                      <span className={feature.included ? "text-gray-700" : "text-gray-400"}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handlePayment(plan.id)}
                  disabled={isLoading}
                  className={`w-full ${
                    plan.buttonVariant === "primary"
                      ? "bg-orange-500 hover:bg-orange-600 text-white"
                      : "bg-white text-gray-900 border-2 border-gray-300 hover:border-gray-400"
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    plan.buttonText
                  )}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Payment Method Section (Only show for paid plans) */}
      {selectedPlan !== 'FREE' && (
        <section className="py-8 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Payment Method
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button
                  onClick={() => setPaymentMethod('edahabia')}
                  className={`p-6 border-2 rounded-xl text-left transition-all duration-200 ${
                    paymentMethod === 'edahabia'
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center">
                    <div
                      className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center ${
                        paymentMethod === 'edahabia'
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300'
                      }`}
                    >
                      {paymentMethod === 'edahabia' && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-lg">EDAHABIA</p>
                      <p className="text-gray-600">Algerie Poste</p>
                    </div>
                  </div>
                </button>
                
                <button
                  onClick={() => setPaymentMethod('cib')}
                  className={`p-6 border-2 rounded-xl text-left transition-all duration-200 ${
                    paymentMethod === 'cib'
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center">
                    <div
                      className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center ${
                        paymentMethod === 'cib'
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300'
                      }`}
                    >
                      {paymentMethod === 'cib' && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-lg">CIB</p>
                      <p className="text-gray-600">SATIM</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            Frequently Asked Questions
          </h2>
          <div className="max-w-3xl mx-auto space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {faq.question}
                </h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Still have questions?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Our team is here to help you choose the right plan for your restaurant
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" className="border-2 border-gray-300 text-gray-900 hover:bg-gray-100">
              Contact Support
            </Button>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white">
              Start Free Trial
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">© 2025 MenuMaster. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};