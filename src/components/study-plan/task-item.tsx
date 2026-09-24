'use client';

import { StudyTask } from './task-calendar';
import { Clock, BookOpen } from 'lucide-react';

interface TaskItemProps {
  task: StudyTask;
  onToggle: (completed: boolean) => void;
}

export default function TaskItem({ task, onToggle }: TaskItemProps) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-4 flex items-start gap-3 transition-all duration-300 ${task.is_completed ? 'opacity-60 bg-gray-50 dark:bg-gray-800/50' : ''}`}>
      <input 
        type="checkbox" 
        checked={task.is_completed}
        onChange={(e) => onToggle(e.target.checked)}
        className="w-5 h-5 mt-0.5 rounded border-2 border-gray-300 dark:border-gray-600 accent-blue-500 cursor-pointer"
      />
      <div className="flex-1 space-y-1.5">
        <h4 className={`font-medium dark:text-white ${task.is_completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900'}`}>
          {task.title}
        </h4>
        
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="inline-flex items-center gap-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-md">
            <Clock size={12} /> {task.duration_minutes} dk
          </span>
          <span className="inline-flex items-center gap-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-md">
            <BookOpen size={12} /> {task.subject}
          </span>
          {task.pages_to_read && (
            <span className="inline-flex items-center gap-1 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-md">
              {task.pages_to_read} sayfa
            </span>
          )}
        </div>
        
        {task.is_completed && task.completed_at && (
          <p className="text-xs text-gray-500 dark:text-gray-400 pt-1">
            Tamamlandı: {new Date(task.completed_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute:'2-digit' })}
          </p>
        )}
      </div>
    </div>
  );
}
