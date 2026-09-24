'use client';

import { useState } from 'react';
import TaskItem from './task-item';

export interface StudyTask {
  id: string;
  plan_id: string;
  user_id: string;
  title: string;
  date: string;
  subject: string;
  duration_minutes: number;
  pages_to_read?: number;
  is_completed: boolean;
  completed_at?: string;
  book_id?: string;
}

interface TaskCalendarProps {
  tasks: StudyTask[];
  onTaskToggle: (taskId: string, isCompleted: boolean, bookId?: string, pagesToRead?: number) => void;
}

export default function TaskCalendar({ tasks, onTaskToggle }: TaskCalendarProps) {
  const [view, setView] = useState<'liste' | 'takvim'>('liste');

  // Group by date
  const groupedTasks = tasks.reduce((acc, task) => {
    if (!acc[task.date]) acc[task.date] = [];
    acc[task.date].push(task);
    return acc;
  }, {} as Record<string, StudyTask[]>);

  const sortedDates = Object.keys(groupedTasks).sort();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="inline-flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          <button 
            className={`rounded-md px-4 py-2 text-sm font-medium ${view === 'liste' ? 'bg-white dark:bg-gray-800 shadow text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
            onClick={() => setView('liste')}
          >
            Liste
          </button>
          <button 
            className={`rounded-md px-4 py-2 text-sm font-medium ${view === 'takvim' ? 'bg-white dark:bg-gray-800 shadow text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
            onClick={() => setView('takvim')}
          >
            Takvim
          </button>
        </div>
      </div>

      {view === 'liste' ? (
        <div className="space-y-8">
          {sortedDates.map(date => {
            const dateObj = new Date(date);
            const formatter = new Intl.DateTimeFormat('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            return (
              <div key={date} className="space-y-4">
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur py-2">
                  {formatter.format(dateObj)}
                </h3>
                <div className="space-y-3">
                  {groupedTasks[date].map(task => (
                    <TaskItem key={task.id} task={task} onToggle={(completed) => onTaskToggle(task.id, completed, task.book_id, task.pages_to_read)} />
                  ))}
                </div>
              </div>
            );
          })}
          {sortedDates.length === 0 && <p className="text-gray-500 dark:text-gray-400">Bu plan için görev bulunmuyor.</p>}
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-1">
          {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map(d => (
            <div key={d} className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 py-2">{d}</div>
          ))}
          {/* A proper calendar calculation should be here, keeping it simple for the layout requirement */}
          {sortedDates.map(date => (
             <div key={date} className="min-h-[80px] bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-2 text-sm">
                <div className="text-right text-gray-500 dark:text-gray-400 mb-1">{new Date(date).getDate()}</div>
                <div className="text-xs text-center text-blue-600 dark:text-blue-400">{groupedTasks[date].length} Görev</div>
             </div>
          ))}
        </div>
      )}
    </div>
  );
}
