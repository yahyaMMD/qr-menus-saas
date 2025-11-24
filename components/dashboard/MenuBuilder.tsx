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
  Settings
} from "lucide-react";
import Link from "next/link";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: string;
  image: string | null;
  category: string;
}

interface MenuCategory {
  id: string;
  name: string;
  items: MenuItem[];
}

export const MenuBuilder = ({ profileId, menuId }: { profileId?: string; menuId?: string }) => {
  const [menuName, setMenuName] = useState("New Menu");
  const [menuDescription, setMenuDescription] = useState("");
  const [categories, setCategories] = useState<MenuCategory[]>([
    {
      id: "1",
      name: "Appetizers",
      items: [],
    },
  ]);
  const [selectedCategory, setSelectedCategory] = useState("1");

  const addCategory = () => {
    const newCategory: MenuCategory = {
      id: Date.now().toString(),
      name: "New Category",
      items: [],
    };
    setCategories([...categories, newCategory]);
    setSelectedCategory(newCategory.id);
  };

  const updateCategoryName = (categoryId: string, name: string) => {
    setCategories(
      categories.map((cat) =>
        cat.id === categoryId ? { ...cat, name } : cat
      )
    );
  };

  const deleteCategory = (categoryId: string) => {
    if (categories.length > 1) {
      setCategories(categories.filter((cat) => cat.id !== categoryId));
      setSelectedCategory(categories[0].id);
    }
  };

  const addMenuItem = (categoryId: string) => {
    const newItem: MenuItem = {
      id: Date.now().toString(),
      name: "",
      description: "",
      price: "",
      image: null,
      category: categoryId,
    };

    setCategories(
      categories.map((cat) =>
        cat.id === categoryId
          ? { ...cat, items: [...cat.items, newItem] }
          : cat
      )
    );
  };

  const updateMenuItem = (
    categoryId: string,
    itemId: string,
    field: keyof MenuItem,
    value: string
  ) => {
    setCategories(
      categories.map((cat) =>
        cat.id === categoryId
          ? {
              ...cat,
              items: cat.items.map((item) =>
                item.id === itemId ? { ...item, [field]: value } : item
              ),
            }
          : cat
      )
    );
  };

  const deleteMenuItem = (categoryId: string, itemId: string) => {
    setCategories(
      categories.map((cat) =>
        cat.id === categoryId
          ? { ...cat, items: cat.items.filter((item) => item.id !== itemId) }
          : cat
      )
    );
  };

  const handleSave = () => {
    console.log("Saving menu:", { menuName, menuDescription, categories });
  };

  const currentCategory = categories.find((cat) => cat.id === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Link href={`/dashboard/profiles/${profileId || '1'}`}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <Input
                  type="text"
                  value={menuName}
                  onChange={(e) => setMenuName(e.target.value)}
                  className="text-2xl font-bold border-none shadow-none p-0 h-auto focus-visible:ring-0"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="gap-2">
                <Eye className="h-4 w-4" />
                Preview
              </Button>
              <Button variant="outline" className="gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </Button>
              <Button className="bg-orange-500 hover:bg-orange-600 text-white gap-2" onClick={handleSave}>
                <Save className="h-4 w-4" />
                Save Menu
              </Button>
            </div>
          </div>
          <Input
            type="text"
            placeholder="Menu description (optional)"
            value={menuDescription}
            onChange={(e) => setMenuDescription(e.target.value)}
            className="max-w-2xl"
          />
        </div>
      </div>

      <div className="flex h-[calc(100vh-140px)]">
        {/* Sidebar - Categories */}
        <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Categories</h3>
              <Button size="sm" variant="ghost" onClick={addCategory}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className={`group flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedCategory === category.id
                      ? "bg-orange-50 border border-orange-200"
                      : "hover:bg-gray-50 border border-transparent"
                  }`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <GripVertical className="h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={category.name}
                    onChange={(e) => {
                      e.stopPropagation();
                      updateCategoryName(category.id, e.target.value);
                    }}
                    className="flex-1 bg-transparent border-none outline-none text-sm font-medium"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span className="text-xs text-gray-500">
                    {category.items.length}
                  </span>
                  {categories.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteCategory(category.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content - Menu Items */}
        <div className="flex-1 overflow-y-auto p-8">
          {currentCategory && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {currentCategory.name}
                </h2>
                <Button
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                  onClick={() => addMenuItem(currentCategory.id)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>

              {currentCategory.items.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plus className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 mb-4">No items in this category yet</p>
                  <Button
                    variant="outline"
                    onClick={() => addMenuItem(currentCategory.id)}
                  >
                    Add Your First Item
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {currentCategory.items.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex gap-6">
                        {/* Image Upload */}
                        <div className="flex-shrink-0">
                          <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-gray-400 transition-colors">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <div className="text-center">
                                <Upload className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                                <span className="text-xs text-gray-500">Upload</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Item Details */}
                        <div className="flex-1 space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Item Name *
                              </label>
                              <Input
                                type="text"
                                placeholder="e.g., Grilled Salmon"
                                value={item.name}
                                onChange={(e) =>
                                  updateMenuItem(
                                    currentCategory.id,
                                    item.id,
                                    "name",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Price (DZD) *
                              </label>
                              <Input
                                type="text"
                                placeholder="1500"
                                value={item.price}
                                onChange={(e) =>
                                  updateMenuItem(
                                    currentCategory.id,
                                    item.id,
                                    "price",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Description
                            </label>
                            <Textarea
                              placeholder="Describe this dish..."
                              value={item.description}
                              onChange={(e) =>
                                updateMenuItem(
                                  currentCategory.id,
                                  item.id,
                                  "description",
                                  e.target.value
                                )
                              }
                              className="resize-none"
                              rows={2}
                            />
                          </div>
                        </div>

                        {/* Delete Button */}
                        <div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              deleteMenuItem(currentCategory.id, item.id)
                            }
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
