

export interface ProductSection {
  title: string
  items: string[]
}

export interface Product {
  id: string
  title: string
  images: string[]
  rating: number
  price: string
  sections: ProductSection[]
}
``
export enum ProductSectionType {
  USES = "Công dụng",
  OVERVIEW = "Tổng quan", 
  INGREDIENTS = "Thành phần",
  NOTES = "Lưu ý",
  CONTRAINDICATIONS = "Chống chỉ định và cảnh cáo",
  SIDE_EFFECTS = "Tác dụng phụ",
  PHYSICAL_DESCRIPTION = "Mô tả vật lý"
}

export default {};
