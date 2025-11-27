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
  FileText
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

interface MenuCategory {
  id: string;
  name: string;
  items: MenuItem[];
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

  const addMenuItem = () => {
    const newItem: MenuItem = {
      id: Date.now().toString(),
      name: "New Item",
      description: "",
      price: "0",
      image: null,
      category: "Uncategorized",
      tags: [],
      status: "Active",
    };
    setMenuItems([...menuItems, newItem]);
  };

  const deleteMenuItem = (itemId: string) => {
    setMenuItems(menuItems.filter((item) => item.id !== itemId));
  };

  const handleSave = () => {
    console.log("Saving menu...");
  };

  const handlePublish = () => {
    console.log("Publishing menu...");
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
              <h1 className="text-xl font-semibold text-gray-900">MenuMaster</h1>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">John Doe</div>
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
                                <span className="px-3 py-1 bg-gray-900 text-white text-xs font-medium rounded-full">
                                  {item.status}
                                </span>
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-2">
                                  <button className="p-1.5 hover:bg-gray-100 rounded">
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
                  <div className="text-center py-16">
                    <p className="text-gray-600">Types management coming soon...</p>
                  </div>
                )}

                {activeTab === 'categories' && (
                  <div className="text-center py-16">
                    <p className="text-gray-600">Categories management coming soon...</p>
                  </div>
                )}

                {activeTab === 'tags' && (
                  <div className="text-center py-16">
                    <p className="text-gray-600">Tags management coming soon...</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};
