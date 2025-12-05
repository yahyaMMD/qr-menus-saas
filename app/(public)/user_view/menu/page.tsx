"use client";

import React, { useEffect, useState } from "react";
import {
  Facebook,
  Filter,
  Instagram,
  MessageCircle,
  Globe,
  ChevronDown,
} from "lucide-react";
import { useSearchParams } from "next/navigation";

import { Filters, Item, MenuData, LanguageInfo } from "./menu.types";
import { mockMenuData } from "./menu.mock";
import FilterModal from "./components/FilterModal";
import MenuSection from "./components/MenuSection";
import Link from "next/link";

const MenuPage: React.FC = () => {
  const searchParams = useSearchParams();
  const menuId = searchParams.get("menuId");
  
  const [data, setData] = useState<MenuData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<string>("en");
  const [filters, setFilters] = useState<Filters>({
    typeIds: [],
    categoryIds: [],
    tagIds: [],
    priceRange: [0, 50000],
  });

  const fetchData = async (lang?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!menuId) {
        // Fall back to mock data if no menuId
        setData(mockMenuData);
        return;
      }

      const langParam = lang ? `?lang=${lang}` : '';
      const response = await fetch(`/api/public/menu/${menuId}${langParam}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError("Menu not found or not available");
        } else {
          setError("Failed to load menu");
        }
        return;
      }

      const menuData = await response.json();
      setData(menuData);
      
      // Set current language from response
      if (menuData.languages?.current) {
        setCurrentLanguage(menuData.languages.current);
      }
    } catch (err) {
      console.error("Error fetching menu:", err);
      setError("Failed to load menu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [menuId]);

  const handleLanguageChange = (langCode: string) => {
    setIsLanguageOpen(false);
    if (langCode !== currentLanguage) {
      setCurrentLanguage(langCode);
      fetchData(langCode);
    }
  };

  // Get current language info
  const currentLangInfo = data?.languages?.availableLanguages?.find(
    (l) => l.code === currentLanguage
  );

  // Check if RTL language
  const isRTL = currentLangInfo?.direction === 'rtl';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading menu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🍽️</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Menu Unavailable</h1>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  // Filter items based on active filters
  const filteredItems = data.items.filter((item) => {
    // Type filter
    if (filters.typeIds.length > 0 && !filters.typeIds.includes(item.typeId || "")) {
      return false;
    }

    // Category filter
    if (
      filters.categoryIds.length > 0 &&
      !filters.categoryIds.includes(item.categoryId || "")
    ) {
      return false;
    }

    // Tag filter
    if (filters.tagIds.length > 0) {
      const hasMatchingTag = item.tags.some((tag) => filters.tagIds.includes(tag));
      if (!hasMatchingTag) return false;
    }

    // Price filter
    if (item.price !== null) {
      if (item.price < filters.priceRange[0] || item.price > filters.priceRange[1]) {
        return false;
      }
    }

    return true;
  });

  // Group items by category
  const groupedItems: Record<string, Item[]> = {};
  filteredItems.forEach((item) => {
    const category = data.categories.find((c) => c.id === item.categoryId);
    const categoryName = category?.name || "Other";
    if (!groupedItems[categoryName]) {
      groupedItems[categoryName] = [];
    }
    groupedItems[categoryName].push(item);
  });

  const activeFilterCount =
    filters.typeIds.length + filters.categoryIds.length + filters.tagIds.length;

  const hasMultipleLanguages = data.languages && data.languages.availableLanguages.length > 1;

  return (
    <div className={`min-h-screen bg-gray-50 pb-20 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src={data.menu.logoUrl}
              alt="Restaurant Logo"
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover"
            />
            <span className="text-lg sm:text-xl font-bold text-gray-900">
              {data.menu.name}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            {hasMultipleLanguages && (
              <div className="relative">
                <button
                  onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-full transition text-sm font-medium text-gray-700"
                >
                  <Globe className="w-4 h-4" />
                  <span className="hidden sm:inline">{currentLangInfo?.flag} {currentLangInfo?.nativeName}</span>
                  <span className="sm:hidden">{currentLangInfo?.flag}</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${isLanguageOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Language Dropdown */}
                {isLanguageOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIsLanguageOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                      <div className="px-3 py-2 border-b border-gray-100">
                        <p className="text-xs font-medium text-gray-500 uppercase">Select Language</p>
                      </div>
                      {data.languages?.availableLanguages.map((lang: LanguageInfo) => (
                        <button
                          key={lang.code}
                          onClick={() => handleLanguageChange(lang.code)}
                          className={`w-full px-3 py-2.5 flex items-center gap-3 hover:bg-gray-50 transition ${
                            currentLanguage === lang.code ? 'bg-orange-50 text-orange-600' : 'text-gray-700'
                          }`}
                        >
                          <span className="text-xl">{lang.flag}</span>
                          <div className="text-left">
                            <p className="font-medium text-sm">{lang.nativeName}</p>
                            <p className="text-xs text-gray-500">{lang.name}</p>
                          </div>
                          {currentLanguage === lang.code && (
                            <span className="ml-auto text-orange-500">✓</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Filter Button */}
            <button
              onClick={() => setIsFilterOpen(true)}
              className="bg-orange-500 text-white px-3 sm:px-4 py-2 rounded-full font-semibold flex items-center gap-2 hover:bg-orange-600 transition relative"
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Page Title */}
      <div className="max-w-4xl mx-auto px-4 py-4 sm:py-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Menu</h1>
        {data.menu.description && (
          <p className="text-gray-600 mt-1">{data.menu.description}</p>
        )}
      </div>

      {/* Menu Sections */}
      <main className="max-w-4xl mx-auto px-4">
        {Object.keys(groupedItems).length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No items found matching your filters.
            </p>
          </div>
        ) : (
          Object.entries(groupedItems).map(([categoryName, items]) => (
            <MenuSection
              key={categoryName}
              title={categoryName}
              items={items}
              tags={data.tags}
            />
          ))
        )}
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-30">
        <div className="max-w-4xl mx-auto px-4 py-2 sm:py-3 flex items-center justify-center gap-4 sm:gap-6">
          <button className="text-gray-600 hover:text-blue-600 transition flex items-center gap-1 sm:gap-2">
            <Facebook className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-xs sm:text-sm font-medium hidden sm:inline">
              Facebook
            </span>
          </button>
          <button className="text-gray-600 hover:text-pink-600 transition flex items-center gap-1 sm:gap-2">
            <Instagram className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-xs sm:text-sm font-medium hidden sm:inline">
              Instagram
            </span>
          </button>
          <Link
             href="/feedback"
             className="bg-orange-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-semibold flex items-center gap-1 sm:gap-2 hover:bg-orange-600 transition text-xs sm:text-sm"
              >
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Feedback</span>
          </Link>
        </div>
      </footer>

      {/* Filter Modal */}
      <FilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        onApplyFilters={setFilters}
        types={data.types}
        categories={data.categories}
        tags={data.tags}
      />
    </div>
  );
};

export default MenuPage;
