# 🎵 Sistema de Escalas de Louvor - Documentação Completa

## 📋 Sobre o Sistema

Sistema completo para gerenciamento de escalas de louvor da igreja, desenvolvido em Next.js 15 com React 19, autenticação NextAuth.js e banco SQLite local.

## ✨ Funcionalidades Implementadas

### 🔐 Autenticação e Segurança
- Login com email e senha
- Proteção de rotas com middleware
- Sessões JWT com NextAuth.js
- Banco SQLite local para persistência
- Hash de senhas com bcryptjs
- Logout funcional

### 👥 Gerenciamento de Pessoas
- Cadastro de ministros, back vocals e músicos
- Seleção de instrumentos para músicos
- Listagem e remoção de pessoas
- Validação de dados

### 📅 Gerenciamento de Escalas
- Criação de escalas por data
- Seleção de ministro e back vocals
- Atribuição de instrumentos (violão, teclado, baixo, bateria)
- Visualização mensal em tabela
- Edição e remoção de escalas
- Geração de imagem da tabela (PNG)

### 🎨 Interface
- Design responsivo com Tailwind CSS
- Interface moderna e intuitiva
- Navegação por abas
- Feedback visual (loading, erros, sucesso)
- Contraste otimizado para legibilidade
- Ícones com Lucide React

## 🚀 Como Usar

### 1. Acesso Inicial
- O sistema criará automaticamente um usuário admin:
  - **Email**: admin@igreja.com
  - **Senha**: admin123

### 2. Login
- Acesse `http://localhost:3000`
- O sistema redirecionará para `/login`
- Use as credenciais padrão ou crie um novo admin

### 3. Navegação
- **Aba Escalas**: Visualize e gerencie escalas mensais
- **Aba Pessoas**: Cadastre e gerencie pessoas do ministério

### 4. Cadastro de Pessoas
1. Vá para a aba "Pessoas"
2. Clique em "Adicionar Pessoa"
3. Selecione o tipo (Ministro, Back Vocal, Músico)
4. Para músicos, selecione os instrumentos
5. Salve

### 5. Criação de Escalas
1. Vá para a aba "Escalas"
2. Clique em "Nova Escala"
3. Selecione a data
4. Escolha o ministro e back vocals
5. Atribua os instrumentos
6. Salve

### 6. Visualização e Edição
- Use os botões de navegação mensal (← →)
- Clique no ícone de edição para alterar escalas
- Use o botão de câmera para gerar imagem da tabela
- Delete escalas com o ícone de lixeira

## 🔧 Instalação e Desenvolvimento

### Pré-requisitos
- Node.js 18+ 
- NPM ou Yarn

### Comandos
```bash
# Instalar dependências
npm install

# Modo desenvolvimento
npm run dev

# Build para produção
npm run build

# Iniciar produção
npm start
```

### Dependências Principais
- Next.js 15.3.4
- React 19
- NextAuth.js 4
- better-sqlite3 (banco local)
- Tailwind CSS 3
- TypeScript
- Lucide React (ícones)
- html2canvas (geração de imagem)

## 📁 Estrutura do Projeto

```
src/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/route.ts    # Configuração NextAuth
│   │   │   └── register/route.ts         # Registro de admin
│   │   ├── pessoas/route.ts              # API de pessoas
│   │   └── escalas/route.ts              # API de escalas
│   ├── login/page.tsx                    # Página de login
│   ├── register/page.tsx                 # Página de registro (removível)
│   ├── layout.tsx                        # Layout com SessionProvider
│   └── page.tsx                          # Página principal
├── components/
│   ├── FormEscala.tsx                    # Formulário de escalas
│   ├── GerenciarPessoas.tsx              # Gerenciamento de pessoas
│   └── TabelaEscalas.tsx                 # Tabela mensal de escalas
├── contexts/
│   └── EscalasContext.tsx                # Contexto global do app
├── lib/
│   ├── database.ts                       # Configuração SQLite
│   └── auth.ts                           # Configuração NextAuth
├── types/
│   ├── index.ts                          # Tipos TypeScript
│   └── next-auth.d.ts                    # Tipos NextAuth
└── utils/
    └── imageCapture.ts                   # Utilitário para captura de imagem
```

## 🗄️ Banco de Dados

### Tabelas Criadas Automaticamente

#### users
- id (INTEGER PRIMARY KEY)
- email (TEXT UNIQUE)
- password (TEXT - hash bcrypt)
- name (TEXT)
- role (TEXT - padrão 'admin')
- created_at (DATETIME)

#### pessoas  
- id (INTEGER PRIMARY KEY)
- nome (TEXT)
- tipo (TEXT - 'ministro', 'vocal', 'musico')
- instrumentos (TEXT - JSON array)
- created_at (DATETIME)

#### escalas
- id (INTEGER PRIMARY KEY)
- data (TEXT - formato YYYY-MM-DD)
- ministro_id (INTEGER - FK para pessoas)
- back_vocals (TEXT - JSON array de IDs)
- violao_id (INTEGER - FK para pessoas)
- teclado_id (INTEGER - FK para pessoas)
- baixo_id (INTEGER - FK para pessoas)
- bateria_id (INTEGER - FK para pessoas)
- created_at (DATETIME)

## 🛡️ Segurança

- Todas as rotas protegidas por middleware
- Senhas hasheadas com bcrypt (salt 12)
- Sessões JWT seguras
- Validação de dados nas APIs
- Sanitização de inputs

## 🚀 Deploy

### Vercel (Recomendado)
1. Conecte seu repositório GitHub à Vercel
2. Configure as variáveis de ambiente:
   - `NEXTAUTH_URL`: URL do seu site
   - `NEXTAUTH_SECRET`: Chave secreta forte
3. Deploy automático

### Outras Plataformas
- Funciona em qualquer plataforma que suporte Node.js
- Certifique-se de que o SQLite seja persistente

## ⚠️ Notas Importantes

### Rota de Registro
- A rota `/register` foi criada apenas para configuração inicial
- **REMOVER APÓS CRIAR O ADMIN PRINCIPAL**
- Para remover: delete o arquivo `src/app/register/page.tsx` e `src/app/api/auth/register/route.ts`

### Backup do Banco
- O arquivo `database.sqlite` contém todos os dados
- Faça backup regular deste arquivo
- Em produção, considere usar PostgreSQL

### Variáveis de Ambiente
```env
NEXTAUTH_URL=https://seu-dominio.com
NEXTAUTH_SECRET=sua-chave-secreta-super-forte-aqui
```

## 🐛 Solução de Problemas

### Build Falha
- Verifique se todas as dependências estão instaladas
- Confirme versões do Node.js (18+)

### Login Não Funciona
- Verifique as variáveis de ambiente
- Confirme se o banco foi criado corretamente

### Imagens Não Geram
- Problema comum com html2canvas
- Use o botão de fallback que aparece automaticamente

## 📞 Suporte

Sistema desenvolvido para uso interno da igreja. Para dúvidas técnicas, consulte o desenvolvedor.

---

**Sistema Escalas de Louvor v1.0**  
Desenvolvido com ❤️ para o ministério de louvor
