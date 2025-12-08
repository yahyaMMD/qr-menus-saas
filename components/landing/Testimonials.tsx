// @ts-nocheck
'use client';
import { Star } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState([
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
      text: 'Our customers love scanning the QR code and browsing our menu on their phones. It\'s so convenient!',
      author: 'Mohamed Cherif',
      role: 'Restaurant El Bahia',
      rating: 5,
    },
    {
      text: 'The multilingual support is perfect for our tourist customers. They can view the menu in their language!',
      author: 'Leila Hamidi',
      role: 'Café des Arts - Algiers',
      rating: 5,
    },
    {
      text: 'Real-time menu updates are a game changer. No more printing new menus every week!',
      author: 'Karim Bensaid',
      role: 'Le Gourmet Restaurant',
      rating: 5,
    },
    {
      text: 'The customer feedback feature helps us improve our service constantly. Highly recommend!',
      author: 'Nadia Mansouri',
      role: 'Pizzeria Napoli',
      rating: 5,
    },
    {
      text: 'Easy to use dashboard and beautiful menu presentation. Our sales increased by 20%!',
      author: 'Rachid Taleb',
      role: 'Tajine House',
      rating: 5,
    },
    {
      text: 'Professional QR code menus at an affordable price. Perfect for small businesses like ours.',
      author: 'Samira Bouteldja',
      role: 'Café Glacier',
      rating: 5,
    },
    {
      text: 'The team support is excellent. They helped us set up everything in just one day!',
      author: 'Yacine Brahimi',
      role: 'Grillades & Saveurs',
      rating: 5,
    },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await fetch('/api/feedbacks?limit=10&minRating=4');
        if (response.ok) {
          const data = await response.json();
          if (data.feedbacks && data.feedbacks.length > 0) {
            const formattedTestimonials = data.feedbacks.map((feedback: any) => ({
              text: feedback.comment || 'Great experience with MenuMaster!',
              author: feedback.userName,
              role: feedback.restaurantName,
              rating: feedback.rating,
            }));
            setTestimonials(formattedTestimonials);
          }
        }
      } catch (error) {
        console.error('Error fetching testimonials:', error);
        // Keep default testimonials if fetch fails
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, [])

  if (loading) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Loved by Restaurant Owners
            </h2>
          </div>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Loved by Restaurant Owners
          </h2>
          <p className="text-gray-600 text-sm">Scroll to see more testimonials →</p>
        </div>

        {/* Testimonials Scrollable Container */}
        <div className="overflow-x-auto pb-4 scrollbar-thin">
          <div className="flex gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-md min-w-[320px] max-w-[320px] flex-shrink-0">
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* Testimonial Text */}
                <p className="text-gray-700 mb-6 italic">"{testimonial.text}"</p>

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
      
      <style jsx global>{`
        .scrollbar-thin::-webkit-scrollbar {
          height: 8px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #fb923c;
          border-radius: 10px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #f97316;
        }
      `}</style>
    </section>
  )
}
