import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { escalaQueries, pessoaQueries } from '@/lib/database';

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const escalas = escalaQueries.getAll.all() as any[];
    const pessoas = pessoaQueries.getAll.all() as any[];

    // Converter para formato do frontend
    const escalasFormatadas = escalas.map(escala => {
      const backVocalsIds = escala.back_vocals ? JSON.parse(escala.back_vocals) : [];
      const backVocals = pessoas.filter(p => backVocalsIds.includes(p.id));

      return {
        id: escala.id.toString(),
        data: escala.data,
        periodo: escala.periodo || undefined, // Incluir o campo período
        ministro: escala.ministro_id ? {
          id: escala.ministro_id.toString(),
          nome: escala.ministro_nome,
          tipo: 'ministro'
        } : null,
        backVocals: backVocals.map((bv: any) => ({
          id: bv.id.toString(),
          nome: bv.nome,
          tipo: bv.tipo
        })),
        musicos: {
          violao: escala.violao_id ? {
            id: escala.violao_id.toString(),
            nome: escala.violao_nome,
            tipo: 'musico'
          } : null,
          teclado: escala.teclado_id ? {
            id: escala.teclado_id.toString(),
            nome: escala.teclado_nome,
            tipo: 'musico'
          } : null,
          baixo: escala.baixo_id ? {
            id: escala.baixo_id.toString(),
            nome: escala.baixo_nome,
            tipo: 'musico'
          } : null,
          bateria: escala.bateria_id ? {
            id: escala.bateria_id.toString(),
            nome: escala.bateria_nome,
            tipo: 'musico'
          } : null,
        }
      };
    });

    return NextResponse.json(escalasFormatadas);
  } catch (error) {
    console.error('Erro ao buscar escalas:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const { data, periodo, ministro, backVocals, musicos } = await request.json();

    if (!data) {
      return NextResponse.json({ error: 'Data é obrigatória' }, { status: 400 });
    }

    // Verificar se é domingo e se período está definido
    const dataSelecionada = new Date(data + 'T12:00:00');
    const diaDaSemana = dataSelecionada.getDay(); // 0 = domingo
    const periodoFinal = diaDaSemana === 0 ? periodo : 'noite'; // Domingo usa período selecionado, outros dias sempre "noite"

    const ministroId = ministro ? parseInt(ministro.id) : null;
    const backVocalsIds = backVocals?.length > 0 ? backVocals.map((bv: any) => parseInt(bv.id)) : [];
    const backVocalsJson = JSON.stringify(backVocalsIds);
    
    const violaoId = musicos?.violao ? parseInt(musicos.violao.id) : null;
    const tecladoId = musicos?.teclado ? parseInt(musicos.teclado.id) : null;
    const baixoId = musicos?.baixo ? parseInt(musicos.baixo.id) : null;
    const bateriaId = musicos?.bateria ? parseInt(musicos.bateria.id) : null;

    const result = escalaQueries.create.run(
      data,
      periodoFinal,
      ministroId,
      backVocalsJson,
      violaoId,
      tecladoId,
      baixoId,
      bateriaId
    );
    
    return NextResponse.json({ 
      id: result.lastInsertRowid.toString(),
      data,
      periodo: periodoFinal,
      ministro,
      backVocals,
      musicos
    }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar escala:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const { id, data, periodo, ministro, backVocals, musicos } = await request.json();

    if (!id || !data) {
      return NextResponse.json({ error: 'ID e data são obrigatórios' }, { status: 400 });
    }

    // Verificar se é domingo e se período está definido
    const dataSelecionada = new Date(data + 'T12:00:00');
    const diaDaSemana = dataSelecionada.getDay(); // 0 = domingo
    const periodoFinal = diaDaSemana === 0 ? periodo : 'noite'; // Domingo usa período selecionado, outros dias sempre "noite"

    const ministroId = ministro ? parseInt(ministro.id) : null;
    const backVocalsIds = backVocals?.length > 0 ? backVocals.map((bv: any) => parseInt(bv.id)) : [];
    const backVocalsJson = JSON.stringify(backVocalsIds);
    
    const violaoId = musicos?.violao ? parseInt(musicos.violao.id) : null;
    const tecladoId = musicos?.teclado ? parseInt(musicos.teclado.id) : null;
    const baixoId = musicos?.baixo ? parseInt(musicos.baixo.id) : null;
    const bateriaId = musicos?.bateria ? parseInt(musicos.bateria.id) : null;

    escalaQueries.update.run(
      data,
      periodoFinal,
      ministroId,
      backVocalsJson,
      violaoId,
      tecladoId,
      baixoId,
      bateriaId,
      parseInt(id)
    );
    
    return NextResponse.json({ 
      id,
      data,
      periodo: periodoFinal,
      ministro,
      backVocals,
      musicos
    });
  } catch (error) {
    console.error('Erro ao atualizar escala:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 });
    }

    escalaQueries.delete.run(parseInt(id));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao deletar escala:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
