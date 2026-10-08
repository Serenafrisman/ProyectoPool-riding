import { createClient } from '@supabase/supabase-js';

// Las claves van entre comillas simples ' '
const supabaseUrl ='https://yuzspbxqvristrkgdirk.supabase.co'; // Asegurate de que empiece con https:// y termine en .supabase.co
const supabaseAnonKey = 'sb_publishable_-uTPLoYLKKBgjcJ5yXzIKw_X4a9M-u4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);