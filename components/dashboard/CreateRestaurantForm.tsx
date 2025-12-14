// @ts-nocheck
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { ImageUpload } from "../ui/ImageUpload";
import { Facebook, Instagram, Music } from "lucide-react";
import { useAuth } from '@/lib/auth/context';

const ALGERIAN_WILAYAS = [
  "Adrar",
  "Chlef",
  "Laghouat",
  "Oum El Bouaghi",
  "Batna",
  "Béjaïa",
  "Biskra",
  "Béchar",
  "Blida",
  "Bouira",
  "Tamanrasset",
  "Tébessa",
  "Tlemcen",
  "Tiaret",
  "Tizi Ouzou",
  "Algiers",
  "Djelfa",
  "Jijel",
  "Sétif",
  "Saïda",
  "Skikda",
  "Sidi Bel Abbès",
  "Annaba",
  "Guelma",
  "Constantine",
  "Médéa",
  "Mostaganem",
  "M'Sila",
  "Mascara",
  "Ouargla",
  "Oran",
  "El Bayadh",
  "Illizi",
  "Bordj Bou Arréridj",
  "Boumerdès",
  "El Tarf",
  "Tindouf",
  "Tissemsilt",
  "El Oued",
  "Khenchela",
  "Souk Ahras",
  "Tipaza",
  "Mila",
  "Aïn Defla",
  "Naâma",
  "Aïn Témouchent",
  "Ghardaïa",
  "Relizane",
  "El M'Ghair",
  "El Meniaa",
  "Ouled Djellal",
  "Bordj Badji Mokhtar",
  "Béni Abbès",
  "Timimoun",
  "Touggourt",
  "Djanet",
  "In Salah",
  "In Guezzam",
] as const;

export const CreateRestaurantForm = () => {
  const router = useRouter();
  const { user } = useAuth(); // Access authenticated user
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    logo: null,
    wilaya: "",
    commune: "",
    address: "",
    latitude: 0,
    longitude: 0,
    facebook: "",
    instagram: "",
    tiktok: "",
  });

  const [charCount, setCharCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const token = localStorage.getItem('accessToken');
      
      // Prepare the data to send to API
      const profileData = {
        name: formData.name,
        description: formData.description,
        logo: formData.logo,
        location: {
          address: formData.address,
          city: formData.commune,
          country: "Algeria",
          wilaya: formData.wilaya,
          latitude: formData.latitude,
          longitude: formData.longitude,
        },
        socialLinks: {
          facebook: formData.facebook,
          instagram: formData.instagram,
          tiktok: formData.tiktok,
        },
      };

      const response = await fetch('/api/profiles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create profile');
      }

      const data = await response.json();
      
      // Redirect to the new profile
      router.push(`/dashboard/profiles/${data.profile.id}`);
    } catch (err: any) {
      console.error('Create profile error:', err);
      setError(err.message || 'Failed to create profile');
    } finally {
      setIsSubmitting(false);
    }
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

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
            {error}
          </div>
        )}

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
          <div className="max-w-[200px]">
            <ImageUpload
              value={formData.logo}
              onChange={(url) => setFormData({ ...formData, logo: url })}
              folder="qr-menus/logos"
              aspectRatio="square"
              placeholder="Upload logo"
            />
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
              {ALGERIAN_WILAYAS.map((wilaya) => (
                <option key={wilaya} value={wilaya}>
                  {wilaya}
                </option>
              ))}
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

        {/* Map Coordinates */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-900 mb-4">
            Map Location (Optional)
          </label>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Latitude
              </label>
              <Input
                type="number"
                step="0.000001"
                placeholder="36.7538"
                value={formData.latitude || ''}
                onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Longitude
              </label>
              <Input
                type="number"
                step="0.000001"
                placeholder="3.0588"
                value={formData.longitude || ''}
                onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })}
                className="w-full"
              />
            </div>
          </div>
          
          {/* Map Preview */}
          {formData.latitude !== 0 && formData.longitude !== 0 ? (
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 border-b border-gray-300">
                <p className="text-sm font-medium text-gray-700">Map Preview</p>
              </div>
              <iframe
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${formData.longitude - 0.01},${formData.latitude - 0.01},${formData.longitude + 0.01},${formData.latitude + 0.01}&layer=mapnik&marker=${formData.latitude},${formData.longitude}`}
                width="100%"
                height="300"
                style={{ border: 0 }}
                loading="lazy"
              ></iframe>
            </div>
          ) : (
            <div className="border border-gray-300 rounded-lg p-12 bg-gray-50 text-center">
              <p className="text-sm text-gray-500">Enter latitude and longitude to see map preview</p>
            </div>
          )}
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
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="px-8 py-2 bg-orange-500 hover:bg-orange-600 text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Profile'}
          </Button>
        </div>
      </form>
    </div>
  );
};
