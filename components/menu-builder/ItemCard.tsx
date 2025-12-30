'use client';

import { Edit, Trash2, Globe, Percent, ImageIcon } from 'lucide-react';
import { Item, MenuData } from './types';

interface ItemCardProps {
  item: Item;
  menu?: MenuData | null;
  onEdit: (item: Item) => void;
  onDelete: (itemId: string, itemName: string) => void;
  onTranslate: (type: string, id: string, name: string) => void;
}

export function ItemCard({ item, menu, onEdit, onDelete, onTranslate }: ItemCardProps) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all group bg-white">
      <div className="relative">
        {item.image ? (
          <img src={item.image} alt={item.name} className="w-full h-40 object-cover" />
        ) : (
          <div className="w-full h-40 bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
            <ImageIcon className="w-12 h-12 text-orange-400" />
          </div>
        )}
        {item.isPromotion && (
          <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <Percent className="w-3 h-3" />
            SALE
          </div>
        )}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
          {(menu?.supportedLanguages?.length || 0) > 1 && (
            <button onClick={() => onTranslate('item', item.id, item.name)} className="p-2 bg-white rounded-lg shadow-lg hover:bg-blue-50" title="Translate">
              <Globe className="w-4 h-4 text-blue-600" />
            </button>
          )}
          <button onClick={() => onEdit(item)} className="p-2 bg-white rounded-lg shadow-lg hover:bg-gray-50">
            <Edit className="w-4 h-4 text-gray-700" />
          </button>
          <button onClick={() => onDelete(item.id, item.name)} className="p-2 bg-white rounded-lg shadow-lg hover:bg-red-50">
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2">{item.name}</h3>
        {item.description && (
          <p className="text-sm text-gray-500 mb-2 line-clamp-2">{item.description}</p>
        )}
        <div className="flex items-center justify-between mb-3">
          {item.isPromotion && item.originalPrice ? (
            <div className="flex items-baseline gap-2">
              <span className="text-gray-400 line-through text-sm">{item.originalPrice.toFixed(0)} DA</span>
              <span className="text-xl font-bold text-green-600">{item.price?.toFixed(0) || '0'} DA</span>
            </div>
          ) : (
            <span className="text-xl font-bold text-orange-600">{item.price?.toFixed(0) || '0'} DA</span>
          )}
        </div>
        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {item.tags.map(tag => (
              <span
                key={tag.id}
                className="px-2 py-0.5 text-xs rounded-full font-medium"
                style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

