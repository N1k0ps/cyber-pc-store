'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from 'E:/cyber-pc-store/src/utils/supabase'; // Наш относительный путь к клиенту

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    if (isLogin) {
      // 1. ЛОГИКА ВХОДА
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        alert(`Ошибка входа: ${error.message}`);
      } else {
        router.push('/'); // При успехе кидаем на главную
        router.refresh();
      }
    } else {
      // 2. ЛОГИКА РЕГИСТРАЦИИ
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // Куда вернуть пользователя после клика на ссылку в письме
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        alert(`Ошибка регистрации: ${error.message}`);
      } else {
        alert('Регистрация успешна! Проверь свою почту для подтверждения аккаунта.');
      }
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    // 3. ЛОГИКА ВХОДА ЧЕРЕЗ GOOGLE
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    
    if (error) alert(`Ошибка Google Auth: ${error.message}`);
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      <div className="p-4">
        <Link href="/" className="text-sm text-slate-400 hover:text-white transition-colors">
          ← На главную
        </Link>
      </div>

      <div className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/40 p-6 md:p-8 backdrop-blur-md shadow-2xl">
          
          {/* Переключатель Вход / Регистрация */}
          <div className="mb-8 flex rounded-lg bg-slate-950 p-1 border border-slate-800/60">
            <button
              onClick={() => setIsLogin(true)}
              className={`w-1/2 rounded-md py-2 text-sm font-medium transition-all ${
                isLogin ? 'bg-violet-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Вход
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`w-1/2 rounded-md py-2 text-sm font-medium transition-all ${
                !isLogin ? 'bg-violet-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Регистрация
            </button>
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-center text-white mb-6">
            {isLogin ? 'Рады возвращению!' : 'Создать аккаунт'}
          </h2>

          {/* Кнопка Google */}
          <button
            onClick={handleGoogleLogin}
            type="button"
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-slate-800 bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" />
            </svg>
            <span>Войти через Google</span>
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-800" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-slate-950 px-2 text-slate-500">Или почта</span></div>
          </div>

          {/* Форма */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Email адрес</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full rounded-lg bg-slate-950 border border-slate-800 px-4 py-2.5 text-sm text-slate-200 focus:border-violet-500 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Пароль</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg bg-slate-950 border border-slate-800 px-4 py-2.5 text-sm text-slate-200 focus:border-violet-500 focus:outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-lg bg-violet-600 py-3 text-sm font-bold text-white transition-all hover:bg-violet-500 active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? 'Загрузка...' : isLogin ? 'Войти в аккаунт' : 'Зарегистрироваться'}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}