import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';

// Caminho do banco de dados
const dbPath = path.join(process.cwd(), 'database.sqlite');
const db = new Database(dbPath);

// Inicializar tabelas
export function initializeDatabase() {
  // Tabela de usuários
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'admin',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tabela de pessoas
  db.exec(`
    CREATE TABLE IF NOT EXISTS pessoas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      tipo TEXT NOT NULL CHECK (tipo IN ('ministro', 'vocal', 'musico')),
      instrumentos TEXT, -- JSON string para array de instrumentos
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tabela de escalas
  db.exec(`
    CREATE TABLE IF NOT EXISTS escalas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      data TEXT NOT NULL,
      periodo TEXT, -- 'manha' ou 'noite' para domingos
      ministro_id INTEGER,
      back_vocals TEXT, -- JSON string para array de IDs
      violao_id INTEGER,
      teclado_id INTEGER,
      baixo_id INTEGER,
      bateria_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (ministro_id) REFERENCES pessoas (id),
      FOREIGN KEY (violao_id) REFERENCES pessoas (id),
      FOREIGN KEY (teclado_id) REFERENCES pessoas (id),
      FOREIGN KEY (baixo_id) REFERENCES pessoas (id),
      FOREIGN KEY (bateria_id) REFERENCES pessoas (id)
    )
  `);

  // Adicionar coluna periodo se não existir (para escalas existentes)
  try {
    db.exec(`ALTER TABLE escalas ADD COLUMN periodo TEXT`);
  } catch (error) {
    // Coluna já existe, ignorar erro
  }
}

// Inicializar banco imediatamente
initializeDatabase();

// Funções para usuários
export const userQueries = {
  create: db.prepare(`
    INSERT INTO users (email, password, name, role)
    VALUES (?, ?, ?, ?)
  `),
  
  findByEmail: db.prepare(`
    SELECT * FROM users WHERE email = ?
  `),
  
  findById: db.prepare(`
    SELECT * FROM users WHERE id = ?
  `),
  
  count: db.prepare(`
    SELECT COUNT(*) as count FROM users
  `)
};

// Funções para pessoas
export const pessoaQueries = {
  getAll: db.prepare(`
    SELECT * FROM pessoas ORDER BY nome
  `),
  
  create: db.prepare(`
    INSERT INTO pessoas (nome, tipo, instrumentos)
    VALUES (?, ?, ?)
  `),
  
  delete: db.prepare(`
    DELETE FROM pessoas WHERE id = ?
  `),
  
  findById: db.prepare(`
    SELECT * FROM pessoas WHERE id = ?
  `)
};

// Funções para escalas
export const escalaQueries = {
  getAll: db.prepare(`
    SELECT e.*, 
           m.nome as ministro_nome,
           v.nome as violao_nome,
           t.nome as teclado_nome,
           b.nome as baixo_nome,
           d.nome as bateria_nome
    FROM escalas e
    LEFT JOIN pessoas m ON e.ministro_id = m.id
    LEFT JOIN pessoas v ON e.violao_id = v.id
    LEFT JOIN pessoas t ON e.teclado_id = t.id
    LEFT JOIN pessoas b ON e.baixo_id = b.id
    LEFT JOIN pessoas d ON e.bateria_id = d.id
    ORDER BY e.data
  `),
  
  create: db.prepare(`
    INSERT INTO escalas (data, periodo, ministro_id, back_vocals, violao_id, teclado_id, baixo_id, bateria_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `),
  
  update: db.prepare(`
    UPDATE escalas 
    SET data = ?, periodo = ?, ministro_id = ?, back_vocals = ?, violao_id = ?, teclado_id = ?, baixo_id = ?, bateria_id = ?
    WHERE id = ?
  `),
  
  delete: db.prepare(`
    DELETE FROM escalas WHERE id = ?
  `),
  
  findById: db.prepare(`
    SELECT * FROM escalas WHERE id = ?
  `)
};

// Função para criar usuário admin inicial
export async function createInitialAdmin() {
  const userCount = userQueries.count.get() as { count: number };
  
  if (userCount.count === 0) {
    const hashedPassword = await bcrypt.hash('IANRLouvor', 12);
    userQueries.create.run('admin@ianr.com.br', hashedPassword, 'Administrador', 'admin');
  }
}

// Criar admin inicial
createInitialAdmin();

// Função para verificar senha
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Função para hash de senha
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export default db;
