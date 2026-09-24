import Link from "next/link";
import {
  BookOpen,
  BrainCircuit,
  BarChart3,
  Calendar,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 text-gray-900 dark:text-gray-100 flex flex-col">
      {/* Navbar */}
      <header className="border-b border-gray-200/80 dark:border-gray-800/80 bg-white/70 dark:bg-gray-900/70 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              StudyTracker
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Giriş Yap
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-500/20 transition-all hover:scale-[1.02]"
            >
              Kayıt Ol
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60 mb-8 animate-fade-in">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Google Gemini 1.5 Flash Yapay Zeka Destekli</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-gray-950 dark:text-white max-w-4xl mx-auto leading-tight sm:leading-none">
            Ders Çalışma Rutinini{" "}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Yapay Zeka
            </span>{" "}
            ile Yönet
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Kaynak kitaplarının sayfa ilerlemelerini takip et, TYT & AYT deneme netlerini grafiklerle analiz et ve eksiklerine özel haftalık dinamik ders programı oluştur.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02]"
            >
              <span>Panele Git</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 shadow-sm transition-all"
            >
              Giriş Yap
            </Link>
          </div>
        </section>

        {/* Feature Cards */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-gray-100 dark:border-gray-800/80">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-950 dark:text-white">
              Hedeflerine Ulaşman İçin Tasarlanmış Özellikler
            </h2>
            <p className="mt-3 text-gray-600 dark:text-gray-400">
              Sınav maratonunda zamanını en verimli şekilde kullanman için gereken tüm araçlar tek bir yerde.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Kart 1: Kitap Takibi */}
            <div className="p-8 rounded-2xl bg-white dark:bg-gray-800/50 border border-gray-200/80 dark:border-gray-700/80 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-6">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Kaynak Kitap Yönetimi
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                Google Books API ile kitaplarını saniyeler içinde ekle. Çözdüğün sayfaları, kalan gün hedefini ve yüzde ilerlemeni takip et.
              </p>
            </div>

            {/* Kart 2: Deneme Analizi */}
            <div className="p-8 rounded-2xl bg-white dark:bg-gray-800/50 border border-gray-200/80 dark:border-gray-700/80 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-6">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                TYT / AYT Deneme Analizi
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                Ders bazında netlerini kaydet. Gelişim grafiklerini incele ve son 3 denemede düşüşe geçen zayıf konularını otomatik olarak tespit et.
              </p>
            </div>

            {/* Kart 3: AI Planlayıcı */}
            <div className="p-8 rounded-2xl bg-white dark:bg-gray-800/50 border border-gray-200/80 dark:border-gray-700/80 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-6">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Kişisel AI Çalışma Planı
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                Gemini 1.5 Flash eksik konularına ağırlık vererek ve kitaplarının kalan sayfalarını hedef tarihine dağıtarak haftalık interaktif takvim üretir.
              </p>
            </div>
          </div>
        </section>

        {/* Quick Start Section */}
        <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-extrabold mb-4">Hemen Çalışmaya Başla</h2>
            <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">
              Hesabını oluştur, kitaplarını ve son denemeni gir; sana özel ders programın dakikalar içinde hazır olsun.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold bg-white text-blue-700 hover:bg-blue-50 shadow-lg shadow-black/10 transition-all hover:scale-[1.02]"
            >
              <span>Ücretsiz Kayıt Ol</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>© {new Date().getFullYear()} StudyTracker — Akıllı Ders Çalışma ve İlerleme Takip Platformu</p>
      </footer>
    </div>
  );
}
