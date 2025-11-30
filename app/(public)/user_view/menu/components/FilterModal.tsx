"use client";

import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Category, Filters, Tag, Type } from "../menu.types";

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: Filters;
  onApplyFilters: (filters: Filters) => void;
  types: Type[];
  categories: Category[];
  tags: Tag[];
}

const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
  types,
  categories,
  tags,
}) => {
  const [localFilters, setLocalFilters] = useState<Filters>(filters);
  const [minPrice, setMinPrice] = useState(filters.priceRange[0]);
  const [maxPrice, setMaxPrice] = useState(filters.priceRange[1]);

  useEffect(() => {
    setLocalFilters(filters);
    setMinPrice(filters.priceRange[0]);
    setMaxPrice(filters.priceRange[1]);
  }, [filters]);

  if (!isOpen) return null;

  const toggleType = (typeId: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      typeIds: prev.typeIds.includes(typeId)
        ? prev.typeIds.filter((id) => id !== typeId)
        : [...prev.typeIds, typeId],
    }));
  };

  const toggleCategory = (categoryId: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(categoryId)
        ? prev.categoryIds.filter((id) => id !== categoryId)
        : [...prev.categoryIds, categoryId],
    }));
  };

  const toggleTag = (tagId: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      tagIds: prev.tagIds.includes(tagId)
        ? prev.tagIds.filter((id) => id !== tagId)
        : [...prev.tagIds, tagId],
    }));
  };

  const handleClearAll = () => {
    setLocalFilters({
      typeIds: [],
      categoryIds: [],
      tagIds: [],
      priceRange: [0, 4500],
    });
    setMinPrice(0);
    setMaxPrice(4500);
  };

  const handleApply = () => {
    onApplyFilters({
      ...localFilters,
      priceRange: [minPrice, maxPrice],
    });
    onClose();
  };

  const priceRanges = [
    { label: "Tous", min: 0, max: 4500 },
    { label: "Moins de 100 DA", min: 0, max: 100 },
    { label: "100 DA - 200 DA", min: 100, max: 200 },
    { label: "200 DA - 300 DA", min: 200, max: 300 },
    { label: "Plus de 300 DA", min: 300, max: 4500 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Filters</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-500 text-sm mb-6">
            Filter items by type, category, tag and price!
          </p>

          {/* Type Section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Type</h3>
            <div className="grid grid-cols-2 gap-3">
              {types.map((type) => (
                <button
                  key={type.id}
                  onClick={() => toggleType(type.id)}
                  className={`py-3 px-4 rounded-xl font-medium transition ${
                    localFilters.typeIds.includes(type.id)
                      ? "bg-orange-500 text-white"
                      : "bg-white border border-gray-200 text-gray-900 hover:border-orange-500"
                  }`}
                >
                  {type.name}
                </button>
              ))}
            </div>
          </div>

          {/* Categories Section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Categories</h3>
            <div className="grid grid-cols-2 gap-3">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => toggleCategory(category.id)}
                  className={`py-3 px-4 rounded-xl font-medium transition ${
                    localFilters.categoryIds.includes(category.id)
                      ? "bg-orange-500 text-white"
                      : "bg-white border border-gray-200 text-gray-900 hover:border-orange-500"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Tags Section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Tags</h3>
            <div className="flex flex-wrap gap-3">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => toggleTag(tag.id)}
                  className={`py-2 px-4 rounded-full font-medium transition ${
                    localFilters.tagIds.includes(tag.id)
                      ? "text-white"
                      : "bg-white border border-gray-200 text-gray-900 hover:border-orange-500"
                  }`}
                  style={{
                    backgroundColor: localFilters.tagIds.includes(tag.id)
                      ? tag.color
                      : undefined,
                  }}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Range of prices
            </h3>

            <div className="flex items-center gap-4 mb-4">
              <div className="bg-orange-100 text-orange-600 px-4 py-2 rounded-lg font-semibold">
                {minPrice}DA
              </div>
              <div className="bg-orange-100 text-orange-600 px-4 py-2 rounded-lg font-semibold">
                {maxPrice}DA
              </div>
            </div>

            <input
              type="range"
              min="0"
              max="4500"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full h-2 bg-gray-900 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />

            <div className="grid grid-cols-2 gap-3 mt-4">
              {priceRanges.map((range, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setMinPrice(range.min);
                    setMaxPrice(range.max);
                  }}
                  className="py-3 px-4 rounded-xl border border-gray-200 text-gray-900 font-medium hover:border-orange-500 transition text-sm"
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleClearAll}
              className="w-full py-3 px-4 rounded-xl border-2 border-gray-300 text-gray-900 font-semibold hover:bg-gray-50 transition"
            >
              Tout effacer
            </button>
            <button
              onClick={handleApply}
              className="w-full py-3 px-4 rounded-xl bg-orange-500 text-white font-semibold hover:bg-orange-600 transition"
            >
              Appliquer les filtres
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;
