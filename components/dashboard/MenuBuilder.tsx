// @ts-nocheck
"use client";
import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  Upload,
  Save,
  Eye,
  ArrowLeft,
  Settings,
  Edit2,
  FileText,
  X,
  Check
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: string;
  image: string | null;
  category: string;
  tags: string[];
  status: 'Active' | 'Inactive';
}

interface MenuType {
  id: string;
  name: string;
  image: string | null;
}

interface MenuCategory {
  id: string;
  name: string;
  image: string | null;
}

interface MenuTag {
  id: string;
  name: string;
  color: string;
}

export const MenuBuilder = ({ profileId, menuId }: { profileId?: string; menuId?: string }) => {
  const [menuName, setMenuName] = useState("Menu Builder");
  const [menuDescription, setMenuDescription] = useState("Build and customize your digital menu");
  const [activeTab, setActiveTab] = useState<'types' | 'categories' | 'tags' | 'items'>('items');
  
  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    {
      id: "1",
      name: "Cappuccino",
      description: "Classic Italian coffee with steamed milk",
      price: "350",
      image: "/assets/menu1-img.png",
      category: "Coffee",
      tags: ["Popular"],
      status: "Active"
    },
    {
      id: "2",
      name: "Croissant",
      description: "Fresh butter croissant baked daily",
      price: "200",
      image: "/assets/menu2-img.png",
      category: "Pastries",
      tags: ["Popular", "New"],
      status: "Active"
    },
    {
      id: "3",
      name: "Green Tea",
      description: "Organic green tea with mint",
      price: "250",
      image: "/assets/menu1-img.png",
      category: "Tea",
      tags: ["Vegan"],
      status: "Active"
    },
  ]);

  // Types State
  const [types, setTypes] = useState<MenuType[]>([
    { id: "1", name: "Hot Drinks", image: null },
    { id: "2", name: "Cold Drinks", image: null },
    { id: "3", name: "Food", image: null },
  ]);

  // Categories State
  const [categories, setCategories] = useState<MenuCategory[]>([
    { id: "1", name: "Coffee", image: null },
    { id: "2", name: "Tea", image: null },
    { id: "3", name: "Pastries", image: null },
  ]);

  // Tags State
  const [tags, setTags] = useState<MenuTag[]>([
    { id: "1", name: "Popular", color: "#ec4899" },
    { id: "2", name: "New", color: "#3b82f6" },
    { id: "3", name: "Vegan", color: "#10b981" },
    { id: "4", name: "Spicy", color: "#ef4444" },
  ]);

  // Modal States
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showEditItemModal, setShowEditItemModal] = useState(false);
  const [showAddTypeModal, setShowAddTypeModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showAddTagModal, setShowAddTagModal] = useState(false);

  // New/Edit Item State
  const [currentItem, setCurrentItem] = useState<MenuItem>({
    id: "",
    name: "",
    description: "",
    price: "",
    image: null,
    category: "Uncategorized",
    tags: [],
    status: "Active"
  });

  // New Entity States
  const [newType, setNewType] = useState({ name: "", image: null });
  const [newCategory, setNewCategory] = useState({ name: "", image: null });
  const [newTag, setNewTag] = useState({ name: "", color: "#3b82f6" });

  // Item Actions
  const addMenuItem = () => {
    setCurrentItem({
      id: Date.now().toString(),
      name: "",
      description: "",
      price: "",
      image: null,
      category: categories[0]?.name || "Uncategorized",
      tags: [],
      status: "Active"
    });
    setShowAddItemModal(true);
  };

  const saveNewItem = () => {
    if (!currentItem.name.trim() || !currentItem.price.trim()) {
      alert("Please enter item name and price");
      return;
    }
    setMenuItems([...menuItems, currentItem]);
    setShowAddItemModal(false);
    setCurrentItem({
      id: "",
      name: "",
      description: "",
      price: "",
      image: null,
      category: "Uncategorized",
      tags: [],
      status: "Active"
    });
  };

  const editMenuItem = (item: MenuItem) => {
    setCurrentItem({ ...item });
    setShowEditItemModal(true);
  };

  const saveEditedItem = () => {
    if (!currentItem.name.trim() || !currentItem.price.trim()) {
      alert("Please enter item name and price");
      return;
    }
    setMenuItems(menuItems.map(item => 
      item.id === currentItem.id ? currentItem : item
    ));
    setShowEditItemModal(false);
  };

  const deleteMenuItem = (itemId: string) => {
    if (confirm("Are you sure you want to delete this item?")) {
      setMenuItems(menuItems.filter((item) => item.id !== itemId));
    }
  };

  const toggleItemStatus = (itemId: string) => {
    setMenuItems(menuItems.map(item =>
      item.id === itemId 
        ? { ...item, status: item.status === 'Active' ? 'Inactive' : 'Active' }
        : item
    ));
  };

  const toggleTag = (tagName: string) => {
    const newTags = currentItem.tags.includes(tagName)
      ? currentItem.tags.filter(t => t !== tagName)
      : [...currentItem.tags, tagName];
    setCurrentItem({ ...currentItem, tags: newTags });
  };

  // Type Actions
  const addType = () => {
    if (newType.name.trim()) {
      setTypes([...types, { id: Date.now().toString(), ...newType }]);
      setNewType({ name: "", image: null });
      setShowAddTypeModal(false);
    }
  };

  const deleteType = (id: string) => {
    if (confirm("Are you sure you want to delete this type?")) {
      setTypes(types.filter(t => t.id !== id));
    }
  };

  // Category Actions
  const addCategory = () => {
    if (newCategory.name.trim()) {
      setCategories([...categories, { id: Date.now().toString(), ...newCategory }]);
      setNewCategory({ name: "", image: null });
      setShowAddCategoryModal(false);
    }
  };

  const deleteCategory = (id: string) => {
    if (confirm("Are you sure you want to delete this category?")) {
      setCategories(categories.filter(c => c.id !== id));
    }
  };

  // Tag Actions
  const addTag = () => {
    if (newTag.name.trim()) {
      setTags([...tags, { id: Date.now().toString(), ...newTag }]);
      setNewTag({ name: "", color: "#3b82f6" });
      setShowAddTagModal(false);
    }
  };

  const deleteTag = (id: string) => {
    if (confirm("Are you sure you want to delete this tag?")) {
      setTags(tags.filter(t => t.id !== id));
    }
  };

  const handleSave = () => {
    console.log("Saving menu...");
    alert("Menu saved as draft!");
  };

  const handlePublish = () => {
    console.log("Publishing menu...");
    alert("Menu published successfully!");
  };

  const tabs = [
    { id: 'types', label: 'Types' },
    { id: 'categories', label: 'Categories' },
    { id: 'tags', label: 'Tags' },
    { id: 'items', label: 'Items' },
  ];

  const getTagColor = (tag: string) => {
    const colors: Record<string, string> = {
      'Popular': 'bg-pink-500 text-white',
      'New': 'bg-blue-500 text-white',
      'Vegan': 'bg-green-500 text-white',
      'Spicy': 'bg-red-500 text-white',
    };
    return colors[tag] || 'bg-gray-500 text-white';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 md:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <div className="flex flex-col gap-1">
                  <div className="w-5 h-0.5 bg-gray-600"></div>
                  <div className="w-5 h-0.5 bg-gray-600"></div>
                  <div className="w-5 h-0.5 bg-gray-600"></div>
                </div>
              </button>
              <h1 className="text-xl font-semibold text-gray-900">MenuLix</h1>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">L3aziz Mariné</div>
                  <div className="text-xs text-gray-500">Standard Plan</div>
                </div>
                <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-semibold text-sm">
                  JD
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <div className="p-6 md:p-8">
          {/* Page Title */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-1">{menuName}</h1>
            <p className="text-gray-600">{menuDescription}</p>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="border-b border-gray-200">
              <div className="flex">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-gray-50 text-gray-900 border-b-2 border-orange-500'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'items' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <p className="text-sm text-gray-600">Add menu items with details, prices, and images</p>
                    <Button 
                      className="bg-orange-500 hover:bg-orange-600 text-white gap-2"
                      onClick={addMenuItem}
                    >
                      <Plus className="h-4 w-4" />
                      Add Item
                    </Button>
                  </div>

                  {/* Items Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Image</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Name</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Price</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Category</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Tags</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {menuItems.map((item) => (
                          <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="py-4 px-4">
                              <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                                {item.image ? (
                                  <Image
                                    src={item.image}
                                    alt={item.name}
                                    width={64}
                                    height={64}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Upload className="h-6 w-6 text-gray-400" />
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="font-medium text-gray-900">{item.name}</div>
                              <div className="text-sm text-gray-500 mt-1">{item.description}</div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="font-medium text-gray-900">{item.price}</div>
                              <div className="text-xs text-gray-500">DZD</div>
                            </td>
                            <td className="py-4 px-4">
                              <span className="text-sm text-gray-700">{item.category}</span>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex flex-wrap gap-1">
                                {item.tags.map((tag, idx) => (
                                  <span
                                    key={idx}
                                    className={`px-2 py-1 text-xs font-medium rounded-full ${getTagColor(tag)}`}
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <button
                                onClick={() => toggleItemStatus(item.id)}
                                className={`px-3 py-1 text-xs font-medium rounded-full ${
                                  item.status === 'Active'
                                    ? 'bg-green-700 text-white'
                                    : 'bg-gray-300 text-gray-700'
                                }`}
                              >
                                {item.status}
                              </button>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <button 
                                  className="p-1.5 hover:bg-gray-100 rounded"
                                  onClick={() => editMenuItem(item)}
                                >
                                  <Edit2 className="h-4 w-4 text-gray-600" />
                                </button>
                                <button 
                                  className="p-1.5 hover:bg-red-50 rounded"
                                  onClick={() => deleteMenuItem(item.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-600" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Bottom Actions */}
                  <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                    <Button 
                      variant="outline" 
                      className="gap-2"
                      onClick={handleSave}
                    >
                      <FileText className="h-4 w-4" />
                      Save Draft
                    </Button>
                    <Button 
                      className="bg-orange-500 hover:bg-orange-600 text-white gap-2"
                      onClick={handlePublish}
                    >
                      Publish Menu
                    </Button>
                  </div>
                </div>
              )}

              {activeTab === 'types' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <p className="text-sm text-gray-600">Organize your menu into different types (e.g., Hot Drinks, Cold Drinks)</p>
                    <Button 
                      className="bg-orange-500 hover:bg-orange-600 text-white gap-2"
                      onClick={() => setShowAddTypeModal(true)}
                    >
                      <Plus className="h-4 w-4" />
                      Add Type
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {types.map((type) => (
                      <div key={type.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{type.name}</h3>
                          </div>
                          <button
                            onClick={() => deleteType(type.id)}
                            className="p-1 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'categories' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <p className="text-sm text-gray-600">Create categories to organize your menu items</p>
                    <Button 
                      className="bg-orange-500 hover:bg-orange-600 text-white gap-2"
                      onClick={() => setShowAddCategoryModal(true)}
                    >
                      <Plus className="h-4 w-4" />
                      Add Category
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.map((category) => (
                      <div key={category.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{category.name}</h3>
                          </div>
                          <button
                            onClick={() => deleteCategory(category.id)}
                            className="p-1 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'tags' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <p className="text-sm text-gray-600">Add tags to highlight special features (e.g., Vegan, Spicy, Popular)</p>
                    <Button 
                      className="bg-orange-500 hover:bg-orange-600 text-white gap-2"
                      onClick={() => setShowAddTagModal(true)}
                    >
                      <Plus className="h-4 w-4" />
                      Add Tag
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tags.map((tag) => (
                      <div key={tag.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 flex items-center gap-3">
                            <div 
                              className="w-8 h-8 rounded-full"
                              style={{ backgroundColor: tag.color }}
                            ></div>
                            <h3 className="font-semibold text-gray-900">{tag.name}</h3>
                          </div>
                          <button
                            onClick={() => deleteTag(tag.id)}
                            className="p-1 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Item Modal */}
      {(showAddItemModal || showEditItemModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                {showAddItemModal ? 'Add Menu Item' : 'Edit Menu Item'}
              </h3>
              <button
                onClick={() => {
                  setShowAddItemModal(false);
                  setShowEditItemModal(false);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Item Name *</label>
                <Input
                  value={currentItem.name}
                  onChange={(e) => setCurrentItem({ ...currentItem, name: e.target.value })}
                  placeholder="e.g., Cappuccino"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <Textarea
                  value={currentItem.description}
                  onChange={(e) => setCurrentItem({ ...currentItem, description: e.target.value })}
                  placeholder="Describe your item..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price (DZD) *</label>
                  <Input
                    type="number"
                    value={currentItem.price}
                    onChange={(e) => setCurrentItem({ ...currentItem, price: e.target.value })}
                    placeholder="350"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={currentItem.category}
                    onChange={(e) => setCurrentItem({ ...currentItem, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => toggleTag(tag.name)}
                      className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
                        currentItem.tags.includes(tag.name)
                          ? getTagColor(tag.name)
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                <Input
                  value={currentItem.image || ''}
                  onChange={(e) => setCurrentItem({ ...currentItem, image: e.target.value || null })}
                  placeholder="https://example.com/image.jpg"
                />
                <p className="text-xs text-gray-500 mt-1">Or upload an image file (coming soon)</p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddItemModal(false);
                  setShowEditItemModal(false);
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={showAddItemModal ? saveNewItem : saveEditedItem}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                disabled={!currentItem.name.trim() || !currentItem.price.trim()}
              >
                {showAddItemModal ? 'Add Item' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Type Modal */}
      {showAddTypeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Add Type</h3>
              <button
                onClick={() => setShowAddTypeModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type Name</label>
                <Input
                  value={newType.name}
                  onChange={(e) => setNewType({ ...newType, name: e.target.value })}
                  placeholder="e.g., Hot Drinks, Cold Drinks"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowAddTypeModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={addType}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                disabled={!newType.name.trim()}
              >
                Add Type
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Add Category</h3>
              <button
                onClick={() => setShowAddCategoryModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category Name</label>
                <Input
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  placeholder="e.g., Coffee, Tea, Pastries"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowAddCategoryModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={addCategory}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                disabled={!newCategory.name.trim()}
              >
                Add Category
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Tag Modal */}
      {showAddTagModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Add Tag</h3>
              <button
                onClick={() => setShowAddTagModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tag Name</label>
                <Input
                  value={newTag.name}
                  onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
                  placeholder="e.g., Vegan, Spicy, Popular"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tag Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={newTag.color}
                    onChange={(e) => setNewTag({ ...newTag, color: e.target.value })}
                    className="w-12 h-12 rounded cursor-pointer"
                  />
                  <Input
                    value={newTag.color}
                    onChange={(e) => setNewTag({ ...newTag, color: e.target.value })}
                    placeholder="#3b82f6"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowAddTagModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={addTag}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                disabled={!newTag.name.trim()}
              >
                Add Tag
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
