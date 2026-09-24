'use client'

import React, { useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

export interface MockExam {
  id: string
  exam_name: string
  exam_date: string
  exam_type: string
  total_net: number
  notes?: string | null
  scores?: {
    subject_id: string
    net: number
    subject?: {
      name: string
    }
  }[]
}

interface NetChartProps {
  exams: MockExam[]
}

const SUBJECT_COLORS: Record<string, string> = {
  'Türkçe': '#3B82F6',
  'Matematik': '#EF4444',
  'Fen Bilimleri': '#10B981',
  'Sosyal Bilimler': '#F59E0B',
  'Fizik': '#8B5CF6',
  'Kimya': '#EC4899',
  'Biyoloji': '#14B8A6',
  'Türk Dili ve Edebiyatı': '#06B6D4',
  'Tarih-1': '#F97316',
  'Coğrafya-1': '#84CC16',
  'Toplam': '#111827'
}

const DEFAULT_COLOR = '#6B7280'

export default function NetChart({ exams }: NetChartProps) {
  const chartData = useMemo(() => {
    if (!exams || exams.length === 0) return []
    
    // Sort exams by date ascending
    const sorted = [...exams].sort((a, b) => new Date(a.exam_date).getTime() - new Date(b.exam_date).getTime())
    
    return sorted.map(exam => {
      const dataPoint: any = {
        name: exam.exam_name,
        date: new Date(exam.exam_date).toLocaleDateString('tr-TR'),
        Toplam: exam.total_net
      }
      
      if (exam.scores) {
        exam.scores.forEach(score => {
          if (score.subject?.name) {
            dataPoint[score.subject.name] = score.net
          }
        })
      }
      
      return dataPoint
    })
  }, [exams])

  const subjects = useMemo(() => {
    const subs = new Set<string>()
    if (exams) {
      exams.forEach(exam => {
        if (exam.scores) {
          exam.scores.forEach(score => {
            if (score.subject?.name) {
              subs.add(score.subject.name)
            }
          })
        }
      })
    }
    return Array.from(subs)
  }, [exams])

  if (!exams || exams.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 flex items-center justify-center min-h-[300px]">
        <p className="text-gray-500 dark:text-gray-400">Henüz deneme verisi bulunmuyor.</p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Net Gelişim Grafiği</h3>
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
            <XAxis 
              dataKey="date" 
              stroke="#6B7280"
              fontSize={12}
              tickMargin={10}
            />
            <YAxis 
              stroke="#6B7280"
              fontSize={12}
              tickMargin={10}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                borderRadius: '8px',
                border: '1px solid #E5E7EB',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              labelStyle={{ fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}
              itemStyle={{ fontSize: '14px', padding: '2px 0' }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            
            <Line
              type="monotone"
              dataKey="Toplam"
              stroke={SUBJECT_COLORS['Toplam']}
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 2 }}
              activeDot={{ r: 6 }}
            />
            
            {subjects.map(subject => (
              <Line
                key={subject}
                type="monotone"
                dataKey={subject}
                stroke={SUBJECT_COLORS[subject] || DEFAULT_COLOR}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
                opacity={0.8}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
