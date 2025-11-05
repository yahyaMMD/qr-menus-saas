import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Owner, The Garden Bistro",
    content: "Switching to digital menus was the best decision we made. Our customers love how easy it is to browse, and we save thousands on printing costs.",
    rating: 5,
  },
  {
    name: "Michael Chen",
    role: "Manager, Urban Eats",
    content: "The analytics feature is incredible! We now know exactly which dishes are popular and can adjust our menu accordingly. Game changer!",
    rating: 5,
  },
  {
    name: "Elena Rodriguez",
    role: "Chef & Owner, La Mesa",
    content: "I can update our daily specials in seconds. No more reprinting menus every day. Our customers appreciate the real-time updates.",
    rating: 5,
  },
];

export const Testimonials = () => {
  return (
    <section className="py-20 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            What Our Clients Say
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join thousands of restaurants already loving their digital menus
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-card rounded-2xl p-8 shadow-lg"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-foreground mb-6 leading-relaxed">
                "{testimonial.content}"
              </p>
              <div>
                <p className="font-bold text-foreground">{testimonial.name}</p>
                <p className="text-sm text-muted-foreground">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};