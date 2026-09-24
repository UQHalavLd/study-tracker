'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import ExamForm from '@/components/exams/exam-form'

export default function NewExamPage() {
  const router = useRouter()

  const handleSuccess = () => {
    router.push('/dashboard/exams')
    router.refresh()
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Yeni Deneme Ekle</h1>
      </div>

      <ExamForm onSuccess={handleSuccess} />
    </div>
  )
}
