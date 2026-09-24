'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen, LayoutDashboard, ClipboardList, Calendar, Settings, X, User, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  userFullName?: string
}

export function Sidebar({ isOpen, onClose, userFullName }: SidebarProps) {
  const pathname = usePathname()

  const navItems = [
    { name: 'Gösterge Paneli', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Kitaplarım', href: '/dashboard/books', icon: BookOpen },
    { name: 'Denemelerim', href: '/dashboard/exams', icon: ClipboardList },
    { name: 'Çalışma Planı', href: '/dashboard/study-plan', icon: Calendar },
    { name: 'Ayarlar', href: '/dashboard/settings', icon: Settings },
    { name: 'Yönetici Paneli', href: '/dashboard/admin', icon: Shield },
  ]

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 flex h-full w-64 flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200 dark:border-gray-700">
          <Link href="/dashboard" className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">StudyTracker</span>
          </Link>
          <button onClick={onClose} className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose()
                }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                )}
              >
                <Icon className={cn("h-5 w-5", isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-400 dark:text-gray-500")} />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* User info & 1has branding */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 flex-shrink-0 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
              <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {userFullName || 'Öğrenci'}
              </p>
              <p className="text-[11px] text-gray-400">Aktif Hesap</p>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100 dark:border-gray-700/50 flex items-center justify-between text-[11px] text-gray-400">
            <span>Geliştirici:</span>
            <span className="font-extrabold text-blue-600 dark:text-blue-400">1has</span>
          </div>
        </div>
      </aside>
    </>
  )
}
