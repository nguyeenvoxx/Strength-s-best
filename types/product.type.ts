

export interface ProductSection {
  title: string
  items: string[]
}

export interface Product {
  _id: string
  id: string
  title: string
  image?: string
  images: string[]
  rating: number
  price: string
  priceProduct: number
  sections: ProductSection[]  
  favoriteId?: string
}

export enum ProductSectionType {
  USES = "Công dụng",
  OVERVIEW = "Tổng quan", 
  INGREDIENTS = "Thành phần",
  NOTES = "Lưu ý",
  CONTRAINDICATIONS = "Chống chỉ định và cảnh cáo",
  SIDE_EFFECTS = "Tác dụng phụ",
  PHYSICAL_DESCRIPTION = "Mô tả vật lý"
}

export interface User {
  avatar?: string;
}

export default {};
