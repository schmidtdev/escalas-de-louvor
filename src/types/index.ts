export interface Pessoa {
  id: string;
  nome: string;
  tipo: 'ministro' | 'vocal' | 'musico';
  instrumentos?: string[]; // Para músicos
}

export interface EscalaItem {
  id: string;
  data: string; // YYYY-MM-DD
  periodo?: 'manha' | 'noite'; // Apenas para domingos
  ministro: Pessoa | null;
  backVocals: Pessoa[];
  musicos: {
    violao: Pessoa | null;
    teclado: Pessoa | null;
    baixo: Pessoa | null;
    bateria: Pessoa | null;
  };
}

export interface EscalaMensal {
  mes: string; // YYYY-MM
  escalas: EscalaItem[];
}

export type Instrumento = 'violao' | 'teclado' | 'baixo' | 'bateria';
