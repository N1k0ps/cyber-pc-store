'use client';
import React, { useEffect, useState } from 'react';
import { ShoppingCart, Check } from 'lucide-react';
import { useCart, Product } from 'e:/cyber-pc-store/src/store/useCart'; // Относительный путь к стору корзины

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    image: string;
    specs: {
      cpu: string;
      gpu: string;
      ram: string;
      ssd: string;
    };
    price: number;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const [mounted, setMounted] = useState(false);
  
  // Достаем функцию добавления и саму корзину из Zustand стора
  const addToCart = useCart((state) => state.addToCart);
  const cart = useCart((state) => state.cart) || [];

  // Ждем, пока компонент полностью смонтируется на клиенте (браузере)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Ищем, добавлен ли товар, и СТРОГО проверяем, что его количество больше нуля
  const cartItem = cart.find((item) => item.id === product.id);
  const isAdded = mounted && !!cartItem && cartItem.quantity > 0;

  const handleAddToCart = () => {
    const productToCart: Product = {
      id: product.id,
      name: product.name,
      price: product.price,
      category: 'pc',
      image: product.image
    };
    
    addToCart(productToCart);
  };

  return (
    <div className="group relative rounded-2xl border border-slate-800 bg-slate-900/40 p-4 backdrop-blur-md hover:border-violet-500/40 hover:bg-slate-900/80 transition-all flex flex-col h-full shadow-xl">
      
      {/* Изображение товара */}
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-950 border border-slate-800/50">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute top-2 right-2 rounded-md bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
          В наличии
        </span>
      </div>

      {/* Контент */}
      <div className="mt-4 flex flex-col flex-1">
        <h3 className="font-bold text-lg text-slate-100 tracking-tight group-hover:text-violet-400 transition-colors">
          {product.name}
        </h3>

        {/* Характеристики */}
        <div className="mt-3 space-y-1.5 flex-1">
          <p className="text-xs text-slate-400 flex justify-between"><span className="text-slate-600">Процессор:</span> {product.specs.cpu}</p>
          <p className="text-xs text-slate-400 flex justify-between"><span className="text-slate-600">Видеокарта:</span> {product.specs.gpu}</p>
          <p className="text-xs text-slate-400 flex justify-between"><span className="text-slate-600">ОЗУ:</span> {product.specs.ram}</p>
          <p className="text-xs text-slate-400 flex justify-between"><span className="text-slate-600">Накопитель:</span> {product.specs.ssd}</p>
        </div>

        {/* Подвал карточки с ценой и кнопкой */}
        <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-800/60">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Цена</span>
            <span className="text-xl font-black text-emerald-400 font-mono">
              {product.price.toLocaleString()} грн
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all active:scale-[0.97] ${
              isAdded
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                : 'bg-violet-600 text-white hover:bg-violet-500 shadow-md shadow-violet-950/50'
            }`}
          >
            {isAdded ? (
              <>
                <Check className="h-4 w-4 stroke-[3]" />
                <span>В корзине ({cartItem.quantity})</span>
              </>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4" />
                <span>Купить</span>
              </>
            )}
          </button>
        </div>
      </div>

    </div>
  );
}