// @ts-nocheck
"use client";

import { Button } from "../ui/button";
import { Menu } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/" className="text-2xl font-bold text-orange-500">
            MenuLix
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a href="/" className="text-gray-700 hover:text-orange-500 transition-colors">
              Home
            </a>
            <a href="#pricing" className="text-gray-700 hover:text-orange-500 transition-colors">
              Pricing
            </a>
            <a href="#about" className="text-gray-700 hover:text-orange-500 transition-colors">
              About
            </a>
            <a href="#support" className="text-gray-700 hover:text-orange-500 transition-colors">
              Support
            </a>
            <a href="#contact" className="text-gray-700 hover:text-orange-500 transition-colors">
              Contact
            </a>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/auth/login">
              <Button variant="ghost" className="text-gray-700">
                Login
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                Register
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-4">
              <a href="#features" className="text-foreground hover:text-primary transition-colors">
                Features
              </a>
              <a href="#pricing" className="text-foreground hover:text-primary transition-colors">
                Pricing
              </a>
              <a href="#testimonials" className="text-foreground hover:text-primary transition-colors">
                Testimonials
              </a>
              <a href="#contact" className="text-foreground hover:text-primary transition-colors">
                Contact
              </a>
              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                <Link href="/auth/login">
                  <Button variant="ghost" className="w-full">
                    Log In
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};