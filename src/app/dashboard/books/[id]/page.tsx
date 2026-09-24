'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, BookOpen, Trash2, Calendar, Target, Edit3 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function BookDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const supabase = createClient();
  const [book, setBook] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentPageInput, setCurrentPageInput] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchBook();
  }, [params.id]);

  const fetchBook = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('books')
        .select(`*, subjects(name)`)
        .eq('id', params.id)
        .single();

      if (error) throw error;
      setBook(data);
      setCurrentPageInput(data.current_page.toString());
    } catch (error) {
      console.error('Kitap yüklenirken hata:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProgress = async () => {
    const newPage = parseInt(currentPageInput);
    if (isNaN(newPage) || newPage < 0) return;

    // Limit to total pages
    const validPage = Math.min(newPage, book.total_pages);
    
    setIsUpdating(true);
    try {
      let status = book.status;
      if (validPage >= book.total_pages) {
        status = 'completed';
      } else if (book.status === 'completed' && validPage < book.total_pages) {
        status = 'active';
      }

      const { error } = await supabase
        .from('books')
        .update({ current_page: validPage, status })
        .eq('id', book.id);

      if (error) throw error;
      
      setBook({ ...book, current_page: validPage, status });
      setCurrentPageInput(validPage.toString());
    } catch (error) {
      console.error('İlerleme güncellenirken hata:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      const { error } = await supabase
        .from('books')
        .update({ status: newStatus })
        .eq('id', book.id);

      if (error) throw error;
      setBook({ ...book, status: newStatus });
    } catch (error) {
      console.error('Durum güncellenirken hata:', error);
    }
  };

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('books')
        .delete()
        .eq('id', book.id);

      if (error) throw error;
      router.push('/dashboard/books');
    } catch (error) {
      console.error('Kitap silinirken hata:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">Kitap bulunamadı</h2>
        <Link href="/dashboard/books" className="text-blue-500 hover:underline">
          Kitaplarıma dön
        </Link>
      </div>
    );
  }

  const progressPercentage = book.total_pages > 0 
    ? Math.min(100, Math.round((book.current_page / book.total_pages) * 100)) 
    : 0;
  
  const remainingPages = book.total_pages - book.current_page;
  
  let remainingDays = null;
  let dailyTarget = null;
  
  if (book.target_date) {
    const today = new Date();
    const target = new Date(book.target_date);
    const diffTime = target.getTime() - today.getTime();
    remainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (remainingDays > 0) {
      dailyTarget = Math.ceil(remainingPages / remainingDays);
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Link 
        href="/dashboard/books" 
        className="inline-flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Kitaplarıma Dön
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10">
        
        {/* Left Column: Cover & Actions */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="aspect-[3/4] bg-gray-100 dark:bg-gray-700 rounded-lg relative overflow-hidden shadow-inner mx-auto w-full max-w-[240px] md:max-w-full">
              {book.cover_url ? (
                <Image
                  src={book.cover_url}
                  alt={book.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  <BookOpen className="w-20 h-20" />
                </div>
              )}
            </div>
            
            <div className="mt-6 flex flex-col gap-2">
              {book.status === 'active' ? (
                <button 
                  onClick={() => handleStatusChange('paused')}
                  className="w-full py-2.5 bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:hover:bg-orange-900/50 rounded-lg font-medium transition-colors"
                >
                  Okumayı Duraklat
                </button>
              ) : book.status === 'paused' ? (
                <button 
                  onClick={() => handleStatusChange('active')}
                  className="w-full py-2.5 bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50 rounded-lg font-medium transition-colors"
                >
                  Okumaya Devam Et
                </button>
              ) : null}

              {book.status !== 'completed' && (
                <button 
                  onClick={() => handleStatusChange('completed')}
                  className="w-full py-2.5 bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 rounded-lg font-medium transition-colors"
                >
                  Tamamlandı Olarak İşaretle
                </button>
              )}

              <button 
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full py-2.5 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 mt-2"
              >
                <Trash2 className="w-4 h-4" />
                Kitabı Sil
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Details & Progress */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 md:p-8">
            <div className="mb-2">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-3
                ${book.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 
                  book.status === 'completed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' : 
                  'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'}`}
              >
                {book.status === 'active' ? 'Aktif' : book.status === 'completed' ? 'Tamamlandı' : 'Duraklatıldı'}
              </span>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{book.title}</h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">{book.author || 'Bilinmeyen Yazar'}</p>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-gray-100 dark:border-gray-700 mb-8">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">ISBN</p>
                <p className="font-medium text-gray-900 dark:text-white">{book.isbn || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Ders/Branş</p>
                <p className="font-medium text-gray-900 dark:text-white">{book.subjects?.name || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Toplam Sayfa</p>
                <p className="font-medium text-gray-900 dark:text-white">{book.total_pages}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Eklenme</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {new Date(book.created_at).toLocaleDateString('tr-TR')}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-8 mb-8">
              {/* Circular Progress */}
              <div className="relative w-32 h-32 flex-shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    className="text-gray-200 dark:text-gray-700 stroke-current"
                    strokeWidth="8"
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                  ></circle>
                  <circle
                    className="text-blue-500 stroke-current transition-all duration-1000 ease-out"
                    strokeWidth="8"
                    strokeLinecap="round"
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - progressPercentage / 100)}`}
                  ></circle>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">%{progressPercentage}</span>
                </div>
              </div>

              {/* Progress Form */}
              <div className="flex-1 w-full bg-gray-50 dark:bg-gray-700/30 p-5 rounded-xl border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">İlerlemeyi Güncelle</h3>
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center">
                    <input
                      type="number"
                      min="0"
                      max={book.total_pages}
                      value={currentPageInput}
                      onChange={(e) => setCurrentPageInput(e.target.value)}
                      className="w-24 px-3 py-2 text-lg font-semibold text-center rounded-l-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="px-3 py-2 bg-gray-200 dark:bg-gray-600 border-y border-r border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-r-lg h-full flex items-center font-medium">
                      / {book.total_pages}
                    </div>
                  </div>
                  <button
                    onClick={handleUpdateProgress}
                    disabled={isUpdating || parseInt(currentPageInput) === book.current_page}
                    className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpdating ? 'Güncelleniyor...' : 'Güncelle'}
                  </button>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center sm:text-left mt-2">
                  Kalan: <strong className="text-gray-900 dark:text-white">{remainingPages}</strong> sayfa
                </p>
              </div>
            </div>

            {/* Target Info */}
            {book.target_date && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30">
                  <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-orange-600 dark:text-orange-400">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-orange-600/80 dark:text-orange-400/80 font-medium mb-0.5">Hedef Tarih</p>
                    <p className="text-lg font-semibold text-orange-700 dark:text-orange-300">
                      {new Date(book.target_date).toLocaleDateString('tr-TR')}
                      {remainingDays !== null && remainingDays >= 0 && (
                        <span className="text-sm font-normal ml-2">({remainingDays} gün kaldı)</span>
                      )}
                    </p>
                  </div>
                </div>

                {dailyTarget !== null && dailyTarget > 0 && remainingDays !== null && remainingDays >= 0 && (
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                      <Target className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm text-blue-600/80 dark:text-blue-400/80 font-medium mb-0.5">Günlük Hedef</p>
                      <p className="text-lg font-semibold text-blue-700 dark:text-blue-300">
                        {dailyTarget} sayfa
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {book.notes && (
              <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Notlar</h3>
                <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/30 p-4 rounded-xl text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                  {book.notes}
                </div>
              </div>
            )}
            
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Kitabı Sil</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              "{book.title}" adlı kitabı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Evet, Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
