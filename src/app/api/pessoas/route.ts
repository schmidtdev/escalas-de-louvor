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
    const pessoas = await pessoaQueries.getAll();
    
    // Converter IDs para string para compatibilidade com o frontend
    const pessoasFormatadas = pessoas.map((pessoa: any) => ({
      ...pessoa,
      id: pessoa.id.toString()
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

    const result = await pessoaQueries.create(nome, tipo, instrumentos || []);
    
    return NextResponse.json({ 
      id: result.id.toString(),
      nome: result.nome,
      tipo: result.tipo,
      instrumentos: result.instrumentos
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

    await pessoaQueries.delete(parseInt(id));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao deletar pessoa:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
