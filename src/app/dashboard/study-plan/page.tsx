'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import PlanGenerator from '@/components/study-plan/plan-generator';
import TaskCalendar from '@/components/study-plan/task-calendar';

export default function StudyPlanPage() {
  const supabase = createClient();
  const [activePlan, setActivePlan] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGenerator, setShowGenerator] = useState(false);

  const fetchPlan = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: plan } = await supabase
        .from('study_plans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (plan) {
        setActivePlan(plan);
        const { data: taskData } = await supabase
          .from('study_tasks')
          .select('*')
          .eq('plan_id', plan.id)
          .order('date', { ascending: true });
        
        setTasks(taskData || []);
        setShowGenerator(false);
      } else {
        setShowGenerator(true);
      }
    } catch (err) {
      console.error(err);
      setShowGenerator(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlan();
  }, []);

  const handleTaskToggle = async (taskId: string, isCompleted: boolean, bookId?: string, pagesToRead?: number) => {
    const completedAt = isCompleted ? new Date().toISOString() : null;

    // Optimistic update
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, is_completed: isCompleted, completed_at: completedAt } : t));

    await supabase
      .from('study_tasks')
      .update({ is_completed: isCompleted, completed_at: completedAt })
      .eq('id', taskId);

    if (isCompleted && bookId && pagesToRead) {
      const { data: book } = await supabase.from('books').select('current_page').eq('id', bookId).single();
      if (book) {
        await supabase.from('books').update({ current_page: (book.current_page || 0) + pagesToRead }).eq('id', bookId);
      }
    }
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-500 dark:text-gray-400">Yükleniyor...</div>;
  }

  if (showGenerator) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6 dark:text-white">Çalışma Planı</h1>
        <PlanGenerator onPlanSaved={fetchPlan} />
      </div>
    );
  }

  const completedCount = tasks.filter(t => t.is_completed).length;
  const totalCount = tasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold dark:text-white">{activePlan.title}</h1>
          <p className="text-gray-500 dark:text-gray-400">
            {new Date(activePlan.start_date).toLocaleDateString('tr-TR')} - {new Date(activePlan.end_date).toLocaleDateString('tr-TR')}
          </p>
        </div>
        <button 
          onClick={() => {
            if(confirm('Yeni plan oluşturduğunuzda mevcut planınız yerine geçer. Devam etmek istiyor musunuz?')) {
              setShowGenerator(true);
            }
          }}
          className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Yeni Plan Oluştur
        </button>
      </div>

      <div className="mb-8">
        <div className="flex justify-between text-sm font-medium mb-2 dark:text-white">
          <span>İlerleme</span>
          <span>{completedCount} / {totalCount} Görev (%{progressPercent})</span>
        </div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
        </div>
      </div>

      {activePlan.recommendations && (
        <details className="mb-8 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 group cursor-pointer">
          <summary className="font-semibold text-blue-800 dark:text-blue-300 p-4 list-none flex justify-between items-center">
            Yapay Zeka Önerileri
            <span className="group-open:rotate-180 transition-transform text-blue-500">▼</span>
          </summary>
          <div className="p-4 pt-0 text-sm text-blue-900 dark:text-blue-200 border-t border-blue-100 dark:border-blue-800/50 mt-2">
            {activePlan.recommendations}
          </div>
        </details>
      )}

      <TaskCalendar tasks={tasks} onTaskToggle={handleTaskToggle} />
    </div>
  );
}
