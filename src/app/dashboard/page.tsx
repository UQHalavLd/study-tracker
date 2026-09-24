'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { StatsCards, DashboardStats } from '@/components/dashboard/stats-cards'
import { Plus, PenTool, CalendarPlus, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [userName, setUserName] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', user.id)
            .single()
            
          setUserName(profile?.full_name?.split(' ')[0] || user.email?.split('@')[0] || '')
        }

        const { count: booksCount } = await supabase.from('books').select('*', { count: 'exact', head: true })
        
        setStats({
          totalBooks: booksCount || 0,
          averageProgress: 45,
          lastExamNet: 82.5,
          completedTodayTasks: 3,
          todayTaskCount: 5
        })
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [supabase])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
          ))}
        </div>
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse mt-8"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {userName ? `Hoş geldin, ${userName}!` : 'Hoş geldin!'}
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          İşte bugünkü çalışma özetin.
        </p>
      </div>

      {stats && <StatsCards stats={stats} />}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/dashboard/books" className="flex items-center justify-center gap-2 p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl border border-blue-100 dark:border-blue-900/50 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors font-medium">
          <Plus className="h-5 w-5" />
          Kitap Ekle
        </Link>
        <Link href="/dashboard/exams" className="flex items-center justify-center gap-2 p-4 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-xl border border-purple-100 dark:border-purple-900/50 hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors font-medium">
          <PenTool className="h-5 w-5" />
          Deneme Gir
        </Link>
        <Link href="/dashboard/study-plan" className="flex items-center justify-center gap-2 p-4 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-xl border border-orange-100 dark:border-orange-900/50 hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-colors font-medium">
          <CalendarPlus className="h-5 w-5" />
          Plan Oluştur
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Son Aktiviteler</h3>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-full mb-3">
            <CheckCircle className="h-8 w-8 text-gray-400 dark:text-gray-500" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Henüz bir aktivite bulunmuyor</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Kitap ekleyerek veya deneme çözerek başlayabilirsin.</p>
        </div>
      </div>
    </div>
  )
}
