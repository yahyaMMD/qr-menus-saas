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
}

export interface MenuData {
  menu: Menu;
  items: Item[];
  types: Type[];
  categories: Category[];
  tags: Tag[];
}

export interface Filters {
  typeIds: string[];
  categoryIds: string[];
  tagIds: string[];
  priceRange: [number, number];
}
