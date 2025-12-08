import Footer from "@/components/landing/Footer";
import Navbar from "@/components/landing/Navbar"

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Navbar/>
      <main>{children}</main>
      <Footer/>
    </div>
  );
}
