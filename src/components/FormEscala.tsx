'use client';

import { useState } from 'react';
import { useEscalas } from '@/contexts/EscalasContext';
import { EscalaItem, Pessoa, Instrumento } from '@/types';
import { Plus, Save, X } from 'lucide-react';

interface FormEscalaProps {
  escalaParaEditar?: EscalaItem;
  onClose: () => void;
}

export default function FormEscala({ escalaParaEditar, onClose }: FormEscalaProps) {
  const { pessoas, criarEscala, atualizarEscala } = useEscalas();
  
  const [data, setData] = useState(escalaParaEditar?.data || '');
  const [periodo, setPeriodo] = useState<'manha' | 'noite' | ''>((escalaParaEditar?.periodo as 'manha' | 'noite') || '');
  const [ministroId, setMinistroId] = useState(escalaParaEditar?.ministro?.id || '');
  const [backVocalsIds, setBackVocalsIds] = useState<string[]>(
    escalaParaEditar?.backVocals.map(bv => bv.id) || []
  );
  const [musicosIds, setMusicosIds] = useState({
    violao: escalaParaEditar?.musicos.violao?.id || '',
    teclado: escalaParaEditar?.musicos.teclado?.id || '',
    baixo: escalaParaEditar?.musicos.baixo?.id || '',
    bateria: escalaParaEditar?.musicos.bateria?.id || '',
  });

  const ministros = pessoas.filter(p => p.tipo === 'ministro');
  const backVocals = pessoas.filter(p => p.tipo === 'vocal');
  
  // Verificar se a data selecionada é um domingo
  // Corrigir interpretação da data para evitar problemas de timezone
  const isDomingo = data ? new Date(data + 'T12:00:00').getDay() === 0 : false;
  
  const getMusicosParaInstrumento = (instrumento: Instrumento) => {
    return pessoas.filter(p => 
      p.tipo === 'musico' && 
      p.instrumentos?.includes(instrumento)
    );
  };

  const handleBackVocalChange = (id: string, checked: boolean) => {
    if (checked) {
      setBackVocalsIds(prev => [...prev, id]);
    } else {
      setBackVocalsIds(prev => prev.filter(bvId => bvId !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const ministro = ministroId ? ministros.find(m => {
      return m.id.toString() === ministroId.toString();
    }) || null : null;
    
    const backVocalsEscolhidos = backVocals.filter(bv => backVocalsIds.includes(bv.id));
    
    const musicos = {
      violao: musicosIds.violao ? getMusicosParaInstrumento('violao').find(m => {
        return m.id.toString() === musicosIds.violao.toString();
      }) || null : null,
      teclado: musicosIds.teclado ? getMusicosParaInstrumento('teclado').find(m => m.id.toString() === musicosIds.teclado.toString()) || null : null,
      baixo: musicosIds.baixo ? getMusicosParaInstrumento('baixo').find(m => m.id.toString() === musicosIds.baixo.toString()) || null : null,
      bateria: musicosIds.bateria ? getMusicosParaInstrumento('bateria').find(m => m.id.toString() === musicosIds.bateria.toString()) || null : null,
    };

    const dadosEscala = {
      data,
      periodo: isDomingo && periodo ? periodo as 'manha' | 'noite' : 'noite', // Noite por padrão para não-domingos
      ministro,
      backVocals: backVocalsEscolhidos,
      musicos,
    };

    if (escalaParaEditar) {
      atualizarEscala(escalaParaEditar.id, dadosEscala);
    } else {
      criarEscala(dadosEscala);
    }
    
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50">
      <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            {escalaParaEditar ? 'Editar Escala' : 'Nova Escala'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Data */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">
              Data *
            </label>
            <input
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              required
            />
          </div>

          {/* Período - só aparece para domingos */}
          {isDomingo && (
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">
                Período *
              </label>
              <select
                value={periodo}
                onChange={(e) => setPeriodo(e.target.value as 'manha' | 'noite' | '')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                required
              >
                <option value="">Selecione o período</option>
                <option value="manha">Manhã</option>
                <option value="noite">Noite</option>
              </select>
            </div>
          )}

          {/* Ministro */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">
              Ministro
            </label>
            <select
              value={ministroId}
              onChange={(e) => setMinistroId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            >
              <option value="">Selecione um ministro</option>
              {ministros.map(ministro => (
                <option key={ministro.id} value={ministro.id}>
                  {ministro.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Back Vocals */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Back Vocals
            </label>
            <div className="space-y-2 max-h-32 sm:max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3">
              {backVocals.map(vocal => (
                <label key={vocal.id} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={backVocalsIds.includes(vocal.id)}
                    onChange={(e) => handleBackVocalChange(vocal.id, e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 flex-shrink-0"
                  />
                  <span className="text-gray-800 font-medium text-sm sm:text-base">{vocal.nome}</span>
                </label>
              ))}
              {backVocals.length === 0 && (
                <p className="text-gray-600 text-sm italic">
                  Nenhum back vocal cadastrado
                </p>
              )}
            </div>
          </div>

          {/* Músicos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Violão */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">
                Violão
              </label>
              <select
                value={musicosIds.violao}
                onChange={(e) => setMusicosIds(prev => ({ ...prev, violao: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              >
                <option value="">Selecione</option>
                {getMusicosParaInstrumento('violao').map(musico => (
                  <option key={musico.id} value={musico.id}>
                    {musico.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* Teclado */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">
                Teclado
              </label>
              <select
                value={musicosIds.teclado}
                onChange={(e) => setMusicosIds(prev => ({ ...prev, teclado: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              >
                <option value="">Selecione</option>
                {getMusicosParaInstrumento('teclado').map(musico => (
                  <option key={musico.id} value={musico.id}>
                    {musico.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* Baixo */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">
                Baixo
              </label>
              <select
                value={musicosIds.baixo}
                onChange={(e) => setMusicosIds(prev => ({ ...prev, baixo: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              >
                <option value="">Selecione</option>
                {getMusicosParaInstrumento('baixo').map(musico => (
                  <option key={musico.id} value={musico.id}>
                    {musico.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* Bateria */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">
                Bateria
              </label>
              <select
                value={musicosIds.bateria}
                onChange={(e) => setMusicosIds(prev => ({ ...prev, bateria: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              >
                <option value="">Selecione</option>
                {getMusicosParaInstrumento('bateria').map(musico => (
                  <option key={musico.id} value={musico.id}>
                    {musico.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Botões */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors order-2 sm:order-1"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors order-1 sm:order-2"
            >
              <Save className="w-4 h-4" />
              {escalaParaEditar ? 'Atualizar' : 'Criar'} Escala
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
