import { create } from 'zustand';
import { API_CONFIG } from '../constants/config';

interface Product {
  _id: string;
  nameProduct: string;
  description: string;
  image: string;
  priceProduct: number;
}

interface CartItem {
  _id: string;
  idProduct: Product;
  quantity: number;
  price: number;
}

interface Cart {
  _id: string;
  idUser: string;
  items: CartItem[];
  totalPrice: number;
  created_at: string;
  updated_at: string;
}

interface CartStore {
  cart: Cart | null;
  items: CartItem[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchCart: (token: string) => Promise<void>;
  addToCart: (token: string, productId: string, quantity: number) => Promise<void>;
  removeFromCart: (token: string, productId: string) => Promise<void>;
  clearCart: (token: string) => Promise<void>;
  clearError: () => void;
}

export const useCartStore = create<CartStore>((set, get) => ({
  cart: null,
  items: [],
  loading: false,
  error: null,

  fetchCart: async (token: string) => {
    try {
      set({ loading: true, error: null });
      console.log('=== CART STORE: FETCH CART REQUEST ===');
      console.log('Token:', token ? 'Present' : 'Missing');

      const response = await fetch(`${API_CONFIG.BASE_URL}/carts`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('=== CART STORE: FETCH CART RESPONSE ===');
      console.log('Status:', response.status);
      console.log('Status Text:', response.statusText);

      if (response.ok) {
        const data = await response.json();
        console.log('Cart Data:', data);
        console.log('Cart Items:', data.data?.cart?.items || []);
        
        set({ 
          cart: data.data?.cart || null,
          items: data.data?.cart?.items || [],
          loading: false 
        });
      } else {
        const errorData = await response.json();
        console.error('=== CART STORE: FETCH CART ERROR ===');
        console.error('Status:', response.status);
        console.error('Error Data:', errorData);
        
        set({ 
          error: errorData.message || 'Không thể lấy giỏ hàng',
          loading: false 
        });
      }
    } catch (error) {
      console.error('=== CART STORE: FETCH CART ERROR ===');
      console.error('Error:', error);
      set({ 
        error: 'Không thể kết nối đến server',
        loading: false 
      });
    }
  },

  addToCart: async (token: string, productId: string, quantity: number) => {
    try {
      set({ loading: true, error: null });
      console.log('=== CART STORE: ADD TO CART REQUEST ===');
      console.log('Product ID:', productId);
      console.log('Quantity:', quantity);
      console.log('Token:', token ? 'Present' : 'Missing');

      const response = await fetch(`${API_CONFIG.BASE_URL}/carts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          idProduct: productId,
          quantity: quantity
        })
      });

      console.log('=== CART STORE: ADD TO CART RESPONSE ===');
      console.log('Status:', response.status);
      console.log('Status Text:', response.statusText);

      if (response.ok) {
        const responseData = await response.json();
        console.log('Add to Cart Response Data:', responseData);
        
        // Refresh cart after adding
        await get().fetchCart(token);
      } else {
        const errorData = await response.json();
        console.log('Add to Cart Error Data:', errorData);
        set({ 
          error: errorData.message || 'Không thể thêm vào giỏ hàng',
          loading: false 
        });
      }
    } catch (error) {
      console.error('=== CART STORE: ADD TO CART ERROR ===');
      console.error('Error:', error);
      set({ 
        error: 'Không thể kết nối đến server',
        loading: false 
      });
    }
  },

  removeFromCart: async (token: string, productId: string) => {
    try {
      set({ loading: true, error: null });
      console.log('=== CART STORE: REMOVE FROM CART REQUEST ===');
      console.log('Product ID:', productId);
      console.log('Token:', token ? 'Present' : 'Missing');

      const response = await fetch(`${API_CONFIG.BASE_URL}/carts`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          idProduct: productId
        })
      });

      console.log('=== CART STORE: REMOVE FROM CART RESPONSE ===');
      console.log('Status:', response.status);
      console.log('Status Text:', response.statusText);

      if (response.ok) {
        const responseData = await response.json();
        console.log('Remove from Cart Response Data:', responseData);
        
        // Refresh cart after removing
        await get().fetchCart(token);
      } else {
        const errorData = await response.json();
        console.log('Remove from Cart Error Data:', errorData);
        set({ 
          error: errorData.message || 'Không thể xóa sản phẩm',
          loading: false 
        });
      }
    } catch (error) {
      console.error('=== CART STORE: REMOVE FROM CART ERROR ===');
      console.error('Error:', error);
      set({ 
        error: 'Không thể kết nối đến server',
        loading: false 
      });
    }
  },

  clearCart: async (token: string) => {
    try {
      set({ loading: true, error: null });
      console.log('=== CART STORE: CLEAR CART REQUEST ===');
      console.log('Token:', token ? 'Present' : 'Missing');

      const response = await fetch(`${API_CONFIG.BASE_URL}/carts/clear`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('=== CART STORE: CLEAR CART RESPONSE ===');
      console.log('Status:', response.status);
      console.log('Status Text:', response.statusText);

      if (response.ok) {
        const responseData = await response.json();
        console.log('Clear Cart Response Data:', responseData);
        
        set({ 
          cart: null,
          items: [],
          loading: false 
        });
      } else {
        const errorData = await response.json();
        console.log('Clear Cart Error Data:', errorData);
        set({ 
          error: errorData.message || 'Không thể xóa giỏ hàng',
          loading: false 
        });
      }
    } catch (error) {
      console.error('=== CART STORE: CLEAR CART ERROR ===');
      console.error('Error:', error);
      set({ 
        error: 'Không thể kết nối đến server',
        loading: false 
      });
    }
  },

  clearError: () => {
    set({ error: null });
  }
})); 