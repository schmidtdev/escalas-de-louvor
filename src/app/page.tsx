'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { EscalasProvider } from '@/contexts/EscalasContext';
import GerenciarPessoas from '@/components/GerenciarPessoas';
import TabelaEscalas from '@/components/TabelaEscalas';
import { Users, Calendar, Church, LogOut, User } from 'lucide-react';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [abaSelecionada, setAbaSelecionada] = useState<'escalas' | 'pessoas'>('escalas');

  // Redirecionar para login se não estiver autenticado
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecionando para o login...</p>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    signOut({ callbackUrl: '/login' });
  };

  return (
    <EscalasProvider>
      <div className="min-h-screen bg-gray-100">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14 sm:h-16">
              <div className="flex items-center gap-2 sm:gap-3">
                <Church className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                    Escalas de Louvor
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">
                    Sistema de Gerenciamento da Igreja
                  </p>
                </div>
              </div>
              
              {/* User Menu */}
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
                  <User className="w-4 h-4" />
                  <span className="max-w-32 truncate">{session?.user?.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 text-xs sm:text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Sair</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation */}
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
            <div className="flex">
              <button
                onClick={() => setAbaSelecionada('escalas')}
                className={`flex-1 sm:flex-none flex items-center justify-center sm:justify-start gap-2 py-3 sm:py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  abaSelecionada === 'escalas'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Calendar className="w-4 h-4" />
                Escalas
              </button>
              <button
                onClick={() => setAbaSelecionada('pessoas')}
                className={`flex-1 sm:flex-none flex items-center justify-center sm:justify-start gap-2 py-3 sm:py-4 px-1 sm:ml-8 border-b-2 font-medium text-sm transition-colors ${
                  abaSelecionada === 'pessoas'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Users className="w-4 h-4" />
                Pessoas
              </button>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
          {abaSelecionada === 'escalas' && <TabelaEscalas />}
          {abaSelecionada === 'pessoas' && <GerenciarPessoas />}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t mt-8 sm:mt-16">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
            <p className="text-center text-xs sm:text-sm text-gray-500">
              Sistema de Escalas de Louvor - Desenvolvido para facilitar a organização da igreja
            </p>
          </div>
        </footer>
      </div>
    </EscalasProvider>
  );
}
