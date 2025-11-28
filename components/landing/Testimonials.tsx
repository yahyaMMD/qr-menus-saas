// @ts-nocheck
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Maya Priya",
    role: "Chef",
    content: "Nomen adipiscing amet est nunc lorem rhoncus tVeh non odio tellus ipsum. Nunc eget fermentum lorem felis nec handrerit eget. Eu sit.",
    rating: 5,
    avatar: "MP",
  },
  {
    name: "American Burger",
    role: "Manager",
    content: "Nomen adipiscing amet est nunc lorem rhoncus tVeh non odio tellus ipsum. Nunc eget fermentum lorem felis nec handrerit eget. Eu sit.",
    rating: 5,
    avatar: "AB",
  },
  {
    name: "LVRS org",
    role: "Owner",
    content: "Nomen adipiscing amet est nunc lorem rhoncus tVeh non odio tellus ipsum. Nunc eget fermentum lorem felis nec handrerit eget. Eu sit.",
    rating: 5,
    avatar: "L",
  },
];

export const Testimonials = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            What Our Clients Say
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-8 shadow-md border border-gray-200"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-white font-bold">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="font-bold text-gray-900">{testimonial.name}</p>
                  <div className="flex gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-orange-400 text-orange-400" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed text-sm">
                {testimonial.content}
              </p>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-8">
          <a href="#" className="text-orange-500 hover:text-orange-600 font-semibold">
            See All Reviews
          </a>
        </div>
      </div>
    </section>
  );
};