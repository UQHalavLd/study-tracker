# 📚 StudyTracker — Akıllı Ders Çalışma ve İlerleme Takip Platformu

Kullanıcıların kaynak kitaplarını, deneme sınavı sonuçlarını ve günlük çalışma rutinlerini takip ettiği; **yapay zeka desteğiyle** kişiselleştirilmiş ders çalışma programları üreten, modern ve güvenli bir web uygulaması.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=flat-square&logo=tailwind-css)
![Supabase](https://img.shields.io/badge/Supabase-Auth_%26_DB-3ECF8E?style=flat-square&logo=supabase)
![Gemini](https://img.shields.io/badge/Google_Gemini-AI-4285F4?style=flat-square&logo=google)

---

## ✨ Özellikler

### 🔐 Kimlik Doğrulama
- Email/Password ve Google OAuth ile giriş
- Supabase Row Level Security (RLS) ile güvenli veri erişimi
- Otomatik profil oluşturma

### 📖 Kitap Yönetimi
- **Google Books API** ile kitap arama (ISBN veya kitap adı)
- Otomatik kapak resmi ve sayfa sayısı doldurma
- İlerleme takibi: Yüzde göstergesi, kalan gün, günlük hedef sayfa

### 📝 Deneme Sınavı Takibi
- TYT / AYT deneme sonuçları girişi
- Ders bazında Doğru, Yanlış, Boş ve Net hesaplama
- **Recharts** ile net gelişim grafikleri
- Son 3 deneme analiziyle zayıf konu tespiti

### 🤖 AI Ders Programı Oluşturucu
- **Google Gemini 1.5 Flash** ile kişiselleştirilmiş haftalık plan
- Kitap ilerlemesi, deneme netleri ve zayıf konulara göre ağırlıklı program
- İnteraktif görev listesi / takvim görünümü
- Tek tıkla "tamamlandı" işaretleme

### 🎨 Modern Arayüz
- Responsive tasarım (mobil, tablet, masaüstü)
- Dark / Light mode desteği
- Minimalist ve kullanıcı dostu dashboard

---

## 🛠️ Teknoloji Yığını

| Katman | Teknoloji |
|--------|-----------|
| Frontend | Next.js 16 (App Router), TypeScript, Tailwind CSS 4 |
| Backend & Auth | Supabase (PostgreSQL, RLS, Auth) |
| AI | Google Gemini 1.5 Flash API |
| Kitap Verisi | Google Books API |
| Grafikler | Recharts |
| İkonlar | Lucide React |
| Hosting | Vercel (ücretsiz hobi planı) |

---

## 🚀 Kurulum

### 1. Repo'yu klonlayın
```bash
git clone https://github.com/UQHalavLd/study-tracker.git
cd study-tracker
npm install
```

### 2. Supabase Projesini Oluşturun
1. [supabase.com](https://supabase.com) adresinden ücretsiz hesap açın
2. Yeni bir proje oluşturun
3. SQL Editor'de `supabase/schema.sql` dosyasını çalıştırın
4. Ardından `supabase/seed.sql` dosyasını çalıştırın (TYT/AYT branş verileri)
5. Authentication > Providers'dan **Google** provider'ı aktif edin (opsiyonel)

### 3. Ortam Değişkenlerini Ayarlayın
`.env.example` dosyasını `.env.local` olarak kopyalayın ve değerleri doldurun:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
GEMINI_API_KEY=your-gemini-api-key
GOOGLE_BOOKS_API_KEY=your-google-books-key  # opsiyonel
```

**API Key Kaynakları:**
- Supabase: Dashboard > Settings > API
- Gemini: [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
- Google Books: [console.cloud.google.com](https://console.cloud.google.com/apis/credentials)

### 4. Geliştirme Sunucusunu Başlatın
```bash
npm run dev
```

Tarayıcıda [http://localhost:3000](http://localhost:3000) adresini açın.

---

## 📁 Proje Yapısı

```
src/
├── app/
│   ├── login/                    # Giriş sayfası
│   ├── register/                 # Kayıt sayfası
│   ├── forgot-password/          # Şifre sıfırlama
│   ├── auth/callback/            # OAuth callback
│   ├── dashboard/
│   │   ├── page.tsx              # Ana dashboard
│   │   ├── books/                # Kitap yönetimi
│   │   ├── exams/                # Deneme takibi
│   │   ├── study-plan/           # AI çalışma planı
│   │   └── settings/             # Profil ayarları
│   └── api/
│       ├── ai/generate-plan/     # Gemini AI endpoint
│       └── books/search/         # Google Books endpoint
├── components/
│   ├── dashboard/                # Sidebar, Header, Stats
│   ├── books/                    # Kitap bileşenleri
│   ├── exams/                    # Deneme bileşenleri
│   └── study-plan/               # Plan bileşenleri
├── lib/
│   ├── supabase/                 # Client, Server, Middleware
│   ├── api/                      # Gemini, Google Books
│   ├── types.ts                  # TypeScript tipleri
│   └── utils.ts                  # Yardımcı fonksiyonlar
└── middleware.ts                 # Auth guard
```

---

## 🗃️ Veritabanı Şeması

| Tablo | Açıklama |
|-------|----------|
| `profiles` | Kullanıcı profilleri |
| `subjects` | TYT/AYT dersleri |
| `books` | Kaynak kitaplar |
| `mock_exams` | Deneme sınavları |
| `mock_exam_scores` | Ders bazında sonuçlar |
| `study_plans` | AI çalışma planları |
| `study_tasks` | Plan görevleri |
| `weak_topics` | Zayıf konular |

Tüm tablolarda **Row Level Security (RLS)** aktiftir — her kullanıcı yalnızca kendi verisini görebilir.

---

## 🌐 Vercel'e Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/UQHalavLd/study-tracker)

1. Vercel'de "Import Project" ile bu repo'yu bağlayın
2. Environment Variables bölümüne `.env.local` değerlerini girin
3. Deploy!

---

## 📄 Lisans

MIT License — Özgürce kullanabilir, değiştirebilir ve dağıtabilirsiniz.
