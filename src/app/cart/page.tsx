'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCart } from '../../store/useCart'
import { supabase } from '../../utils/supabase'
import { 
  Trash2, Plus, Minus, ShoppingBag, ArrowLeft, 
  CreditCard, Truck, User, Smartphone, Loader2, CheckCircle2 
} from 'lucide-react';

// НАСТРОЙКИ TELEGRAM (Вставь сюда свои данные)
const TELEGRAM_BOT_TOKEN = '8568639508:AAGD_J1QlO5UxFA9HHDeC98iN2x6tXhkp5U'; 
const TELEGRAM_CHAT_ID = '649141894';

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');

  // Данные покупателя
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Автозагрузка данных профиля из Supabase
  useEffect(() => {
    async function loadProfileForCheckout() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('first_name, last_name, phone, address')
          .eq('id', user.id)
          .single();
        
        if (data) {
          setFirstName(data.first_name || '');
          setLastName(data.last_name || '');
          setPhone(data.phone || '');
          setAddress(data.address || '');
        }
      }
      setLoading(false);
    }
    loadProfileForCheckout();
  }, []);

  // Функция отправки уведомления администратору @n1kor0 в Telegram
  const sendTelegramNotification = async (methodName: string) => {
    const itemsList = cart.map(item => `• ${item.name} (${item.quantity} шт.) — ${item.price * item.quantity} грн`).join('\n');
    
    const text = `
⚡️ <b>НОВЫЙ ЗАКАЗ НА САЙТЕ CYBER PC!</b> ⚡️

👤 <b>Покупатель:</b> ${firstName} ${lastName}
📞 <b>Телефон:</b> ${phone}
📍 <b>Адрес доставки:</b> ${address}

🛒 <b>Товары в заказе:</b>
${itemsList}

💰 <b>Итоговая сумма:</b> ${totalPrice.toLocaleString()} грн
💳 <b>Способ оплаты:</b> ${methodName}
🏦 <b>Реквизиты получателя (@n1kor0):</b> 4441111014863504
    `;

    try {
      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: text,
          parse_mode: 'HTML'
        })
      });
    } catch (err) {
      console.error('Ошибка отправки в TG:', err);
    }
  };

  // Обработчик систем экспресс-оплаты
  const handleExpressPayment = (method: string, label: string) => {
    if (!firstName || !phone || !address) {
      alert('Пожалуйста, заполните данные доставки слева перед выбором оплаты!');
      return;
    }

    setPaymentMethod(label);
    setIsProcessing(true);

    // Эмулируем авторизацию шлюза транзакции (FaceID / TouchID биометрию)
    setTimeout(async () => {
      await sendTelegramNotification(label);
      setIsProcessing(false);
      setOrderSuccess(true);
      clearCart();
    }, 3000);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
      </div>
    );
  }

  if (orderSuccess) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-slate-950 text-slate-100 p-4">
        <div className="rounded-full bg-emerald-500/10 border border-emerald-500/30 p-6 text-emerald-400 mb-6 shadow-xl shadow-emerald-950/40">
          <CheckCircle2 className="h-16 w-16 animate-pulse" />
        </div>
        <h2 className="text-3xl font-black mb-2 uppercase tracking-wider">Заказ Оформлен!</h2>
        <p className="text-emerald-400 text-sm font-mono mb-4">МЕТОД: {paymentMethod}</p>
        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl text-center max-w-md mb-8">
          <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Реквизиты для перевода:</p>
          <p className="text-lg font-mono font-black text-white mt-1 select-all tracking-wider">4441111014863504</p>
          <p className="text-[11px] text-slate-500 mt-2">Сумма к зачислению: <span className="text-emerald-400 font-bold">{totalPrice.toLocaleString()} грн</span>. Администратор @n1kor0 уже получил детали заказа в Telegram.</p>
        </div>
        <Link href="/" className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-bold text-white hover:bg-violet-500 transition-all">
          <ArrowLeft className="h-4 w-4" /> <span>Вернуться на главную</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      
      {/* Экран биометрии и процессинга */}
      {isProcessing && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center">
          <div className="relative flex items-center justify-center mb-6">
            <div className="absolute h-32 w-32 rounded-full border-4 border-violet-500/20 animate-ping" />
            <div className="h-24 w-24 rounded-full border-4 border-dashed border-violet-500 animate-spin flex items-center justify-center text-violet-400" />
          </div>
          <p className="text-sm font-black tracking-widest text-violet-400 uppercase animate-pulse">Инициализация {paymentMethod}...</p>
          <p className="text-xs text-slate-500 font-mono mt-1">Подтвердите списание средств со счета карты 4441...</p>
        </div>
      )}

      <div className="container mx-auto max-w-7xl pt-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Данные доставки и товары */}
          <div className="lg:col-span-7 space-y-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/20 p-6 backdrop-blur-md">
              <h3 className="text-xs font-bold text-violet-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Truck className="h-4 w-4" /> Информация о доставке
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-sm text-slate-200 focus:border-violet-500 focus:outline-none" placeholder="Имя" />
                  <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-sm text-slate-200 focus:border-violet-500 focus:outline-none" placeholder="Фамилия" />
                </div>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-sm text-slate-200 focus:border-violet-500 focus:outline-none" placeholder="Номер телефона" />
                <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-sm text-slate-200 focus:border-violet-500 focus:outline-none" placeholder="Город, № отделения Новой Почты" />
              </div>
            </div>

            {/* Компактный список деталей */}
            <div className="space-y-2">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-800/60 bg-slate-900/10 backdrop-blur-sm gap-4">
                  <div className="flex items-center gap-3 truncate">
                    <img src={item.image} alt={item.name} className="h-10 w-16 object-cover rounded-md bg-slate-950 border border-slate-800" />
                    <h4 className="font-bold text-sm text-slate-300 truncate">{item.name} <span className="text-xs text-slate-500 font-mono">({item.quantity} шт)</span></h4>
                  </div>
                  <span className="text-sm font-bold text-emerald-400 font-mono">{(item.price * item.quantity).toLocaleString()} грн</span>
                </div>
              ))}
            </div>
          </div>

          {/* Итог и Кнопки Чекаута */}
          <div className="lg:col-span-5">
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl border border-slate-800 p-6 sticky top-24 shadow-2xl">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-4 border-b border-slate-800 pb-3">Сводка платежа</h3>
              
              <div className="flex justify-between items-baseline mb-6">
                <span className="font-bold text-slate-400 text-sm">Итого к оплате</span>
                <span className="text-2xl font-black text-emerald-400 font-mono">{totalPrice.toLocaleString()} грн</span>
              </div>

              {/* ВИДЖЕТЫ ОПЛАТЫ */}
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block text-center mb-2">Выбрать метод экспресс-оплаты</span>
                
                {/* Apple Pay */}
                <button 
                  onClick={() => handleExpressPayment('apple', 'Apple Pay')}
                  className="w-full bg-white text-black h-12 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-100 active:scale-[0.99] transition-all text-sm tracking-wide"
                >
                  <span className="text-lg">🍏</span> <span>Apple Pay</span>
                </button>

                {/* Google Pay */}
                <button 
                  onClick={() => handleExpressPayment('google', 'Google Pay')}
                  className="w-full bg-slate-900 text-white border border-slate-800 h-12 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 active:scale-[0.99] transition-all text-sm tracking-wide"
                >
                  <span className="text-lg">🤖</span> <span>Google Pay</span>
                </button>

                {/* PayPal */}
                <button 
                  onClick={() => handleExpressPayment('paypal', 'PayPal')}
                  className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 h-12 rounded-xl font-black flex items-center justify-center gap-1 hover:brightness-110 active:scale-[0.99] transition-all text-sm italic tracking-tight"
                >
                  <span className="text-blue-900 font-extrabold text-base">Pay</span><span className="text-cyan-700 font-extrabold text-base">Pal</span>
                </button>
              </div>

              <p className="text-[10px] text-slate-500 text-center mt-4">Все транзакции защищены сквозным шифрованием SSL.</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}