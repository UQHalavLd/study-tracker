'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { BookCard, Book } from '@/components/books/book-card';
import { BookSearch, GoogleBookResult } from '@/components/books/book-search';
import { BookForm } from '@/components/books/book-form';
import { Plus, X, BookOpen } from 'lucide-react';

type FilterType = 'all' | 'active' | 'completed' | 'paused';

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGoogleBook, setSelectedGoogleBook] = useState<GoogleBookResult | null>(null);
  
  const supabase = createClient();

  const fetchBooks = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('books')
        .select(`
          id, title, author, cover_url, total_pages, current_page, target_date, status,
          subjects (name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBooks(data || []);
    } catch (error) {
      console.error('Kitaplar yüklenirken hata:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [supabase]);

  const filteredBooks = books.filter(book => filter === 'all' ? true : book.status === filter);

  const handleBookSelect = (book: GoogleBookResult | null) => {
    setSelectedGoogleBook(book);
  };

  const handleSuccess = () => {
    setIsModalOpen(false);
    setSelectedGoogleBook(null);
    fetchBooks();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Kitaplarım</h1>
        <button
          onClick={() => {
            setSelectedGoogleBook(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          Kitap Ekle
        </button>
      </div>

      <div className="flex overflow-x-auto pb-2 scrollbar-hide">
        <div className="inline-flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
          {[
            { id: 'all', label: 'Tümü' },
            { id: 'active', label: 'Aktif' },
            { id: 'completed', label: 'Tamamlandı' },
            { id: 'paused', label: 'Duraklatıldı' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as FilterType)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === tab.id
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 h-80 flex flex-col">
              <div className="aspect-[3/4] bg-gray-200 dark:bg-gray-700 rounded-t-xl" />
              <div className="p-4 space-y-3 flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                <div className="mt-auto pt-4 space-y-2">
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mx-auto" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredBooks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBooks.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <BookOpen className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Henüz kitap bulunmuyor
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
            {filter === 'all' 
              ? 'Henüz hiç kitap eklemediniz. "Kitap Ekle" butonuna tıklayarak ilk kitabınızı ekleyin!'
              : 'Bu filtreye uygun kitap bulunamadı.'}
          </p>
          {filter === 'all' && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              İlk Kitabını Ekle
            </button>
          )}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto flex flex-col">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 sm:p-6 flex justify-between items-center z-10 rounded-t-2xl">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Yeni Kitap Ekle</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-4 sm:p-6 space-y-6">
              {!selectedGoogleBook && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Kitap Ara (Google Books)
                  </label>
                  <BookSearch onSelect={handleBookSelect} />
                </div>
              )}

              {(selectedGoogleBook || selectedGoogleBook === null) && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">
                    Kitap Bilgileri
                  </h3>
                  <BookForm 
                    prefillData={selectedGoogleBook} 
                    onSuccess={handleSuccess} 
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
