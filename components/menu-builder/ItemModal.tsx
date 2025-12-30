'use client';

import { X, Plus, Percent, Banknote, Loader2 } from 'lucide-react';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { ItemForm, Category, Type, Tag } from './types';

interface ItemModalProps {
  isEdit?: boolean;
  itemForm: ItemForm;
  categories: Category[];
  types: Type[];
  tags: Tag[];
  saving: boolean;
  onClose: () => void;
  onSave: () => void;
  onFormChange: (form: ItemForm) => void;
  onShowAddTag: () => void;
  onResetForm: () => void;
}

export function ItemModal({
  isEdit = false,
  itemForm,
  categories,
  types,
  tags,
  saving,
  onClose,
  onSave,
  onFormChange,
  onShowAddTag,
  onResetForm,
}: ItemModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h3 className="text-2xl font-bold text-gray-900">
            {isEdit ? 'Edit Menu Item' : 'Add New Menu Item'}
          </h3>
          <button
            onClick={() => { onResetForm(); onClose(); }}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Item Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g., Avocado Toast"
              value={itemForm.name}
              onChange={(e) => onFormChange({ ...itemForm, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Category & Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={itemForm.categoryId}
                onChange={(e) => onFormChange({ ...itemForm, categoryId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">No Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                value={itemForm.typeId}
                onChange={(e) => onFormChange({ ...itemForm, typeId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">No Type</option>
                {types.map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Pricing with Promotion */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={itemForm.isPromotion}
                  onChange={(e) => onFormChange({ ...itemForm, isPromotion: e.target.checked })}
                  className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
                />
                <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <Percent className="w-4 h-4" />
                  This item is on promotion
                </span>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {itemForm.isPromotion && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Original Price <span className="text-gray-400">(strikethrough)</span>
                  </label>
                  <div className="relative">
                    <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      step="1"
                      placeholder="1500"
                      value={itemForm.originalPrice}
                      onChange={(e) => onFormChange({ ...itemForm, originalPrice: e.target.value })}
                      className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">DA</span>
                  </div>
                </div>
              )}
              <div className={itemForm.isPromotion ? '' : 'col-span-2'}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {itemForm.isPromotion ? 'Sale Price' : 'Price'}
                  {itemForm.isPromotion && <span className="text-green-600 ml-1">(promotional)</span>}
                </label>
                <div className="relative">
                  <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    step="1"
                    placeholder="1200"
                    value={itemForm.price}
                    onChange={(e) => onFormChange({ ...itemForm, price: e.target.value })}
                    className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">DA</span>
                </div>
              </div>
            </div>

            {/* Promotion Preview */}
            {itemForm.isPromotion && itemForm.originalPrice && itemForm.price && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-800 font-medium flex items-center gap-2">
                  <Percent className="w-4 h-4" />
                  Promotion Preview:
                </p>
                <div className="flex items-baseline gap-3 mt-1">
                  <span className="text-gray-500 line-through text-lg">{parseFloat(itemForm.originalPrice).toFixed(0)} DA</span>
                  <span className="text-green-600 font-bold text-2xl">{parseFloat(itemForm.price).toFixed(0)} DA</span>
                  <span className="text-green-600 text-sm font-medium">
                    Save {Math.round((1 - parseFloat(itemForm.price) / parseFloat(itemForm.originalPrice)) * 100)}%
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              rows={3}
              placeholder="Describe your item..."
              value={itemForm.description}
              onChange={(e) => onFormChange({ ...itemForm, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Tags */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Tags</label>
              <button
                type="button"
                onClick={onShowAddTag}
                className="text-sm text-orange-600 hover:text-orange-700 flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                New Tag
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => {
                    const isSelected = itemForm.tagIds.includes(tag.id);
                    onFormChange({
                      ...itemForm,
                      tagIds: isSelected
                        ? itemForm.tagIds.filter(id => id !== tag.id)
                        : [...itemForm.tagIds, tag.id],
                    });
                  }}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${itemForm.tagIds.includes(tag.id)
                    ? 'ring-2 ring-offset-2 ring-orange-500'
                    : 'opacity-60 hover:opacity-100'
                    }`}
                  style={{
                    backgroundColor: `${tag.color}20`,
                    color: tag.color,
                    borderColor: tag.color,
                  }}
                >
                  {tag.name}
                </button>
              ))}
              {tags.length === 0 && (
                <p className="text-sm text-gray-500">No tags yet. Create one to categorize items.</p>
              )}
            </div>
          </div>

          {/* Item Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Item Image</label>
            <ImageUpload
              value={itemForm.image}
              onChange={(url) => onFormChange({ ...itemForm, image: url || '' })}
              folder="qr-menus/items"
              aspectRatio="video"
              placeholder="Upload item image"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex gap-3">
          <button
            onClick={() => { onResetForm(); onClose(); }}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={saving || !itemForm.name.trim()}
            className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {isEdit ? 'Update Item' : 'Add Item'}
          </button>
        </div>
      </div>
    </div>
  );
}

