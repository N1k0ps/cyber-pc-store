import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Выводим в консоль терминала то, что прочитал Next.js
console.log('--- ПРОВЕРКА КЛЮЧЕЙ SUPABASE ---');
console.log('URL:', supabaseUrl ? 'Найдено (Успех)' : 'ПУСТО (Ошибка!)');
console.log('KEY:', supabaseAnonKey ? 'Найдено (Успех)' : 'ПУСТО (Ошибка!)');
console.log('--------------------------------');

export const supabase = createClient(
  supabaseUrl || 'https://placeholder-project.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);