// Carregar variáveis de ambiente do .env.local
import * as dotenv from 'dotenv';
import { join } from 'path';

// Carregar .env.local do diretório raiz
dotenv.config({ path: join(process.cwd(), '.env.local') });

console.log('🔧 Carregando variáveis de ambiente...');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Configurado' : '❌ Não encontrado');
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Configurado' : '❌ Não encontrado');

// Importar após carregar as variáveis
import { createInitialAdmin } from '../src/lib/database';

async function initializeDatabase() {
  console.log('\n🚀 Inicializando banco de dados...');
  
  try {
    await createInitialAdmin();
    console.log('✅ Banco de dados inicializado com sucesso!');
    console.log('✅ Admin criado: admin@ianr.com.br / IANRLouvor');
  } catch (error) {
    console.error('❌ Erro ao inicializar banco:', error);
  }
  
  process.exit(0);
}

initializeDatabase();
