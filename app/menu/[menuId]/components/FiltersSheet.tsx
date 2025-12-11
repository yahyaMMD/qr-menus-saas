"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import {
  FiltersState,
  TypeView,
  CategoryView,
  TagView,
} from "../types";

type Props = {
  open: boolean;
  onClose: () => void;
  filters: FiltersState;
  onChange: (next: FiltersState) => void;
  types: TypeView[];
  categories: CategoryView[];
  tags: TagView[];
};

export function FiltersSheet({
  open,
  onClose,
  filters,
  onChange,
  types,
  categories,
  tags,
}: Props) {
  if (!open) return null;

  const setFilter = (patch: Partial<FiltersState>) =>
    onChange({ ...filters, ...patch });

  const toggleInArray = (key: keyof FiltersState, value: string) => {
    const current = (filters[key] as string[] | undefined) ?? [];
    if (current.includes(value)) {
      onChange({ ...filters, [key]: current.filter((v) => v !== value) });
    } else {
      onChange({ ...filters, [key]: [...current, value] });
    }
 };

  const clearAll = () => onChange({});

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-t-3xl bg-white shadow-2xl">
        <div className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-5 w-5 text-orange-600" />
              <h2 className="text-lg font-bold text-gray-900">Filters</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-1 hover:bg-gray-100 transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          <div className="max-h-[60vh] space-y-5 overflow-y-auto pr-2">
            {/* Types */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                Type
              </label>
              <div className="flex flex-wrap gap-2">
                {types.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => toggleInArray("typeIds", t.id)}
                    className={`rounded-full px-4 py-2 text-sm font-medium border-2 transition-all ${
                      filters.typeIds?.includes(t.id)
                        ? "bg-orange-500 text-white border-orange-500 shadow-md"
                        : "bg-white text-gray-700 border-gray-200 hover:border-orange-300"
                    }`}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                Category
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleInArray("categoryIds", c.id)}
                    className={`rounded-full px-4 py-2 text-sm font-medium border-2 transition-all ${
                      filters.categoryIds?.includes(c.id)
                        ? "bg-orange-500 text-white border-orange-500 shadow-md"
                        : "bg-white text-gray-700 border-gray-200 hover:border-orange-300"
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleInArray("tagIds", tag.id)}
                    className="rounded-full px-4 py-2 text-sm font-medium border-2 transition-all"
                    style={{
                      backgroundColor:
                        filters.tagIds?.includes(tag.id) ? tag.color : "white",
                      color:
                        filters.tagIds?.includes(tag.id) ? "white" : "#374151",
                      borderColor:
                        filters.tagIds?.includes(tag.id) ? tag.color : "#e5e7eb",
                    }}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Price range */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                Price range (DZD)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  placeholder="Min"
                  className="w-1/2 rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm focus:border-orange-500 focus:outline-none"
                  value={filters.minPrice ?? ""}
                  onChange={(e) =>
                    setFilter({
                      minPrice: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    })
                  }
                />
                <span className="text-gray-400">—</span>
                <input
                  type="number"
                  placeholder="Max"
                  className="w-1/2 rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm focus:border-orange-500 focus:outline-none"
                  value={filters.maxPrice ?? ""}
                  onChange={(e) =>
                    setFilter({
                      maxPrice: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    })
                  }
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button
              type="button"
              onClick={clearAll}
              className="flex-1 rounded-xl border-2 border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Clear all
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-3 text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-all"
            >
              Apply filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
