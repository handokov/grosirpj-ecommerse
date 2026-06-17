import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product, CartItemType, Category } from '@/types';

// Re-export types for backward compatibility — other files may import from here
export type { Product, CartItemType, Category } from '@/types';

// Helper: build a unique cart key from productId + variant selections
function cartKey(productId: string, size?: string, color?: string, variant?: string): string {
  return `${productId}-${size || 'no-size'}-${color || 'no-color'}-${variant || 'no-variant'}`;
}

interface StoreState {
  cartItems: CartItemType[];
  isCartOpen: boolean;
  isMobileMenuOpen: boolean;

  addToCart: (product: Product, quantity?: number, size?: string, color?: string, variant?: string) => void;
  removeFromCart: (productId: string, size?: string, color?: string, variant?: string) => void;
  updateCartQuantity: (productId: string, quantity: number, size?: string, color?: string, variant?: string) => void;
  clearCart: () => void;
  setIsCartOpen: (open: boolean) => void;
  setIsMobileMenuOpen: (open: boolean) => void;
  getCartTotal: () => number;
  getCartItemCount: () => number;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      cartItems: [],
      isCartOpen: false,
      isMobileMenuOpen: false,

      addToCart: (product, quantity = 1, size, color, variant) => {
        const { cartItems } = get();
        const key = cartKey(product.id, size, color, variant);
        const existingItem = cartItems.find(
          (item) => cartKey(item.product.id, item.size, item.color, item.variant) === key
        );

        if (existingItem) {
          set({
            cartItems: cartItems.map((item) =>
              cartKey(item.product.id, item.size, item.color, item.variant) === key
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
          });
        } else {
          set({ cartItems: [...cartItems, { product, quantity, size, color, variant }] });
        }
      },

      removeFromCart: (productId, size, color, variant) => {
        const key = cartKey(productId, size, color, variant);
        set({
          cartItems: get().cartItems.filter(
            (item) => cartKey(item.product.id, item.size, item.color, item.variant) !== key
          ),
        });
      },

      updateCartQuantity: (productId, quantity, size, color, variant) => {
        if (quantity <= 0) {
          get().removeFromCart(productId, size, color, variant);
          return;
        }
        const key = cartKey(productId, size, color, variant);
        const item = get().cartItems.find(i => cartKey(i.product.id, i.size, i.color, i.variant) === key);
        const minOrder = item?.product.minOrder ?? 1;
        const clampedQty = Math.max(minOrder, quantity);
        set({
          cartItems: get().cartItems.map((item) =>
            cartKey(item.product.id, item.size, item.color, item.variant) === key
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
