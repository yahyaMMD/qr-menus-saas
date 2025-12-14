"use client";

import React, { useState } from "react";
import {
  Search,
  Book,
  Mail,
  Phone,
  FileText,
  Settings,
  CreditCard,
  BarChart3,
  Users,
  QrCode,
  ChevronDown,
  ChevronUp,
  Clock,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const categories = [
    { id: 'all', name: 'All Topics', icon: Book },
    { id: 'getting-started', name: 'Getting Started', icon: CheckCircle },
    { id: 'menus', name: 'Menu Management', icon: FileText },
    { id: 'qr-codes', name: 'QR Codes', icon: QrCode },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 },
    { id: 'billing', name: 'Billing & Plans', icon: CreditCard },
    { id: 'settings', name: 'Settings', icon: Settings },
  ];

  const faqs = [
    {
      id: 1,
      category: 'getting-started',
      question: 'How do I create my first restaurant profile?',
      answer: 'To create your first restaurant profile, go to Dashboard > Restaurants > Add New Restaurant. Fill in your restaurant details including name, location, cuisine type, and upload your logo. Click "Save" and your profile will be created instantly.',
    },
    {
      id: 2,
      category: 'getting-started',
      question: 'What information do I need to get started?',
      answer: 'You\'ll need basic information like your restaurant name, address, contact details, and logo. You can always update this information later from your restaurant settings.',
    },
    {
      id: 3,
      category: 'menus',
      question: 'How do I add items to my digital menu?',
      answer: 'Navigate to your restaurant profile, go to Menus, select your menu or create a new one, then click "Add Item". Enter the item name, description, price, category, and upload an image. You can also add tags like "Popular" or "New".',
    },
    {
      id: 4,
      category: 'menus',
      question: 'Can I have multiple menus for one restaurant?',
      answer: 'Yes! You can create unlimited menus per restaurant. This is useful for different meal times (breakfast, lunch, dinner) or seasonal menus. Each menu has its own QR code.',
    },
    {
      id: 5,
      category: 'menus',
      question: 'How do I organize menu items into categories?',
      answer: 'When adding or editing a menu item, you can assign it to a category. You can create custom categories like "Appetizers", "Main Courses", "Desserts", etc. in your menu settings.',
    },
    {
      id: 6,
      category: 'qr-codes',
      question: 'How do I generate a QR code for my menu?',
      answer: 'Each menu automatically generates a unique QR code. Go to your menu page and click "Download QR Code". You can choose different sizes and formats (PNG, SVG, PDF) suitable for printing.',
    },
    {
      id: 7,
      category: 'qr-codes',
      question: 'Can I customize my QR code design?',
      answer: 'Yes! Premium and Standard plan users can customize QR codes with their brand colors and add their logo to the center. Go to Menu Settings > QR Code Design to customize.',
    },
    {
      id: 8,
      category: 'analytics',
      question: 'What analytics are available?',
      answer: 'You can track menu scans, popular items, peak hours, customer engagement, and more. Analytics are available per menu and per restaurant, with real-time updates on Premium plans.',
    },
    {
      id: 9,
      category: 'analytics',
      question: 'How often is analytics data updated?',
      answer: 'Standard plans receive daily analytics updates. Premium plans get real-time analytics that update every few minutes.',
    },
    {
      id: 10,
      category: 'billing',
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, Mastercard), debit cards, and local payment methods including CIB (Chargily). All transactions are secure and encrypted.',
    },
    {
      id: 11,
      category: 'billing',
      question: 'Can I change my plan anytime?',
      answer: 'Yes! You can upgrade or downgrade your plan at any time. Upgrades take effect immediately, while downgrades take effect at the end of your current billing cycle.',
    },
    {
      id: 12,
      category: 'billing',
      question: 'Do you offer refunds?',
      answer: 'We offer a 14-day money-back guarantee for new subscribers. If you cancel within 14 days of your first payment, you\'ll receive a full refund. No questions asked.',
    },
    {
      id: 13,
      category: 'settings',
      question: 'How do I add team members to my account?',
      answer: 'Go to Restaurant Settings > Team Access. Click "Invite Member", enter their email, choose a role (Manager or Staff), and send the invite. The team member will receive an email with a secure link to join.',
    },
    {
      id: 14,
      category: 'settings',
      question: 'Can I set different business hours for each day?',
      answer: 'Yes! In Restaurant Settings > Business Hours, you can set custom opening and closing times for each day of the week. You can also mark days as closed.',
    },
  ];

  const quickGuides = [
    {
      title: 'Quick Start Guide',
      description: 'Get up and running in 5 minutes',
      icon: CheckCircle,
      time: '5 min read',
      color: 'orange',
    },
    {
      title: 'Menu Best Practices',
      description: 'Tips for creating engaging menus',
      icon: FileText,
      time: '8 min read',
      color: 'blue',
    },
    {
      title: 'QR Code Setup',
      description: 'Print and display your QR codes',
      icon: QrCode,
      time: '3 min read',
      color: 'purple',
    },
    {
      title: 'Understanding Analytics',
      description: 'Make data-driven decisions',
      icon: BarChart3,
      time: '10 min read',
      color: 'green',
    },
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">How can we help you?</h1>
            <p className="text-lg text-orange-100 mb-8 max-w-2xl mx-auto">
              Search our knowledge base or browse categories to find step-by-step answers.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for help articles..."
                  className="w-full pl-12 pr-4 py-4 rounded-xl border-0 focus:ring-4 focus:ring-orange-300 text-gray-900 placeholder-gray-500 shadow-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Quick Guides */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Guides</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickGuides.map((guide, idx) => {
              const Icon = guide.icon;
              const colorClasses = {
                orange: 'bg-orange-100 text-orange-600',
                blue: 'bg-blue-100 text-blue-600',
                purple: 'bg-purple-100 text-purple-600',
                green: 'bg-green-100 text-green-600',
              };
              
              return (
                <div
                  key={idx}
                  className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all cursor-pointer group"
                >
                  <div className={`w-12 h-12 rounded-lg ${colorClasses[guide.color as keyof typeof colorClasses]} flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                    {guide.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">{guide.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      {guide.time}
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Categories Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-4 sticky top-6">
              <h3 className="font-semibold text-gray-900 mb-4">Categories</h3>
              <div className="space-y-1">
                {categories.map((category) => {
                  const Icon = category.icon;
                  const isActive = activeCategory === category.id;
                  
                  return (
                    <button
                      key={category.id}
                      onClick={() => setActiveCategory(category.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-orange-50 text-orange-600'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{category.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Frequently Asked Questions
              </h2>
              
              {filteredFaqs.length === 0 ? (
                <div className="text-center py-12">
                  <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No results found for "{searchQuery}"</p>
                  <p className="text-sm text-gray-500 mt-2">Try different keywords or browse categories</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredFaqs.map((faq) => (
                    <div
                      key={faq.id}
                      className="border border-gray-200 rounded-lg overflow-hidden"
                    >
                      <button
                        onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                      >
                        <span className="font-medium text-gray-900 text-left">{faq.question}</span>
                        {expandedFaq === faq.id ? (
                          <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        )}
                      </button>
                      {expandedFaq === faq.id && (
                        <div className="px-4 pb-4 pt-0">
                          <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Contact Support Section */}
        <div className="mt-12">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-8 text-white">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">Still need help?</h2>
              <p className="text-orange-100 mb-8">
                Our support team is here to help you succeed. Get in touch with us through your preferred channel.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 justify-between">
            
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <Mail className="w-8 h-8 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Email Support</h3>
                  <p className="text-sm text-orange-100 mb-4">support@qresto.com</p>
                  <a
                    href="mailto:support@qresto.com"
                    className="inline-block px-4 py-2 bg-white text-orange-600 rounded-lg hover:bg-orange-50 transition-colors font-medium text-sm"
                  >
                    Send Email
                  </a>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <Phone className="w-8 h-8 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Phone Support</h3>
                  <p className="text-sm text-orange-100 mb-4">+213 23 123 456</p>
                  <a
                    href="tel:+21323123456"
                    className="inline-block px-4 py-2 bg-white text-orange-600 rounded-lg hover:bg-orange-50 transition-colors font-medium text-sm"
                  >
                    Call Us
                  </a>
                </div>
              </div>
              
              <div className="mt-8 pt-8 border-t border-white/20">
                <p className="text-sm text-orange-100">
                  Support hours: Sunday - Thursday, 9:00 AM - 6:00 PM (GMT+1)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
