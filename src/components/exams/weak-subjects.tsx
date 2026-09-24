'use client'

import React, { useMemo } from 'react'
import { TrendingDown, AlertTriangle } from 'lucide-react'
import type { MockExam } from './net-chart'

interface WeakSubjectsProps {
  exams: MockExam[]
}

interface Weakness {
  subject: string
  latest: number
  previousAvg: number
  dropAmount: number
  dropPercentage: number
  severity: 'low' | 'medium' | 'high'
  recentNets: number[]
}

export default function WeakSubjects({ exams }: WeakSubjectsProps) {
  const weakSubjects = useMemo<Weakness[]>(() => {
    if (!exams || exams.length < 2) return []

    const sorted = [...exams].sort((a, b) => new Date(b.exam_date).getTime() - new Date(a.exam_date).getTime())
    const last3 = sorted.slice(0, 3)

    if (last3.length < 2) return []

    const subjectNets: Record<string, number[]> = {}

    last3.forEach(exam => {
      if (exam.scores) {
        exam.scores.forEach(score => {
          const subjectName = score.subject?.name
          if (subjectName) {
            if (!subjectNets[subjectName]) subjectNets[subjectName] = []
            subjectNets[subjectName].unshift(score.net)
          }
        })
      }
    })

    const weaknesses: Weakness[] = []

    for (const [subject, nets] of Object.entries(subjectNets)) {
      if (nets.length >= 2) {
        const latest = nets[nets.length - 1]
        const previousAvg = nets.slice(0, -1).reduce((a, b) => a + b, 0) / (nets.length - 1)

        if (latest < previousAvg) {
          const dropAmount = previousAvg - latest
          if (dropAmount >= 1) {
            const dropPercentage = (dropAmount / (previousAvg || 1)) * 100

            let severity: 'low' | 'medium' | 'high' = 'low'
            if (dropPercentage > 30) severity = 'high'
            else if (dropPercentage > 15) severity = 'medium'

            weaknesses.push({
              subject,
              latest,
              previousAvg,
              dropAmount,
              dropPercentage,
              severity,
              recentNets: nets
            })
          }
        }
      }
    }

    return weaknesses.sort((a, b) => {
      const severityOrder = { high: 0, medium: 1, low: 2 }
      if (severityOrder[a.severity] !== severityOrder[b.severity]) {
        return severityOrder[a.severity] - severityOrder[b.severity]
      }
      return b.dropAmount - a.dropAmount
    })
  }, [exams])

  if (!exams || exams.length < 2) {
    return null
  }

  const getSeverityBadgeClass = (severity: string) => {
    if (severity === 'high') return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    if (severity === 'medium') return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
    return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2 mb-6">
        <AlertTriangle className="w-5 h-5 text-orange-500" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Düşüşteki Konular (Son 3 Deneme)</h3>
      </div>

      {weakSubjects.length === 0 ? (
        <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 p-4 rounded-lg flex items-center justify-center gap-2">
          <span>Tebrikler! Zayıf konu tespit edilmedi. 🎉</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {weakSubjects.map((weakness, i) => (
            <div key={i} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-gray-900 dark:text-white">{weakness.subject}</h4>
                <span className={'text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 ' + getSeverityBadgeClass(weakness.severity)}>
                  <TrendingDown className="w-3 h-3" />
                  %{weakness.dropPercentage.toFixed(0)}
                </span>
              </div>

              <div className="mt-3 text-sm flex justify-between items-end">
                <div className="text-gray-500 dark:text-gray-400">
                  <p>Önceki Ort.: <span className="font-medium text-gray-700 dark:text-gray-300">{weakness.previousAvg.toFixed(1)}</span></p>
                  <p>Son Deneme: <span className="font-bold text-red-500">{weakness.latest.toFixed(1)}</span></p>
                </div>
                <div className="text-xs text-gray-400">
                  Trend: {weakness.recentNets.map(n => n.toFixed(1)).join(' → ')}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
