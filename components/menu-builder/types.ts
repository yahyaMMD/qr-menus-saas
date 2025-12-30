export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Category {
  id: string;
  name: string;
  image?: string | null;
}

export interface Type {
  id: string;
  name: string;
  image?: string | null;
}

export interface Item {
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

export interface MenuData {
  id: string;
  name: string;
  description?: string | null;
  defaultLanguage?: string;
  supportedLanguages?: string[];
  profile: {
    id: string;
    name: string;
  };
}

export interface Translation {
  id: string;
  entityType: string;
  entityId: string;
  languageCode: string;
  field: string;
  value: string;
}

export interface ItemForm {
  id: string;
  name: string;
  description: string;
  price: string;
  originalPrice: string;
  isPromotion: boolean;
  image: string;
  categoryId: string;
  typeId: string;
  tagIds: string[];
}

