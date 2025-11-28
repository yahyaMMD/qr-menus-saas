'use client';

import React, { useState } from 'react';
import { ArrowLeft, Star, ThumbsUp, Filter, Search, MoreVertical } from 'lucide-react';
import { useRouter } from 'next/navigation';

const mockFeedbacks = [
  {
    id: '1',
    userName: 'Sarah Johnson',
    avatar: 'https://i.pravatar.cc/150?img=1',
    rating: 5,
    date: '2 days ago',
    comment: 'Absolutely amazing! The organic salad bowl was fresh and delicious. The staff were so friendly and the atmosphere was perfect. Will definitely be coming back!',
    helpful: 12
  },
  {
    id: '2',
    userName: 'Mike Chen',
    avatar: 'https://i.pravatar.cc/150?img=2',
    rating: 4,
    date: '5 days ago',
    comment: 'Great food quality and nice presentation. The avocado toast was a bit small for the price though. Overall good experience!',
    helpful: 8
  },
  {
    id: '3',
    userName: 'Emma Wilson',
    avatar: 'https://i.pravatar.cc/150?img=3',
    rating: 5,
    date: '1 week ago',
    comment: 'Love this place! Best smoothies in town. Coffee was good too and they have plenty of vegetarian options. Highly recommend!',
    helpful: 15
  },
  {
    id: '4',
    userName: 'John Smith',
    avatar: 'https://i.pravatar.cc/150?img=4',
    rating: 3,
    date: '1 week ago',
    comment: 'Food is good but service was a bit slow during lunch rush. Maybe need more staff?',
    helpful: 5
  },
  {
    id: '5',
    userName: 'Fatima Boutros',
    avatar: 'https://i.pravatar.cc/150?img=5',
    rating: 5,
    date: '2 weeks ago',
    comment: 'Such a cozy place with amazing food. The chia pudding for breakfast was to die for. Portions are generous!',
    helpful: 10
  },
  {
    id: '6',
    userName: 'Ryan Lee',
    avatar: 'https://i.pravatar.cc/150?img=6',
    rating: 4,
    date: '2 weeks ago',
    comment: 'Been here a few times now. Consistently good food and the menu changes seasonally which I love. Wish they had more vegan options though.',
    helpful: 7
  }
];

export default function CustomerFeedbackPage({ params }: { params: { profileId: string } }) {
  const router = useRouter();
  const [feedbacks] = useState(mockFeedbacks);
  const [filterRating, setFilterRating] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const stats = {
    avgRating: 4.4,
    totalReviews: 60,
    distribution: {
      5: 45,
      4: 8,
      3: 4,
      2: 2,
      1: 1
    }
  };

  const filteredFeedbacks = feedbacks.filter(f => {
    const matchesRating = filterRating === 'all' || f.rating.toString() === filterRating;
    const matchesSearch = f.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         f.userName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRating && matchesSearch;
  });

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Customer Feedback</h1>
            <p className="text-gray-600">The Green Leaf Café • Manage customer reviews and ratings</p>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Average Rating */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="text-center">
            <div className="text-5xl font-bold text-gray-900 mb-2">{stats.avgRating}</div>
            <div className="flex items-center justify-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-6 h-6 ${
                    star <= Math.floor(stats.avgRating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : star - 0.5 <= stats.avgRating
                      ? 'fill-yellow-200 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <div className="text-sm text-gray-500">{stats.totalReviews} reviews</div>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 lg:col-span-2">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Rating Distribution</h3>
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-12">
                  <span className="text-sm text-gray-600">{rating}</span>
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-orange-400 to-orange-500 h-3 rounded-full transition-all"
                    style={{ width: `${(stats.distribution[rating as keyof typeof stats.distribution] / stats.totalReviews) * 100}%` }}
                  />
                </div>
                <div className="text-sm text-gray-600 w-12 text-right">
                  {stats.distribution[rating as keyof typeof stats.distribution]}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl p-4 border border-gray-200 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search reviews..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <select
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>
      </div>

      {/* Recent Feedback */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Feedback</h3>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredFeedbacks.map((feedback) => (
            <div key={feedback.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start gap-4">
                <img
                  src={feedback.avatar}
                  alt={feedback.userName}
                  className="w-12 h-12 rounded-full"
                />
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-semibold text-gray-900">{feedback.userName}</div>
                      <div className="text-sm text-gray-500">{feedback.date}</div>
                    </div>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <MoreVertical className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 ${
                          star <= feedback.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>

                  <p className="text-gray-700 mb-4">{feedback.comment}</p>

                  <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-teal-600 transition-colors">
                      <ThumbsUp className="w-4 h-4" />
                      Helpful ({feedback.helpful})
                    </button>
                    <button className="text-sm text-teal-600 hover:text-teal-700 font-medium">
                      Reply
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}