"use client";

import { useMemo, useState } from "react";
import { Search, Phone, Globe, Wifi, MapPin, Star } from "lucide-react";
import {
  ProfileView,
  MenuView,
  TypeView,
  CategoryView,
  TagView,
  ItemView,
  FiltersState,
} from "./types";
import { MenuHeader } from "../../../../components/user_view/MenuHeader";
import { FiltersSheet } from "../../../../components/user_view/FiltersSheet";
import { ItemCard } from "../../../../components/user_view/ItemCard";
import { ItemModal } from "../../../../components/user_view/ItemModal";
import { useRouter } from "next/navigation";

// ---- Mock data (same as your single file) ----

const mockProfile: ProfileView = {
  id: "profile1",
  name: "La Trattoria Italiana",
  logo:
    "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=200&h=200&fit=crop",
  phone: "+213 555 123 456",
  website: "https://latrattoria.example.com",
  wifiName: "LaTrattoriaWiFi",
  wifiPassword: "askwaiter",
  mapUrl: "https://maps.google.com",
  socialLinks: {
    instagram: "https://instagram.com",
    facebook: "https://facebook.com",
  },
  businessHours: {
    openNow: true,
    label: "Open until 23:00",
  },
};

const mockMenu: MenuView = {
  id: "menu1",
  name: "Main Menu",
  description: "Our signature Italian dishes",
  defaultLanguage: "en",
  supportedLanguages: ["en", "fr"],
};

const mockTypes: TypeView[] = [
  { id: "t1", name: "Breakfast" },
  { id: "t2", name: "Lunch" },
  { id: "t3", name: "Dinner" },
];

const mockCategories: CategoryView[] = [
  { id: "c1", name: "Pizzas", typeId: "t3" },
  { id: "c2", name: "Pastas", typeId: "t3" },
  { id: "c3", name: "Drinks", typeId: "t2" },
];

const mockTags: TagView[] = [
  { id: "tag1", name: "Spicy", color: "#ff6b35" },
  { id: "tag2", name: "Vegetarian", color: "#4caf50" },
  { id: "tag3", name: "Popular", color: "#ff9800" },
];

const mockItems: ItemView[] = [
  {
    id: "i1",
    name: "Margherita Pizza",
    description:
      "Classic pizza with tomato sauce, mozzarella, and basil.",
    image:
      "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&h=400&fit=crop",
    price: 1200,
    originalPrice: 1400,
    isPromotion: true,
    typeId: "t3",
    categoryId: "c1",
    tags: [mockTags[1], mockTags[2]],
  },
  {
    id: "i2",
    name: "Arrabbiata Pasta",
    description: "Penne pasta with spicy tomato sauce and chili.",
    image:
      "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600&h=400&fit=crop",
    price: 1300,
    isPromotion: false,
    typeId: "t3",
    categoryId: "c2",
    tags: [mockTags[0]],
  },
  {
    id: "i3",
    name: "Fresh Orange Juice",
    description: "Freshly squeezed oranges.",
    image:
      "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600&h=400&fit=crop",
    price: 600,
    isPromotion: false,
    typeId: "t2",
    categoryId: "c3",
    tags: [],
  },
];

// ---- Page ----

export default function MenuPage() {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<FiltersState>({});
  const [selectedItem, setSelectedItem] = useState<ItemView | null>(null);
  
  
  

  const filteredItems = useMemo(() => {
  return mockItems.filter((item) => {
    if (filters.typeIds && filters.typeIds.length > 0 && !filters.typeIds.includes(item.typeId ?? "")) {
      return false;
    }
    if (
      filters.categoryIds &&
      filters.categoryIds.length > 0 &&
      !filters.categoryIds.includes(item.categoryId ?? "")
    ) {
      return false;
    }
    if (filters.tagIds && filters.tagIds.length > 0) {
      const itemTagIds = item.tags.map((t) => t.id);
      const hasAny = filters.tagIds.some((id) => itemTagIds.includes(id));
      if (!hasAny) return false;
    }
    if (filters.minPrice !== undefined && item.price < filters.minPrice) {
      return false;
    }
    if (filters.maxPrice !== undefined && item.price > filters.maxPrice) {
      return false;
    }
    return true;
  });
}, [filters]);


  const itemsByType = useMemo(() => {
    const byType: Record<string, ItemView[]> = {};
    for (const item of filteredItems) {
      const key = item.typeId ?? "other";
      if (!byType[key]) byType[key] = [];
      byType[key].push(item);
    }
    return byType;
  }, [filteredItems]);

  const getTypeName = (id?: string | null) =>
    mockTypes.find((t) => t.id === id)?.name ?? "Other";

  const getCategoryName = (id?: string | null) =>
    mockCategories.find((c) => c.id === id)?.name ?? "";
  
  const router = useRouter();
  const handleOpenFeedback = () => {
    router.push(`/feedback?profileId=${mockProfile.id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <MenuHeader
        profile={mockProfile}
        menu={mockMenu}
        onOpenFilters={() => setFiltersOpen(true)}
      />

      <main className="mx-auto max-w-3xl space-y-8 px-4 pb-8 pt-6">
        {/* Items grouped by type and category */}
        <div className="space-y-8">
          {Object.entries(itemsByType).map(([typeId, items]) => (
            <section key={typeId} className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-orange-500" />
                <h2 className="text-xl font-bold text-gray-900">
                  {getTypeName(typeId)}
                </h2>
                <div className="h-px flex-1 bg-gradient-to-r from-orange-200 to-transparent" />
              </div>

              <div className="space-y-6">
                {Object.entries(
                  items.reduce<Record<string, ItemView[]>>(
                    (acc, item) => {
                      const cid = item.categoryId ?? "none";
                      if (!acc[cid]) acc[cid] = [];
                      acc[cid].push(item);
                      return acc;
                    },
                    {}
                  )
                ).map(([categoryId, catItems]) => (
                  <div key={categoryId} className="space-y-3">
                    {categoryId !== "none" && (
                      <h3 className="text-sm font-semibold uppercase tracking-wide text-orange-600">
                        {getCategoryName(categoryId)}
                      </h3>
                    )}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {catItems.map((item) => (
                        <ItemCard
                          key={item.id}
                          item={item}
                          onOpen={setSelectedItem}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}

          {filteredItems.length === 0 && (
            <div className="py-16 text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
                <Search className="h-8 w-8 text-orange-500" />
              </div>
              <p className="text-sm text-gray-500">
                No items match your filters.
              </p>
            </div>
          )}
        </div>

        {/* Restaurant info section */}
        <section className="mt-8 space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-1 w-1 rounded-full bg-orange-500" />
            <h2 className="text-xl font-bold text-gray-900">
              Restaurant Info
            </h2>
            <div className="h-px flex-1 bg-gradient-to-r from-orange-200 to-transparent" />
          </div>

          <div className="space-y-4 rounded-2xl border-2 border-orange-100 bg-white p-6 shadow-lg">
            {/* Contact */}
            <div className="flex flex-wrap gap-3">
              {mockProfile.phone && (
                <a
                  href={`tel:${mockProfile.phone}`}
                  className="inline-flex items-center gap-2 rounded-xl bg-orange-50 px-4 py-2.5 text-sm font-medium text-orange-900 hover:bg-orange-100 transition-colors"
                >
                  <Phone className="h-4 w-4" />
                  <span>{mockProfile.phone}</span>
                </a>
              )}

              {mockProfile.website && (
                <a
                  href={mockProfile.website}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-orange-50 px-4 py-2.5 text-sm font-medium text-orange-900 hover:bg-orange-100 transition-colors"
                >
                  <Globe className="h-4 w-4" />
                  <span className="max-w-[140px] truncate">
                    Website
                  </span>
                </a>
              )}

              {mockProfile.mapUrl && (
                <a
                  href={mockProfile.mapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-orange-50 px-4 py-2.5 text-sm font-medium text-orange-900 hover:bg-orange-100 transition-colors"
                >
                  <MapPin className="h-4 w-4" />
                  <span>View Map</span>
                </a>
              )}
            </div>

            {/* WiFi */}
            {(mockProfile.wifiName || mockProfile.wifiPassword) && (
              <div className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-50 to-orange-100 px-4 py-3 text-sm">
                <Wifi className="h-4 w-4 text-orange-600" />
                <span className="font-semibold text-orange-900">
                  Wi‑Fi:
                </span>
                <span className="font-bold text-orange-700">
                  {mockProfile.wifiName ?? "N/A"}
                </span>
                <span className="text-orange-600">/</span>
                <span className="text-orange-900">
                  {mockProfile.wifiPassword ?? "Ask staff"}
                </span>
              </div>
            )}

            {/* Feedback button */}
            <button
              type="button"
              onClick={handleOpenFeedback}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:from-orange-600 hover:to-orange-700 hover:shadow-xl"
            >
              <Star className="h-4 w-4" />
              Leave Feedback
            </button>
          </div>
        </section>
      </main>

      <FiltersSheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        filters={filters}
        onChange={setFilters}
        types={mockTypes}
        categories={mockCategories}
        tags={mockTags}
      />

      <ItemModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </div>
  );
}
