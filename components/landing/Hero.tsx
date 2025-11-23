// @ts-nocheck
import { Button } from "../ui/button";
import heroImage from "../../public/assets/home-bg.png";
import Image from "next/image";

export const Hero = () => {
  return (
    <section className="relative min-h-[600px] flex items-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src={heroImage}
          alt="Elegant restaurant interior"
          className="w-full h-full object-cover"
          fill
          priority
        />
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Content */}
      <div className="container relative z-10 mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight uppercase">
            SAY GOODBYE TO PAPER MENUS
          </h1>
          <p className="text-base md:text-lg text-white/90 mb-8 leading-relaxed max-w-2xl mx-auto">
            BUILD STYLISH CONTACTLESS DIGITAL MENUS FOR YOUR RESTAURANT IN MINUTES. SAVE TIME, REDUCE PRINTING COSTS, AND GIVE YOUR CUSTOMERS A MODERN EXPERIENCE WITH MENULIX.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-base px-8 py-6 bg-orange-500 hover:bg-orange-600 text-white uppercase font-semibold">
              Get Started
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-base px-8 py-6 border-2 border-white text-white hover:bg-white hover:text-gray-900 uppercase font-semibold"
            >
              View Pricing
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};