import { create } from 'zustand';
import axios from 'axios';
import { Product } from '../types/product.type';
import { API_CONFIG } from '../constants/config';

interface FavoriteState {
    favorites: Product[];
    isLoading: boolean;
    error: string | null;
    addToFavorites: (product: Product, token: string) => Promise<void>;
    fetchFavorites: (token: string) => Promise<void>;
    removeFromFavorites: (favoriteId: string, token: string) => Promise<void>;
    checkFavoriteStatus: (productId: string, token: string) => Promise<{ isFavorite: boolean; favoriteId: string | null }>;
    clearError: () => void;
}

export const useFavoriteStore = create<FavoriteState>((set, get) => ({
    favorites: [],
    isLoading: false,
    error: null,

    addToFavorites: async (product, token) => {
        try {
            set({ isLoading: true, error: null });
            
            if (!product || !product._id) {
                console.error('Sản phẩm không hợp lệ:', product);
                set({ error: 'Sản phẩm không hợp lệ', isLoading: false });
                return;
            }

            console.log('🔍 Adding to favorites:', { productId: product._id, productName: product.title });

            const response = await axios.post(`${API_CONFIG.BASE_URL}/favorites`, {
                idProduct: product._id,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            console.log('✅ Added to favorites successfully:', response.data);

            // Fetch lại để có `favoriteId` mới
            await get().fetchFavorites(token);

        } catch (err: any) {
            console.error('❌ Error adding to favorites:', err);
            const errorMessage = err?.response?.data?.message || 'Lỗi khi thêm vào yêu thích';
            set({ error: errorMessage, isLoading: false });
            throw new Error(errorMessage);
        } finally {
            set({ isLoading: false });
        }
    },

    fetchFavorites: async (token) => {
        try {
            set({ isLoading: true, error: null });
            
            console.log('🔍 Fetching favorites...');

            const res = await axios.get(`${API_CONFIG.BASE_URL}/favorites`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            console.log('✅ Fetched favorites response:', res.data);

            const rawFavorites = res.data?.data?.favorites ?? [];

            const products: Product[] = rawFavorites
                .filter((fav: any) => fav?.idProduct && fav.idProduct.status === 'active')
                .map((fav: any) => ({
                    _id: fav.idProduct._id,
                    id: fav.idProduct._id,
                    title: fav.idProduct.nameProduct || fav.idProduct.title || 'Không có tên',
                    images: fav.idProduct.images || [fav.idProduct.image] || [],
                    image: fav.idProduct.image || '',
                    price: fav.idProduct.price || '',
                    priceProduct: fav.idProduct.priceProduct || 0,
                    rating: fav.idProduct.rating || 5,
                    sections: fav.idProduct.sections || [],
                    favoriteId: fav._id,
                    // Thêm thông tin brand và category nếu có
                    idBrand: fav.idProduct.idBrand,
                    idCategory: fav.idProduct.idCategory,
                }));

            console.log('📊 Processed favorites:', products.length, 'items');

            set({ favorites: products, isLoading: false });
        } catch (err: any) {
            console.error('❌ Error fetching favorites:', err);
            const errorMessage = err?.response?.data?.message || 'Lỗi khi tải danh sách yêu thích';
            set({ error: errorMessage, favorites: [], isLoading: false });
            throw new Error(errorMessage);
        }
    },

    removeFromFavorites: async (favoriteId, token) => {
        try {
            set({ isLoading: true, error: null });
            
            console.log('🔍 Removing from favorites:', favoriteId);

            await axios.delete(`${API_CONFIG.BASE_URL}/favorites/${favoriteId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            console.log('✅ Removed from favorites successfully');

            set((state) => ({
                favorites: state.favorites.filter((p) => p.favoriteId !== favoriteId),
                isLoading: false
            }));
        } catch (err: any) {
            console.error('❌ Error removing from favorites:', err);
            const errorMessage = err?.response?.data?.message || 'Lỗi khi xóa khỏi yêu thích';
            set({ error: errorMessage, isLoading: false });
            throw new Error(errorMessage);
        }
    },

    checkFavoriteStatus: async (productId, token) => {
        try {
            console.log('🔍 Checking favorite status for product:', productId);

            const response = await axios.get(`${API_CONFIG.BASE_URL}/favorites/check/${productId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            console.log('✅ Favorite status check result:', response.data);

            return {
                isFavorite: response.data?.isFavorite || false,
                favoriteId: response.data?.favoriteId || null
            };
        } catch (err: any) {
            console.error('❌ Error checking favorite status:', err);
            // Nếu API không có endpoint check, thử kiểm tra trong danh sách favorites
            try {
                const favoritesResponse = await axios.get(`${API_CONFIG.BASE_URL}/favorites`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                
                const favorites = favoritesResponse.data?.data?.favorites || [];
                const existingFavorite = favorites.find((fav: any) => fav.idProduct?._id === productId);
                
                return {
                    isFavorite: !!existingFavorite,
                    favoriteId: existingFavorite?._id || null
                };
            } catch (checkErr) {
                console.error('❌ Error checking favorites list:', checkErr);
                return { isFavorite: false, favoriteId: null };
            }
        }
    },

    clearError: () => {
        set({ error: null });
    },
}));