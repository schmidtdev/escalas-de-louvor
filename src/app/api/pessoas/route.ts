import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { pessoaQueries } from '@/lib/database';

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const pessoas = pessoaQueries.getAll.all() as any[];
    
    // Converter instrumentos de JSON string para array e IDs para string
    const pessoasFormatadas = pessoas.map((pessoa: any) => ({
      ...pessoa,
      id: pessoa.id.toString(), // Converter ID para string
      instrumentos: pessoa.instrumentos ? JSON.parse(pessoa.instrumentos) : undefined
    }));

    return NextResponse.json(pessoasFormatadas);
  } catch (error) {
    console.error('Erro ao buscar pessoas:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const { nome, tipo, instrumentos } = await request.json();

    if (!nome || !tipo) {
      return NextResponse.json({ error: 'Nome e tipo são obrigatórios' }, { status: 400 });
    }

    const instrumentosJson = instrumentos ? JSON.stringify(instrumentos) : null;
    
    const result = pessoaQueries.create.run(nome, tipo, instrumentosJson);
    
    return NextResponse.json({ 
      id: result.lastInsertRowid,
      nome,
      tipo,
      instrumentos: instrumentos || undefined
    }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar pessoa:', error);
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

    pessoaQueries.delete.run(id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao deletar pessoa:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
