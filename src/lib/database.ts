import { getSupabase, getSupabaseAdmin } from './supabase';
import bcrypt from 'bcryptjs';

// Types
export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: string;
  created_at: string;
}

export interface Pessoa {
  id: number;
  nome: string;
  tipo: 'ministro' | 'vocal' | 'musico';
  instrumentos: string[];
  created_at: string;
}

export interface Escala {
  id: number;
  data: string;
  periodo?: string;
  ministro_id?: number;
  back_vocals: number[];
  violao_id?: number;
  teclado_id?: number;
  baixo_id?: number;
  bateria_id?: number;
  created_at: string;
}

// Função para inicializar as tabelas (SQL para executar no Supabase)
export const initializeDatabaseSQL = `
-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de pessoas
CREATE TABLE IF NOT EXISTS pessoas (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('ministro', 'vocal', 'musico')),
  instrumentos JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de escalas
CREATE TABLE IF NOT EXISTS escalas (
  id SERIAL PRIMARY KEY,
  data DATE NOT NULL,
  periodo TEXT,
  ministro_id INTEGER REFERENCES pessoas(id),
  back_vocals JSONB DEFAULT '[]'::jsonb,
  violao_id INTEGER REFERENCES pessoas(id),
  teclado_id INTEGER REFERENCES pessoas(id),
  baixo_id INTEGER REFERENCES pessoas(id),
  bateria_id INTEGER REFERENCES pessoas(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS (Row Level Security) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE pessoas ENABLE ROW LEVEL SECURITY;
ALTER TABLE escalas ENABLE ROW LEVEL SECURITY;

-- Policies para permitir acesso autenticado
CREATE POLICY "Allow authenticated users" ON users FOR ALL USING (true);
CREATE POLICY "Allow authenticated users" ON pessoas FOR ALL USING (true);
CREATE POLICY "Allow authenticated users" ON escalas FOR ALL USING (true);
`;

// Funções para usuários
export const userQueries = {
  async create(email: string, password: string, name: string, role: string = 'admin') {
    const { data, error } = await getSupabaseAdmin()
      .from('users')
      .insert({ email, password, name, role })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async findByEmail(email: string) {
    const { data, error } = await getSupabaseAdmin()
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
    return data;
  },

  async findById(id: string) {
    const { data, error } = await getSupabaseAdmin()
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async count() {
    const { count, error } = await getSupabaseAdmin()
      .from('users')
      .select('*', { count: 'exact', head: true });
    
    if (error) throw error;
    return { count: count || 0 };
  }
};

// Funções para pessoas
export const pessoaQueries = {
  async getAll() {
    const { data, error } = await getSupabase()
      .from('pessoas')
      .select('*')
      .order('nome');
    
    if (error) throw error;
    return data;
  },

  async create(nome: string, tipo: string, instrumentos: string[]) {
    const { data, error } = await getSupabase()
      .from('pessoas')
      .insert({ nome, tipo, instrumentos })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: number) {
    const { error } = await getSupabase()
      .from('pessoas')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async findById(id: number) {
    const { data, error } = await getSupabase()
      .from('pessoas')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }
};

// Funções para escalas
export const escalaQueries = {
  async getAll() {
    const { data, error } = await getSupabase()
      .from('escalas')
      .select(`
        *,
        ministro:pessoas!escalas_ministro_id_fkey(nome),
        violao:pessoas!escalas_violao_id_fkey(nome),
        teclado:pessoas!escalas_teclado_id_fkey(nome),
        baixo:pessoas!escalas_baixo_id_fkey(nome),
        bateria:pessoas!escalas_bateria_id_fkey(nome)
      `)
      .order('data');
    
    if (error) throw error;
    
    // Processar os dados para manter compatibilidade com o formato anterior
    return data.map((escala: any) => ({
      ...escala,
      ministro_nome: escala.ministro?.nome,
      violao_nome: escala.violao?.nome,
      teclado_nome: escala.teclado?.nome,
      baixo_nome: escala.baixo?.nome,
      bateria_nome: escala.bateria?.nome
    }));
  },

  async create(data: string, periodo: string | null, ministro_id: number | null, back_vocals: number[], violao_id: number | null, teclado_id: number | null, baixo_id: number | null, bateria_id: number | null) {
    const { data: result, error } = await getSupabase()
      .from('escalas')
      .insert({
        data,
        periodo,
        ministro_id,
        back_vocals,
        violao_id,
        teclado_id,
        baixo_id,
        bateria_id
      })
      .select()
      .single();
    
    if (error) throw error;
    return result;
  },

  async update(id: number, data: string, periodo: string | null, ministro_id: number | null, back_vocals: number[], violao_id: number | null, teclado_id: number | null, baixo_id: number | null, bateria_id: number | null) {
    const { data: result, error } = await getSupabase()
      .from('escalas')
      .update({
        data,
        periodo,
        ministro_id,
        back_vocals,
        violao_id,
        teclado_id,
        baixo_id,
        bateria_id
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return result;
  },

  async delete(id: number) {
    const { error } = await getSupabase()
      .from('escalas')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async findById(id: number) {
    const { data, error } = await getSupabase()
      .from('escalas')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }
};

// Função para criar usuário admin inicial
export async function createInitialAdmin() {
  try {
    const userCount = await userQueries.count();
    
    if (userCount.count === 0) {
      const hashedPassword = await bcrypt.hash('IANRLouvor', 12);
      await userQueries.create('admin@ianr.com.br', hashedPassword, 'Administrador', 'admin');
      console.log('Admin inicial criado com sucesso');
    }
  } catch (error) {
    console.error('Erro ao criar admin inicial:', error);
  }
}

// Função para verificar senha
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Função para hash de senha
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}
