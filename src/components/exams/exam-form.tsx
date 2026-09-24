'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Save, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Subject {
  id: string
  name: string
  exam_type: string
  question_count: number
}

interface ExamFormProps {
  onSuccess?: () => void
}

interface ScoreEntry {
  subject_id: string
  correct: number
  wrong: number
}

export default function ExamForm({ onSuccess }: ExamFormProps) {
  const [examType, setExamType] = useState<'tyt' | 'ayt' | 'custom'>('tyt')
  const [examName, setExamName] = useState('')
  const [examDate, setExamDate] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [scores, setScores] = useState<Record<string, ScoreEntry>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    fetchSubjects()
  }, [examType])

  const fetchSubjects = async () => {
    setLoading(true)
    setError(null)

    const fallbackSubjects: Subject[] = examType === 'tyt'
      ? [
          { id: '1', name: 'Türkçe', exam_type: 'tyt', question_count: 40 },
          { id: '2', name: 'Matematik', exam_type: 'tyt', question_count: 40 },
          { id: '3', name: 'Fen Bilimleri', exam_type: 'tyt', question_count: 20 },
          { id: '4', name: 'Sosyal Bilimler', exam_type: 'tyt', question_count: 20 },
        ]
      : examType === 'ayt'
      ? [
          { id: '5', name: 'Matematik', exam_type: 'ayt', question_count: 40 },
          { id: '6', name: 'Fizik', exam_type: 'ayt', question_count: 14 },
          { id: '7', name: 'Kimya', exam_type: 'ayt', question_count: 13 },
          { id: '8', name: 'Biyoloji', exam_type: 'ayt', question_count: 13 },
          { id: '9', name: 'Türk Dili ve Edebiyatı', exam_type: 'ayt', question_count: 24 },
          { id: '10', name: 'Tarih-1', exam_type: 'ayt', question_count: 10 },
          { id: '11', name: 'Coğrafya-1', exam_type: 'ayt', question_count: 6 },
        ]
      : []

    try {
      const { data, error: dbError } = await supabase
        .from('subjects')
        .select('*')
        .eq('exam_type', examType)

      if (dbError) throw dbError

      const loadedSubjects = data && data.length > 0 ? (data as Subject[]) : fallbackSubjects
      setSubjects(loadedSubjects)

      const initialScores: Record<string, ScoreEntry> = {}
      loadedSubjects.forEach(sub => {
        initialScores[sub.id] = { subject_id: sub.id, correct: 0, wrong: 0 }
      })
      setScores(initialScores)
    } catch {
      setSubjects(fallbackSubjects)
      const initialScores: Record<string, ScoreEntry> = {}
      fallbackSubjects.forEach(sub => {
        initialScores[sub.id] = { subject_id: sub.id, correct: 0, wrong: 0 }
      })
      setScores(initialScores)
    } finally {
      setLoading(false)
    }
  }

  const handleScoreChange = (subjectId: string, field: 'correct' | 'wrong', value: string) => {
    const numValue = value === '' ? 0 : parseInt(value, 10)
    if (isNaN(numValue) || numValue < 0) return

    setScores(prev => {
      const subject = subjects.find(s => s.id === subjectId)
      if (!subject) return prev

      const currentScore = prev[subjectId]
      const newScore = { ...currentScore, [field]: numValue }

      if (newScore.correct + newScore.wrong > subject.question_count) {
        return prev
      }

      return { ...prev, [subjectId]: newScore }
    })
  }

  const calculateNet = (correct: number, wrong: number) => {
    return correct - (wrong / 4)
  }

  const calculateTotalNet = () => {
    return Object.values(scores).reduce((total, score) => {
      return total + calculateNet(score.correct, score.wrong)
    }, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!examName.trim()) {
      setError('Lütfen bir deneme adı girin.')
      return
    }

    setSaving(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Kullanıcı bulunamadı')

      const totalNet = calculateTotalNet()

      const { data: examData, error: examError } = await supabase
        .from('mock_exams')
        .insert({
          user_id: user.id,
          exam_name: examName,
          exam_type: examType,
          exam_date: examDate,
          total_net: totalNet,
          notes: notes
        })
        .select()
        .single()

      if (examError) throw examError

      const scoreEntries = Object.values(scores).map(score => ({
        mock_exam_id: examData.id,
        subject_id: score.subject_id,
        correct_count: score.correct,
        wrong_count: score.wrong,
        empty_count: (subjects.find(s => s.id === score.subject_id)?.question_count ?? 0) - score.correct - score.wrong,
      }))

      const { error: scoresError } = await supabase
        .from('mock_exam_scores')
        .insert(scoreEntries)

      if (scoresError) throw scoresError

      if (onSuccess) {
        onSuccess()
      } else {
        router.push('/dashboard/exams')
        router.refresh()
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Bir hata oluştu'
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  const examTypes: { value: 'tyt' | 'ayt' | 'custom'; label: string }[] = [
    { value: 'tyt', label: 'TYT' },
    { value: 'ayt', label: 'AYT' },
    { value: 'custom', label: 'Özel' },
  ]

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Yeni Deneme Ekle</h2>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Deneme Türü
            </label>
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              {examTypes.map(type => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setExamType(type.value)}
                  className={[
                    'flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors',
                    examType === type.value
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  ].join(' ')}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tarih
            </label>
            <input
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Deneme Adı
          </label>
          <input
            type="text"
            value={examName}
            onChange={(e) => setExamName(e.target.value)}
            placeholder="Örn: 3D TYT Deneme 5"
            required
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {loading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        ) : (
          <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            <div className="grid grid-cols-5 gap-2 items-center bg-gray-50 dark:bg-gray-900 p-4 border-b border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-400">
              <div className="col-span-1">Ders</div>
              <div className="text-center">Doğru</div>
              <div className="text-center">Yanlış</div>
              <div className="text-center">Boş</div>
              <div className="text-center">Net</div>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {subjects.map((subject, index) => {
                const score = scores[subject.id]
                if (!score) return null

                const empty = subject.question_count - score.correct - score.wrong
                const net = calculateNet(score.correct, score.wrong)
                const rowBg = index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/50 dark:bg-gray-800/50'

                return (
                  <div key={subject.id} className={'grid grid-cols-5 gap-2 items-center p-4 ' + rowBg}>
                    <div className="col-span-1">
                      <div className="font-medium text-gray-900 dark:text-white">{subject.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{subject.question_count} Soru</div>
                    </div>
                    <div className="flex justify-center">
                      <input
                        type="number"
                        min="0"
                        max={subject.question_count}
                        value={score.correct || ''}
                        onChange={(e) => handleScoreChange(subject.id, 'correct', e.target.value)}
                        className="w-20 text-center px-2 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div className="flex justify-center">
                      <input
                        type="number"
                        min="0"
                        max={subject.question_count}
                        value={score.wrong || ''}
                        onChange={(e) => handleScoreChange(subject.id, 'wrong', e.target.value)}
                        className="w-20 text-center px-2 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div className="flex justify-center text-gray-500 dark:text-gray-400 font-medium">
                      {empty}
                    </div>
                    <div className={'flex justify-center font-bold ' + (net > 0 ? 'text-green-500' : net < 0 ? 'text-red-500' : 'text-gray-500')}>
                      {net.toFixed(2)}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 p-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <span className="font-bold text-gray-700 dark:text-gray-300">Toplam Net</span>
              <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {calculateTotalNet().toFixed(2)}
              </span>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Notlar (İsteğe bağlı)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Deneme hakkında notlarınız..."
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={saving || loading}
          className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-5 h-5" />
          {saving ? 'Kaydediliyor...' : 'Denemeyi Kaydet'}
        </button>
      </form>
    </div>
  )
}
