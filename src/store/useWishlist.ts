'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useSyncExternalStore } from 'react';
import type { Product } from '@/types';

interface WishlistState {
  items: Product[];

  toggleWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
  getWishlistCount: () => number;
}

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      toggleWishlist: (product) => {
        const exists = get().items.some((p) => p.id === product.id);
        if (exists) {
          set({ items: get().items.filter((p) => p.id !== product.id) });
        } else {
          set({ items: [...get().items, product] });
        }
      },

      removeFromWishlist: (productId) => {
        set({ items: get().items.filter((p) => p.id !== productId) });
      },

      isInWishlist: (productId) => get().items.some((p) => p.id === productId),

      clearWishlist: () => set({ items: [] }),

      getWishlistCount: () => get().items.length,
    }),
    {
      name: 'grosirpj-wishlist',
    }
  )
);

/**
 * Detects whether the wishlist store has finished hydrating from localStorage.
 * Returns false during SSR and the first client render (to avoid hydration
 * mismatches), then true once the client has mounted.
 *
 * Implemented with useSyncExternalStore so we don't call setState inside an
 * effect (which would trip the react-hooks/set-state-in-effect lint rule).
 */
export function useWishlistHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}
