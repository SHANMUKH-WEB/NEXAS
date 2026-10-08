import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://csdusdduodzbehqxffly.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzZHVzZGR1b2R6YmVocXhmZmx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEzNzQ4ODgsImV4cCI6MjEwNjk1MDg4OH0.KQkS-fQg-WqYXrDB5SeEQkTAAoZwJ-Ks2MS_umexPCc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
