'use client';

import { X, Tag as TagIcon, Loader2 } from 'lucide-react';

interface TagModalProps {
  tag: { name: string; color: string };
  saving: boolean;
  onClose: () => void;
  onSave: () => void;
  onTagChange: (tag: { name: string; color: string }) => void;
  onReset: () => void;
}

export function TagModal({
  tag,
  saving,
  onClose,
  onSave,
  onTagChange,
  onReset,
}: TagModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-lg w-full p-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Create New Tag</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tag Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <TagIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="e.g., Vegan, Spicy, Popular"
                value={tag.name}
                onChange={(e) => onTagChange({ ...tag, name: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tag Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={tag.color}
                onChange={(e) => onTagChange({ ...tag, color: e.target.value })}
                className="w-12 h-12 rounded-lg cursor-pointer border-0"
              />
              <div
                className="px-4 py-2 rounded-full text-sm font-medium"
                style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
              >
                {tag.name || 'Preview'}
              </div>
            </div>
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
            disabled={saving || !tag.name.trim()}
            className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Create Tag
          </button>
        </div>
      </div>
    </div>
  );
}

