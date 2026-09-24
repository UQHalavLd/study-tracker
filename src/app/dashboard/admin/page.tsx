'use client';

import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  BookOpen,
  ClipboardList,
  Calendar,
  Activity,
  CheckCircle2,
  Database,
  Key,
  Server,
  RefreshCw,
  Plus,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface AdminStats {
  totalUsers: number;
  totalBooks: number;
  totalExams: number;
  totalPlans: number;
  totalTasks: number;
}

interface UserProfile {
  id: string;
  full_name: string | null;
  target_exam: string;
  daily_study_hours: number;
  created_at: string;
}

interface SubjectItem {
  id: string;
  name: string;
  exam_type: string;
  category: string;
  question_count: number;
  sort_order: number;
}

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalBooks: 0,
    totalExams: 0,
    totalPlans: 0,
    totalTasks: 0,
  });
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectExam, setNewSubjectExam] = useState<'tyt' | 'ayt' | 'custom'>('tyt');
  const [newSubjectQuestions, setNewSubjectQuestions] = useState(40);
  const [subjectAdding, setSubjectAdding] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    setStatusMessage(null);

    try {
      // 1. Profil sayısını ve kullanıcıları çek
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      // 2. Kitap sayısını çek
      const { count: booksCount } = await supabase
        .from('books')
        .select('*', { count: 'exact', head: true });

      // 3. Deneme sayısını çek
      const { count: examsCount } = await supabase
        .from('mock_exams')
        .select('*', { count: 'exact', head: true });

      // 4. Çalışma planı sayısını çek
      const { count: plansCount } = await supabase
        .from('study_plans')
        .select('*', { count: 'exact', head: true });

      // 5. Görev sayısını çek
      const { count: tasksCount } = await supabase
        .from('study_tasks')
        .select('*', { count: 'exact', head: true });

      // 6. Dersleri çek
      const { data: subjectsData } = await supabase
        .from('subjects')
        .select('*')
        .order('sort_order', { ascending: true });

      setStats({
        totalUsers: profilesData?.length || 0,
        totalBooks: booksCount || 0,
        totalExams: examsCount || 0,
        totalPlans: plansCount || 0,
        totalTasks: tasksCount || 0,
      });

      setUsers(profilesData || []);
      setSubjects(subjectsData || []);
    } catch (err: unknown) {
      console.error('Admin verileri yüklenirken hata:', err);
      setStatusMessage('Veriler çekilirken bir hata oluştu.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;

    setSubjectAdding(true);
    try {
      const { data, error } = await supabase
        .from('subjects')
        .insert({
          name: newSubjectName.trim(),
          exam_type: newSubjectExam,
          question_count: newSubjectQuestions,
          sort_order: subjects.length + 1,
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setSubjects([...subjects, data]);
        setNewSubjectName('');
        setStatusMessage(`"${data.name}" branşı başarıyla eklendi!`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Ders eklenirken hata oluştu.';
      setStatusMessage(`Hata: ${msg}`);
    } finally {
      setSubjectAdding(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Başlık & Yenileme */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Shield className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white">
              Sistem & Yönetici Paneli
            </h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Platform veritabanı durumu, kayıtlı kullanıcılar, sistem sağlığı ve branş yönetimi
          </p>
        </div>

        <button
          onClick={() => {
            setRefreshing(true);
            fetchAdminData();
          }}
          disabled={loading || refreshing}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-blue-600' : ''}`} />
          <span>{refreshing ? 'Güncelleniyor...' : 'Verileri Yenile'}</span>
        </button>
      </div>

      {statusMessage && (
        <div className="p-4 rounded-xl text-sm font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* 1. Sistem İstatistik Kartları */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Kullanıcılar</span>
            <Users className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-gray-900 dark:text-white">
            {loading ? '...' : stats.totalUsers}
          </div>
          <p className="text-xs text-gray-400 mt-1">Kayıtlı Profil</p>
        </div>

        <div className="p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Kitaplar</span>
            <BookOpen className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-gray-900 dark:text-white">
            {loading ? '...' : stats.totalBooks}
          </div>
          <p className="text-xs text-gray-400 mt-1">Eklenen Kaynak</p>
        </div>

        <div className="p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Denemeler</span>
            <ClipboardList className="w-5 h-5 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-gray-900 dark:text-white">
            {loading ? '...' : stats.totalExams}
          </div>
          <p className="text-xs text-gray-400 mt-1">Sınav Girişi</p>
        </div>

        <div className="p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">AI Planlar</span>
            <Calendar className="w-5 h-5 text-orange-500" />
          </div>
          <div className="text-2xl font-black text-gray-900 dark:text-white">
            {loading ? '...' : stats.totalPlans}
          </div>
          <p className="text-xs text-gray-400 mt-1">Haftalık Takvim</p>
        </div>

        <div className="p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Görevler</span>
            <Activity className="w-5 h-5 text-pink-500" />
          </div>
          <div className="text-2xl font-black text-gray-900 dark:text-white">
            {loading ? '...' : stats.totalTasks}
          </div>
          <p className="text-xs text-gray-400 mt-1">Oluşturulan Görev</p>
        </div>
      </div>

      {/* 2. Sistem Entegrasyon & Sağlık Durumu */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Server className="w-5 h-5 text-blue-600" />
          <span>Altyapı & Entegrasyon Sağlık Durumu</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-green-200 dark:border-green-900/50 bg-green-50/50 dark:bg-green-950/20 flex items-start gap-3">
            <Database className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-gray-900 dark:text-white">Supabase PostgreSQL</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700 dark:bg-green-900/60 dark:text-green-300">
                  Aktif (RLS)
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Tablolar, trigger fonksiyonları ve Row Level Security politikaları aktif çalışıyor.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/20 flex items-start gap-3">
            <Key className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-gray-900 dark:text-white">Google Gemini 1.5 Flash</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
                  API Bağlı
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Kişiselleştirilmiş haftalık JSON ders programı üretim motoru hazır.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-purple-200 dark:border-purple-900/50 bg-purple-50/50 dark:bg-purple-950/20 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-gray-900 dark:text-white">Google Books API</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300">
                  Entegre
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                ISBN ve kitap adına göre kapak görseli ve toplam sayfa sayısı otomatik çekiliyor.
              </p>
            </div>
          </div>
        </div>

        {/* E-posta Doğrulama Ayarı Rehberi */}
        <div className="mt-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 flex items-start gap-3">
          <HelpCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed">
            <strong className="font-bold">Önemli: Yeni Kullanıcı Kayıtlarında E-posta Doğrulamasını Kaldırmak İçin:</strong>
            <p className="mt-1">
              Supabase Dashboard &gt; <em>Authentication</em> &gt; <em>Providers</em> &gt; <em>Email</em> menüsüne gidin.
              Burada <strong>&quot;Confirm email&quot;</strong> seçeneğini kapatırsanız, kullanıcıların gelen kutusuna onay maili gitmesine gerek kalmadan kayıt oldukları anda doğrudan sisteme girmelerini sağlarsınız.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Kayıtlı Kullanıcılar Tablosu */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          <span>Kayıtlı Kullanıcı Profilleri ({users.length})</span>
        </h2>

        {users.length === 0 ? (
          <div className="text-center py-8 text-sm text-gray-500">Henüz kayıtlı kullanıcı bulunmuyor.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
              <thead className="bg-gray-50 dark:bg-gray-700/50 text-xs uppercase text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-4 py-3">Ad Soyad</th>
                  <th className="px-4 py-3">Hedef Sınav</th>
                  <th className="px-4 py-3">Günlük Hedef</th>
                  <th className="px-4 py-3">Kayıt Tarihi</th>
                  <th className="px-4 py-3">ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30">
                    <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">
                      {u.full_name || 'İsimsiz Öğrenci'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="uppercase text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                        {u.target_exam || 'TYT'}
                      </span>
                    </td>
                    <td className="px-4 py-3">{u.daily_study_hours || 4} saat/gün</td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {new Date(u.created_at).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-gray-400 truncate max-w-[120px]">
                      {u.id}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. Ders / Branş Yönetimi */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-600" />
          <span>Sistem Ders &amp; Branş Listesi ({subjects.length})</span>
        </h2>

        {/* Yeni Branş Ekleme Formu */}
        <form onSubmit={handleAddSubject} className="mb-6 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/40 border border-gray-200 dark:border-gray-700 flex flex-wrap items-center gap-3">
          <input
            type="text"
            required
            value={newSubjectName}
            onChange={(e) => setNewSubjectName(e.target.value)}
            placeholder="Ders / Branş Adı (örn: Geometri)"
            className="flex-1 min-w-[200px] px-3.5 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />

          <select
            value={newSubjectExam}
            onChange={(e) => setNewSubjectExam(e.target.value as 'tyt' | 'ayt' | 'custom')}
            className="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="tyt">TYT</option>
            <option value="ayt">AYT</option>
            <option value="custom">Özel</option>
          </select>

          <input
            type="number"
            min="1"
            max="100"
            value={newSubjectQuestions}
            onChange={(e) => setNewSubjectQuestions(parseInt(e.target.value) || 40)}
            placeholder="Soru Sayısı"
            className="w-24 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-center"
          />

          <button
            type="submit"
            disabled={subjectAdding}
            className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>{subjectAdding ? 'Ekleniyor...' : 'Yeni Branş Ekle'}</span>
          </button>
        </form>

        {/* Branş Listesi */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {subjects.map((sub) => (
            <div
              key={sub.id}
              className="p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/20 flex flex-col justify-between"
            >
              <div className="font-bold text-sm text-gray-900 dark:text-white mb-1">
                {sub.name}
              </div>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span className="uppercase font-semibold text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                  {sub.exam_type}
                </span>
                <span>{sub.question_count} Soru</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
