'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { GoogleBookResult } from './book-search';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Subject {
  id: string;
  name: string;
}

interface BookFormProps {
  initialData?: any;
  prefillData?: GoogleBookResult | null;
  onSuccess: () => void;
}

export function BookForm({ initialData, prefillData, onSuccess }: BookFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    author: initialData?.author || '',
    isbn: initialData?.isbn || '',
    cover_url: initialData?.cover_url || '',
    total_pages: initialData?.total_pages || '',
    current_page: initialData?.current_page || 0,
    subject_id: initialData?.subject_id || '',
    target_date: initialData?.target_date ? new Date(initialData.target_date).toISOString().split('T')[0] : '',
    notes: initialData?.notes || '',
    status: initialData?.status || 'active',
  });

  useEffect(() => {
    async function fetchSubjects() {
      const { data, error } = await supabase
        .from('subjects')
        .select('id, name')
        .order('name');
      
      if (!error && data) {
        setSubjects(data);
      }
    }
    
    fetchSubjects();
  }, [supabase]);

  useEffect(() => {
    if (prefillData) {
      setFormData(prev => ({
        ...prev,
        title: prefillData.title || prev.title,
        author: prefillData.authors?.join(', ') || prev.author,
        isbn: prefillData.isbn || prev.isbn,
        cover_url: prefillData.thumbnail || prev.cover_url,
        total_pages: prefillData.pageCount || prev.total_pages,
      }));
    }
  }, [prefillData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Kullanıcı bulunamadı');

      const bookData = {
        title: formData.title,
        author: formData.author,
        isbn: formData.isbn,
        cover_url: formData.cover_url,
        total_pages: parseInt(formData.total_pages as string) || 0,
        current_page: parseInt(formData.current_page as string) || 0,
        subject_id: formData.subject_id || null,
        target_date: formData.target_date || null,
        notes: formData.notes,
        status: formData.status,
        user_id: user.id,
      };

      let result;
      
      if (initialData?.id) {
        result = await supabase
          .from('books')
          .update(bookData)
          .eq('id', initialData.id);
      } else {
        result = await supabase
          .from('books')
          .insert(bookData);
      }

      if (result.error) throw result.error;
      
      onSuccess();
      router.refresh();
    } catch (err: any) {
      console.error('Kitap kaydedilirken hata:', err);
      setError(err.message || 'Kitap kaydedilirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      {error && (
        <div className="p-3 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Kitap Adı *
          </label>
          <input
            type="text"
            name="title"
            required
            value={formData.title}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Yazar
          </label>
          <input
            type="text"
            name="author"
            value={formData.author}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            ISBN
          </label>
          <input
            type="text"
            name="isbn"
            value={formData.isbn}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Ders/Branş
          </label>
          <select
            name="subject_id"
            value={formData.subject_id}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Seçiniz...</option>
            {subjects.map(subject => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Toplam Sayfa *
          </label>
          <input
            type="number"
            name="total_pages"
            required
            min="1"
            value={formData.total_pages}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Mevcut Sayfa
          </label>
          <input
            type="number"
            name="current_page"
            min="0"
            max={formData.total_pages || undefined}
            value={formData.current_page}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Hedef Tarih
          </label>
          <input
            type="date"
            name="target_date"
            value={formData.target_date}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Durum
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="active">Aktif</option>
            <option value="completed">Tamamlandı</option>
            <option value="paused">Duraklatıldı</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Kapak URL
        </label>
        <div className="flex gap-4 items-start">
          <input
            type="text"
            name="cover_url"
            value={formData.cover_url}
            onChange={handleChange}
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="https://..."
          />
          {formData.cover_url && (
            <div className="w-12 h-16 relative bg-gray-100 rounded overflow-hidden flex-shrink-0">
              <img src={formData.cover_url} alt="Kapak önizleme" className="w-full h-full object-cover" />
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Notlar
        </label>
        <textarea
          name="notes"
          rows={3}
          value={formData.notes}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          Kaydet
        </button>
      </div>
    </form>
  );
}
