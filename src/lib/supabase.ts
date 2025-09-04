import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabaseUrl = 'https://rkicwozgiufccgztvghl.supabase.co';
const supabaseAnonKey='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJraWN3b3pnaXVmY2NnenR2Z2hsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQwMzQ3NjEsImV4cCI6MjA0OTYxMDc2MX0.lKigHK-D5FbpsCw-SkNaBHaJr7ayhW3VZs9bw7jtms8';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);