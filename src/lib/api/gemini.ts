import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AIPlanRequest, AIPlanResponse } from "@/lib/types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function generateStudyPlan(
  request: AIPlanRequest
): Promise<AIPlanResponse> {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.7,
    },
  });

  const prompt = buildPrompt(request);

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();

  try {
    const parsed = JSON.parse(text) as AIPlanResponse;
    return parsed;
  } catch {
    throw new Error("AI yanıtı JSON formatında değil. Lütfen tekrar deneyin.");
  }
}

function buildPrompt(request: AIPlanRequest): string {
  const booksInfo = request.books
    .map(
      (b) =>
        `- "${b.title}": Toplam ${b.total_pages} sayfa, mevcut ilerleme ${b.current_page} sayfa, kalan ${b.total_pages - b.current_page} sayfa${b.target_date ? `, hedef tarih: ${b.target_date}` : ""}`
    )
    .join("\n");

  const scoresInfo =
    request.examScores.length > 0
      ? request.examScores
          .map(
            (s) =>
              `- ${s.subject_name}: ${s.net} net (${s.question_count} soru üzerinden)`
          )
          .join("\n")
      : "Henüz deneme sonucu girilmemiş.";

  const weakTopicsInfo =
    request.weakTopics.length > 0
      ? request.weakTopics
          .map((w) => `- ${w.topic_name} (Önem: ${w.severity})`)
          .join("\n")
      : "Belirgin zayıf konu tespit edilmemiş.";

  return `Sen bir eğitim danışmanı ve ders çalışma planı uzmanısın. Aşağıdaki verilere göre öğrenci için kişiselleştirilmiş haftalık ders çalışma planı oluştur.

## Öğrenci Verileri

### Kitaplar ve İlerleme
${booksInfo}

### Son Deneme Sınav Netleri
${scoresInfo}

### Zayıf Konular
${weakTopicsInfo}

### Çalışma Parametreleri
- Günlük çalışılabilecek saat: ${request.dailyStudyHours} saat
- Plan başlangıç tarihi: ${request.startDate}
- Plan bitiş tarihi: ${request.endDate}

## Kurallar
1. Zayıf konulara daha fazla ağırlık ver (zayıf konular için %40 daha fazla süre ayır).
2. Kitapların kalan sayfalarını hedeflenen tarihe kadar eşit şekilde dağıt.
3. Her gün farklı derslerden dengeli bir program oluştur.
4. Her görev için net ve anlaşılır bir başlık ve açıklama yaz (Türkçe).
5. Görev sürelerini gerçekçi tut (minimum 25 dakika, maksimum 90 dakika pomodoro mantığı).
6. Her gün için görevleri sırala (sort_order).

## Yanıt Formatı (JSON)
Aşağıdaki JSON formatında yanıt ver:

{
  "plan_title": "Haftalık Çalışma Planı - [tarih aralığı]",
  "tasks": [
    {
      "title": "Görev başlığı",
      "description": "Detaylı açıklama",
      "task_date": "YYYY-MM-DD",
      "start_time": "HH:MM",
      "duration_minutes": 45,
      "book_id": "kitap_id veya null",
      "subject_id": "ders_id veya null",
      "page_start": 50,
      "page_end": 65,
      "sort_order": 1
    }
  ],
  "recommendations": [
    "Genel tavsiye 1",
    "Genel tavsiye 2"
  ]
}

Yalnızca geçerli JSON döndür, başka bir açıklama ekleme.`;
}
