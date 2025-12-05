export interface Item {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  categoryId: string | null;
  typeId: string | null;
  menuId: string;
  tags: string[];
  price: number | null;
  originalPrice: number | null;
  isPromotion: boolean;
}

export interface Type {
  id: string;
  name: string;
  image: string | null;
  menuId: string;
}

export interface Category {
  id: string;
  name: string;
  image: string | null;
  menuId: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  menuId: string;
}

export interface Menu {
  id: string;
  logoUrl: string;
  name: string;
  description?: string | null;
}

export interface LanguageInfo {
  code: string;
  name: string;
  nativeName: string;
  direction: 'ltr' | 'rtl';
  flag: string;
}

export interface LanguagesData {
  current: string;
  default: string;
  supported: string[];
  availableLanguages: LanguageInfo[];
}

export interface MenuData {
  menu: Menu;
  items: Item[];
  types: Type[];
  categories: Category[];
  tags: Tag[];
  languages?: LanguagesData;
}

export interface Filters {
  typeIds: string[];
  categoryIds: string[];
  tagIds: string[];
  priceRange: [number, number];
}
