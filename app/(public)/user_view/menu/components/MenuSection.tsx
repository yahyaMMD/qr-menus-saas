"use client";

import React from "react";
import { Item, Tag } from "../menu.types";
import MenuItemCard from "./MenuItemCard";

interface MenuSectionProps {
  title: string;
  items: Item[];
  tags: Tag[];
}

const MenuSection: React.FC<MenuSectionProps> = ({ title, items, tags }) => {
  if (items.length === 0) return null;

  return (
    <section className="space-y-5 rounded-3xl border border-gray-200 bg-white/80 p-6 shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 capitalize">{title}</h2>
          <p className="text-sm text-gray-500">{items.length} delicious options</p>
        </div>
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-orange-500">
          Menu curated
        </span>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <MenuItemCard key={item.id} item={item} tags={tags} />
        ))}
      </div>
    </section>
  );
};

export default MenuSection;
