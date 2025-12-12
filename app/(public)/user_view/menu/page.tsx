"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Filter,
  Globe,
  ChevronDown,
  MapPin,
  Phone,
  Sparkles,
  Star,
} from "lucide-react";
import { useSearchParams } from "next/navigation";

import { Filters, Item, MenuData, LanguageInfo } from "./menu.types";
import FilterModal from "./components/FilterModal";
import MenuSection from "./components/MenuSection";

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

  const fetchData = useCallback(
    async (lang?: string) => {
      try {
        setLoading(true);
        setError(null);

      if (!menuId) {
        setError("No menu specified");
        return;
      }

        const langParam = lang ? `?lang=${lang}` : "";
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

        if (menuData.languages?.current) {
          setCurrentLanguage(menuData.languages.current);
        }
      } catch (err) {
        console.error("Error fetching menu:", err);
        setError("Failed to load menu");
      } finally {
        setLoading(false);
      }
    },
    [menuId]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleLanguageChange = (langCode: string) => {
    setIsLanguageOpen(false);
    if (langCode !== currentLanguage) {
      setCurrentLanguage(langCode);
      fetchData(langCode);
    }
  };

  const currentLangInfo = data?.languages?.availableLanguages?.find(
    (l) => l.code === currentLanguage
  );
  const isRTL = currentLangInfo?.direction === "rtl";

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

  const filteredItems = data.items.filter((item) => {
    if (filters.typeIds.length > 0 && !filters.typeIds.includes(item.typeId || "")) {
      return false;
    }

    if (
      filters.categoryIds.length > 0 &&
      !filters.categoryIds.includes(item.categoryId || "")
    ) {
      return false;
    }

    if (filters.tagIds.length > 0) {
      const hasMatchingTag = item.tags.some((tag) => filters.tagIds.includes(tag));
      if (!hasMatchingTag) return false;
    }

    if (item.price !== null) {
      if (item.price < filters.priceRange[0] || item.price > filters.priceRange[1]) {
        return false;
      }
    }

    return true;
  });

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

  const heroStats = [
    { label: "Categories", value: data.categories.length },
    { label: "Items", value: data.items.length },
    { label: "Languages", value: data.languages?.availableLanguages.length ?? 1 },
  ];

  const highlightTags = data.tags.slice(0, 4);
  const topPromotions = filteredItems.filter((item) => item.isPromotion).slice(0, 3);

  const restaurantLocation = data.restaurant?.location;
  const locationLabel = restaurantLocation
    ? [
        restaurantLocation.address,
        restaurantLocation.city,
        restaurantLocation.country,
      ]
        .filter(Boolean)
        .join(" • ")
    : "Location details coming soon";

  const actions = [
    {
      icon: Phone,
      label: "Call",
      value: data.restaurant?.phone,
      href: data.restaurant?.phone ? `tel:${data.restaurant.phone}` : undefined,
    },
    {
      icon: MapPin,
      label: "Visit",
      value: locationLabel,
    },
    {
      icon: Globe,
      label: "Website",
      value: data.restaurant?.website,
      href: data.restaurant?.website,
    },
  ].filter((action) => Boolean(action.value));

  const heroBadge = data.menu.description ? data.menu.description : "Digital curated menu";

  return (
    <div
      className={`min-h-screen bg-[#fdfaf7] pb-16 ${isRTL ? "rtl" : "ltr"}`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <header className="relative overflow-hidden rounded-b-[32px] bg-gradient-to-br from-orange-500 via-amber-500 to-rose-500 text-white shadow-lg">
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.4),_transparent_60%)]" />
        <div className="relative z-10 mx-auto max-w-5xl px-4 py-10 space-y-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-white/30 p-1 shadow-lg">
              <img
                src={data.menu.logoUrl}
                alt={data.menu.name}
                className="h-full w-full rounded-xl object-cover"
              />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-white/80">
                Digital Menu
              </p>
              <h1 className="text-3xl sm:text-4xl font-bold">{data.menu.name}</h1>
              {heroBadge && (
                <p className="text-sm sm:text-base text-white/90 mt-1 max-w-2xl">
                  {heroBadge}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {heroStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-white/30 bg-white/20 px-4 py-3 backdrop-blur"
              >
                <p className="text-sm uppercase tracking-wide text-white/80">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsFilterOpen(true)}
              className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-orange-600 shadow-lg hover:bg-white/90 transition"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {data.languages?.availableLanguages && data.languages.availableLanguages.length > 1 && (
              <div className="relative">
                <button
                  onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                  className="flex items-center gap-2 rounded-full border border-white/50 bg-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/30"
                >
                  <Globe className="w-4 h-4" />
                  <span className="truncate">
                    {currentLangInfo?.flag} {currentLangInfo?.nativeName}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${isLanguageOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {isLanguageOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-white/30 bg-white text-gray-900 shadow-2xl">
                    <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Select Language
                    </div>
                    {data.languages.availableLanguages.map((lang: LanguageInfo) => (
                      <button
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang.code)}
                        className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition hover:bg-gray-50 ${
                          currentLanguage === lang.code ? "bg-orange-50 text-orange-600" : "text-gray-800"
                        }`}
                      >
                        <span className="text-xl">{lang.flag}</span>
                        <div>
                          <p className="font-semibold">{lang.nativeName}</p>
                          <p className="text-xs text-gray-500">{lang.name}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto mt-8 max-w-5xl px-4 space-y-8">
        <section className="grid gap-4 rounded-3xl bg-white/60 p-5 shadow-lg border border-gray-100 sm:grid-cols-3">
          {actions.map((action) => (
            <div
              key={action.label}
              className="flex items-start gap-3 rounded-2xl border border-gray-200 bg-white/80 px-3 py-3 shadow-sm"
            >
              <action.icon className="w-5 h-5 text-orange-500" />
              <div className="text-sm">
                <p className="text-xs uppercase tracking-[0.3em] text-gray-400">{action.label}</p>
                {action.href ? (
                  <a
                    href={action.href}
                    target={action.href.startsWith("http") ? "_blank" : undefined}
                    rel={action.href.startsWith("http") ? "noreferrer" : undefined}
                    className="text-base font-semibold text-gray-900 hover:text-orange-500"
                  >
                    {action.value}
                  </a>
                ) : (
                  <p className="text-base font-semibold text-gray-900">{action.value}</p>
                )}
              </div>
            </div>
          ))}
        </section>

        {highlightTags.length > 0 && (
          <section className="rounded-3xl border border-dashed border-gray-200 bg-white/70 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-gray-400">Chef&apos;s Picks</p>
                <h3 className="text-xl font-bold text-gray-900">Featured tags</h3>
              </div>
              <Sparkles className="text-orange-500" />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {highlightTags.map((tag) => (
                <span
                  key={tag.id}
                  className="inline-flex items-center rounded-2xl px-4 py-2 text-sm font-semibold text-white"
                  style={{ backgroundColor: tag.color }}
                >
                  {tag.name}
                </span>
              ))}
            </div>
          </section>
        )}

        {topPromotions.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-gray-500">Limited time</p>
                <h3 className="text-2xl font-bold text-gray-900">Chef&apos;s specials</h3>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {topPromotions.map((item) => (
                <div key={item.id} className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-sm font-semibold text-gray-500">{item.categoryId ? data.categories.find((cat) => cat.id === item.categoryId)?.name : "Signature"}</p>
                    <span className="text-xs text-green-600 font-semibold">Sale</span>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-lg font-bold text-gray-900">{item.name}</h4>
                    {item.description && (
                      <p className="text-sm text-gray-500 line-clamp-3">{item.description}</p>
                    )}
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      {item.originalPrice && (
                        <p className="text-xs text-gray-400 line-through">{item.originalPrice} DZD</p>
                      )}
                      <p className="text-xl font-bold text-gray-900">{item.price} DZD</p>
                    </div>
                    <Star className="text-yellow-500" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <main className="space-y-10">
          {Object.keys(groupedItems).length === 0 ? (
            <div className="rounded-3xl border border-dashed border-gray-200 bg-white p-8 text-center text-gray-500">
              <p className="text-lg">No items found matching your filters.</p>
              <p className="text-sm text-gray-400">Try toggling a different category or price range.</p>
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
      </div>

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
