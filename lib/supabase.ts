import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const supabaseUrl = 'YOUR_SUPABASE_URL'; // Replace with your URL or process.env
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY'; // Replace with your Key or process.env

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Tell Supabase to use AsyncStorage to cache session tokens locally
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
  },
});