import { create } from 'zustand';
import axios from 'axios';
import { Product } from '../types/product.type';

const BASE_URL = 'http://192.168.100.28:3000/api/v1';

interface FavoriteState {
    favorites: Product[];
    addToFavorites: (product: Product, token: string) => Promise<void>;
    fetchFavorites: (token: string) => Promise<void>;
    removeFromFavorites: (favoriteId: string, token: string) => Promise<void>;
}

export const useFavoriteStore = create<FavoriteState>((set) => ({
    favorites: [],

    addToFavorites: async (product, token) => {
         try {
    if (!product || !product._id) {
      console.error('Sản phẩm không hợp lệ:', product);
      return;
    }

    await axios.post(`${BASE_URL}/favorites`, {
      idProduct: product._id,
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });

    // ✅ fetch lại để có `favoriteId`
    await useFavoriteStore.getState().fetchFavorites(token);

  } catch (err) {
    console.error('Lỗi khi thêm vào favorites:', err);
  }
},
    fetchFavorites: async (token) => {
        try {
            const res = await axios.get(`${BASE_URL}/favorites`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            const rawFavorites = res.data?.data?.favorites ?? [];

            const products: Product[] = rawFavorites
                .filter((fav: any) => fav?.idProduct)
                .map((fav: any) => ({
                    _id: fav.idProduct._id,
                    title: fav.idProduct.title || 'Không có tên',
                    images: fav.idProduct.images || [],
                    image: fav.idProduct.image || '',
                    price: fav.idProduct.price || '',
                    priceProduct: fav.idProduct.priceProduct || 0,
                    rating: fav.idProduct.rating || 0,
                    sections: fav.idProduct.sections || [],
                    favoriteId: fav._id,
                }));

            set({ favorites: products });
        } catch (err) {
            console.error('Lỗi fetch favorites:', err);
            set({ favorites: [] }); // ✅ đảm bảo không undefined
        }
    },
    removeFromFavorites: async (favoriteId: string, token: string) => {
        try {
            await axios.delete(`${BASE_URL}/favorites/${favoriteId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            set((state) => ({
                favorites: state.favorites.filter((p) => p.favoriteId !== favoriteId),
            }));
        } catch (err) {
            console.error('Lỗi khi xóa khỏi favorites:', err);
        }
    },
}));