import { Button } from "../ui/button";
import { ArrowRight } from "lucide-react";
import heroImage from "../../public/assets/home-bg.png";
import Image from "next/image";
export const Hero = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src={heroImage}
          alt="Elegant restaurant interior"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/70 to-black/50" />
      </div>

      {/* Content */}
      <div className="container relative z-10 mx-auto px-4 py-20">
        <div className="max-w-3xl">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Say Goodbye to{" "}
            <span className="text-primary">Paper Menus</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
            Transform your restaurant with beautiful digital menus accessible via QR codes. 
            Easy to update, eco-friendly, and loved by customers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 text-white">
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-8 py-6 border-2 border-white text-white hover:bg-white hover:text-foreground"
            >
              View Demo
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};