import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vaomdzazvcqemijkhujp.supabase.co'; // Replace with your actual project URL
const supabaseAnonKey = 'sb_publishable_thSGK68b5Aq3UGb_sBJ2BQ_ImH26D3O'; // Replace with your actual anon public key

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // Disables background storage conflicts on web preview
    detectSessionInUrl: false, // Stops the server from looking for browser URLs early
  },
});