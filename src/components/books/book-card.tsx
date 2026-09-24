'use client';

import Link from 'next/link';
import { BookOpen, Calendar, Target } from 'lucide-react';
import Image from 'next/image';

export interface Book {
  id: string;
  title: string;
  author: string | null;
  cover_url: string | null;
  total_pages: number;
  current_page: number;
  target_date: string | null;
  status: 'active' | 'completed' | 'paused';
}

interface BookCardProps {
  book: Book;
}

export function BookCard({ book }: BookCardProps) {
  const progressPercentage = book.total_pages > 0 
    ? Math.min(100, Math.round((book.current_page / book.total_pages) * 100)) 
    : 0;

  let remainingDays = null;
  let dailyTarget = null;
  
  if (book.target_date && book.status === 'active') {
    const today = new Date();
    const target = new Date(book.target_date);
    const diffTime = target.getTime() - today.getTime();
    remainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (remainingDays > 0) {
      const remainingPages = book.total_pages - book.current_page;
      dailyTarget = Math.ceil(remainingPages / remainingDays);
    }
  }

  const getStatusColor = () => {
    switch (book.status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'paused': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const getStatusText = () => {
    switch (book.status) {
      case 'active': return 'Aktif';
      case 'completed': return 'Tamamlandı';
      case 'paused': return 'Duraklatıldı';
      default: return book.status;
    }
  };

  return (
    <Link href={`/dashboard/books/${book.id}`} className="block">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md hover:scale-[1.02] transition-all duration-200 h-full flex flex-col">
        
        <div className="relative">
          <div className="aspect-[3/4] bg-gray-100 dark:bg-gray-700 relative w-full overflow-hidden">
            {book.cover_url ? (
              <Image
                src={book.cover_url}
                alt={book.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                <BookOpen className="w-12 h-12" />
              </div>
            )}
          </div>
          <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </div>
        </div>

        <div className="p-4 flex-1 flex flex-col">
          <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1 mb-1" title={book.title}>
            {book.title}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1 mb-4">
            {book.author || 'Bilinmeyen Yazar'}
          </p>

          <div className="mt-auto">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs text-gray-500 dark:text-gray-400">İlerleme</span>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                %{progressPercentage}
              </span>
            </div>
            
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-2">
              <div 
                className="h-full bg-blue-500 transition-all duration-500 ease-in-out" 
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            
            <div className="text-xs text-center text-gray-500 dark:text-gray-400 mb-3">
              Sayfa {book.current_page} / {book.total_pages}
            </div>

            {(remainingDays !== null || dailyTarget !== null) && book.status === 'active' && (
              <div className="flex gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                {remainingDays !== null && remainingDays >= 0 && (
                  <div className="flex-1 flex items-center justify-center gap-1.5 text-xs text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 py-1.5 rounded">
                    <Calendar className="w-3 h-3" />
                    <span>{remainingDays} gün</span>
                  </div>
                )}
                {dailyTarget !== null && dailyTarget > 0 && remainingDays !== null && remainingDays >= 0 && (
                  <div className="flex-1 flex items-center justify-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 py-1.5 rounded">
                    <Target className="w-3 h-3" />
                    <span>{dailyTarget} syf/gün</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
