// @ts-nocheck
import { Star } from 'lucide-react'

export default function Testimonials() {
  const testimonials = [
    {
      text: 'Qresto transformed how we present our items. Customers love our digital experience and we\'re saving costs!',
      author: 'Sarah Johnson',
      role: 'The Green Leaf Cafe - Algeria',
      rating: 5,
    },
    {
      text: 'The analytics feature is incredible. We can now see which dishes are most popular and adjust our menu accordingly.',
      author: 'Ahmed Benali',
      role: 'La Pizzeria Chef',
      rating: 5,
    },
    {
      text: 'Super simple and efficient! Our customers appreciate the contactless menu experience.',
      author: 'Fatima Mokrane',
      role: 'Cafe Constantine',
      rating: 5,
    },
    {
      text: 'The QR code system is brilliant! Setup was easy and our customers find it very convenient.',
      author: 'Karim Meziane',
      role: 'Restaurant Le Pacha',
      rating: 5,
    },
    {
      text: 'Qresto helped us go digital seamlessly. The customer feedback feature is a game changer!',
      author: 'Amina Boudiaf',
      role: 'Bistro Alger',
      rating: 5,
    },
    {
      text: 'Best investment for our restaurant! Our staff loves how easy it is to update the menu.',
      author: 'Omar Hadj',
      role: 'Le Gourmet',
      rating: 5,
    },
  ]

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Loved by Restaurant Owners
          </h2>
          <p className="text-lg text-gray-600">
            See what our customers have to say about Qresto
          </p>
        </div>

        {/* Scrollable Testimonials */}
        <div className="overflow-x-auto overflow-y-hidden pb-6">
          <div className="flex gap-6 min-w-max">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-xl shadow-md w-[320px] h-[320px] flex flex-col justify-between flex-shrink-0 hover:shadow-xl transition-shadow"
              >
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* Testimonial Text */}
                <p className="text-gray-700 mb-6 italic leading-relaxed">"{testimonial.text}"</p>

                {/* Author */}
                <div>
                  <p className="font-bold text-gray-900">{testimonial.author}</p>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
