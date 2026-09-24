'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';

interface PlanGeneratorProps {
  onPlanSaved: () => void;
}

export default function PlanGenerator({ onPlanSaved }: PlanGeneratorProps) {
  const supabase = createClient();
  const [step, setStep] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [dataSummary, setDataSummary] = useState<any>(null);
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (step === 2 && !dataSummary) {
      fetchDataSummary();
    }
  }, [step]);

  const fetchDataSummary = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: books } = await supabase.from('books').select('*').eq('user_id', user.id);
      const { data: exams } = await supabase.from('exams').select('*').eq('user_id', user.id).order('date', { ascending: false }).limit(3);
      const { data: profile } = await supabase.from('profiles').select('daily_study_hours').eq('id', user.id).single();

      setDataSummary({
        booksCount: books?.length || 0,
        pagesRemaining: books?.reduce((acc: number, book: any) => acc + (book.total_pages - (book.current_page || 0)), 0) || 0,
        lastExams: exams || [],
        dailyStudyHours: profile?.daily_study_hours || 4
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/ai/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate,
          endDate,
          summary: dataSummary
        })
      });

      if (!res.ok) {
        throw new Error('API hatası');
      }

      const plan = await res.json();
      setGeneratedPlan(plan);
      setStep(3);
    } catch (err: any) {
      setError(err.message || 'Plan oluşturulamadı.');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePlan = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: planData, error: planError } = await supabase.from('study_plans').insert({
        user_id: user.id,
        title: generatedPlan.title || 'Yeni AI Planı',
        start_date: startDate,
        end_date: endDate,
        recommendations: generatedPlan.recommendations
      }).select().single();

      if (planError) throw planError;

      const tasksToInsert = generatedPlan.tasks.map((task: any) => ({
        plan_id: planData.id,
        user_id: user.id,
        title: task.title,
        date: task.date,
        subject: task.subject,
        duration_minutes: task.duration_minutes,
        pages_to_read: task.pages_to_read
      }));

      const { error: tasksError } = await supabase.from('study_tasks').insert(tasksToInsert);
      if (tasksError) throw tasksError;

      onPlanSaved();
    } catch (err: any) {
      setError('Plan kaydedilemedi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex justify-between items-center mb-8 relative">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 dark:bg-gray-700 -z-10 -translate-y-1/2 rounded-full"></div>
        {[1, 2, 3].map((s) => (
          <div key={s} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${step >= s ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
            {s}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold dark:text-white">Tarih Aralığı Seçin</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">Başlangıç Tarihi</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">Bitiş Tarihi</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
          </div>
          <button 
            disabled={!startDate || !endDate} 
            onClick={() => setStep(2)}
            className="flex items-center justify-center gap-2 w-full py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg font-medium disabled:opacity-50"
          >
            İleri <ArrowRight size={18} />
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold dark:text-white">Veri Özeti</h2>
          {dataSummary ? (
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <p>Ekli Kitap Sayısı: {dataSummary.booksCount}</p>
              <p>Okunacak Toplam Sayfa: {dataSummary.pagesRemaining}</p>
              <p>Günlük Çalışma Hedefi: {dataSummary.dailyStudyHours} saat</p>
            </div>
          ) : (
            <p>Yükleniyor...</p>
          )}

          <div className="flex gap-4">
            <button onClick={() => setStep(1)} className="flex items-center gap-2 px-4 py-3 border rounded-lg dark:border-gray-600 dark:text-white">
              <ArrowLeft size={18} /> Geri
            </button>
            <button 
              onClick={handleGenerate}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-medium py-3 px-6 rounded-lg hover:opacity-90 transition-opacity"
            >
              {loading ? (
                <span className="animate-pulse">Yapay zeka planınızı oluşturuyor...</span>
              ) : (
                <><Sparkles size={18} /> AI ile Plan Oluştur</>
              )}
            </button>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
      )}

      {step === 3 && generatedPlan && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold dark:text-white">Plan Önizleme</h2>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
            <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Yapay Zeka Önerileri</h3>
            <p className="text-sm text-blue-900 dark:text-blue-200">{generatedPlan.recommendations}</p>
          </div>

          <div className="flex gap-4">
            <button onClick={() => setStep(2)} className="flex items-center gap-2 px-4 py-3 border rounded-lg dark:border-gray-600 dark:text-white">
              Tekrar Oluştur
            </button>
            <button 
              onClick={handleSavePlan}
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
            >
              {loading ? 'Kaydediliyor...' : 'Planı Kaydet'}
            </button>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
      )}
    </div>
  );
}
