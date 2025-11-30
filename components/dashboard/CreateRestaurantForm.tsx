// @ts-nocheck
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Upload, Facebook, Instagram, Music } from "lucide-react";

export const CreateRestaurantForm = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    logo: null,
    wilaya: "",
    commune: "",
    address: "",
    mapLocation: "",
    facebook: "",
    instagram: "",
    tiktok: "",
  });

  const [charCount, setCharCount] = useState(0);

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    if (text.length <= 500) {
      setFormData({ ...formData, description: text });
      setCharCount(text.length);
    }
  };

  const handleCancel = () => {
    router.push("/dashboard");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log("Form submitted:", formData);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Restaurant Information
          </h2>
          <p className="text-sm text-gray-600">
            Add your restaurant details to create a digital menu profile
          </p>
        </div>

        {/* Restaurant Name */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Restaurant Name <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            placeholder="e.g., The Green Leaf Cafe"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full"
            required
          />
        </div>

        {/* Description */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Description
          </label>
          <Textarea
            placeholder="Tell customers about your restaurant..."
            value={formData.description}
            onChange={handleDescriptionChange}
            className="w-full min-h-[100px] resize-none"
            maxLength={500}
          />
          <p className="text-xs text-gray-500 mt-1">
            {charCount}/500 characters
          </p>
        </div>

        {/* Restaurant Logo */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Restaurant Logo
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-gray-400 transition-colors cursor-pointer">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Upload className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-sm text-gray-600 mb-1">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-500">
                PNG, JPG or SVG (max. 2MB)
              </p>
            </div>
          </div>
        </div>

        {/* Wilaya and Commune */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Wilaya <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.wilaya}
              onChange={(e) => setFormData({ ...formData, wilaya: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            >
              <option value="">Select wilaya</option>
              <option value="bejaia">Bejaia</option>
              <option value="algiers">Algiers</option>
              <option value="oran">Oran</option>
              <option value="constantine">Constantine</option>
              <option value="annaba">Annaba</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Commune <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              placeholder="e.g., Akbou"
              value={formData.commune}
              onChange={(e) => setFormData({ ...formData, commune: e.target.value })}
              className="w-full"
              required
            />
          </div>
        </div>

        {/* Full Address */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Full Address
          </label>
          <Input
            type="text"
            placeholder="Street address, building number"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full"
          />
        </div>

        {/* Google Maps Location */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Google Maps Location
          </label>
          <div className="border border-gray-300 rounded-lg p-12 bg-gray-50 text-center">
            <p className="text-sm text-gray-500">Map preview will appear here</p>
          </div>
        </div>

        {/* Social Media Links */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-900 mb-4">
            Social Media Links
          </label>
          
          {/* Facebook */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Facebook className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Facebook</span>
            </div>
            <Input
              type="url"
              placeholder="https://facebook.com/yourpage"
              value={formData.facebook}
              onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
              className="w-full"
            />
          </div>

          {/* Instagram */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Instagram className="h-4 w-4 text-pink-600" />
              <span className="text-sm font-medium text-gray-700">Instagram</span>
            </div>
            <Input
              type="url"
              placeholder="https://instagram.com/yourprofile"
              value={formData.instagram}
              onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
              className="w-full"
            />
          </div>

          {/* TikTok */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Music className="h-4 w-4 text-gray-900" />
              <span className="text-sm font-medium text-gray-700">TikTok</span>
            </div>
            <Input
              type="url"
              placeholder="https://tiktok.com/@yourprofile"
              value={formData.tiktok}
              onChange={(e) => setFormData({ ...formData, tiktok: e.target.value })}
              className="w-full"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-end pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            className="px-8 py-2 border-gray-300 text-gray-700 hover:bg-gray-50"
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="px-8 py-2 bg-orange-500 hover:bg-orange-600 text-white"
          >
            Create Profile
          </Button>
        </div>
      </form>
    </div>
  );
};
