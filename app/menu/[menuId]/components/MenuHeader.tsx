"use client";

import { Clock, Phone, Instagram, Facebook, MapPin, SlidersHorizontal } from "lucide-react";
import { ProfileView, MenuView } from "../types";

type Props = {
  profile: ProfileView;
  menu: MenuView;
  onOpenFilters: () => void;
};

export function MenuHeader({ profile, menu, onOpenFilters }: Props) {
  const statusLabel = profile.businessHours?.label ?? "Welcome";
  const openNow = profile.businessHours?.openNow ?? false;

  return (
    <header className="sticky top-0 z-20 bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg">
      <div className="mx-auto max-w-3xl px-4 py-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {profile.logo && (
              <img
                src={profile.logo}
                alt={profile.name}
                className="h-12 w-12 rounded-full object-cover border-2 border-white shadow-md"
              />
            )}
            <div className="flex flex-col">
              <h1 className="text-lg font-bold text-white">
                {profile.name}
              </h1>
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3 text-orange-100" />
                <span
                  className={`text-xs font-medium ${
                    openNow ? "text-green-200" : "text-orange-100"
                  }`}
                >
                  {statusLabel}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenFilters}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-orange-600 shadow-lg hover:shadow-xl transition-all"
            aria-label="Filters"
          >
            <SlidersHorizontal className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-white/90">
          {profile.phone && (
            <a
              href={`tel:${profile.phone}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 hover:bg-white/30 transition-colors"
            >
              <Phone className="h-3 w-3" />
              <span>{profile.phone}</span>
            </a>
          )}

          {profile.socialLinks?.instagram && (
            <a
              href={profile.socialLinks.instagram}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            >
              <Instagram className="h-4 w-4" />
            </a>
          )}

          {profile.socialLinks?.facebook && (
            <a
              href={profile.socialLinks.facebook}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            >
              <Facebook className="h-4 w-4" />
            </a>
          )}

          {profile.mapUrl && (
            <a
              href={profile.mapUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 hover:bg-white/30 transition-colors"
            >
              <MapPin className="h-3 w-3" />
              <span>Location</span>
            </a>
          )}
        </div>
      </div>
    </header>
  );
}
