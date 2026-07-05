'use client';
import React, { useState } from 'react';
import { useConfigurator } from '../../store/useConfigurator'; // Относительный путь
import { useCart, Product } from '../../store/useCart';         // Относительный путь
import { CheckCircle2, Circle, Plus, ShoppingBag } from 'lucide-react';

const CATEGORIES = [
  { id: 'case', name: 'Корпус', icon: '📦' },
  { id: 'cpu', name: 'Процессор', icon: '🧠' },
  { id: 'motherboard', name: 'Материнская плата', icon: '🔌' },
  { id: 'gpu', name: 'Видеокарта', icon: '🎮' },
  { id: 'ram', name: 'Оперативная память', icon: '⚡' },
  { id: 'psu', name: 'Блок питания', icon: '🔋' },
  { id: 'cooling', name: 'Охлаждение', icon: '❄️' },
  { id: 'storage', name: 'Накопитель', icon: '💾' },
];

// Временные мок-данные для выбора (пока не подключен Supabase)
const MOCK_PARTS: Record<string, Product[]> = {
  cpu: [
    { id: 'c1', name: 'Intel Core i9-14900K', price: 65000, category: 'cpu', image: '' },
    { id: 'c2', name: 'AMD Ryzen 7 7800X3D', price: 45000, category: 'cpu', image: '' },
  ],
  gpu: [
    { id: 'g1', name: 'NVIDIA RTX 4090', price: 210000, category: 'gpu', image: '' },
    { id: 'g2', name: 'NVIDIA RTX 4070 Super', price: 75000, category: 'gpu', image: '' },
  ],
  case: [
    { id: 'cs1', name: 'LIAN LI O11 Dynamic', price: 15000, category: 'case', image: '' },
    { id: 'cs2', name: 'NZXT H7 Flow', price: 12000, category: 'case', image: '' },
  ]
};

export default function ConfiguratorPage() {
  const { configurator, setPart } = useConfigurator();
  const { addToCart } = useCart();
  const [activeTab, setActiveTab] = useState('case');

  // Расчет стоимости
  const totalPrice = Object.values(configurator).reduce((sum, item) => sum + (item?.price || 0), 0);

  const handleAddToBag = () => {
    Object.values(configurator).forEach(part => {
      if (part) addToCart(part);
    });
    alert("Все выбранные компоненты добавлены в корзину!");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <main className="container mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6">
        
        {/* Шаги выбора */}
        <div className="lg:col-span-4 space-y-2">
          <h2 className="text-2xl font-bold mb-6 text-violet-400 uppercase tracking-wider">Конструктор ПК</h2>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                activeTab === cat.id ? 'border-violet-500 bg-violet-500/10' : 'border-slate-800 bg-slate-900/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{cat.icon}</span>
                <div className="text-left">
                  <p className="text-xs text-slate-500">{cat.name}</p>
                  <p className="text-sm font-semibold truncate max-w-[180px]">
                    {configurator[cat.id]?.name || 'Не выбрано'}
                  </p>
                </div>
              </div>
              {configurator[cat.id] ? (
                <CheckCircle2 className="text-emerald-500 w-5 h-5" />
              ) : (
                <Circle className="text-slate-700 w-5 h-5" />
              )}
            </button>
          ))}
        </div>

        {/* Доступные комплектующие */}
        <div className="lg:col-span-5 bg-slate-900/30 rounded-2xl border border-slate-800 p-6 h-fit">
          <h3 className="text-xl font-bold mb-6 text-slate-200">
            Выберите {CATEGORIES.find(c => c.id === activeTab)?.name}
          </h3>
          <div className="space-y-4">
            {(MOCK_PARTS[activeTab] || []).length === 0 ? (
              <p className="text-slate-500 text-sm">В этой категории пока нет доступных товаров</p>
            ) : (
              (MOCK_PARTS[activeTab] || []).map((part) => (
                <div key={part.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-800 bg-slate-950/60 hover:border-slate-700 transition-all">
                  <div>
                    <p className="font-bold text-sm text-slate-200">{part.name}</p>
                    <p className="text-emerald-400 font-mono text-sm mt-1">{part.price.toLocaleString()} грн</p>
                  </div>
                  <button 
                    onClick={() => setPart(activeTab, part)}
                    className="p-2 bg-violet-600 rounded-lg hover:bg-violet-500 transition-colors"
                  >
                    <Plus className="w-4 h-4 text-white" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Сводка по сборке */}
        <div className="lg:col-span-3">
          <div className="sticky top-24 bg-gradient-to-br from-violet-600 to-violet-800 rounded-2xl p-6 shadow-xl shadow-violet-900/20">
            <h3 className="text-lg font-bold mb-2 text-white">Текущая сборка</h3>
            <div className="text-3xl font-black mb-6 text-white">{totalPrice.toLocaleString()} грн</div>
            
            <div className="space-y-2 mb-6 max-h-[250px] overflow-y-auto pr-1">
              {CATEGORIES.map(cat => configurator[cat.id] && (
                <div key={cat.id} className="text-[11px] flex justify-between border-b border-white/20 pb-1.5">
                  <span className="text-violet-200">{cat.name}</span>
                  <span className="font-medium truncate ml-4 text-white max-w-[120px]">
                    {configurator[cat.id]?.name}
                  </span>
                </div>
              ))}
            </div>

            <button 
              disabled={totalPrice === 0}
              onClick={handleAddToBag}
              className="w-full bg-white text-violet-700 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingBag className="w-4 h-4" />
              Добавить в корзину
            </button>
          </div>
        </div>

      </main>
    </div>
  );
}