//import gallery1 from "../../public/assets/gallery-1.jpg";
//import gallery2 from "../../public/assets/gallery-2.jpg";
//import gallery3 from "../../public/assets/gallery-3.jpg";
// @ts-nocheck
import Image from "next/image";
import Link from "next/link";
import heroImage from "../../public/assets/home-bg.png";
export const Gallery = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            See What You Can Create
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore a few of the stunning digital menus created with QResto. From cozy cafés to elegant restaurants, our designs adapt perfectly to every style.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-200 rounded-2xl p-16 text-center">
            <p className="text-gray-500 text-lg">
              screenshots of examples we did (later)
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};