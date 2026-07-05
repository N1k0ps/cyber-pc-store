'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from 'e:/cyber-pc-store/src/utils/supabase';
import { Plus, Trash2, Image as ImageIcon, Loader2, ShieldAlert, Laptop, Cpu, Monitor, Briefcase, LayoutGrid } from 'lucide-react';

// Доступные категории
const CATEGORIES = [
  { id: 'gaming', name: 'Игровые компьютеры', icon: Monitor, count: '12 моделей' },
  { id: 'office', name: 'Офисные ПК', icon: Briefcase, count: '8 моделей' },
  { id: 'laptops', name: 'Ноутбуки', icon: Laptop, count: '24 модели' },
  { id: 'components', name: 'Комплектующие', icon: Cpu, count: '450+ товаров' },
];

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('gaming'); // Активная категория

  // Состояния формы
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  
  // Характеристики (динамические)
  const [cpu, setCpu] = useState('');
  const [gpu, setGpu] = useState('');
  const [ram, setRam] = useState('');
  const [ssd, setSsd] = useState('');
  const [extraSpec, setExtraSpec] = useState(''); // Для экрана ноутбука или типа детали в комплектующих

  useEffect(() => {
    async function checkAdminAndLoadProducts() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth'); return; }

      const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
      if (!profile || !profile.is_admin) {
        alert('Доступ запрещен.');
        router.push('/');
        return;
      }

      // Загружаем все товары
      const { data: productsData } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (productsData) setProducts(productsData);
      setLoading(false);
    }
    checkAdminAndLoadProducts();
  }, [router]);

  // Загрузка фото в бакет 'products'
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0) return;
      setUploading(true);
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('products').upload(fileName, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(fileName);
      setImageUrl(publicUrl);
    } catch (error: any) {
      alert(`Ошибка загрузки фото: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  // Добавление товара
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !imageUrl) {
      alert('Заполните название, цену и загрузите изображение!');
      return;
    }

    // Собираем кастомные спецификации в зависимости от таба
    const specs: any = { cpu, gpu, ram, ssd };
    if (activeTab === 'laptops') specs.screen = extraSpec;
    if (activeTab === 'components') specs.type = extraSpec;

    const { data, error } = await supabase.from('products').insert([
      {
        name,
        price: Number(price),
        image: imageUrl,
        category: activeTab,
        specs
      }
    ]).select();

    if (error) {
      alert(`Ошибка: ${error.message}`);
    } else {
      setProducts([data[0], ...products]);
      // Сброс формы
      setName(''); setPrice(''); setCpu(''); setGpu(''); setRam(''); setSsd(''); setExtraSpec(''); setImageUrl('');
      alert('Товар успешно добавлен в выбранную категорию!');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Удалить этот товар?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) setProducts(products.filter(p => p.id !== id));
  };

  // Фильтруем товары для отображения в текущем окне/вкладке
  const filteredProducts = products.filter(p => p.category === activeTab);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <div className="container mx-auto max-w-7xl pt-4">
        
        {/* Шапка админки */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-6 mb-8">
          <ShieldAlert className="h-8 w-8 text-violet-500 animate-pulse" />
          <h1 className="text-2xl md:text-3xl font-black tracking-wider uppercase">
            Управление <span className="text-violet-500">Магазином</span>
          </h1>
        </div>

        {/* КНОПКИ КАТЕГОРИЙ (ОКНА) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeTab === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`flex items-center gap-4 p-4 rounded-2xl border transition-all text-left relative overflow-hidden ${
                  isActive 
                    ? 'bg-violet-600/10 border-violet-500 text-white shadow-lg shadow-violet-950/40' 
                    : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:bg-slate-900/60'
                }`}
              >
                <div className={`p-3 rounded-xl ${isActive ? 'bg-violet-600 text-white' : 'bg-slate-950 border border-slate-800'}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-200">{cat.name}</h3>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">{cat.count}</p>
                </div>
                {isActive && <div className="absolute bottom-0 left-0 right-0 h-1 bg-violet-500" />}
              </button>
            );
          })}
        </div>

        {/* ОСНОВНОЙ РАБОЧИЙ ИНТЕРФЕЙС ВКЛАДКИ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* ФОРМА ДОБАВЛЕНИЯ (динамически подстраивается) */}
          <div className="lg:col-span-5 bg-slate-900/20 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md h-fit">
            <div className="mb-4">
              <span className="text-[10px] font-bold text-violet-400 uppercase bg-violet-500/10 border border-violet-500/20 px-2.5 py-1 rounded-md">
                Окно: {CATEGORIES.find(c => c.id === activeTab)?.name}
              </span>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-4 mt-6">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Название товара</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Например: ASUS ROG Strix или Intel i9-14950K" className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-sm text-slate-200 focus:border-violet-500 focus:outline-none transition-colors" />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Цена (грн)</label>
                <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Цена в гривнах" className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-sm text-slate-200 focus:border-violet-500 focus:outline-none transition-colors" />
              </div>

              {/* Поля спецификаций меняются или скрываются в зависимости от категории */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/60 space-y-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block border-b border-slate-900 pb-1.5">Характеристики</span>
                
                {activeTab !== 'components' ? (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <input type="text" value={cpu} onChange={(e) => setCpu(e.target.value)} placeholder="Процессор" className="bg-transparent border-b border-slate-800 py-1.5 text-xs text-slate-200 focus:border-violet-500 focus:outline-none" />
                      <input type="text" value={gpu} onChange={(e) => setGpu(e.target.value)} placeholder="Видеокарта" className="bg-transparent border-b border-slate-800 py-1.5 text-xs text-slate-200 focus:border-violet-500 focus:outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input type="text" value={ram} onChange={(e) => setRam(e.target.value)} placeholder="ОЗУ (RAM)" className="bg-transparent border-b border-slate-800 py-1.5 text-xs text-slate-200 focus:border-violet-500 focus:outline-none" />
                      <input type="text" value={ssd} onChange={(e) => setSsd(e.target.value)} placeholder="Накопитель (SSD)" className="bg-transparent border-b border-slate-800 py-1.5 text-xs text-slate-200 focus:border-violet-500 focus:outline-none" />
                    </div>
                    {activeTab === 'laptops' && (
                      <input type="text" value={extraSpec} onChange={(e) => setExtraSpec(e.target.value)} placeholder="Экран (например: 15.6'' IPS 144Hz)" className="w-full bg-transparent border-b border-slate-800 py-1.5 text-xs text-slate-200 focus:border-violet-500 focus:outline-none mt-2" />
                    )}
                  </>
                ) : (
                  // Если это комплектующие
                  <div>
                    <input type="text" value={extraSpec} onChange={(e) => setExtraSpec(e.target.value)} placeholder="Тип детали (например: Материнская плата, Блок питания)" className="w-full bg-transparent border-b border-slate-800 py-1.5 text-xs text-slate-200 focus:border-violet-500 focus:outline-none" />
                    <p className="text-[10px] text-slate-500 mt-1">Укажите, к какому типу железа относится деталь</p>
                  </div>
                )}
              </div>

              {/* Загрузка фото */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Фото товара</label>
                <div className="relative rounded-xl border border-dashed border-slate-800 bg-slate-950 p-4 text-center hover:border-violet-500/50 transition-colors cursor-pointer">
                  <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  {uploading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-violet-500 mx-auto" />
                  ) : imageUrl ? (
                    <img src={imageUrl} alt="Превью" className="h-24 mx-auto object-cover rounded-lg border border-slate-800" />
                  ) : (
                    <div className="text-slate-500 text-xs flex flex-col items-center gap-1.5 py-2">
                      <ImageIcon className="h-5 w-5 text-slate-600" />
                      <span>Перетащи фото сюда или кликни для выбора</span>
                    </div>
                  )}
                </div>
              </div>

              <button type="submit" className="w-full bg-violet-600 hover:bg-violet-500 text-white font-bold py-3 rounded-xl text-sm transition-all shadow-lg shadow-violet-950/50">
                Опубликовать в этот раздел
              </button>
            </form>
          </div>

          {/* СПИСОК ТОВАРОВ ВЫБРАННОЙ КАТЕГОРИИ */}
          <div className="lg:col-span-7">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <LayoutGrid className="h-4 w-4" /> Уже добавлено в раздел ({filteredProducts.length})
              </h2>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="rounded-2xl border border-slate-900 bg-slate-950/40 p-12 text-center text-slate-500 text-sm">
                В этой категории пока нет товаров. Добавь первый товар слева!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="p-4 rounded-xl border border-slate-800 bg-slate-900/20 backdrop-blur-sm flex flex-col justify-between gap-4 relative group">
                    <div className="flex gap-3">
                      <img src={product.image} alt={product.name} className="h-14 w-24 object-cover rounded-md bg-slate-950 border border-slate-800 shrink-0" />
                      <div className="truncate">
                        <h4 className="font-bold text-sm text-slate-200 truncate">{product.name}</h4>
                        <p className="text-xs text-emerald-400 font-mono font-bold mt-0.5">{product.price.toLocaleString()} грн</p>
                      </div>
                    </div>

                    {/* Вывод характеристик внутри админки для контроля */}
                    <div className="text-[11px] text-slate-500 space-y-0.5 border-t border-slate-900 pt-2">
                      {product.specs.cpu && <div>• CPU: {product.specs.cpu}</div>}
                      {product.specs.gpu && <div>• GPU: {product.specs.gpu}</div>}
                      {product.specs.screen && <div>• Экран: {product.specs.screen}</div>}
                      {product.specs.type && <div>• Тип: {product.specs.type}</div>}
                    </div>

                    <button 
                      onClick={() => handleDeleteProduct(product.id)} 
                      className="absolute top-2 right-2 p-2 text-slate-600 hover:text-rose-400 hover:bg-rose-950/20 rounded-lg transition-colors"
                      title="Удалить товар"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}