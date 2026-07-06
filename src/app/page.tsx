'use client';
import React, { useEffect, useState } from 'react';
import ProductCard from '../components/ui/ProductCard'
import { supabase } from '../../utils/supabase'
import { LayoutGrid, Laptop, Monitor, HardDrive, Loader2 } from 'lucide-react';

const CATEGORIES = [
  { id: 'gaming', name: 'Игровые компьютеры', icon: Monitor, count: 'моделей' },
  { id: 'office', name: 'Офисные ПК', icon: LayoutGrid, count: 'моделей' },
  { id: 'laptops', name: 'Ноутбуки', icon: Laptop, count: 'модели' },
  { id: 'components', name: 'Комплектующие', icon: HardDrive, count: 'товаров' },
];

export default function HomePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('gaming'); // Текущая выбранная категория

  // Загружаем реальные товары из Supabase при старте сайта
  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) {
        setProducts(data);
      }
      setLoading(false);
    }
    fetchProducts();
  }, []);

  // Фильтруем товары для вывода в сетку в зависимости от выбранной категории
  const displayedProducts = products.filter(p => p.category === activeCategory);

  // Считаем динамически, сколько товаров в каждой категории
  const getCount = (catId: string) => {
    return products.filter(p => p.category === catId).length;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-violet-500 selection:text-white">
      <main className="container mx-auto px-4 py-8">
        
        {/* Hero Banner */}
        <section className="relative my-6 rounded-2xl overflow-hidden border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-8 md:p-12 text-center md:text-left">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-violet-600/10 blur-[120px] rounded-full pointer-events-none" />
          <h1 className="max-w-2xl text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Собери свой <span className="text-violet-400">Идеальный ПК</span> за пару кликов
          </h1>
          <p className="mt-4 max-w-xl text-base text-slate-400">
            Передовые компоненты, умный конструктор совместимости и профессиональная сборка с гарантией.
          </p>
        </section>

        {/* ИНТЕРАКТИВНЫЙ БЛОК КАТЕГОРИЙ */}
        <section className="my-12">
          <h2 className="text-xl font-bold tracking-wide text-slate-200 uppercase mb-6">Категории товаров</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = activeCategory === cat.id;
              return (
                <div 
                  key={cat.id} 
                  onClick={() => setActiveCategory(cat.id)}
                  className={`group relative rounded-xl border p-5 transition-all cursor-pointer ${
                    isSelected 
                      ? 'border-violet-500 bg-violet-950/20 shadow-md shadow-violet-950/30' 
                      : 'border-slate-800 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`rounded-lg p-3 transition-transform group-hover:scale-110 ${
                      isSelected ? 'bg-violet-600 text-white' : 'bg-violet-950/60 text-violet-400'
                    }`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-200">{cat.name}</h3>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">
                        {getCount(cat.id)} {cat.count}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ДИНАМИЧЕСКИЙ ВЫВОД ТОВАРОВ ИЗ БАЗЫ ДАННЫХ */}
        <section className="my-12">
          <div className="flex items-center justify-between border-b border-slate-900 pb-4 mb-6">
            <h2 className="text-xl font-bold tracking-wide text-slate-200 uppercase">
              Актуальный ассортимент: <span className="text-violet-400">{CATEGORIES.find(c => c.id === activeCategory)?.name}</span>
            </h2>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
            </div>
          ) : displayedProducts.length === 0 ? (
            <div className="rounded-2xl border border-slate-900 bg-slate-900/10 p-16 text-center text-slate-500">
              <p className="text-base font-medium">В этой категории еще нет добавленных товаров.</p>
              <p className="text-xs text-slate-600 mt-1">Зайди в панель администратора, чтобы добавить первый девайс или сборку!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {displayedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>

      </main>
    </div>
  );
}