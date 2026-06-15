import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  wholesalePrice: number;
  minOrder: number;
  stock: number;
  images: string;
  categoryId: string;
  categoryName?: string;
  categorySlug?: string;
  rating: number;
  reviewCount: number;
  sold: number;
  featured: boolean;
  tags?: string;
  weight?: string;
  sizes?: string;
}

export interface CartItemType {
  product: Product;
  quantity: number;
  size?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  image?: string;
  order: number;
}

interface StoreState {
  searchQuery: string;
  cartItems: CartItemType[];
  isCartOpen: boolean;
  isMobileMenuOpen: boolean;

  setSearchQuery: (query: string) => void;
  addToCart: (product: Product, quantity?: number, size?: string) => void;
  removeFromCart: (productId: string, size?: string) => void;
  updateCartQuantity: (productId: string, quantity: number, size?: string) => void;
  clearCart: () => void;
  setIsCartOpen: (open: boolean) => void;
  setIsMobileMenuOpen: (open: boolean) => void;
  getCartTotal: () => number;
  getCartItemCount: () => number;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      searchQuery: '',
      cartItems: [],
      isCartOpen: false,
      isMobileMenuOpen: false,

      setSearchQuery: (query) => set({ searchQuery: query }),

      addToCart: (product, quantity = 1, size) => {
        const { cartItems } = get();
        const key = `${product.id}-${size || 'no-size'}`;
        const existingItem = cartItems.find(
          (item) => `${item.product.id}-${item.size || 'no-size'}` === key
        );

        if (existingItem) {
          set({
            cartItems: cartItems.map((item) =>
              `${item.product.id}-${item.size || 'no-size'}` === key
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
          });
        } else {
          set({ cartItems: [...cartItems, { product, quantity, size }] });
        }
      },

      removeFromCart: (productId, size) => {
        const key = `${productId}-${size || 'no-size'}`;
        set({
          cartItems: get().cartItems.filter(
            (item) => `${item.product.id}-${item.size || 'no-size'}` !== key
          ),
        });
      },

      updateCartQuantity: (productId, quantity, size) => {
        if (quantity <= 0) {
          get().removeFromCart(productId, size);
          return;
        }
        const key = `${productId}-${size || 'no-size'}`;
        const item = get().cartItems.find(i => `${i.product.id}-${i.size || 'no-size'}` === key);
        const minOrder = item?.product.minOrder ?? 1;
        const clampedQty = Math.max(minOrder, quantity);
        set({
          cartItems: get().cartItems.map((item) =>
            `${item.product.id}-${item.size || 'no-size'}` === key
              ? { ...item, quantity: clampedQty }
              : item
          ),
        });
      },

      clearCart: () => set({ cartItems: [] }),
      setIsCartOpen: (open) => set({ isCartOpen: open }),
      setIsMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),

      getCartTotal: () => {
        return get().cartItems.reduce(
          (total, item) => total + item.product.wholesalePrice * item.quantity,
          0
        );
      },

      getCartItemCount: () => {
        return get().cartItems.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'grosirpj-cart', // localStorage key
      partialize: (state) => ({
        cartItems: state.cartItems,
      }), // only persist cartItems, not UI state like isCartOpen
    }
  )
);
