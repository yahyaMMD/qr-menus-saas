// @ts-nocheck
'use client';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState([
    {
      text: "Qresto transformed how we present our items. Customers love our digital experience and we're saving costs!",
      author: 'Sarah Johnson',
      role: 'The Green Leaf Cafe - Algeria',
      rating: 5,
      avatar: 'SJ',
    },
    {
      text: 'The analytics feature is incredible. We can now see which dishes are most popular and adjust our menu accordingly.',
      author: 'Ahmed Benali',
      role: 'La Pizzeria Chef',
      rating: 5,
      avatar: 'AB',
    },
    {
      text: 'Super simple and efficient! Our customers appreciate the contactless menu experience.',
      author: 'Fatima Mokrane',
      role: 'Cafe Constantine',
      rating: 5,
      avatar: 'FM',
    },
    {
      text: "Our customers love scanning the QR code and browsing our menu on their phones. It's so convenient!",
      author: 'Mohamed Cherif',
      role: 'Restaurant El Bahia',
      rating: 5,
      avatar: 'MC',
    },
    {
      text: 'The multilingual support is perfect for our tourist customers. They can view the menu in their language!',
      author: 'Leila Hamidi',
      role: 'Café des Arts - Algiers',
      rating: 5,
      avatar: 'LH',
    },
    {
      text: 'Real-time menu updates are a game changer. No more printing new menus every week!',
      author: 'Karim Bensaid',
      role: 'Le Gourmet Restaurant',
      rating: 5,
      avatar: 'KB',
    },
    {
      text: 'The customer feedback feature helps us improve our service constantly. Highly recommend!',
      author: 'Nadia Mansouri',
      role: 'Pizzeria Napoli',
      rating: 5,
      avatar: 'NM',
    },
    {
      text: 'Easy to use dashboard and beautiful menu presentation. Our sales increased by 20%!',
      author: 'Rachid Taleb',
      role: 'Tajine House',
      rating: 5,
      avatar: 'RT',
    },
    {
      text: 'Professional QR code menus at an affordable price. Perfect for small businesses like ours.',
      author: 'Samira Bouteldja',
      role: 'Café Glacier',
      rating: 5,
      avatar: 'SB',
    },
    {
      text: 'The team support is excellent. They helped us set up everything in just one day!',
      author: 'Yacine Brahimi',
      role: 'Grillades & Saveurs',
      rating: 5,
      avatar: 'YB',
    },
  ]);

  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await fetch('/api/feedbacks?limit=10&minRating=4');
        if (response.ok) {
          const data = await response.json();
          if (data.feedbacks && data.feedbacks.length > 0) {
            const formattedTestimonials = data.feedbacks.map((feedback: any) => {
              const initials =
                feedback.userName
                  ?.split(' ')
                  .map((n: string) => n[0])
                  .join('')
                  .toUpperCase() || 'U';
              return {
                text: feedback.comment || 'Great experience with MenuMaster!',
                author: feedback.userName,
                role: feedback.restaurantName,
                rating: feedback.rating,
                avatar: initials,
              };
            });
            setTestimonials(formattedTestimonials);
          }
        }
      } catch (error) {
        console.error('Error fetching testimonials:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  // Auto-play carousel
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      handleNext();
    }, 5000);

    return () => clearInterval(interval);
  }, [currentIndex, isAutoPlaying]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  const getVisibleTestimonials = () => {
    const result = [];
    for (let i = -1; i <= 1; i++) {
      const index = (currentIndex + i + testimonials.length) % testimonials.length;
      result.push({ ...testimonials[index], offset: i });
    }
    return result;
  };

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
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

  const visibleTestimonials = getVisibleTestimonials();

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-20 left-0 w-96 h-96 bg-orange-100/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-0 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <span className="bg-orange-100 text-orange-600 px-4 py-2 rounded-full text-sm font-semibold">
              ⭐ Testimonials
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Loved by Restaurant Owners
          </h2>
          <p className="text-gray-600">Real stories from real restaurant owners</p>
        </div>

        {/* Carousel Container */}
        <div className="relative max-w-5xl mx-auto">
          {/* Main Carousel (smaller height) */}
          <div className="relative h-[380px] flex items-center justify-center">
            {visibleTestimonials.map((testimonial, idx) => {
              const isCenter = testimonial.offset === 0;
              const isLeft = testimonial.offset === -1;
              const isRight = testimonial.offset === 1;

              return (
                <div
                  key={`${testimonial.author}-${idx}`}
                  className={`absolute transition-all duration-700 ease-out ${
                    isCenter
                      ? 'z-30 scale-100 opacity-100'
                      : isLeft
                      ? 'z-20 -translate-x-[280px] scale-90 opacity-40 blur-[2px]'
                      : 'z-20 translate-x-[280px] scale-90 opacity-40 blur-[2px]'
                  }`}
                  style={{
                    pointerEvents: isCenter ? 'auto' : 'none',
                  }}
                >
                  {/* Card (smaller width + padding) */}
                  <div className="bg-white rounded-3xl shadow-2xl p-7 w-[360px] border-2 border-gray-100 hover:border-orange-200 transition-colors duration-300">
                    {/* Quote Icon (smaller) */}
                    <div className="flex justify-center mb-5">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg rotate-3 hover:rotate-0 transition-transform duration-300">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                        </svg>
                      </div>
                    </div>

                    {/* Stars (smaller) */}
                    <div className="flex gap-1 justify-center mb-5">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>

                    {/* Testimonial Text (smaller text + less min height) */}
                    <p className="text-gray-700 text-base leading-relaxed text-center mb-6 italic min-h-[95px] flex items-center justify-center">
                      "{testimonial.text}"
                    </p>

                    {/* Author (smaller avatar/text) */}
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg mb-2 shadow-lg">
                        {testimonial.avatar}
                      </div>
                      <p className="font-bold text-gray-900 text-base">{testimonial.author}</p>
                      <p className="text-xs text-gray-600">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={() => {
              handlePrev();
              setIsAutoPlaying(false);
            }}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-40 w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all duration-300 group border-2 border-gray-100 hover:border-orange-500 hover:scale-110"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={() => {
              handleNext();
              setIsAutoPlaying(false);
            }}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-40 w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all duration-300 group border-2 border-gray-100 hover:border-orange-500 hover:scale-110"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`transition-all duration-300 rounded-full ${
                  index === currentIndex
                    ? 'w-8 h-3 bg-gradient-to-r from-orange-500 to-orange-600'
                    : 'w-3 h-3 bg-gray-300 hover:bg-orange-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-50 to-orange-100 px-6 py-3 rounded-full">
            <span className="text-gray-700 font-medium">Join hundreds of happy restaurants</span>
            <a
              href="/auth/register"
              className="text-orange-600 font-semibold hover:text-orange-700 transition-colors"
            >
              Get started today →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
