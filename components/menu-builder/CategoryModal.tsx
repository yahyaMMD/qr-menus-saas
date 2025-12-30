'use client';

import { X, Folder, Loader2 } from 'lucide-react';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { Category } from './types';

interface CategoryModalProps {
  isEdit?: boolean;
  category: Category | null;
  saving: boolean;
  onClose: () => void;
  onSave: () => void;
  onCategoryChange: (category: Category) => void;
  onReset: () => void;
}

export function CategoryModal({
  isEdit = false,
  category,
  saving,
  onClose,
  onSave,
  onCategoryChange,
  onReset,
}: CategoryModalProps) {
  if (!category) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-lg w-full p-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">
          {isEdit ? 'Edit Category' : 'Add New Category'}
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Folder className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="e.g., Appetizers, Main Courses"
                value={category.name}
                onChange={(e) => onCategoryChange({ ...category, name: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category Image <span className="text-gray-400">(optional)</span>
            </label>
            <ImageUpload
              value={category.image || null}
              onChange={(url) => onCategoryChange({ ...category, image: url || undefined })}
              folder="qr-menus/categories"
              aspectRatio="video"
              placeholder="Upload category image"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={() => { onReset(); onClose(); }}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={saving || !category.name.trim()}
            className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {isEdit ? 'Update' : 'Add'} Category
          </button>
        </div>
      </div>
    </div>
  );
}

