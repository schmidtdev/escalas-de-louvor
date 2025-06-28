'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Pessoa, EscalaItem } from '@/types';

interface EscalasContextType {
  pessoas: Pessoa[];
  escalas: EscalaItem[];
  mesSelecionado: string;
  loading: boolean;
  setMesSelecionado: (mes: string) => void;
  adicionarPessoa: (pessoa: Omit<Pessoa, 'id'>) => Promise<void>;
  removerPessoa: (id: string) => Promise<void>;
  criarEscala: (escala: Omit<EscalaItem, 'id'>) => Promise<void>;
  atualizarEscala: (id: string, escala: Partial<EscalaItem>) => Promise<void>;
  removerEscala: (id: string) => Promise<void>;
  obterEscalasPorMes: (mes: string) => EscalaItem[];
  recarregarDados: () => Promise<void>;
}

const EscalasContext = createContext<EscalasContextType | undefined>(undefined);

export function EscalasProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [escalas, setEscalas] = useState<EscalaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [mesSelecionado, setMesSelecionado] = useState<string>(() => {
    const hoje = new Date();
    return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;
  });

  // Função para fazer requests autenticados
  const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  };

  // Carregar dados iniciais
  const recarregarDados = async () => {
    if (status !== 'authenticated') return;
    
    setLoading(true);
    try {
      const [pessoasData, escalasData] = await Promise.all([
        authenticatedFetch('/api/pessoas'),
        authenticatedFetch('/api/escalas'),
      ]);
      
      setPessoas(pessoasData);
      setEscalas(escalasData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      recarregarDados();
    } else if (status === 'unauthenticated') {
      setLoading(false);
    }
  }, [status]);

  const adicionarPessoa = async (novaPessoa: Omit<Pessoa, 'id'>) => {
    try {
      const pessoaCriada = await authenticatedFetch('/api/pessoas', {
        method: 'POST',
        body: JSON.stringify(novaPessoa),
      });
      
      setPessoas(prev => [...prev, pessoaCriada]);
    } catch (error) {
      console.error('Erro ao adicionar pessoa:', error);
      throw error;
    }
  };

  const removerPessoa = async (id: string) => {
    try {
      await authenticatedFetch(`/api/pessoas?id=${id}`, {
        method: 'DELETE',
      });
      
      setPessoas(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Erro ao remover pessoa:', error);
      throw error;
    }
  };

  const criarEscala = async (novaEscala: Omit<EscalaItem, 'id'>) => {
    try {
      const escalaCriada = await authenticatedFetch('/api/escalas', {
        method: 'POST',
        body: JSON.stringify(novaEscala),
      });
      
      setEscalas(prev => [...prev, escalaCriada]);
    } catch (error) {
      console.error('Erro ao criar escala:', error);
      throw error;
    }
  };

  const atualizarEscala = async (id: string, escalaParcial: Partial<EscalaItem>) => {
    try {
      const escalaAtualizada = await authenticatedFetch('/api/escalas', {
        method: 'PATCH',
        body: JSON.stringify({ id, ...escalaParcial }),
      });
      
      setEscalas(prev => prev.map(escala => 
        escala.id === id ? escalaAtualizada : escala
      ));
    } catch (error) {
      console.error('Erro ao atualizar escala:', error);
      throw error;
    }
  };

  const removerEscala = async (id: string) => {
    try {
      await authenticatedFetch(`/api/escalas?id=${id}`, {
        method: 'DELETE',
      });
      
      setEscalas(prev => prev.filter(e => e.id !== id));
    } catch (error) {
      console.error('Erro ao remover escala:', error);
      throw error;
    }
  };

  const obterEscalasPorMes = (mes: string) => {
    return escalas
      .filter(escala => escala.data.startsWith(mes))
      .sort((a, b) => a.data.localeCompare(b.data));
  };

  return (
    <EscalasContext.Provider value={{
      pessoas,
      escalas,
      mesSelecionado,
      loading,
      setMesSelecionado,
      adicionarPessoa,
      removerPessoa,
      criarEscala,
      atualizarEscala,
      removerEscala,
      obterEscalasPorMes,
      recarregarDados,
    }}>
      {children}
    </EscalasContext.Provider>
  );
}

export function useEscalas() {
  const context = useContext(EscalasContext);
  if (context === undefined) {
    throw new Error('useEscalas deve ser usado dentro de um EscalasProvider');
  }
  return context;
}
