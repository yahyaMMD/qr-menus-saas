'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { 
  Zap, 
  Users, 
  Target,
  Award,
  Globe,
  TrendingUp,
  Heart,
  Sparkles,
  CheckCircle,
  ArrowRight,
  Linkedin,
  Mail
} from 'lucide-react';

export default function AboutPage() {
  const stats = [
    { label: 'Restaurants', value: '1,000+', icon: Users },
    { label: 'Digital Menus', value: '5,000+', icon: Sparkles },
    { label: 'QR Scans', value: '100K+', icon: TrendingUp },
    { label: 'Countries', value: 'MELYAR+', icon: Globe },
  ];

  const values = [
    {
      title: 'Innovation First',
      description: 'We constantly innovate to provide cutting-edge solutions for modern restaurants.',
      icon: Zap,
      color: 'orange',
    },
    {
      title: 'Customer Success',
      description: 'Your success is our success. We\'re committed to helping you grow your business.',
      icon: Target,
      color: 'blue',
    },
    {
      title: 'Simplicity',
      description: 'We believe powerful tools should be simple to use. No complexity, just results.',
      icon: CheckCircle,
      color: 'green',
    },
    {
      title: 'Quality',
      description: 'We maintain the highest standards in everything we do, from code to customer service.',
      icon: Award,
      color: 'purple',
    },
  ];

  const team = [
    {
      name: 'Yassir CHERDOUH',
      role: 'Zawali Kheddam',
      image: '',
      bio: 'slt frr cv hh',
    },
    {
      name: 'Yahya Abderrahmane Mehdi',
      role: 'TablaQR',
      image: '',
      bio: 'slm',
    },
    {
      name: 'Hala Boutaya',
      role: 'Win Rah L\'Mariné',
      image: '',
      bio: 'slm',
    },
    {
      name: 'Amani Haichour',
      role: 'Designer Zawaliya',
      image: '',
      bio: 'slm',
    },
    {
      name: 'Baha Eddine Bennacer',
      role: 'Ekhdem',
      image: '',
      bio: 'slm',
    },
  ];

  const timeline = [
    { year: '2025', event: 'QResto founded in Algiers', description: 'Started with a vision to digitalize restaurant menus' },
    { year: '2026', event: 'Reached 100 restaurants', description: 'Expanded across Algeria' },
    { year: '2027', event: 'International expansion', description: 'Now serving restaurants in 10 countries' },
    { year: '2028', event: '1,000+ restaurants', description: 'Became the leading digital menu platform in the region' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Transforming the dining experience, one menu at a time
            </h1>
            <p className="text-xl text-orange-100 mb-8">
              We're on a mission to help restaurants thrive in the digital age with beautiful, contactless digital menus.
            </p>
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-orange-600 rounded-xl hover:bg-orange-50 transition-colors font-semibold text-lg shadow-lg"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-xl mb-4">
                    <Icon className="w-8 h-8 text-orange-600" />
                  </div>
                  <div className="text-4xl font-bold text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Story Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Story</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  QResto was born from a simple observation: restaurants were struggling to adapt to the digital world. Traditional paper menus were outdated, expensive to update, and didn't meet modern hygiene standards.
                </p>
                <p>
                  We set out to create a solution that would be beautiful, easy to use, and affordable for restaurants of all sizes.
                </p>
                <p>
                  Today, QResto is more than just digital menus. We're a complete platform that helps restaurants manage their offerings, understand their customers, and grow their business.
                </p>
                <p className="font-semibold text-gray-900">
                  Our mission is simple: empower every restaurant to succeed in the digital age.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&h=800&fit=crop"
                  alt="Restaurant"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-orange-500 text-white p-6 rounded-xl shadow-lg max-w-xs">
                <Heart className="w-8 h-8 mb-2" />
                <p className="font-semibold">
                  Built with love for restaurants by passionate individuals
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              These core values guide everything we do and every decision we make
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, idx) => {
              const Icon = value.icon;
              const colorClasses = {
                orange: 'bg-orange-100 text-orange-600',
                blue: 'bg-blue-100 text-blue-600',
                green: 'bg-green-100 text-green-600',
                purple: 'bg-purple-100 text-purple-600',
              };
              
              return (
                <div key={idx} className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className={`w-14 h-14 rounded-xl ${colorClasses[value.color as keyof typeof colorClasses]} flex items-center justify-center mb-4`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Timeline Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Journey</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From a small startup to serving thousands of restaurants worldwide
            </p>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-orange-200 hidden lg:block"></div>

            <div className="space-y-12">
              {timeline.map((item, idx) => (
                <div key={idx} className={`flex items-center gap-8 ${idx % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}>
                  <div className={`flex-1 ${idx % 2 === 0 ? 'lg:text-right' : 'lg:text-left'}`}>
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                      <div className="text-orange-600 font-bold text-lg mb-2">{item.year}</div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{item.event}</h3>
                      <p className="text-gray-600">{item.description}</p>
                    </div>
                  </div>
                  
                  <div className="relative z-10 flex-shrink-0">
                    <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center shadow-lg">
                      <div className="w-6 h-6 bg-white rounded-full"></div>
                    </div>
                  </div>
                  
                  <div className="flex-1 hidden lg:block"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Passionate professionals dedicated to helping your restaurant succeed
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, idx) => (
              <div key={idx} className="bg-white rounded-xl border border-gray-200 overflow-hidden group hover:shadow-lg transition-all">
                <div className="aspect-square overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-gray-900 text-lg mb-1">{member.name}</h3>
                  <p className="text-orange-600 font-medium text-sm mb-3">{member.role}</p>
                  <p className="text-gray-600 text-sm mb-4">{member.bio}</p>
                  <div className="flex gap-3">
                    <button className="p-2 bg-gray-100 hover:bg-orange-100 rounded-lg transition-colors">
                      <Linkedin className="w-4 h-4 text-gray-600" />
                    </button>
                    <button className="p-2 bg-gray-100 hover:bg-orange-100 rounded-lg transition-colors">
                      <Mail className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-12 text-white text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to transform your restaurant?
            </h2>
            <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
              Join thousands of restaurants already using QResto to create beautiful digital menus
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/register"
                className="px-8 py-4 bg-white text-orange-600 rounded-xl hover:bg-orange-50 transition-colors font-semibold shadow-lg"
              >
                Start Free Trial
              </Link>
              <Link
                href="/help"
                className="px-8 py-4 bg-orange-700 text-white rounded-xl hover:bg-orange-800 transition-colors font-semibold border-2 border-white/20"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
