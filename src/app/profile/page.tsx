'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from 'e:/cyber-pc-store/src/utils/supabase';
import { 
  User, Save, ArrowLeft, Loader2, LogOut, 
  Settings, Bell, Cpu, FileText, Smartphone, MapPin, CheckCircle2 
} from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  
  // Основные поля формы
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  // Интересные дополнительные настройки
  const [prefBrand, setPrefBrand] = useState('none'); // Предпочтения: Intel, AMD, Nvidia
  const [notifyStatus, setNotifyStatus] = useState(true); // Уведомления о заказах
  const [userNotes, setUserNotes] = useState(''); // Заметки для сборщика ПК

  useEffect(() => {
    async function loadProfile() {
      // Получаем текущего пользователя
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/auth');
        return;
      }

      setUserEmail(user.email || '');

      // Загружаем данные из таблицы profiles
      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name, phone, address, pref_brand, notify_status, user_notes')
        .eq('id', user.id)
        .single();

      if (data) {
        setFirstName(data.first_name || '');
        setLastName(data.last_name || '');
        setPhone(data.phone || '');
        setAddress(data.address || '');
        setPrefBrand(data.pref_brand || 'none');
        setNotifyStatus(data.notify_status !== undefined ? data.notify_status : true);
        setUserNotes(data.user_notes || '');
      }
      setLoading(false);
    }

    loadProfile();
  }, [router]);

  // Функция сохранения изменений
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      first_name: firstName,
      last_name: lastName,
      phone: phone,
      address: address,
      pref_brand: prefBrand,
      notify_status: notifyStatus,
      user_notes: userNotes,
      updated_at: new Date().toISOString(),
    });

    setSaving(false);
    if (error) {
      alert(`Ошибка при сохранении: ${error.message}`);
    } else {
      alert('Конфигурация профиля успешно обновлена!');
    }
  };

  // Функция выхода из аккаунта
  const handleSignOut = async () => {
    const confirmSignOut = window.confirm('Вы уверены, что хотите выйти из аккаунта?');
    if (!confirmSignOut) return;

    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 selection:bg-violet-500 selection:text-white">
      <div className="container mx-auto max-w-3xl pt-4">
        
        {/* Кнопка назад */}
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-violet-400 transition-colors mb-6 group">
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> 
          <span>Вернуться на главную</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Левая колонка: Карточка юзера и кнопка выхода */}
          <div className="lg:col-span-4 rounded-2xl border border-slate-800 bg-slate-900/20 p-6 backdrop-blur-md text-center">
            <div className="relative mx-auto h-24 w-24 rounded-full bg-gradient-to-tr from-violet-600 to-fuchsia-600 p-[2px] shadow-lg shadow-violet-950/50">
              <div className="flex h-full w-full items-center justify-center rounded-full bg-slate-950 text-violet-400">
                <User className="h-10 w-10" />
              </div>
            </div>
            
            <h3 className="mt-4 font-bold text-lg text-white truncate px-2">
              {firstName ? `${firstName} ${lastName}` : 'Кибер-Энтузиаст'}
            </h3>
            <p className="text-xs text-slate-500 truncate mt-0.5">{userEmail}</p>

            <div className="mt-6 pt-6 border-t border-slate-800/80">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-950 border border-slate-800 hover:bg-rose-950/20 hover:border-rose-900/40 text-slate-400 hover:text-rose-400 py-2.5 text-sm font-semibold transition-all active:scale-[0.98]"
              >
                <LogOut className="h-4 w-4" />
                <span>Выйти из аккаунта</span>
              </button>
            </div>
          </div>

          {/* Правая колонка: Форма настроек */}
          <div className="lg:col-span-8 rounded-2xl border border-slate-800 bg-slate-900/40 p-6 md:p-8 backdrop-blur-md shadow-2xl">
            <form onSubmit={handleSave} className="space-y-8">
              
              {/* Секция 1: Личные данные */}
              <div>
                <h4 className="text-xs font-bold text-violet-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <User className="h-4 w-4" /> Личная информация
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Имя</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Имя"
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-sm text-slate-200 focus:border-violet-500 focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Фамилия</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Фамилия"
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-sm text-slate-200 focus:border-violet-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Секция 2: Контакты */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-violet-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Smartphone className="h-4 w-4" /> Контакты и Доставка
                </h4>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Номер телефона</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+380..."
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-sm text-slate-200 focus:border-violet-500 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Адрес Новой Почты / Курьера</label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Город, № отделения или адрес для доставки"
                    rows={2}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-sm text-slate-200 focus:border-violet-500 focus:outline-none transition-colors resize-none"
                  />
                </div>
              </div>

              {/* Секция 3: Геймерские предпочтения (Новое!) */}
              <div className="border-t border-slate-800/80 pt-6 space-y-4">
                <h4 className="text-xs font-bold text-violet-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Cpu className="h-4 w-4" /> Железо и Предпочтения
                </h4>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Любимый бренд комплектующих</label>
                  <select
                    value={prefBrand}
                    onChange={(e) => setPrefBrand(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-sm text-slate-200 focus:border-violet-500 focus:outline-none transition-colors appearance-none cursor-pointer"
                  >
                    <option value="none">Нет предпочтений (Сбалансированный ПК)</option>
                    <option value="intel_nvidia">Intel + NVIDIA Team</option>
                    <option value="amd_radeon">Full AMD Build (Ryzen + Radeon)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Пожелания к сборкам (Заметки)</label>
                  <textarea
                    value={userNotes}
                    onChange={(e) => setUserNotes(e.target.value)}
                    placeholder="Например: Люблю максимальную тишину / Нужна только жидкостная система охлаждения / Предпочитаю белые комплектующие"
                    rows={2}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-sm text-slate-200 focus:border-violet-500 focus:outline-none transition-colors resize-none"
                  />
                </div>
              </div>

              {/* Секция 4: Системные настройки (Новое!) */}
              <div className="border-t border-slate-800/80 pt-6">
                <h4 className="text-xs font-bold text-violet-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Settings className="h-4 w-4" /> Системные уведомления
                </h4>
                <div className="flex items-center justify-between rounded-xl bg-slate-950/60 border border-slate-800 p-4">
                  <div className="flex gap-3 items-start">
                    <Bell className="h-5 w-5 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-slate-200">Статусы сборки и заказов</p>
                      <p className="text-xs text-slate-500 mt-0.5">Получать email-оповещения, когда специалисты начинают собирать и тестировать ваш ПК</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifyStatus}
                    onChange={(e) => setNotifyStatus(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-800 bg-slate-950 text-violet-600 focus:ring-violet-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Кнопка сохранения формы */}
              <button
                type="submit"
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-violet-600 py-3 text-sm font-bold text-white transition-all hover:bg-violet-500 active:scale-[0.99] disabled:opacity-50 shadow-md shadow-violet-950/50"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                <span>Сохранить профиль</span>
              </button>

            </form>
          </div>

        </div>
      </div>
    </div>
  );
}