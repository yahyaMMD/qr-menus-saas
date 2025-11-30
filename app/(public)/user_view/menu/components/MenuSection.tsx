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
    <section className="mb-6 sm:mb-8">
      <div className="mb-3 sm:mb-4">
        <h2 className="font-bold text-lg sm:text-xl text-gray-900 capitalize">
          {title}
        </h2>
        <p className="text-gray-500 text-sm">{items.length} items</p>
      </div>

      <div>
        {items.map((item) => (
          <MenuItemCard key={item.id} item={item} tags={tags} />
        ))}
      </div>
    </section>
  );
};

export default MenuSection;
