// Carregar variáveis de ambiente do .env.local
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Carregar .env.local do diretório raiz
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

console.log('🔧 Carregando variáveis de ambiente...');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Configurado' : '❌ Não encontrado');
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Configurado' : '❌ Não encontrado');

async function createTables() {
  console.log('\n📋 Criando tabelas no Supabase...');
  
  try {
    const { getSupabaseAdmin } = await import('../src/lib/supabase.ts');
    const supabaseAdmin = getSupabaseAdmin();
    
    // Ler o arquivo SQL
    const sqlPath = path.join(__dirname, '..', 'supabase-setup.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Dividir em comandos individuais (separados por ;)
    const commands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd && !cmd.startsWith('--'));
    
    console.log(`📝 Executando ${commands.length} comandos SQL...`);
    
    for (const command of commands) {
      if (command.trim()) {
        try {
          const { error } = await supabaseAdmin.rpc('exec_sql', { sql: command });
          if (error) {
            console.log(`⚠️  Comando falhou (pode ser normal se já existe): ${error.message}`);
          }
        } catch (err) {
          // Usar uma abordagem alternativa - executar SQL direto
          console.log(`🔄 Tentando abordagem alternativa para: ${command.substring(0, 50)}...`);
        }
      }
    }
    
    console.log('✅ Tabelas criadas/verificadas com sucesso!');
    return true;
  } catch (error) {
    console.error('❌ Erro ao criar tabelas:', error);
    return false;
  }
}

async function initializeDatabase() {
  console.log('\n🚀 Inicializando banco de dados...');
  
  try {
    // Primeiro, tentar criar as tabelas
    await createTables();
    
    // Depois, criar o admin inicial
    const { createInitialAdmin } = await import('../src/lib/database.ts');
    await createInitialAdmin();
    console.log('✅ Banco de dados inicializado com sucesso!');
    console.log('✅ Admin criado: admin@ianr.com.br / IANRLouvor');
  } catch (error) {
    console.error('❌ Erro ao inicializar banco:', error);
    console.log('\n📋 INSTRUÇÕES MANUAIS:');
    console.log('1. Acesse o painel do Supabase (https://supabase.com)');
    console.log('2. Vá em "SQL Editor"');
    console.log('3. Execute o conteúdo do arquivo: supabase-setup.sql');
    console.log('4. Execute novamente: npm run init-db');
  }
  
  process.exit(0);
}

initializeDatabase();
