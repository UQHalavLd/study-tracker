import { NextResponse } from 'next/server';
import { searchBooks } from '@/lib/api/google-books';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json(
      { error: 'Arama terimi gereklidir (q parametresi)' },
      { status: 400 }
    );
  }

  try {
    const results = await searchBooks(query);
    return NextResponse.json(results);
  } catch (error) {
    console.error('Google Books API hatası:', error);
    return NextResponse.json(
      { error: 'Kitap aranırken bir hata oluştu' },
      { status: 500 }
    );
  }
}
