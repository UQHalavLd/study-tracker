'use client'

import React from 'react'
import { BookOpen, FileText, Target, CheckCircle } from 'lucide-react'

export interface DashboardStats {
  totalBooks: number
  averageProgress: number
  lastExamNet: number | null
  completedTodayTasks: number
  todayTaskCount: number
}

interface StatsCardsProps {
  stats: DashboardStats
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {/* Card 1 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex flex-col transition-transform hover:-translate-y-1 hover:shadow-md">
        <div className="flex items-center gap-4">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
            <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Toplam Kitap</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalBooks}</h3>
          </div>
        </div>
      </div>

      {/* Card 2 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex flex-col transition-transform hover:-translate-y-1 hover:shadow-md">
        <div className="flex items-center gap-4">
          <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
            <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Sayfa İlerlemesi</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">%{stats.averageProgress}</h3>
          </div>
        </div>
      </div>

      {/* Card 3 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex flex-col transition-transform hover:-translate-y-1 hover:shadow-md">
        <div className="flex items-center gap-4">
          <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full">
            <Target className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Son Deneme</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.lastExamNet !== null ? stats.lastExamNet : '-'}
            </h3>
          </div>
        </div>
      </div>

      {/* Card 4 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex flex-col transition-transform hover:-translate-y-1 hover:shadow-md">
        <div className="flex items-center gap-4">
          <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-full">
            <CheckCircle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Bugünkü Görevler</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.completedTodayTasks} / {stats.todayTaskCount}
            </h3>
          </div>
        </div>
      </div>
    </div>
  )
}
