'use client';

import { X, Loader2 } from 'lucide-react';
import { ImageUpload } from '@/components/ui/ImageUpload';

interface TypeModalProps {
  type: { name: string; image: string };
  saving: boolean;
  onClose: () => void;
  onSave: () => void;
  onTypeChange: (type: { name: string; image: string }) => void;
  onReset: () => void;
}

export function TypeModal({
  type,
  saving,
  onClose,
  onSave,
  onTypeChange,
  onReset,
}: TypeModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-lg w-full p-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Create New Type</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g., Lunch, Dinner, Breakfast, All Day"
              value={type.name}
              onChange={(e) => onTypeChange({ ...type, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              autoFocus
            />
            <p className="text-xs text-gray-500 mt-1">Types help organize when items are available (e.g., Breakfast, Lunch, Dinner)</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type Image (optional)</label>
            <ImageUpload
              value={type.image || null}
              onChange={(url) => onTypeChange({ ...type, image: url || '' })}
              folder="qr-menus/types"
              aspectRatio="video"
              placeholder="Upload type image"
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
            disabled={saving || !type.name.trim()}
            className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Create Type
          </button>
        </div>
      </div>
    </div>
  );
}

