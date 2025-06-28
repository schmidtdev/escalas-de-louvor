-- SQL para executar no Supabase SQL Editor

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

-- Habilitar RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE pessoas ENABLE ROW LEVEL SECURITY;
ALTER TABLE escalas ENABLE ROW LEVEL SECURITY;

-- Políticas para permitir acesso (por enquanto, permitir tudo)
-- Em produção, você pode criar políticas mais restritivas baseadas em autenticação
CREATE POLICY "Allow all operations" ON users FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON pessoas FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON escalas FOR ALL USING (true);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_escalas_data ON escalas(data);
CREATE INDEX IF NOT EXISTS idx_pessoas_tipo ON pessoas(tipo);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
