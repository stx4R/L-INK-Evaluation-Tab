import { createClient } from '@supabase/supabase-js';

// .env.local 파일에 VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY를 설정하세요.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://YOUR_PROJECT.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseKey);