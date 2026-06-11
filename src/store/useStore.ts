import { create } from 'zustand';

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
  rating: number;
  reviewCount: number;
  sold: number;
  featured: boolean;
  tags?: string;
  weight?: string;
  dimensions?: string;
}

export interface CartItemType {
  product: Product;
  quantity: number;
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

type ViewMode = 'home' | 'catalog' | 'product';

interface StoreState {
  // Navigation
  currentView: ViewMode;
  selectedCategoryId: string | null;
  selectedProduct: Product | null;
  searchQuery: string;

  // Cart
  cartItems: CartItemType[];
  isCartOpen: boolean;

  // UI
  isMobileMenuOpen: boolean;

  // Actions
  setCurrentView: (view: ViewMode) => void;
  setSelectedCategoryId: (id: string | null) => void;
  setSelectedProduct: (product: Product | null) => void;
  setSearchQuery: (query: string) => void;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setIsCartOpen: (open: boolean) => void;
  setIsMobileMenuOpen: (open: boolean) => void;
  getCartTotal: () => number;
  getCartItemCount: () => number;
  viewProduct: (product: Product) => void;
  viewCategory: (categoryId: string) => void;
  goHome: () => void;
}

export const useStore = create<StoreState>((set, get) => ({
  // Navigation
  currentView: 'home',
  selectedCategoryId: null,
  selectedProduct: null,
  searchQuery: '',

  // Cart
  cartItems: [],
  isCartOpen: false,

  // UI
  isMobileMenuOpen: false,

  // Actions
  setCurrentView: (view) => set({ currentView: view }),
  setSelectedCategoryId: (id) => set({ selectedCategoryId: id }),
  setSelectedProduct: (product) => set({ selectedProduct: product }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  addToCart: (product, quantity = 1) => {
    const { cartItems } = get();
    const existingItem = cartItems.find((item) => item.product.id === product.id);

    if (existingItem) {
      set({
        cartItems: cartItems.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        ),
      });
    } else {
      set({ cartItems: [...cartItems, { product, quantity }] });
    }
  },

  removeFromCart: (productId) => {
    set({ cartItems: get().cartItems.filter((item) => item.product.id !== productId) });
  },

  updateCartQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeFromCart(productId);
      return;
    }
    set({
      cartItems: get().cartItems.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
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

  viewProduct: (product) => {
    set({ selectedProduct: product, currentView: 'product' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  viewCategory: (categoryId) => {
    set({ selectedCategoryId: categoryId, currentView: 'catalog', searchQuery: '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  goHome: () => {
    set({ currentView: 'home', selectedCategoryId: null, selectedProduct: null, searchQuery: '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },
}));
