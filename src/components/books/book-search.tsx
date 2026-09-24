'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Book, Loader2 } from 'lucide-react';
import Image from 'next/image';

export type GoogleBookResult = {
  id: string;
  title: string;
  authors?: string[];
  thumbnail?: string;
  pageCount?: number;
  isbn?: string;
};

interface BookSearchProps {
  onSelect: (book: GoogleBookResult | null) => void;
}

export function BookSearch({ onSelect }: BookSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GoogleBookResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchTimer = setTimeout(async () => {
      if (query.trim().length < 3) {
        setResults([]);
        setIsOpen(false);
        return;
      }

      setIsLoading(true);
      setIsOpen(true);
      try {
        const response = await fetch(`/api/books/search?q=${encodeURIComponent(query)}`);
        if (response.ok) {
          const data = await response.json();
          setResults(Array.isArray(data) ? data : []);
        } else {
          setResults([]);
        }
      } catch (error) {
        console.error('Arama hatası:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(searchTimer);
  }, [query]);

  const handleSelect = (book: GoogleBookResult) => {
    onSelect(book);
    setIsOpen(false);
    setQuery('');
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {isLoading ? (
            <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
          ) : (
            <Search className="h-5 w-5 text-gray-400" />
          )}
        </div>
        <input
          type="text"
          className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Kitap ara (Ad, Yazar, ISBN)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onClick={() => {
            if (query.trim().length >= 3) setIsOpen(true);
          }}
        />
      </div>

      {isOpen && (
        <div className="absolute mt-2 w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 max-h-60 overflow-y-auto z-50">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              Aranıyor...
            </div>
          ) : results.length > 0 ? (
            <ul>
              {results.map((book) => (
                <li
                  key={book.id}
                  className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-0 flex items-start gap-3"
                  onClick={() => handleSelect(book)}
                >
                  <div className="flex-shrink-0 w-10 h-14 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden relative">
                    {book.thumbnail ? (
                      <Image
                        src={book.thumbnail}
                        alt={book.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Book className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {book.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {book.authors?.join(', ') || 'Bilinmeyen Yazar'}
                    </p>
                    {book.pageCount && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {book.pageCount} sayfa
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              Sonuç bulunamadı.
              <button
                type="button"
                className="block w-full mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                onClick={() => {
                  onSelect(null);
                  setIsOpen(false);
                }}
              >
                Manuel Ekle
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
