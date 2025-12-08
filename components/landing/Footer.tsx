// @ts-nocheck
'use client'
import Link from 'next/link'
import { Instagram, Facebook, Linkedin, Mail, MapPin, Clock } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-[#0b1021] via-[#0d152c] to-[#0b1021] text-white pt-16 pb-4 relative overflow-hidden">
      {/* Decorative gradient orbs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-orange-400/12 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid md:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="space-y-4 md:col-span-1">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-orange-300 to-orange-200 bg-clip-text text-transparent">
              Qresto
            </h3>
            <p className="text-slate-200 leading-relaxed text-sm">
              Transform your restaurant menu digitally
            </p>
            
            {/* Social Media Icons */}
            <div className="pt-4">
              <h5 className="text-sm font-semibold mb-3 text-slate-200">Follow Us</h5>
              <div className="flex gap-3 flex-wrap">
                {[Instagram, Facebook, Linkedin].map((Icon, idx) => (
                  <a 
                    key={idx}
                    href="https://instagram.com" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-orange-300 flex items-center justify-center hover:scale-110 hover:-translate-y-1 transition-all duration-300 shadow-lg shadow-orange-300/30"
                  >
                    <Icon className="w-5 h-5 text-slate-950" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold mb-4 text-lg">Product</h4>
            <ul className="space-y-3 text-slate-200">
              <li>
                <Link href="/pricing" className="hover:text-orange-300 transition-all duration-300 inline-flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform duration-300">Pricing</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-4 text-lg">Company</h4>
            <ul className="space-y-3 text-slate-200">
              <li>
                <Link href="/about" className="hover:text-orange-300 transition-all duration-300 inline-flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform duration-300">About</span>
                </Link>
              </li>
              <li>
                <Link href="/help" className="hover:text-orange-300 transition-all duration-300 inline-flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform duration-300">Help Center</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4 text-lg">Legal</h4>
            <ul className="space-y-3 text-slate-200">
              <li>
                <Link href="/legal/privacy" className="hover:text-orange-300 transition-all duration-300 inline-flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform duration-300">Privacy</span>
                </Link>
              </li>
              <li>
                <Link href="/legal/terms" className="hover:text-orange-300 transition-all duration-300 inline-flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform duration-300">Terms</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h4 className="font-semibold mb-4 text-lg">Contact & Support</h4>
            <ul className="space-y-3">
              {/* Email */}
              <li>
                <a 
                  href="mailto:support@qresto.com" 
                  className="flex items-center gap-2 text-slate-200 hover:text-orange-300 transition-all duration-300 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-orange-300 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md">
                    <Mail className="w-4 h-4 text-slate-950" />
                  </div>
                  <span className="text-sm">support@qresto.com</span>
                </a>
              </li>
              
              {/* Availability */}
              <li className="flex items-start gap-2 text-slate-200">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-orange-300 flex items-center justify-center shadow-md">
                  <Clock className="w-4 h-4 text-slate-950" />
                </div>
                <div className="text-sm">
                  <div className="font-semibold text-orange-200">Available 24/7</div>
                  <div className="text-xs text-slate-500">Round-the-clock support</div>
                </div>
              </li>
              
              {/* Location */}
              <li className="flex items-start gap-2 text-slate-200">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-orange-300 flex items-center justify-center shadow-md">
                  <MapPin className="w-4 h-4 text-slate-950" />
                </div>
                <div className="text-sm">
                  <div className="font-semibold text-orange-200">Global Support</div>
                  <div className="text-xs text-slate-500">Worldwide coverage</div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 text-center">
          <p className="text-slate-500 text-sm">
            © 2025 Qresto. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
