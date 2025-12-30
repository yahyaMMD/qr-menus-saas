'use client';

import React, { use, useState, useEffect } from 'react';
import { ArrowLeft, Star, ThumbsUp, Filter, Search, MoreVertical } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CustomerFeedbackPage({ params }: { params: Promise<{ profileId: string }> }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [filterRating, setFilterRating] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const resolvedParams = use(params);
  const profileId = resolvedParams.profileId;

  useEffect(() => {
    fetchFeedbacks();
  }, [profileId]);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/profiles/${profileId}/feedbacks`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch feedbacks');
      }

      const result = await response.json();
      setData(result);
    } catch (err: any) {
      console.error('Error fetching feedbacks:', err);
      setError(err.message || 'Failed to load feedbacks');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading feedbacks...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error || 'Failed to load feedbacks'}</p>
          <button
            onClick={fetchFeedbacks}
            className="mt-2 text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  type Feedback = { id: string; userName: string; rating: number; comment: string; createdAt: string };
  const { profile, stats, feedbacks } = data as { profile: any; stats: any; feedbacks: Feedback[] };

  const filteredFeedbacks = feedbacks.filter((f: Feedback) => {
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
            <p className="text-gray-600">{profile.name} • Manage customer reviews and ratings</p>
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
                  className={`w-6 h-6 ${star <= Math.floor(stats.avgRating)
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
          {filteredFeedbacks.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <p className="text-lg mb-2">No feedbacks found</p>
              <p className="text-sm">
                {searchQuery || filterRating !== 'all'
                  ? 'Try adjusting your filters'
                  : 'No customer feedback yet. Feedbacks will appear here once customers leave reviews.'}
              </p>
            </div>
          ) : (
            filteredFeedbacks.map((feedback: any) => {
              // Generate avatar URL based on first letter of name
              const initial = feedback.userName.charAt(0).toUpperCase();
              const avatarColor = ['#f97316', '#3b82f6', '#10b981', '#ec4899', '#8b5cf6'][
                initial.charCodeAt(0) % 5
              ];

              return (
                <div key={feedback.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                      style={{ backgroundColor: avatarColor }}
                    >
                      {initial}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="font-semibold text-gray-900">{feedback.userName}</div>
                          <div className="text-sm text-gray-500">{feedback.date}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 mb-3">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-5 h-5 ${star <= feedback.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                              }`}
                          />
                        ))}
                      </div>

                      {feedback.comment && (
                        <p className="text-gray-700 mb-4">{feedback.comment}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
