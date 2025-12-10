export type SocialLinks = {
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  [key: string]: string | undefined;
};

export type BusinessHours = {
  openNow?: boolean;
  label?: string;
};

export type ProfileView = {
  id: string;
  name: string;
  logo?: string;
  phone?: string;
  website?: string;
  wifiName?: string;
  wifiPassword?: string;
  mapUrl?: string;
  socialLinks?: SocialLinks;
  businessHours?: BusinessHours;
};

export type TagView = {
  id: string;
  name: string;
  color: string;
};

export type TypeView = {
  id: string;
  name: string;
};

export type CategoryView = {
  id: string;
  name: string;
  typeId?: string | null;
};

export type ItemView = {
  id: string;
  name: string;
  description?: string | null;
  image?: string | null;
  price: number;
  originalPrice?: number | null;
  isPromotion?: boolean;
  typeId?: string | null;
  categoryId?: string | null;
  tags: TagView[];
};

export type MenuView = {
  id: string;
  name: string;
  description?: string | null;
  defaultLanguage: string;
  supportedLanguages: string[];
};


export type FiltersState = {
  typeIds?: string[];      // instead of typeId
  categoryIds?: string[];  // instead of categoryId
  tagIds?: string[];       // instead of tagId
  minPrice?: number;
  maxPrice?: number;
};

