import React from 'react'

export interface MockExamScore {
  id?: string
  subject_id: string
  correct_count: number
  wrong_count: number
  empty_count: number
  net: number
  subject?: {
    name: string
    question_count: number
  }
}

interface ScoreTableProps {
  scores: MockExamScore[]
}

export default function ScoreTable({ scores }: ScoreTableProps) {
  if (!scores || scores.length === 0) return null

  const totalCorrect = scores.reduce((sum, score) => sum + score.correct_count, 0)
  const totalWrong = scores.reduce((sum, score) => sum + score.wrong_count, 0)
  const totalNet = scores.reduce((sum, score) => sum + score.net, 0)

  const totalQuestions = scores.reduce((sum, score) => sum + (score.subject?.question_count || 0), 0)
  const totalEmpty = totalQuestions > 0 ? totalQuestions - totalCorrect - totalWrong : 0

  const getNetColorClass = (net: number, questionCount: number) => {
    if (questionCount === 0) return 'text-gray-500 dark:text-gray-400'
    const percentage = net / questionCount
    if (percentage >= 0.75) return 'text-green-500'
    if (percentage >= 0.4) return 'text-yellow-500'
    return 'text-red-500'
  }

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
      <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700/50 dark:text-gray-400">
          <tr>
            <th scope="col" className="px-4 py-3">Ders</th>
            <th scope="col" className="px-4 py-3 text-center">Doğru</th>
            <th scope="col" className="px-4 py-3 text-center">Yanlış</th>
            <th scope="col" className="px-4 py-3 text-center">Boş</th>
            <th scope="col" className="px-4 py-3 text-center">Net</th>
          </tr>
        </thead>
        <tbody>
          {scores.map((score, index) => {
            const empty = (score.subject?.question_count || 0) - score.correct_count - score.wrong_count

            return (
              <tr
                key={score.id || index}
                className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                  {score.subject?.name || 'Bilinmeyen Ders'}
                </td>
                <td className="px-4 py-3 text-center">{score.correct_count}</td>
                <td className="px-4 py-3 text-center">{score.wrong_count}</td>
                <td className="px-4 py-3 text-center text-gray-400">{empty >= 0 ? empty : '—'}</td>
                <td className={'px-4 py-3 text-center font-bold ' + getNetColorClass(score.net, score.subject?.question_count || 0)}>
                  {score.net.toFixed(2)}
                </td>
              </tr>
            )
          })}
        </tbody>
        <tfoot className="bg-gray-50 dark:bg-gray-700/50 font-bold text-gray-900 dark:text-white">
          <tr>
            <th scope="row" className="px-4 py-3 text-base">Toplam</th>
            <td className="px-4 py-3 text-center">{totalCorrect}</td>
            <td className="px-4 py-3 text-center">{totalWrong}</td>
            <td className="px-4 py-3 text-center">{totalEmpty >= 0 ? totalEmpty : '—'}</td>
            <td className="px-4 py-3 text-center text-blue-600 dark:text-blue-400 text-base">
              {totalNet.toFixed(2)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
