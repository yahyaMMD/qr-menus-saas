'use client';

import React, { useState } from 'react';
import { ArrowLeft, Plus, Search, Edit, Trash2, Image as ImageIcon, DollarSign, Tag } from 'lucide-react';
import { useRouter } from 'next/navigation';

const mockCategories = [
  {
    id: '1',
    name: 'Breakfast',
    items: [
      { id: '1', name: 'Avocado Toast', price: 12.99, image: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=150', tags: ['Vegan', 'Popular'] },
      { id: '2', name: 'Organic Oatmeal', price: 8.99, image: 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=150', tags: ['Vegan', 'Gluten-Free'] },
      { id: '3', name: 'Chia Pudding', price: 9.99, image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=150', tags: ['Vegan'] }
    ]
  },
  {
    id: '2',
    name: 'Salads',
    items: [
      { id: '4', name: 'Caesar Salad', price: 14.99, image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=150', tags: ['Popular'] },
      { id: '5', name: 'Greek Salad', price: 13.99, image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=150', tags: ['Vegetarian'] },
      { id: '6', name: 'Quinoa Bowl', price: 15.99, image: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=150', tags: ['Vegan', 'Popular'] }
    ]
  },
  {
    id: '3',
    name: 'Beverages',
    items: [
      { id: '7', name: 'Green Smoothie', price: 7.99, image: 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=150', tags: ['Vegan'] },
      { id: '8', name: 'Cold Brew Coffee', price: 5.99, image: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=150', tags: ['Popular'] },
      { id: '9', name: 'Fresh Orange Juice', price: 6.99, image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=150', tags: [] }
    ]
  }
];

export default function MenuBuilderPage({ params }: { params: { profileId: string; menuId: string } }) {
  const router = useRouter();
  const [categories, setCategories] = useState(mockCategories);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showAddItem, setShowAddItem] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);

  const allItems = categories.flatMap(cat => 
    cat.items.map(item => ({ ...item, category: cat.name }))
  );

  const filteredItems = searchQuery
    ? allItems.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : null;

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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Menu Builder</h1>
            <p className="text-gray-600">The Green Leaf Café • Spring Menu 2024</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowAddCategory(true)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Add Category
            </button>
            <button
              onClick={() => setShowAddItem(true)}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              Add Item
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl p-4 border border-gray-200 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search menu items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500"
          />
        </div>
      </div>

      {/* Search Results */}
      {filteredItems && (
        <div className="bg-white rounded-xl border border-gray-200 mb-6">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Search Results ({filteredItems.length})
            </h3>
          </div>
          <div className="divide-y divide-gray-200">
            {filteredItems.map((item) => (
              <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{item.name}</div>
                    <div className="text-sm text-gray-500">{item.category}</div>
                  </div>
                  <div className="text-lg font-bold text-gray-900">${item.price}</div>
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <Edit className="w-5 h-5 text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-5 h-5 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Categories */}
      {!filteredItems && (
        <div className="space-y-6">
          {categories.map((category) => (
            <div key={category.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {/* Category Header */}
              <div className="bg-gradient-to-r from-orange-400 to-orange-500 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{category.name}</h2>
                    <p className="text-orange-100 text-sm mt-1">{category.items.length} items</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors">
                      <Edit className="w-5 h-5 text-white" />
                    </button>
                    <button className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors">
                      <Trash2 className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Items Grid */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {category.items.map((item) => (
                  <div
                    key={item.id}
                    className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all group"
                  >
                    <div className="relative">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                        <button className="p-2 bg-white rounded-lg shadow-lg hover:bg-gray-50">
                          <Edit className="w-4 h-4 text-gray-700" />
                        </button>
                        <button className="p-2 bg-white rounded-lg shadow-lg hover:bg-red-50">
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">{item.name}</h3>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xl font-bold text-orange-600">${item.price}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {item.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Add Item Card */}
                <button
                  onClick={() => setShowAddItem(true)}
                  className="border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all h-[340px] flex flex-col items-center justify-center gap-3 text-gray-500 hover:text-orange-600"
                >
                  <Plus className="w-12 h-12" />
                  <span className="font-medium">Add New Item</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Item Modal */}
      {showAddItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Add New Menu Item</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Item Name</label>
                <input
                  type="text"
                  placeholder="e.g., Avocado Toast"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500">
                    <option>Breakfast</option>
                    <option>Salads</option>
                    <option>Beverages</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      step="0.01"
                      placeholder="12.99"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe your item..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                <input
                  type="text"
                  placeholder="Vegan, Gluten-Free, Popular..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-orange-500 transition-colors cursor-pointer">
                  <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddItem(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowAddItem(false)}
                className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Add Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}