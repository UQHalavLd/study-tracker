'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Trash2, ChevronDown, ChevronUp, Calendar, X } from 'lucide-react'
import ExamForm from '@/components/exams/exam-form'
import ScoreTable from '@/components/exams/score-table'
import NetChart from '@/components/exams/net-chart'
import type { MockExam } from '@/components/exams/net-chart'
import WeakSubjects from '@/components/exams/weak-subjects'

export default function ExamsPage() {
  const [exams, setExams] = useState<MockExam[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [expandedExam, setExpandedExam] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchExams()
  }, [])

  const fetchExams = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('mock_exams')
        .select(`
          id, exam_name, exam_date, exam_type, total_net, notes,
          scores:mock_exam_scores(id, subject_id, correct_count, wrong_count, empty_count, net, subject:subjects(name, question_count))
        `)
        .eq('user_id', user.id)
        .order('exam_date', { ascending: false })

      if (error) throw error
      setExams((data as unknown as MockExam[]) || [])
    } catch (err) {
      console.error('Denemeler yüklenirken hata:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bu denemeyi silmek istediğinize emin misiniz?')) return

    try {
      const { error } = await supabase.from('mock_exams').delete().eq('id', id)
      if (error) throw error
      setExams(exams.filter(e => e.id !== id))
    } catch (err) {
      console.error('Deneme silinirken hata:', err)
      alert('Silinirken bir hata oluştu.')
    }
  }

  const toggleExpand = (id: string) => {
    setExpandedExam(expandedExam === id ? null : id)
  }

  const handleExamAdded = () => {
    setShowModal(false)
    fetchExams()
  }

  const getTypeBadgeClass = (type: string) => {
    if (type === 'tyt') return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    if (type === 'ayt') return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
    return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Denemelerim</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Yeni Deneme Ekle
        </button>
      </div>

      {exams.length > 0 && (
        <div className="space-y-8">
          <NetChart exams={exams} />
          <WeakSubjects exams={exams} />
        </div>
      )}

      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Deneme Geçmişi</h2>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : exams.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <Calendar className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Henüz deneme girmediniz</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">İlerlemenizi takip etmek için ilk denemenizi ekleyin!</p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 px-6 py-2 rounded-lg font-medium hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
            >
              Deneme Ekle
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {exams.map(exam => (
              <div key={exam.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-all hover:shadow-md">
                <div
                  className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer"
                  onClick={() => toggleExpand(exam.id)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">{exam.exam_name}</h3>
                      <span className={'inline-flex px-3 py-1 rounded-full text-xs font-medium ' + getTypeBadgeClass(exam.exam_type)}>
                        {exam.exam_type.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 gap-4">
                      <span>{new Date(exam.exam_date).toLocaleDateString('tr-TR')}</span>
                      {exam.notes && <span className="truncate max-w-[200px]">{exam.notes}</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-right">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Toplam Net</div>
                      <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                        {typeof exam.total_net === 'number' ? exam.total_net.toFixed(2) : '—'}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(exam.id); }}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Sil"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg">
                        {expandedExam === exam.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {expandedExam === exam.id && exam.scores && (
                  <div className="p-5 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/20">
                    <ScoreTable scores={exam.scores as unknown as import('@/components/exams/score-table').MockExamScore[]} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Yeni Deneme</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <ExamForm onSuccess={handleExamAdded} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
