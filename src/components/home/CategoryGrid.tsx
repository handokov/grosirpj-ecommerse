'use client';

import { useEffect, useState } from 'react';
import { useStore, type Category } from '@/store/useStore';
import { Card, CardContent } from '@/components/ui/card';
import {
  Baby, Smile, GraduationCap, Sparkles, Crown, Footprints,
} from 'lucide-react';
import ProductImage from '@/components/ui/product-image';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Baby, Smile, GraduationCap, Sparkles, Crown, Footprints,
};

export default function CategoryGrid() {
  const [categories, setCategories] = useState<(Category & { productCount?: number })[]>([]);
  const viewCategory = useStore((s) => s.viewCategory);

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then(setCategories)
      .catch(() => {});
  }, []);

  return (
    <section className="py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Belanja Berdasarkan Usia
          </h2>
          <p className="text-muted-foreground">
            Temukan fashion yang tepat untuk setiap tahap usia si kecil
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {categories.map((cat) => {
            const IconComp = iconMap[cat.icon || ''];
            return (
              <Card
                key={cat.id}
                className="group cursor-pointer border-0 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                onClick={() => viewCategory(cat.id)}
              >
                <CardContent className="p-0">
                  <div className="relative h-36 sm:h-44 overflow-hidden">
                    <ProductImage
                      src={cat.image || ''}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                      <div className="flex items-center gap-1.5">
                        {IconComp && <IconComp className="h-4 w-4 text-amber-400" />}
                        <h3 className="font-semibold text-xs sm:text-sm">{cat.name}</h3>
                      </div>
                      <p className="text-[10px] text-gray-300 mt-0.5">
                        {cat.productCount ?? 0} produk
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
