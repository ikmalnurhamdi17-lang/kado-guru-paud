import { createBrowserClient } from '@supabase/ssr';

// Kode ini lebih stabil dan merupakan standar terbaru dari Supabase
// Ia otomatis membaca URL dan KEY dari .env.local Ibu
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);