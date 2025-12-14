"use client";

import { useMemo, useState, useEffect } from "react";
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
import { MenuHeader } from "./components/MenuHeader";
import { FiltersSheet } from "./components/FiltersSheet";
import { ItemCard } from "./components/ItemCard";
import { ItemModal } from "./components/ItemModal";
import { useRouter, useParams } from "next/navigation";

// ---- Page ----

export default function MenuPage() {
  const params = useParams();
  const menuId = params?.menuId as string;
  const router = useRouter();

  // State for data fetched from API
  const [profile, setProfile] = useState<ProfileView | null>(null);
  const [menu, setMenu] = useState<MenuView | null>(null);
  const [types, setTypes] = useState<TypeView[]>([]);
  const [categories, setCategories] = useState<CategoryView[]>([]);
  const [tags, setTags] = useState<TagView[]>([]);
  const [items, setItems] = useState<ItemView[]>([]);
  
  // UI state
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<FiltersState>({});
  const [selectedItem, setSelectedItem] = useState<ItemView | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch menu data from API
  useEffect(() => {
    const fetchMenuData = async () => {
      if (!menuId) return;

      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/public/menu/${menuId}`);
        
        if (!response.ok) {
          throw new Error(`Menu not found`);
        }

        const data = await response.json();

        // Transform API response to component state
        setProfile({
          id: data.restaurant.id,
          name: data.restaurant.name,
          logo: data.menu.logoUrl,
          phone: data.restaurant.phone,
          website: data.restaurant.website,
          wifiName: undefined,
          wifiPassword: undefined,
          mapUrl: undefined,
          socialLinks: data.restaurant.socialLinks || {},
          businessHours: {
            openNow: true,
            label: "Open",
          },
        });

        setMenu({
          id: data.menu.id,
          name: data.menu.name,
          description: data.menu.description,
          defaultLanguage: data.languages.default,
          supportedLanguages: data.languages.supported,
        });

        setTypes(data.types);
        setCategories(data.categories);
        setTags(data.tags);

        // Transform items to include tag objects
        const transformedItems = data.items.map((item: any) => ({
          ...item,
          tags: item.tags
            .map((tagId: string) => data.tags.find((t: TagView) => t.id === tagId))
            .filter(Boolean) as TagView[],
        }));

        setItems(transformedItems);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching menu:", err);
        setError(err instanceof Error ? err.message : "Failed to load menu");
        setIsLoading(false);
      }
    };

    fetchMenuData();
  }, [menuId]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
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
  }, [filters, items]);


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
    types.find((t) => t.id === id)?.name ?? "Other";

  const getCategoryName = (id?: string | null) =>
    categories.find((c) => c.id === id)?.name ?? "";
  
  const handleOpenFeedback = () => {
    if (profile) {
      router.push(`/feedback?profileId=${profile.id}`);
    }
  };

  const handleGiveFeedbackFromModal = () => {
    setSelectedItem(null);
    handleOpenFeedback();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 mb-4">
            <div className="h-6 w-6 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin" />
          </div>
          <p className="text-gray-600">Loading menu...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !profile || !menu) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex items-center justify-center">
        <div className="text-center max-w-sm mx-4">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
            <Search className="h-6 w-6 text-red-600" />
          </div>
          <p className="text-gray-900 font-semibold mb-2">Menu Not Found</p>
          <p className="text-gray-600 text-sm">{error || "The menu you are looking for does not exist or is not available."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <MenuHeader
        profile={profile}
        menu={menu}
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
              {profile.phone && (
                <a
                  href={`tel:${profile.phone}`}
                  className="inline-flex items-center gap-2 rounded-xl bg-orange-50 px-4 py-2.5 text-sm font-medium text-orange-900 hover:bg-orange-100 transition-colors"
                >
                  <Phone className="h-4 w-4" />
                  <span>{profile.phone}</span>
                </a>
              )}

              {profile.website && (
                <a
                  href={profile.website}
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

              {profile.mapUrl && (
                <a
                  href={profile.mapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-orange-50 px-4 py-2.5 text-sm font-medium text-orange-900 hover:bg-orange-100 transition-colors"
                >
                  <MapPin className="h-4 w-4" />
                  <span>View Map</span>
                </a>
              )}
            </div>

            {/* WiFi - Not available from API yet */}

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
        types={types}
        categories={categories}
        tags={tags}
      />

      <ItemModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onGiveFeedback={handleGiveFeedbackFromModal}
      />
    </div>
  );
}
