'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, User, Cpu, Search, Settings } from 'lucide-react'; // Добавили Settings
import { useCart } from 'e:/cyber-pc-store/src/store/useCart'; // Вернули чистый относительный путь
import { supabase } from 'e:/cyber-pc-store/src/utils/supabase'; // Вернули чистый относительный путь

export default function Header() {
  const [isAuth, setIsAuth] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mounted, setMounted] = useState(false); // Защита от багов гидратации Next.js
  
  // Правильный селектор: пересчитываем количество прямо внутри Zustand. 
  const cartItemsCount = useCart((state) => 
    (state.cart || []).reduce((sum, item) => sum + item.quantity, 0)
  );

  useEffect(() => {
    setMounted(true); // Сигнализируем, что клиентская часть успешно загрузилась

    // Функция для проверки роли админа
    const checkAdminRole = async (userId: string) => {
      const { data } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', userId)
        .single();
      
      if (data?.is_admin) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    };

    // 1. Проверяем пользователя при первой загрузке страницы
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsAuth(!!user);
      if (user) {
        checkAdminRole(user.id);
      } else {
        setIsAdmin(false);
      }
    });

    // 2. Подписываемся на события auth, чтобы шапка мгновенно реагировала на вход или выход
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const user = session?.user;
      setIsAuth(!!user);
      
      if (user) {
        checkAdminRole(user.id);
      } else {
        // Если пользователь вышел — убираем значок админа
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        
        {/* Логотип */}
        <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-wider text-white">
          <span className="text-violet-500">CYBER</span><span>PC</span>
        </Link>

        {/* Поиск */}
        <div className="relative hidden max-w-sm flex-1 sm:block mx-8">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="search"
            placeholder="Поиск комплектующих и ПК..."
            className="w-full rounded-full bg-slate-900 py-2 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-500 border border-slate-800 focus:border-violet-500 focus:outline-none transition-colors"
          />
        </div>

        {/* Навигация */}
        <nav className="flex items-center gap-6">
          {/* Кнопка Конструктора */}
          <Link href="/configurator" className="flex items-center gap-1.5 text-sm font-medium text-violet-400 hover:text-violet-300 transition-colors bg-violet-950/40 px-3 py-1.5 rounded-md border border-violet-800/50">
            <Cpu className="h-4 w-4" />
            <span className="hidden md:inline">Конструктор ПК</span>
          </Link>
          
          {/* Корзина */}
          <Link href="/cart" className="relative p-2 text-slate-400 hover:text-white transition-colors">
            <ShoppingCart className="h-6 w-6" />
            {/* Отрендерится строго после mounted, когда браузер прочитает корзину из памяти */}
            {mounted && cartItemsCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-slate-950 shadow-md shadow-emerald-950">
                {cartItemsCount}
              </span>
            )}
          </Link>

          {/* ОБНОВЛЕННЫЙ ДИНАМИЧЕСКИЙ БЛОК АВТОРИЗАЦИИ С АДМИНКОЙ */}
          {isAuth ? (
            <div className="flex items-center gap-3">
              {/* Потайная шестерёнка — рендерится строго если ты админ */}
              {mounted && isAdmin && (
                <Link 
                  href="/admin" 
                  title="Панель администратора" 
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-violet-400 hover:border-violet-500/30 transition-all shadow-md active:scale-95"
                >
                  <Settings className="h-5 w-5 animate-[spin_5s_linear_infinite]" />
                </Link>
              )}

              {/* Круглая кнопка Личного Кабинета */}
              <Link 
                href="/profile" 
                title="Личный кабинет"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-600/10 border border-violet-500/30 text-violet-400 hover:bg-violet-600 hover:text-white transition-all shadow-md shadow-violet-950/50"
              >
                <User className="h-5 w-5" />
              </Link>
            </div>
          ) : (
            /* Если гость — стандартная кнопка входа */
            <Link href="/auth" className="flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-slate-200 border border-slate-800 hover:bg-slate-800 transition-colors">
              <User className="h-4 w-4" />
              <span>Войти</span>
            </Link>
          )}
        </nav>

      </div>
    </header>
  );
}