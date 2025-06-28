import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    message: 'NextAuth route test',
    url: request.url,
    method: 'GET'
  });
}

export async function POST(request: NextRequest) {
  return NextResponse.json({ 
    message: 'NextAuth route test',
    url: request.url,
    method: 'POST'
  });
}
