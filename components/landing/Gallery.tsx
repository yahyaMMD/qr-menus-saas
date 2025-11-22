//import gallery1 from "../../public/assets/gallery-1.jpg";
//import gallery2 from "../../public/assets/gallery-2.jpg";
//import gallery3 from "../../public/assets/gallery-3.jpg";
// @ts-nocheck
import Image from "next/image";
import Link from "next/link";
import heroImage from "../../public/assets/home-bg.png";
export const Gallery = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            See What You Can Create
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Beautiful digital menus that showcase your cuisine
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300">
            <Image
              src={heroImage}
              alt="Digital menu on tablet"
              className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-end justify-end">
              <p className="text-white text-lg font-semibold p-6 w-full">
                Interactive Menu Design
              </p>
              <Link 
                href="/menu/restaurant-1" 
                className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              >
                <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold">
                  View Menu
                </button>
              </Link>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300">
            <Image
              src={heroImage}
              alt="Digital menu on smartphone"
              className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-end justify-end">
              <p className="text-white text-lg font-semibold p-6 w-full">
                Mobile-Optimized Experience
              </p>
              <Link 
                href="/menu/restaurant-2" 
                className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              >
                <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold">
                  View Menu
                </button>
              </Link>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300">
            <Image
              src={heroImage}
              alt="QR code menu stand"
              className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-end justify-end">
              <p className="text-white text-lg font-semibold p-6 w-full">
                Seamless QR Integration
              </p>
              <Link 
                href="/menu/restaurant-3" 
                className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              >
                <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold">
                  View Menu
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};