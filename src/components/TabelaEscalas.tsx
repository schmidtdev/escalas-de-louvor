'use client';

import { useState, useRef } from 'react';
import { useEscalas } from '@/contexts/EscalasContext';
import { EscalaItem } from '@/types';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import FormEscala from './FormEscala';
import { downloadTableAsImage } from '@/utils/imageCapture';
import { Plus, Edit2, Trash2, Camera } from 'lucide-react';

export default function TabelaEscalas() {
  const { mesSelecionado, setMesSelecionado, obterEscalasPorMes, removerEscala } = useEscalas();
  const [mostrarForm, setMostrarForm] = useState(false);
  const [escalaParaEditar, setEscalaParaEditar] = useState<EscalaItem | undefined>();
  const tabelaRef = useRef<HTMLDivElement>(null);

  const escalasDoMes = obterEscalasPorMes(mesSelecionado);

  // Função para agrupar escalas
  const agruparEscalas = (escalas: EscalaItem[]) => {
    const grupos = {
      tercas: [] as EscalaItem[],
      domingosManha: [] as EscalaItem[],
      domingosNoite: [] as EscalaItem[]
    };

    escalas.forEach(escala => {
      // Corrigir interpretação da data para evitar problemas de timezone
      const data = new Date(escala.data + 'T12:00:00');
      const diaDaSemana = data.getDay();

      if (diaDaSemana === 2) { // Terça-feira (sempre período "noite")
        grupos.tercas.push(escala);
      } else if (diaDaSemana === 0) { // Domingo
        if (escala.periodo === 'manha') {
          grupos.domingosManha.push(escala);
        } else if (escala.periodo === 'noite') {
          grupos.domingosNoite.push(escala);
        } else {
          // Domingo sem período definido (escalas antigas)
          grupos.domingosManha.push(escala);
        }
      }
    });

    // Ordenar cada grupo por data
    grupos.tercas.sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
    grupos.domingosManha.sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
    grupos.domingosNoite.sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());

    return grupos;
  };

  const gruposEscalas = agruparEscalas(escalasDoMes);

  // Função para renderizar um grupo de escalas
  const renderizarGrupo = (escalas: EscalaItem[], titulo: string, isDesktop: boolean = true) => {
    if (escalas.length === 0) return null;

    if (isDesktop) {
      return (
        <div key={titulo} className="mb-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-3 px-4 py-2 bg-blue-50 rounded-t-lg border-l-4 border-blue-500">
            {titulo} ({escalas.length})
          </h4>
          <div className="bg-white rounded-b-lg border border-gray-200 divide-y divide-gray-200">
            {escalas.map((escala) => (
              <div key={escala.id} className="hover:bg-gray-50 px-4 py-3">
                <div className="grid grid-cols-8 gap-4 items-center">
                  <div className="text-sm font-medium text-gray-900">
                    {formatarDataCompleta(escala.data, escala.periodo)}
                  </div>
                  <div className="text-sm text-gray-800">
                    {escala.ministro?.nome || '-'}
                  </div>
                  <div className="text-sm text-gray-800">
                    {escala.backVocals.length > 0 
                      ? escala.backVocals.map(bv => bv.nome).join(', ')
                      : '-'
                    }
                  </div>
                  <div className="text-sm text-gray-800">
                    {escala.musicos.violao?.nome || '-'}
                  </div>
                  <div className="text-sm text-gray-800">
                    {escala.musicos.teclado?.nome || '-'}
                  </div>
                  <div className="text-sm text-gray-800">
                    {escala.musicos.baixo?.nome || '-'}
                  </div>
                  <div className="text-sm text-gray-800">
                    {escala.musicos.bateria?.nome || '-'}
                  </div>
                  <div className="text-sm action-buttons">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditarEscala(escala)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Tem certeza que deseja remover esta escala?')) {
                            removerEscala(escala.id);
                          }
                        }}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Remover"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    } else {
      return (
        <div key={titulo} className="mb-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-3 px-3 py-2 bg-blue-50 rounded-t-lg border-l-4 border-blue-500">
            {titulo} ({escalas.length})
          </h4>
          <div className="bg-white rounded-b-lg border border-gray-200 divide-y divide-gray-200">
            {escalas.map((escala) => (
              <div key={escala.id} className="p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start mb-3">
                  <div className="font-medium text-gray-900 text-base">
                    {formatarDataCompleta(escala.data, escala.periodo)}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditarEscala(escala)}
                      className="text-blue-600 hover:text-blue-800 p-1"
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Tem certeza que deseja remover esta escala?')) {
                          removerEscala(escala.id);
                        }
                      }}
                      className="text-red-600 hover:text-red-800 p-1"
                      title="Remover"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Ministro:</span>
                    <div className="text-gray-800">{escala.ministro?.nome || '-'}</div>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-700">Back Vocals:</span>
                    <div className="text-gray-800">
                      {escala.backVocals.length > 0 
                        ? escala.backVocals.map(bv => bv.nome).join(', ')
                        : '-'
                      }
                    </div>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-700">Violão:</span>
                    <div className="text-gray-800">{escala.musicos.violao?.nome || '-'}</div>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-700">Teclado:</span>
                    <div className="text-gray-800">{escala.musicos.teclado?.nome || '-'}</div>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-700">Baixo:</span>
                    <div className="text-gray-800">{escala.musicos.baixo?.nome || '-'}</div>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-700">Bateria:</span>
                    <div className="text-gray-800">{escala.musicos.bateria?.nome || '-'}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }
  };

  const formatarData = (data: string) => {
    try {
      return format(parseISO(data), 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return data;
    }
  };

  const formatarDataCompleta = (data: string, periodo?: 'manha' | 'noite') => {
    try {
      const dataFormatada = format(parseISO(data), 'dd/MM/yyyy', { locale: ptBR });
      const diaSemana = format(parseISO(data), 'EEEE', { locale: ptBR });
      
      if (periodo) {
        const periodoTexto = periodo === 'manha' ? 'Manhã' : 'Noite';
        return `${dataFormatada} (${periodoTexto})`;
      }
      
      return dataFormatada;
    } catch {
      return data;
    }
  };

  const formatarMes = (mes: string) => {
    try {
      const [ano, mesNum] = mes.split('-');
      const data = new Date(parseInt(ano), parseInt(mesNum) - 1);
      return format(data, 'MMMM yyyy', { locale: ptBR });
    } catch {
      return mes;
    }
  };

  const handleEditarEscala = (escala: EscalaItem) => {
    setEscalaParaEditar(escala);
    setMostrarForm(true);
  };

  const handleNovaEscala = () => {
    setEscalaParaEditar(undefined);
    setMostrarForm(true);
  };

  const handleFecharForm = () => {
    setMostrarForm(false);
    setEscalaParaEditar(undefined);
  };

  const gerarImagem = async () => {
    if (!tabelaRef.current) {
      alert('Tabela não encontrada. Tente novamente.');
      return;
    }

    if (escalasDoMes.length === 0) {
      alert('Nenhuma escala encontrada para gerar imagem.');
      return;
    }

    // Mostrar loading
    const loadingElement = document.createElement('div');
    loadingElement.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px;">
        <div style="width: 20px; height: 20px; border: 3px solid #f3f3f3; border-top: 3px solid #3498db; border-radius: 50%; animation: spin 1s linear infinite;"></div>
        Gerando imagem...
      </div>
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    `;
    loadingElement.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:white;padding:20px;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.3);z-index:9999;font-family:Arial,sans-serif';
    document.body.appendChild(loadingElement);

    try {
      const nomeArquivo = `escala-${formatarMes(mesSelecionado).toLowerCase().replace(/\s+/g, '-')}.png`;
      
      await downloadTableAsImage(tabelaRef.current, nomeArquivo);
      
      alert('✅ Imagem gerada com sucesso!');
    } catch (error) {
      alert('❌ Erro ao gerar imagem. Tente novamente ou verifique se o navegador permite downloads.');
    } finally {
      // Remover loading
      if (document.body.contains(loadingElement)) {
        document.body.removeChild(loadingElement);
      }
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Escalas de Louvor</h2>
          <p className="text-gray-700 capitalize font-medium text-sm sm:text-base">{formatarMes(mesSelecionado)}</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <input
            type="month"
            value={mesSelecionado}
            onChange={(e) => setMesSelecionado(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
          />
          
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <button
              onClick={handleNovaEscala}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nova Escala
            </button>
            
            {escalasDoMes.length > 0 && (
              <button
                onClick={gerarImagem}
                className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <Camera className="w-4 h-4" />
                Gerar Imagem
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabela */}
      <div ref={tabelaRef} className="bg-white rounded-lg border overflow-hidden">
        {/* Cabeçalho para imagem */}
        <div className="bg-blue-50 p-4 border-b print:block">
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-900">Escala de Louvor</h3>
            <p className="text-gray-700 font-medium capitalize">{formatarMes(mesSelecionado)}</p>
            <p className="text-sm text-gray-600 mt-1">Igreja - Sistema de Escalas</p>
          </div>
        </div>
        
        {escalasDoMes.length > 0 ? (
          <>
            {/* Versão Desktop - Grupos de Tabelas */}
            <div className="hidden lg:block space-y-6" id="desktop-view">
              {/* Cabeçalho da tabela desktop */}
              <div className="bg-gray-50 px-4 py-3 border-b table-header">
                <div className="grid grid-cols-8 gap-4">
                  <div className="text-sm font-semibold text-gray-900">Data</div>
                  <div className="text-sm font-semibold text-gray-900">Ministro</div>
                  <div className="text-sm font-semibold text-gray-900">Back Vocals</div>
                  <div className="text-sm font-semibold text-gray-900">Violão</div>
                  <div className="text-sm font-semibold text-gray-900">Teclado</div>
                  <div className="text-sm font-semibold text-gray-900">Baixo</div>
                  <div className="text-sm font-semibold text-gray-900">Bateria</div>
                  <div className="text-sm font-semibold text-gray-900 action-buttons">Ações</div>
                </div>
              </div>
              
              {/* Grupos de escalas */}
              <div className="escalas-groups">
                {renderizarGrupo(gruposEscalas.tercas, "🔥 Terças-feiras", true)}
                {renderizarGrupo(gruposEscalas.domingosManha, "🌅 Domingos - Manhã", true)}
                {renderizarGrupo(gruposEscalas.domingosNoite, "🌙 Domingos - Noite", true)}
              </div>
            </div>

            {/* Versão Mobile/Tablet - Grupos de Cards */}
            <div className="lg:hidden space-y-6">
              {renderizarGrupo(gruposEscalas.tercas, "🔥 Terças-feiras", false)}
              {renderizarGrupo(gruposEscalas.domingosManha, "🌅 Domingos - Manhã", false)}
              {renderizarGrupo(gruposEscalas.domingosNoite, "🌙 Domingos - Noite", false)}
            </div>
          </>
        ) : (
          <div className="p-6 sm:p-8 text-center">
            <p className="text-gray-700 text-base sm:text-lg mb-4 font-medium">
              Nenhuma escala encontrada para {formatarMes(mesSelecionado)}
            </p>
            <button
              onClick={handleNovaEscala}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg flex items-center gap-2 mx-auto transition-colors"
            >
              <Plus className="w-4 sm:w-5 h-4 sm:h-5" />
              Criar Primeira Escala
            </button>
          </div>
        )}
      </div>

      {/* Modal do formulário */}
      {mostrarForm && (
        <FormEscala
          escalaParaEditar={escalaParaEditar}
          onClose={handleFecharForm}
        />
      )}
    </div>
  );
}
