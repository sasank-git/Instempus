import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://jzwzdvrzykkhvimfmdhy.supabase.co';
const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6d3pkdnJ6eWtraHZpbWZtZGh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTExMTE5NjIsImV4cCI6MjEwNjY4Nzk2Mn0.7dOJIwIzmaMkBtgoc18-Hi_1zzdlGLuqMAT3jDgI2EI';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
