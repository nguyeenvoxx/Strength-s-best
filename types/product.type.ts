

export interface ProductSection {
  title: string
  items: SectionItem[]
}

export interface SectionItem {
  text: string
  hasBullet: boolean
}

export interface Product {
  _id: string
  id: string
  title: string
  image?: string
  images: string[]
  rating: number
  price: number
  priceProduct: number
  discount?: number // Thêm trường discount
  quantity?: number // Thêm trường quantity
  status?: string // Thêm trường status
  sections: ProductSection[]
  idCategory?: string | {
    _id: string;
    nameCategory: string;
  }
  idBrand?: string | {
    _id: string;
    nameBrand: string;
  }
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
