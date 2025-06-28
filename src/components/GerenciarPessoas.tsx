'use client';

import { useState } from 'react';
import { useEscalas } from '@/contexts/EscalasContext';
import { Pessoa } from '@/types';
import { Plus, Trash2, User, Music, Mic } from 'lucide-react';

export default function GerenciarPessoas() {
  const { pessoas, adicionarPessoa, removerPessoa, loading } = useEscalas();
  const [novoNome, setNovoNome] = useState('');
  const [novoTipo, setNovoTipo] = useState<'ministro' | 'vocal' | 'musico'>('ministro');
  const [novosInstrumentos, setNovosInstrumentos] = useState<string[]>([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const instrumentosDisponiveis = ['violao', 'teclado', 'baixo', 'bateria'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (novoNome.trim()) {
      adicionarPessoa({
        nome: novoNome.trim(),
        tipo: novoTipo,
        instrumentos: novoTipo === 'musico' ? novosInstrumentos : undefined,
      });
      setNovoNome('');
      setNovosInstrumentos([]);
      setMostrarForm(false);
    }
  };

  const toggleInstrumento = (instrumento: string) => {
    setNovosInstrumentos(prev => 
      prev.includes(instrumento)
        ? prev.filter(i => i !== instrumento)
        : [...prev, instrumento]
    );
  };

  const getIcon = (tipo: string) => {
    switch (tipo) {
      case 'ministro': return <User className="w-4 h-4" />;
      case 'vocal': return <Mic className="w-4 h-4" />;
      case 'musico': return <Music className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const getPessoas = (tipo: 'ministro' | 'vocal' | 'musico') => {
    return pessoas.filter(p => p.tipo === tipo);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Gerenciar Pessoas</h2>
        <button
          onClick={() => setMostrarForm(!mostrarForm)}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Adicionar Pessoa
        </button>
      </div>

      {mostrarForm && (
        <div className="bg-gray-50 p-4 sm:p-6 rounded-lg border">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">
                Nome
              </label>
              <input
                type="text"
                value={novoNome}
                onChange={(e) => setNovoNome(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="Digite o nome completo"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">
                Tipo
              </label>
              <select
                value={novoTipo}
                onChange={(e) => setNovoTipo(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              >
                <option value="ministro">Ministro</option>
                <option value="vocal">Back Vocal</option>
                <option value="musico">Músico</option>
              </select>
            </div>

            {novoTipo === 'musico' && (
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Instrumentos
                </label>
                <div className="grid grid-cols-2 gap-3 border border-gray-200 rounded-lg p-3">
                  {instrumentosDisponiveis.map(instrumento => (
                    <label key={instrumento} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={novosInstrumentos.includes(instrumento)}
                        onChange={() => toggleInstrumento(instrumento)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 flex-shrink-0"
                      />
                      <span className="text-sm capitalize text-gray-800 font-medium">{instrumento}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
              <button
                type="submit"
                className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors order-1"
              >
                Salvar
              </button>
              <button
                type="button"
                onClick={() => setMostrarForm(false)}
                className="w-full sm:w-auto bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors order-2"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Ministros */}
        <div className="bg-white p-4 sm:p-6 rounded-lg border">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900">
            <User className="w-5 h-5 text-blue-600" />
            Ministros ({getPessoas('ministro').length})
          </h3>
          <div className="space-y-2">
            {getPessoas('ministro').map(pessoa => (
              <div key={pessoa.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-semibold text-gray-900 text-sm sm:text-base truncate pr-2">{pessoa.nome}</span>
                <button
                  onClick={() => removerPessoa(pessoa.id)}
                  className="text-red-600 hover:text-red-800 p-1 flex-shrink-0"
                  title="Remover"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {getPessoas('ministro').length === 0 && (
              <p className="text-gray-600 text-sm italic">Nenhum ministro cadastrado</p>
            )}
          </div>
        </div>

        {/* Back Vocals */}
        <div className="bg-white p-4 sm:p-6 rounded-lg border">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900">
            <Mic className="w-5 h-5 text-purple-600" />
            Back Vocals ({getPessoas('vocal').length})
          </h3>
          <div className="space-y-2">
            {getPessoas('vocal').map(pessoa => (
              <div key={pessoa.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-semibold text-gray-900 text-sm sm:text-base truncate pr-2">{pessoa.nome}</span>
                <button
                  onClick={() => removerPessoa(pessoa.id)}
                  className="text-red-600 hover:text-red-800 p-1 flex-shrink-0"
                  title="Remover"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {getPessoas('vocal').length === 0 && (
              <p className="text-gray-600 text-sm italic">Nenhum back vocal cadastrado</p>
            )}
          </div>
        </div>

        {/* Músicos */}
        <div className="bg-white p-4 sm:p-6 rounded-lg border">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900">
            <Music className="w-5 h-5 text-green-600" />
            Músicos ({getPessoas('musico').length})
          </h3>
          <div className="space-y-2">
            {getPessoas('musico').map(pessoa => (
              <div key={pessoa.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900 text-sm sm:text-base truncate pr-2">{pessoa.nome}</span>
                  <button
                    onClick={() => removerPessoa(pessoa.id)}
                    className="text-red-600 hover:text-red-800 p-1 flex-shrink-0"
                    title="Remover"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                {pessoa.instrumentos && pessoa.instrumentos.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {pessoa.instrumentos.map(instrumento => (
                      <span key={instrumento} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        {instrumento}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {getPessoas('musico').length === 0 && (
              <p className="text-gray-600 text-sm italic">Nenhum músico cadastrado</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
