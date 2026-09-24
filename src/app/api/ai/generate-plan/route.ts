import { NextResponse } from 'next/server';
import { generateStudyPlan } from '@/lib/api/gemini';

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API anahtarı yapılandırılmamış.' },
        { status: 500 }
      );
    }

    const body = await req.json();

    const plan = await generateStudyPlan(body);

    return NextResponse.json(plan);
  } catch (error) {
    console.error('Plan generation error:', error);
    return NextResponse.json(
      { error: 'Plan oluşturulurken bir hata oluştu.' },
      { status: 500 }
    );
  }
}
