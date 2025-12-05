'use client';

import React, { useState, useEffect, use } from 'react';
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Image as ImageIcon, 
  Banknote,
  QrCode,
  Download,
  Printer,
  Copy,
  Check,
  Folder,
  Tag as TagIcon,
  Percent,
  X,
  Loader2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getErrorPagePath } from '@/lib/error-redirect';

interface Tag {
  id: string;
  name: string;
  color: string;
}

interface Category {
  id: string;
  name: string;
  image?: string | null;
}

interface Type {
  id: string;
  name: string;
  image?: string | null;
}

interface Item {
  id: string;
  name: string;
  description?: string | null;
  price: number | null;
  originalPrice?: number | null;
  isPromotion: boolean;
  image?: string | null;
  categoryId?: string | null;
  typeId?: string | null;
  category?: { id: string; name: string } | null;
  type?: { id: string; name: string } | null;
  tags: Tag[];
}

interface MenuData {
  id: string;
  name: string;
  description?: string | null;
  profile: {
    id: string;
    name: string;
  };
}

export default function MenuBuilderPage({ 
  params 
}: { 
  params: Promise<{ profileId: string; menuId: string }> 
}) {
  const { profileId, menuId } = use(params);
  const router = useRouter();
  
  const [menu, setMenu] = useState<MenuData | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [types, setTypes] = useState<Type[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals
  const [showAddItem, setShowAddItem] = useState(false);
  const [showEditItem, setShowEditItem] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showEditCategory, setShowEditCategory] = useState(false);
  const [showAddTag, setShowAddTag] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  
  const [qrCodeSvg, setQrCodeSvg] = useState<string>('');
  const [isLoadingQR, setIsLoadingQR] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form states
  const [newCategory, setNewCategory] = useState({ name: '', image: '' });
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newTag, setNewTag] = useState({ name: '', color: '#f97316' });
  
  const [itemForm, setItemForm] = useState({
    id: '',
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    isPromotion: false,
    image: '',
    categoryId: '',
    typeId: '',
    tagIds: [] as string[],
  });

  // Get auth token
  const getToken = () => {
    let token = localStorage.getItem('accessToken');
    if (!token) {
      const authRaw = localStorage.getItem('auth');
      if (authRaw) {
        try {
          const auth = JSON.parse(authRaw);
          token = auth?.tokens?.accessToken;
        } catch (e) {
          console.error('Failed to parse auth', e);
        }
      }
    }
    return token;
  };

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      const token = getToken();
      if (!token) {
        router.push('/unauthorized');
        return;
      }

      try {
        setLoading(true);
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch menu details, categories, items, tags, types in parallel
        const [menuRes, categoriesRes, itemsRes, tagsRes, typesRes] = await Promise.all([
          fetch(`/api/menus/${menuId}`, { headers }),
          fetch(`/api/menus/${menuId}/categories`, { headers }),
          fetch(`/api/menus/${menuId}/items`, { headers }),
          fetch(`/api/menus/${menuId}/tags`, { headers }),
          fetch(`/api/menus/${menuId}/types`, { headers }),
        ]);

        // Check for auth errors
        for (const res of [menuRes, categoriesRes, itemsRes, tagsRes, typesRes]) {
          if (!res.ok) {
            const errorPath = getErrorPagePath(res.status);
            if (errorPath) {
              router.push(errorPath);
              return;
            }
          }
        }

        const [menuData, categoriesData, itemsData, tagsData, typesData] = await Promise.all([
          menuRes.json(),
          categoriesRes.json(),
          itemsRes.json(),
          tagsRes.json(),
          typesRes.json(),
        ]);

        setMenu(menuData);
        setCategories(categoriesData.categories || []);
        setItems(itemsData.items || []);
        setTags(tagsData.tags || []);
        setTypes(typesData.types || []);
      } catch (error) {
        console.error('Error fetching menu data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [menuId, router]);

  // Group items by category
  const itemsByCategory = categories.map(cat => ({
    ...cat,
    items: items.filter(item => item.categoryId === cat.id),
  }));

  // Uncategorized items
  const uncategorizedItems = items.filter(item => !item.categoryId);

  // Search filter
  const filteredItems = searchQuery
    ? items.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some(tag => tag.name.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : null;

  // CRUD Operations
  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) return;
    const token = getToken();
    setSaving(true);

    try {
      const response = await fetch(`/api/menus/${menuId}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: newCategory.name, image: newCategory.image || null }),
      });

      const data = await response.json();
      if (response.ok) {
        setCategories([...categories, data.category]);
        setNewCategory({ name: '', image: '' });
        setShowAddCategory(false);
      } else {
        alert(data.error || 'Failed to create category');
      }
    } catch (error) {
      console.error('Create category error:', error);
      alert('Failed to create category');
    } finally {
      setSaving(false);
    }
  };

  const handleEditCategory = async () => {
    if (!editingCategory?.name.trim()) return;
    const token = getToken();
    setSaving(true);

    try {
      const response = await fetch(`/api/menus/${menuId}/categories/${editingCategory.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: editingCategory.name, image: editingCategory.image || null }),
      });

      const data = await response.json();
      if (response.ok) {
        setCategories(categories.map(cat => cat.id === editingCategory.id ? data.category : cat));
        setEditingCategory(null);
        setShowEditCategory(false);
      } else {
        alert(data.error || 'Failed to update category');
      }
    } catch (error) {
      console.error('Update category error:', error);
      alert('Failed to update category');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string, categoryName: string) => {
    if (!confirm(`Delete "${categoryName}"? Items in this category will become uncategorized.`)) return;
    const token = getToken();

    try {
      const response = await fetch(`/api/menus/${menuId}/categories/${categoryId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setCategories(categories.filter(cat => cat.id !== categoryId));
        // Update items to remove category reference
        setItems(items.map(item => item.categoryId === categoryId ? { ...item, categoryId: null, category: null } : item));
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Delete category error:', error);
      alert('Failed to delete category');
    }
  };

  const handleAddTag = async () => {
    if (!newTag.name.trim()) return;
    const token = getToken();
    setSaving(true);

    try {
      const response = await fetch(`/api/menus/${menuId}/tags`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newTag),
      });

      const data = await response.json();
      if (response.ok) {
        setTags([...tags, data.tag]);
        setNewTag({ name: '', color: '#f97316' });
        setShowAddTag(false);
      } else {
        alert(data.error || 'Failed to create tag');
      }
    } catch (error) {
      console.error('Create tag error:', error);
      alert('Failed to create tag');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveItem = async () => {
    if (!itemForm.name.trim()) {
      alert('Item name is required');
      return;
    }
    const token = getToken();
    setSaving(true);

    const itemData = {
      name: itemForm.name,
      description: itemForm.description || null,
      price: itemForm.price ? parseFloat(itemForm.price) : null,
      originalPrice: itemForm.isPromotion && itemForm.originalPrice ? parseFloat(itemForm.originalPrice) : null,
      isPromotion: itemForm.isPromotion,
      image: itemForm.image || null,
      categoryId: itemForm.categoryId || null,
      typeId: itemForm.typeId || null,
      tagIds: itemForm.tagIds,
    };

    try {
      const isEdit = !!itemForm.id;
      const url = isEdit ? `/api/menus/${menuId}/items/${itemForm.id}` : `/api/menus/${menuId}/items`;
      const method = isEdit ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(itemData),
      });

      if (!response.ok) {
        const errorPath = getErrorPagePath(response.status);
        if (errorPath) {
          router.push(errorPath);
          return;
        }
      }

      const data = await response.json();
      if (response.ok) {
        if (isEdit) {
          setItems(items.map(item => item.id === itemForm.id ? data.item : item));
        } else {
          setItems([data.item, ...items]);
        }
        resetItemForm();
        setShowAddItem(false);
        setShowEditItem(false);
      } else {
        alert(data.error || 'Failed to save item');
      }
    } catch (error) {
      console.error('Save item error:', error);
      alert('Failed to save item');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteItem = async (itemId: string, itemName: string) => {
    if (!confirm(`Delete "${itemName}"?`)) return;
    const token = getToken();

    try {
      const response = await fetch(`/api/menus/${menuId}/items/${itemId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setItems(items.filter(item => item.id !== itemId));
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete item');
      }
    } catch (error) {
      console.error('Delete item error:', error);
      alert('Failed to delete item');
    }
  };

  const resetItemForm = () => {
    setItemForm({
      id: '',
      name: '',
      description: '',
      price: '',
      originalPrice: '',
      isPromotion: false,
      image: '',
      categoryId: '',
      typeId: '',
      tagIds: [],
    });
  };

  const openEditItem = (item: Item) => {
    setItemForm({
      id: item.id,
      name: item.name,
      description: item.description || '',
      price: item.price?.toString() || '',
      originalPrice: item.originalPrice?.toString() || '',
      isPromotion: item.isPromotion,
      image: item.image || '',
      categoryId: item.categoryId || '',
      typeId: item.typeId || '',
      tagIds: item.tags.map(t => t.id),
    });
    setShowEditItem(true);
  };

  // QR Code handlers
  const handleGenerateQR = async () => {
    setIsLoadingQR(true);
    setShowQRModal(true);
    try {
      const response = await fetch(`/api/qr/${menuId}?format=svg`);
      const svg = await response.text();
      setQrCodeSvg(svg);
    } catch (error) {
      console.error('Failed to generate QR code:', error);
    } finally {
      setIsLoadingQR(false);
    }
  };

  const handleDownloadQR = async (format: 'svg' | 'png') => {
    try {
      const response = await fetch(`/api/qr/${menuId}?format=${format}&size=1000`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `menu-qr-${menuId}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download QR code:', error);
    }
  };

  const handleCopyURL = () => {
    const menuUrl = `${window.location.origin}/menu/${profileId}?menuId=${menuId}`;
    navigator.clipboard.writeText(menuUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrintQR = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const menuUrl = `${window.location.origin}/menu/${profileId}?menuId=${menuId}`;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Code - ${menu?.name || 'Menu'}</title>
          <style>
            body { font-family: Arial, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; padding: 2rem; }
            .qr-container { text-align: center; max-width: 600px; }
            h1 { color: #f97316; font-size: 2rem; }
            p { color: #666; }
            .qr-code { margin: 2rem 0; }
            .url { margin-top: 1rem; padding: 0.5rem; background: #f3f4f6; border-radius: 4px; font-family: monospace; word-break: break-all; }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <h1>Scan to View Menu</h1>
            <p>${menu?.profile?.name || 'Restaurant'}</p>
            <div class="qr-code">${qrCodeSvg}</div>
            <div class="url"><strong>Direct link:</strong><br>${menuUrl}</div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  // Item Modal Component
  const ItemModal = ({ isEdit = false }: { isEdit?: boolean }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h3 className="text-2xl font-bold text-gray-900">
            {isEdit ? 'Edit Menu Item' : 'Add New Menu Item'}
          </h3>
          <button
            onClick={() => { resetItemForm(); isEdit ? setShowEditItem(false) : setShowAddItem(false); }}
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
              onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Category & Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={itemForm.categoryId}
                onChange={(e) => setItemForm({ ...itemForm, categoryId: e.target.value })}
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
                onChange={(e) => setItemForm({ ...itemForm, typeId: e.target.value })}
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
                  onChange={(e) => setItemForm({ ...itemForm, isPromotion: e.target.checked })}
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
                      onChange={(e) => setItemForm({ ...itemForm, originalPrice: e.target.value })}
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
                    onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
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
              onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Tags */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Tags</label>
              <button
                type="button"
                onClick={() => setShowAddTag(true)}
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
                    setItemForm({
                      ...itemForm,
                      tagIds: isSelected
                        ? itemForm.tagIds.filter(id => id !== tag.id)
                        : [...itemForm.tagIds, tag.id],
                    });
                  }}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    itemForm.tagIds.includes(tag.id)
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

          {/* Image URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
            <input
              type="url"
              placeholder="https://example.com/image.jpg"
              value={itemForm.image}
              onChange={(e) => setItemForm({ ...itemForm, image: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            {itemForm.image && (
              <div className="mt-2 relative w-32 h-32 rounded-lg overflow-hidden border border-gray-200">
                <img src={itemForm.image} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex gap-3">
          <button
            onClick={() => { resetItemForm(); isEdit ? setShowEditItem(false) : setShowAddItem(false); }}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveItem}
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

  // Category Modal
  const CategoryModal = ({ isEdit = false }: { isEdit?: boolean }) => (
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
                value={isEdit ? editingCategory?.name || '' : newCategory.name}
                onChange={(e) => isEdit 
                  ? setEditingCategory({ ...editingCategory!, name: e.target.value })
                  : setNewCategory({ ...newCategory, name: e.target.value })
                }
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                autoFocus
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={() => {
              isEdit ? setShowEditCategory(false) : setShowAddCategory(false);
              setEditingCategory(null);
              setNewCategory({ name: '', image: '' });
            }}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={isEdit ? handleEditCategory : handleAddCategory}
            disabled={saving || !(isEdit ? editingCategory?.name.trim() : newCategory.name.trim())}
            className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {isEdit ? 'Update' : 'Add'} Category
          </button>
        </div>
      </div>
    </div>
  );

  // Tag Modal
  const TagModal = () => (
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
                value={newTag.name}
                onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
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
                value={newTag.color}
                onChange={(e) => setNewTag({ ...newTag, color: e.target.value })}
                className="w-12 h-12 rounded-lg cursor-pointer border-0"
              />
              <div
                className="px-4 py-2 rounded-full text-sm font-medium"
                style={{ backgroundColor: `${newTag.color}20`, color: newTag.color }}
              >
                {newTag.name || 'Preview'}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={() => { setShowAddTag(false); setNewTag({ name: '', color: '#f97316' }); }}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleAddTag}
            disabled={saving || !newTag.name.trim()}
            className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Create Tag
          </button>
        </div>
      </div>
    </div>
  );

  // QR Code Modal
  const QRCodeModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">QR Code</h3>
          <button onClick={() => setShowQRModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {isLoadingQR ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
          </div>
        ) : (
          <>
            <div className="bg-gray-50 rounded-xl p-8 mb-6 flex items-center justify-center">
              <div className="bg-white p-6 rounded-lg shadow-lg" dangerouslySetInnerHTML={{ __html: qrCodeSvg }} />
            </div>

            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-900 font-medium mb-2">Menu URL:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-sm bg-white px-3 py-2 rounded border border-blue-200 overflow-x-auto">
                  {`${window.location.origin}/menu/${profileId}?menuId=${menuId}`}
                </code>
                <button
                  onClick={handleCopyURL}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm flex items-center gap-2"
                >
                  {copied ? <><Check className="w-4 h-4" />Copied</> : <><Copy className="w-4 h-4" />Copy</>}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <button onClick={() => handleDownloadQR('svg')} className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium">
                <Download className="w-5 h-5" />SVG
              </button>
              <button onClick={() => handleDownloadQR('png')} className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium">
                <Download className="w-5 h-5" />PNG
              </button>
              <button onClick={handlePrintQR} className="flex items-center justify-center gap-2 px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium">
                <Printer className="w-5 h-5" />Print
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );

  // Item Card Component
  const ItemCard = ({ item }: { item: Item }) => (
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
          <button onClick={() => openEditItem(item)} className="p-2 bg-white rounded-lg shadow-lg hover:bg-gray-50">
            <Edit className="w-4 h-4 text-gray-700" />
          </button>
          <button onClick={() => handleDeleteItem(item.id, item.name)} className="p-2 bg-white rounded-lg shadow-lg hover:bg-red-50">
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

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Modals */}
      {showQRModal && <QRCodeModal />}
      {showAddCategory && <CategoryModal />}
      {showEditCategory && <CategoryModal isEdit />}
      {showAddTag && <TagModal />}
      {showAddItem && <ItemModal />}
      {showEditItem && <ItemModal isEdit />}

      {/* Header */}
      <div className="mb-8">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Menu Builder</h1>
            <p className="text-gray-600">{menu?.profile?.name} • {menu?.name}</p>
          </div>
          <div className="flex gap-3">
            <button onClick={handleGenerateQR} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium">
              <QrCode className="w-5 h-5" />
              QR Code
            </button>
            <button onClick={() => setShowAddCategory(true)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
              Add Category
            </button>
            <button onClick={() => { resetItemForm(); setShowAddItem(true); }} className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium">
              <Plus className="w-5 h-5" />
              Add Item
            </button>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl p-4 border border-gray-200 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search menu items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Search Results */}
      {filteredItems && (
        <div className="bg-white rounded-xl border border-gray-200 mb-6">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Search Results ({filteredItems.length})</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredItems.map(item => <ItemCard key={item.id} item={item} />)}
          </div>
        </div>
      )}

      {/* Categories with Items */}
      {!filteredItems && (
        <div className="space-y-6">
          {/* Uncategorized Items */}
          {uncategorizedItems.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="bg-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-700">Uncategorized</h2>
                <p className="text-gray-500 text-sm mt-1">{uncategorizedItems.length} items</p>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {uncategorizedItems.map(item => <ItemCard key={item.id} item={item} />)}
              </div>
            </div>
          )}

          {/* Categories */}
          {itemsByCategory.map(category => (
            <div key={category.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-orange-400 to-orange-500 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{category.name}</h2>
                    <p className="text-orange-100 text-sm mt-1">{category.items.length} items</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setEditingCategory(category); setShowEditCategory(true); }}
                      className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                    >
                      <Edit className="w-5 h-5 text-white" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id, category.name)}
                      className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {category.items.map(item => <ItemCard key={item.id} item={item} />)}
                <button
                  onClick={() => { resetItemForm(); setItemForm(f => ({ ...f, categoryId: category.id })); setShowAddItem(true); }}
                  className="border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all min-h-[280px] flex flex-col items-center justify-center gap-3 text-gray-500 hover:text-orange-600"
                >
                  <Plus className="w-12 h-12" />
                  <span className="font-medium">Add Item</span>
                </button>
              </div>
            </div>
          ))}

          {/* Empty state */}
          {categories.length === 0 && items.length === 0 && (
            <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
              <Folder className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No menu items yet</h3>
              <p className="text-gray-500 mb-6">Start by creating categories and adding items to your menu</p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowAddCategory(true)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Create Category
                </button>
                <button
                  onClick={() => { resetItemForm(); setShowAddItem(true); }}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
                >
                  Add First Item
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
