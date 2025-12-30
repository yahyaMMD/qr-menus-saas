'use client';

import React, { useState, use, Suspense, lazy } from 'react';
import {
  ArrowLeft,
  Plus,
  Search,
  Trash2,
  QrCode,
  Folder,
  Tag as TagIcon,
  Languages,
  Settings,
  Loader2,
  Globe,
  Edit,
  X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getErrorPagePath } from '@/lib/error-redirect';
import { getPublicMenuUrl as resolvePublicMenuUrl } from '@/lib/public-menu-url';
import {
  useMenu,
  useMenuCategories,
  useMenuItems,
  useMenuTags,
  useMenuTypes,
  useMenuTranslations,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useCreateTag,
  useDeleteTag,
  useCreateType,
  useDeleteType,
  useCreateItem,
  useUpdateItem,
  useDeleteItem,
  useUpdateLanguages,
  useSaveTranslation,
} from '@/lib/react-query/hooks';
import type { Tag, Category, Type, Item, MenuData, Translation, ItemForm } from '@/components/menu-builder/types';

// Lazy load modal components
const ItemModal = lazy(() => import('@/components/menu-builder/ItemModal').then(m => ({ default: m.ItemModal })));
const CategoryModal = lazy(() => import('@/components/menu-builder/CategoryModal').then(m => ({ default: m.CategoryModal })));
const TagModal = lazy(() => import('@/components/menu-builder/TagModal').then(m => ({ default: m.TagModal })));
const TypeModal = lazy(() => import('@/components/menu-builder/TypeModal').then(m => ({ default: m.TypeModal })));
const QRCodeModal = lazy(() => import('@/components/menu-builder/QRCodeModal').then(m => ({ default: m.QRCodeModal })));
const LanguagesModal = lazy(() => import('@/components/menu-builder/LanguagesModal').then(m => ({ default: m.LanguagesModal })));
const TranslationModal = lazy(() => import('@/components/menu-builder/TranslationModal').then(m => ({ default: m.TranslationModal })));
const ItemCard = lazy(() => import('@/components/menu-builder/ItemCard').then(m => ({ default: m.ItemCard })));

// Loading fallback for modals
const ModalLoader = () => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-xl p-8">
      <Loader2 className="w-8 h-8 text-orange-500 animate-spin mx-auto" />
    </div>
  </div>
);

export default function MenuBuilderPage({
  params
}: {
  params: Promise<{ profileId: string; menuId: string }>
}) {
  const { profileId, menuId } = use(params);
  const router = useRouter();

  // Form states (need to be defined before mutations)
  const [newCategory, setNewCategory] = useState({ name: '', image: '' });
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newTag, setNewTag] = useState({ name: '', color: '#f97316' });
  const [newType, setNewType] = useState({ name: '', image: '' });
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
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showAddItem, setShowAddItem] = useState(false);
  const [showEditItem, setShowEditItem] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showEditCategory, setShowEditCategory] = useState(false);
  const [showAddTag, setShowAddTag] = useState(false);
  const [showAddType, setShowAddType] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showLanguagesModal, setShowLanguagesModal] = useState(false);
  const [showTranslationModal, setShowTranslationModal] = useState(false);
  const [translatingEntity, setTranslatingEntity] = useState<{ type: string; id: string; name: string } | null>(null);

  const [qrCodeSvg, setQrCodeSvg] = useState<string>('');
  const [isLoadingQR, setIsLoadingQR] = useState(false);
  const [copied, setCopied] = useState(false);

  // React Query hooks for data fetching
  const { data: menuData, isLoading: menuLoading, error: menuError } = useMenu(menuId);
  const { data: categoriesData, isLoading: categoriesLoading } = useMenuCategories(menuId);
  const { data: itemsData, isLoading: itemsLoading } = useMenuItems(menuId);
  const { data: tagsData, isLoading: tagsLoading } = useMenuTags(menuId);
  const { data: typesData, isLoading: typesLoading } = useMenuTypes(menuId);
  const { data: translationsData, isLoading: translationsLoading } = useMenuTranslations(menuId);

  // Mutations
  const createCategoryMutation = useCreateCategory(menuId);
  const updateCategoryMutation = useUpdateCategory(menuId);
  const deleteCategoryMutation = useDeleteCategory(menuId);
  const createTagMutation = useCreateTag(menuId);
  const deleteTagMutation = useDeleteTag(menuId);
  const createTypeMutation = useCreateType(menuId);
  const deleteTypeMutation = useDeleteType(menuId);
  const createItemMutation = useCreateItem(menuId);
  const updateItemMutation = useUpdateItem(menuId);
  const deleteItemMutation = useDeleteItem(menuId);
  const updateLanguagesMutation = useUpdateLanguages(menuId);
  const saveTranslationMutation = useSaveTranslation(menuId);

  // Derived state from React Query
  const menu = menuData as MenuData | null;
  const categories = (categoriesData?.categories || []) as Category[];
  const items = (itemsData?.items || []) as Item[];
  const tags = (tagsData?.tags || []) as Tag[];
  const types = (typesData?.types || []) as Type[];
  const translations = (translationsData?.translations || []) as Translation[];
  const loading = menuLoading || categoriesLoading || itemsLoading || tagsLoading || typesLoading || translationsLoading;
  const saving = createCategoryMutation.isPending || updateCategoryMutation.isPending ||
    createTagMutation.isPending || createTypeMutation.isPending ||
    createItemMutation.isPending || updateItemMutation.isPending ||
    deleteCategoryMutation.isPending || deleteTagMutation.isPending ||
    deleteTypeMutation.isPending || deleteItemMutation.isPending ||
    updateLanguagesMutation.isPending || saveTranslationMutation.isPending;

  // Handle errors
  if (menuError) {
    const error = menuError as any;
    const errorPath = getErrorPagePath(error?.status || 500);
    if (errorPath) {
      router.push(errorPath);
      return null;
    }
  }

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

    try {
      await createCategoryMutation.mutateAsync({
        name: newCategory.name,
        image: newCategory.image || undefined,
      });
      setNewCategory({ name: '', image: '' });
      setShowAddCategory(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create category';
      alert(errorMessage);
    }
  };

  const handleEditCategory = async () => {
    if (!editingCategory?.name.trim()) return;

    try {
      await updateCategoryMutation.mutateAsync({
        categoryId: editingCategory.id,
        name: editingCategory.name,
        image: editingCategory.image || undefined,
      });
      setEditingCategory(null);
      setShowEditCategory(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update category';
      alert(errorMessage);
    }
  };

  const handleDeleteCategory = async (categoryId: string, categoryName: string) => {
    if (!confirm(`Delete "${categoryName}"? Items in this category will become uncategorized.`)) return;

    try {
      await deleteCategoryMutation.mutateAsync(categoryId);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete category';
      alert(errorMessage);
    }
  };

  const handleAddTag = async () => {
    if (!newTag.name.trim()) return;

    try {
      await createTagMutation.mutateAsync(newTag);
      setNewTag({ name: '', color: '#f97316' });
      setShowAddTag(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create tag';
      alert(errorMessage);
    }
  };

  const handleAddType = async () => {
    if (!newType.name.trim()) return;

    try {
      await createTypeMutation.mutateAsync({
        name: newType.name,
        image: newType.image || undefined,
      });
      setNewType({ name: '', image: '' });
      setShowAddType(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create type';
      alert(errorMessage);
    }
  };

  const handleDeleteType = async (typeId: string, typeName: string) => {
    if (!confirm(`Delete type "${typeName}"?`)) return;

    try {
      await deleteTypeMutation.mutateAsync(typeId);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete type';
      alert(errorMessage);
    }
  };

  const handleDeleteTag = async (tagId: string, tagName: string) => {
    if (!confirm(`Delete tag "${tagName}"?`)) return;

    try {
      await deleteTagMutation.mutateAsync(tagId);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete tag';
      alert(errorMessage);
    }
  };

  const handleSaveItem = async () => {
    if (!itemForm.name.trim()) {
      alert('Item name is required');
      return;
    }

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
      if (isEdit) {
        await updateItemMutation.mutateAsync({ itemId: itemForm.id, ...itemData });
      } else {
        await createItemMutation.mutateAsync(itemData);
      }
      resetItemForm();
      setShowAddItem(false);
      setShowEditItem(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save item';
      alert(errorMessage);
    }
  };

  const handleDeleteItem = async (itemId: string, itemName: string) => {
    if (!confirm(`Delete "${itemName}"?`)) return;

    try {
      await deleteItemMutation.mutateAsync(itemId);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete item';
      alert(errorMessage);
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

  const getPublicMenuUrl = () =>
    resolvePublicMenuUrl(menuId, { client: true });

  const handleCopyURL = () => {
    const menuUrl = getPublicMenuUrl();
    navigator.clipboard.writeText(menuUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Language management
  const handleUpdateLanguages = async (defaultLang: string, supportedLangs: string[]) => {
    try {
      await updateLanguagesMutation.mutateAsync({
        defaultLanguage: defaultLang,
        supportedLanguages: supportedLangs,
      });
      setShowLanguagesModal(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update languages';
      alert(errorMessage);
    }
  };

  const handleSaveTranslation = async (entityType: string, entityId: string, languageCode: string, field: string, value: string) => {
    try {
      await saveTranslationMutation.mutateAsync({
        entityType,
        entityId,
        languageCode,
        field,
        value,
      });
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save translation';
      alert(errorMessage);
      return false;
    }
  };

  const getTranslation = (entityType: string, entityId: string, languageCode: string, field: string) => {
    return translations.find(t =>
      t.entityType === entityType && t.entityId === entityId && t.languageCode === languageCode && t.field === field
    )?.value || '';
  };

  const openTranslationModal = (type: string, id: string, name: string) => {
    setTranslatingEntity({ type, id, name });
    setShowTranslationModal(true);
  };

  const handlePrintQR = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const menuUrl = getPublicMenuUrl();
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


  // Helper function to prepare category for modal
  const getCategoryForModal = (isEdit: boolean): Category => {
    if (isEdit && editingCategory) {
      return editingCategory;
    }
    return { id: '', name: newCategory.name, image: newCategory.image || null };
  };



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
      {/* Modals - Lazy Loaded */}
      {showQRModal && (
        <Suspense fallback={<ModalLoader />}>
          <QRCodeModal
            menu={menu}
            qrCodeSvg={qrCodeSvg}
            isLoadingQR={isLoadingQR}
            copied={copied}
            onClose={() => setShowQRModal(false)}
            onCopyURL={handleCopyURL}
            onDownloadQR={handleDownloadQR}
            onPrintQR={handlePrintQR}
            getPublicMenuUrl={getPublicMenuUrl}
          />
        </Suspense>
      )}
      {showAddCategory && (
        <Suspense fallback={<ModalLoader />}>
          <CategoryModal
            isEdit={false}
            category={getCategoryForModal(false)}
            saving={saving}
            onClose={() => setShowAddCategory(false)}
            onSave={handleAddCategory}
            onCategoryChange={(cat) => setNewCategory({ name: cat.name, image: cat.image || '' })}
            onReset={() => setNewCategory({ name: '', image: '' })}
          />
        </Suspense>
      )}
      {showEditCategory && editingCategory && (
        <Suspense fallback={<ModalLoader />}>
          <CategoryModal
            isEdit={true}
            category={editingCategory}
            saving={saving}
            onClose={() => { setShowEditCategory(false); setEditingCategory(null); }}
            onSave={handleEditCategory}
            onCategoryChange={setEditingCategory}
            onReset={() => { setEditingCategory(null); setNewCategory({ name: '', image: '' }); }}
          />
        </Suspense>
      )}
      {showAddTag && (
        <Suspense fallback={<ModalLoader />}>
          <TagModal
            tag={newTag}
            saving={saving}
            onClose={() => setShowAddTag(false)}
            onSave={handleAddTag}
            onTagChange={setNewTag}
            onReset={() => setNewTag({ name: '', color: '#f97316' })}
          />
        </Suspense>
      )}
      {showAddType && (
        <Suspense fallback={<ModalLoader />}>
          <TypeModal
            type={newType}
            saving={saving}
            onClose={() => setShowAddType(false)}
            onSave={handleAddType}
            onTypeChange={setNewType}
            onReset={() => setNewType({ name: '', image: '' })}
          />
        </Suspense>
      )}
      {showAddItem && (
        <Suspense fallback={<ModalLoader />}>
          <ItemModal
            isEdit={false}
            itemForm={itemForm}
            categories={categories}
            types={types}
            tags={tags}
            saving={saving}
            onClose={() => setShowAddItem(false)}
            onSave={handleSaveItem}
            onFormChange={setItemForm}
            onShowAddTag={() => setShowAddTag(true)}
            onResetForm={resetItemForm}
          />
        </Suspense>
      )}
      {showEditItem && (
        <Suspense fallback={<ModalLoader />}>
          <ItemModal
            isEdit={true}
            itemForm={itemForm}
            categories={categories}
            types={types}
            tags={tags}
            saving={saving}
            onClose={() => setShowEditItem(false)}
            onSave={handleSaveItem}
            onFormChange={setItemForm}
            onShowAddTag={() => setShowAddTag(true)}
            onResetForm={resetItemForm}
          />
        </Suspense>
      )}
      {showLanguagesModal && (
        <Suspense fallback={<ModalLoader />}>
          <LanguagesModal
            menu={menu}
            saving={saving}
            onClose={() => setShowLanguagesModal(false)}
            onSave={handleUpdateLanguages}
          />
        </Suspense>
      )}
      {showTranslationModal && (
        <Suspense fallback={<ModalLoader />}>
          <TranslationModal
            menu={menu}
            translatingEntity={translatingEntity}
            translations={translations}
            onClose={() => setShowTranslationModal(false)}
            onShowLanguagesModal={() => { setShowTranslationModal(false); setShowLanguagesModal(true); }}
            onSaveTranslation={handleSaveTranslation}
            getTranslation={getTranslation}
          />
        </Suspense>
      )}

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
            <button
              onClick={() => router.push(`/dashboard/profiles/${profileId}/menus/${menuId}/settings`)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              title="Menu Settings"
            >
              <Settings className="w-5 h-5" />
              <span className="hidden sm:inline">Settings</span>
            </button>
            <button onClick={() => setShowLanguagesModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
              <Languages className="w-5 h-5" />
              <span className="hidden sm:inline">Languages</span>
              {(menu?.supportedLanguages?.length || 1) > 1 && (
                <span className="bg-white/20 px-1.5 py-0.5 rounded text-xs">{menu?.supportedLanguages?.length}</span>
              )}
            </button>
            <button onClick={handleGenerateQR} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium">
              <QrCode className="w-5 h-5" />
              <span className="hidden sm:inline">QR Code</span>
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

      {/* Search & Quick Actions */}
      <div className="bg-white rounded-xl p-4 border border-gray-200 mb-6">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search menu items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        {/* Tags & Types Management */}
        <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-100">
          {/* Tags Section */}
          <div className="flex-1 min-w-[200px]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <TagIcon className="w-4 h-4" /> Tags ({tags.length})
              </span>
              <button
                onClick={() => setShowAddTag(true)}
                className="text-xs text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add Tag
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {tags.length === 0 ? (
                <span className="text-xs text-gray-400 italic">No tags yet</span>
              ) : (
                tags.map(tag => (
                  <span
                    key={tag.id}
                    className="px-2 py-1 text-xs rounded-full font-medium flex items-center gap-1 group"
                    style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
                  >
                    {tag.name}
                    <button
                      onClick={() => handleDeleteTag(tag.id, tag.name)}
                      className="opacity-0 group-hover:opacity-100 hover:text-red-600 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Types Section */}
          <div className="flex-1 min-w-[200px]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <Folder className="w-4 h-4" /> Types ({types.length})
              </span>
              <button
                onClick={() => setShowAddType(true)}
                className="text-xs text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add Type
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {types.length === 0 ? (
                <span className="text-xs text-gray-400 italic">No types yet</span>
              ) : (
                types.map(type => (
                  <span
                    key={type.id}
                    className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full font-medium flex items-center gap-1 group"
                  >
                    {type.name}
                    <button
                      onClick={() => handleDeleteType(type.id, type.name)}
                      className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Search Results */}
      {filteredItems && (
        <div className="bg-white rounded-xl border border-gray-200 mb-6">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Search Results ({filteredItems.length})</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredItems.map(item => (
              <Suspense key={item.id} fallback={<div className="border border-gray-200 rounded-lg p-4 animate-pulse bg-gray-100 h-64" />}>
                <ItemCard
                  item={item}
                  menu={menu}
                  onEdit={openEditItem}
                  onDelete={handleDeleteItem}
                  onTranslate={openTranslationModal}
                />
              </Suspense>
            ))}
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
                {uncategorizedItems.map(item => (
                  <Suspense key={item.id} fallback={<div className="border border-gray-200 rounded-lg p-4 animate-pulse bg-gray-100 h-64" />}>
                    <ItemCard
                      item={item}
                      menu={menu}
                      onEdit={openEditItem}
                      onDelete={handleDeleteItem}
                      onTranslate={openTranslationModal}
                    />
                  </Suspense>
                ))}
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
                    {(menu?.supportedLanguages?.length || 0) > 1 && (
                      <button
                        onClick={() => openTranslationModal('category', category.id, category.name)}
                        className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                        title="Translate"
                      >
                        <Globe className="w-5 h-5 text-white" />
                      </button>
                    )}
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
                {category.items.map(item => (
                  <Suspense key={item.id} fallback={<div className="border border-gray-200 rounded-lg p-4 animate-pulse bg-gray-100 h-64" />}>
                    <ItemCard
                      item={item}
                      menu={menu}
                      onEdit={openEditItem}
                      onDelete={handleDeleteItem}
                      onTranslate={openTranslationModal}
                    />
                  </Suspense>
                ))}
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
