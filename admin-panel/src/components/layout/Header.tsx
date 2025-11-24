'use client'

import { Bell, Search } from 'lucide-react'
import { Input } from '../ui/Input'

interface HeaderProps {
  title?: string
}

export function Header({ title = 'Dashboard' }: HeaderProps) {
  return (
    <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 flex items-center justify-between">
      <div className="flex-1">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{title}</h1>
      </div>
      
      <div className="flex items-center space-x-4">
        {/* Search */}
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search..."
            className="pl-10 py-2"
          />
        </div>
        
        {/* Notifications */}
        <button className="relative p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full"></span>
        </button>
      </div>
    </header>
  )
}
