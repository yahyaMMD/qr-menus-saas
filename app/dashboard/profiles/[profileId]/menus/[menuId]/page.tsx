'use client';

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Image as ImageIcon, 
  DollarSign,
  QrCode,
  Download,
  Printer,
  Copy,
  Check,
  Folder
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Category {
  id: string;
  name: string;
  image?: string | null;
  items: Array<{
    id: string;
    name: string;
    price: number;
    image: string;
    tags: string[];
  }>;
  _count?: {
    items: number;
  };
}

const mockCategories: Category[] = [
  {
    id: '1',
    name: 'Breakfast',
    image: null,
    items: [
      { id: '1', name: 'Avocado Toast', price: 12.99, image: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=150', tags: ['Vegan', 'Popular'] },
      { id: '2', name: 'Organic Oatmeal', price: 8.99, image: 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=150', tags: ['Vegan', 'Gluten-Free'] },
      { id: '3', name: 'Chia Pudding', price: 9.99, image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=150', tags: ['Vegan'] }
    ],
    _count: { items: 3 }
  },
  {
    id: '2',
    name: 'Salads',
    image: null,
    items: [
      { id: '4', name: 'Caesar Salad', price: 14.99, image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=150', tags: ['Popular'] },
      { id: '5', name: 'Greek Salad', price: 13.99, image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=150', tags: ['Vegetarian'] },
      { id: '6', name: 'Quinoa Bowl', price: 15.99, image: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=150', tags: ['Vegan', 'Popular'] }
    ],
    _count: { items: 3 }
  },
  {
    id: '3',
    name: 'Beverages',
    image: null,
    items: [
      { id: '7', name: 'Green Smoothie', price: 7.99, image: 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=150', tags: ['Vegan'] },
      { id: '8', name: 'Cold Brew Coffee', price: 5.99, image: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=150', tags: ['Popular'] },
      { id: '9', name: 'Fresh Orange Juice', price: 6.99, image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=150', tags: [] }
    ],
    _count: { items: 3 }
  }
];


export default function MenuBuilderPage({ params }: { params: { profileId: string; menuId: string } }) {
  const router = useRouter();
  const [categories, setCategories] = useState(mockCategories);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showAddItem, setShowAddItem] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showEditCategory, setShowEditCategory] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrCodeSvg, setQrCodeSvg] = useState<string>('');
  const [isLoadingQR, setIsLoadingQR] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const [newCategory, setNewCategory] = useState({
    name: '',
    image: '',
  });

  const [editingCategory, setEditingCategory] = useState<any>(null);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`/api/menus/${params.menuId}/categories`);
        const data = await response.json();
        
        if (response.ok) {
          // Transform to match your UI structure
          const transformedCategories = data.categories.map((cat: any) => ({
            id: cat.id,
            name: cat.name,
            image: cat.image,
            items: [], // Will be populated separately if needed
            _count: cat._count,
          }));
          setCategories(transformedCategories);
        } else {
          console.error('Failed to fetch categories:', data.error);
          // Fallback to mock data if API fails
          setCategories(mockCategories);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Fallback to mock data if API fails
        setCategories(mockCategories);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [params.menuId]);

  const allItems = categories.flatMap(cat => 
    cat.items.map(item => ({ ...item, category: cat.name }))
  );

  const filteredItems = searchQuery
    ? allItems.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : null;

  // Handle Add Category
  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) {
      alert('Please enter a category name');
      return;
    }

    try {
      const response = await fetch(`/api/menus/${params.menuId}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCategory.name,
          image: newCategory.image || null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Add new category to state
        setCategories([...categories, {
          id: data.category.id,
          name: data.category.name,
          image: data.category.image,
          items: [],
          _count: { items: 0 },
        }]);
        
        setNewCategory({ name: '', image: '' });
        setShowAddCategory(false);
        alert('Category created successfully!');
      } else {
        alert(`Failed to create category: ${data.error}`);
      }
    } catch (error) {
      console.error('Create category error:', error);
      alert('Failed to create category. Please try again.');
    }
  };

  // Handle Edit Category
  const handleEditCategory = async () => {
    if (!editingCategory?.name.trim()) {
      alert('Please enter a category name');
      return;
    }

    try {
      const response = await fetch(
        `/api/menus/${params.menuId}/categories/${editingCategory.id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: editingCategory.name,
            image: editingCategory.image || null,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        // Update category in state
        setCategories(categories.map(cat => 
          cat.id === editingCategory.id 
            ? { ...cat, name: data.category.name, image: data.category.image }
            : cat
        ));
        
        setShowEditCategory(false);
        setEditingCategory(null);
        alert('Category updated successfully!');
      } else {
        alert(`Failed to update category: ${data.error}`);
      }
    } catch (error) {
      console.error('Update category error:', error);
      alert('Failed to update category. Please try again.');
    }
  };

  // Handle Delete Category
  const handleDeleteCategory = async (categoryId: string, categoryName: string) => {
    if (!confirm(`Are you sure you want to delete "${categoryName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(
        `/api/menus/${params.menuId}/categories/${categoryId}`,
        {
          method: 'DELETE',
        }
      );

      const data = await response.json();

      if (response.ok) {
        // Remove category from state
        setCategories(categories.filter(cat => cat.id !== categoryId));
        alert('Category deleted successfully!');
      } else {
        alert(`Failed to delete category: ${data.error}`);
      }
    } catch (error) {
      console.error('Delete category error:', error);
      alert('Failed to delete category. Please try again.');
    }
  };

  // Generate QR Code
  const handleGenerateQR = async () => {
    setIsLoadingQR(true);
    setShowQRModal(true);
    
    try {
      const response = await fetch(`/api/qr/${params.menuId}?format=svg`);
      const svg = await response.text();
      setQrCodeSvg(svg);
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      alert('Failed to generate QR code. Please try again.');
    } finally {
      setIsLoadingQR(false);
    }
  };

  // Download QR Code
  const handleDownloadQR = async (format: 'svg' | 'png') => {
    try {
      const response = await fetch(`/api/qr/${params.menuId}?format=${format}&size=1000`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `menu-qr-${params.menuId}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download QR code:', error);
      alert('Failed to download QR code. Please try again.');
    }
  };

  // Print QR Code
  const handlePrintQR = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const menuUrl = `${window.location.origin}/menu/${params.profileId}?menuId=${params.menuId}`;
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Code - Menu</title>
          <style>
            @media print {
              @page { margin: 2cm; }
              body { margin: 0; }
            }
            body {
              font-family: Arial, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              padding: 2rem;
            }
            .qr-container {
              text-align: center;
              max-width: 600px;
            }
            .qr-code {
              margin: 2rem 0;
            }
            h1 { color: #f97316; font-size: 2rem; margin-bottom: 0.5rem; }
            p { color: #666; font-size: 1.1rem; margin: 0.5rem 0; }
            .instructions {
              margin-top: 2rem;
              padding: 1.5rem;
              background: #f3f4f6;
              border-radius: 8px;
            }
            .instructions h2 {
              font-size: 1.2rem;
              margin-bottom: 1rem;
              color: #111;
            }
            .instructions ol {
              text-align: left;
              padding-left: 1.5rem;
            }
            .instructions li {
              margin: 0.5rem 0;
              color: #555;
            }
            .url {
              margin-top: 1rem;
              padding: 0.5rem;
              background: #fff;
              border: 1px solid #ddd;
              border-radius: 4px;
              font-family: monospace;
              word-break: break-all;
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <h1>Scan to View Menu</h1>
            <p>The Green Leaf Café</p>
            <div class="qr-code">
              ${qrCodeSvg}
            </div>
            <div class="instructions">
              <h2>How to use this QR code:</h2>
              <ol>
                <li>Open your phone's camera app</li>
                <li>Point it at this QR code</li>
                <li>Tap the notification to view the menu</li>
              </ol>
              <div class="url">
                <strong>Direct link:</strong><br>${menuUrl}
              </div>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  // Copy URL
  const handleCopyURL = () => {
    const menuUrl = `${window.location.origin}/menu/${params.profileId}?menuId=${params.menuId}`;
    navigator.clipboard.writeText(menuUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // QR Code Modal Component
  const QRCodeModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">QR Code</h3>
          <button
            onClick={() => setShowQRModal(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <span className="text-2xl text-gray-500">×</span>
          </button>
        </div>

        {isLoadingQR ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            <div className="bg-gray-50 rounded-xl p-8 mb-6 flex items-center justify-center">
              <div 
                className="bg-white p-6 rounded-lg shadow-lg"
                dangerouslySetInnerHTML={{ __html: qrCodeSvg }}
              />
            </div>

            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-900 font-medium mb-2">Menu URL:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-sm bg-white px-3 py-2 rounded border border-blue-200 overflow-x-auto">
                  {`${window.location.origin}/menu/${params.profileId}?menuId=${params.menuId}`}
                </code>
                <button
                  onClick={handleCopyURL}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm flex items-center gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => handleDownloadQR('svg')}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                <Download className="w-5 h-5" />
                SVG
              </button>
              <button
                onClick={() => handleDownloadQR('png')}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                <Download className="w-5 h-5" />
                PNG
              </button>
              <button
                onClick={handlePrintQR}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
              >
                <Printer className="w-5 h-5" />
                Print
              </button>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-900">
                <strong>💡 Tip:</strong> For best results, print the QR code at least 2x2 inches (5x5 cm) in size. 
                Test it with your phone before distributing.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );

  // Add Category Modal Component
  const AddCategoryModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-lg w-full p-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Add New Category</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Folder className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="e.g., Appetizers, Main Courses, Desserts"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                autoFocus
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Choose a clear, descriptive name for your menu category
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category Image (Optional)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-orange-500 transition-colors cursor-pointer">
              <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
              <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <strong>💡 Tip:</strong> Organize your menu items into logical categories to help customers browse easily. Common categories include Appetizers, Entrees, Desserts, and Beverages.
            </p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={() => {
              setShowAddCategory(false);
              setNewCategory({ name: '', image: '' });
            }}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleAddCategory}
            disabled={!newCategory.name.trim()}
            className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Category
          </button>
        </div>
      </div>
    </div>
  );

  // Edit Category Modal Component
  const EditCategoryModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-lg w-full p-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Edit Category</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Folder className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="e.g., Appetizers, Main Courses, Desserts"
                value={editingCategory?.name || ''}
                onChange={(e) => setEditingCategory({ 
                  ...editingCategory, 
                  name: e.target.value 
                })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category Image (Optional)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-orange-500 transition-colors cursor-pointer">
              <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
              <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={() => {
              setShowEditCategory(false);
              setEditingCategory(null);
            }}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleEditCategory}
            disabled={!editingCategory?.name.trim()}
            className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Update Category
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* QR Code Modal */}
      {showQRModal && <QRCodeModal />}

      {/* Add Category Modal */}
      {showAddCategory && <AddCategoryModal />}

      {/* Edit Category Modal */}
      {showEditCategory && <EditCategoryModal />}

      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Menu Builder</h1>
            <p className="text-gray-600">The Green Leaf Café • Spring Menu 2024</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleGenerateQR}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              <QrCode className="w-5 h-5" />
              QR Code
            </button>
            <button
              onClick={() => setShowAddCategory(true)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Add Category
            </button>
            <button
              onClick={() => setShowAddItem(true)}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              Add Item
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl p-4 border border-gray-200 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search menu items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500"
          />
        </div>
      </div>

      {/* Search Results */}
      {filteredItems && (
        <div className="bg-white rounded-xl border border-gray-200 mb-6">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Search Results ({filteredItems.length})
            </h3>
          </div>
          <div className="divide-y divide-gray-200">
            {filteredItems.map((item) => (
              <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{item.name}</div>
                    <div className="text-sm text-gray-500">{item.category}</div>
                  </div>
                  <div className="text-lg font-bold text-gray-900">${item.price}</div>
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <Edit className="w-5 h-5 text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-5 h-5 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Categories */}
      {!filteredItems && (
        <div className="space-y-6">
          {categories.map((category) => (
            <div key={category.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {/* Category Header */}
              <div className="bg-gradient-to-r from-orange-400 to-orange-500 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{category.name}</h2>
                    <p className="text-orange-100 text-sm mt-1">
                      {category._count?.items || category.items.length} items
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        setEditingCategory({
                          id: category.id,
                          name: category.name,
                          image: category.image || '',
                        });
                        setShowEditCategory(true);
                      }}
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

              {/* Items Grid */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {category.items.map((item) => (
                  <div
                    key={item.id}
                    className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all group"
                  >
                    <div className="relative">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                        <button className="p-2 bg-white rounded-lg shadow-lg hover:bg-gray-50">
                          <Edit className="w-4 h-4 text-gray-700" />
                        </button>
                        <button className="p-2 bg-white rounded-lg shadow-lg hover:bg-red-50">
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">{item.name}</h3>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xl font-bold text-orange-600">${item.price}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {item.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Add Item Card */}
                <button
                  onClick={() => setShowAddItem(true)}
                  className="border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all h-[340px] flex flex-col items-center justify-center gap-3 text-gray-500 hover:text-orange-600"
                >
                  <Plus className="w-12 h-12" />
                  <span className="font-medium">Add New Item</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Item Modal */}
      {showAddItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Add New Menu Item</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Item Name</label>
                <input
                  type="text"
                  placeholder="e.g., Avocado Toast"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500">
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      step="0.01"
                      placeholder="12.99"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe your item..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                <input
                  type="text"
                  placeholder="Vegan, Gluten-Free, Popular..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-orange-500 transition-colors cursor-pointer">
                  <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddItem(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowAddItem(false)}
                className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Add Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
