import { Navbar } from "../../components/landing/Navbar";
import { Hero } from "../../components/landing/Hero";
import { HowItWorks } from "../../components/landing/HowItWorks";
import { Pricing } from "../../components/landing/Pricing";
import { Gallery } from "../../components/landing/Gallery";
import { Testimonials } from "../../components/landing/Testimonials";
import { Contact } from "../../components/landing/Contact";
import { Footer } from "../../components/landing/Footer";

const Homepage = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-16">
        <Hero />
        <div id="features">
          <HowItWorks />
        </div>
        <div id="pricing">
          <Pricing />
        </div>
        <Gallery />
        <div id="testimonials">
          <Testimonials />
        </div>
        <div id="contact">
          <Contact />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Homepage;