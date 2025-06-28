import { createClient } from '@supabase/supabase-js';

// Função para criar cliente Supabase com lazy loading das variáveis
function createSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is required. Please check your .env.local file.');
  }

  if (!supabaseAnonKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is required. Please check your .env.local file.');
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

function createSupabaseAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is required. Please check your .env.local file.');
  }

  return supabaseServiceKey 
    ? createClient(supabaseUrl, supabaseServiceKey)
    : createSupabaseClient();
}

// Lazy getters que só criam os clientes quando necessário
export const getSupabase = () => createSupabaseClient();
export const getSupabaseAdmin = () => createSupabaseAdminClient();

// Para compatibilidade com código existente - usar lazy loading
let _supabase: any = null;
let _supabaseAdmin: any = null;

export const supabase = new Proxy({}, {
  get(target, prop) {
    if (!_supabase) _supabase = createSupabaseClient();
    return _supabase[prop];
  }
});

export const supabaseAdmin = new Proxy({}, {
  get(target, prop) {
    if (!_supabaseAdmin) _supabaseAdmin = createSupabaseAdminClient();
    return _supabaseAdmin[prop];
  }
});
