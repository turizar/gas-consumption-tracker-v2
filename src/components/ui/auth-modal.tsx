'use client'

import Link from 'next/link'
import { Button } from './button'

interface AuthModalProps {
  title: string
  message: string
  action?: string
  onClose?: () => void
}

export function AuthModal({ title, message, action = 'Register', onClose }: AuthModalProps) {
  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex gap-3">
          <Button asChild className="flex-1">
            <Link href="/register">{action}</Link>
          </Button>
          <Button asChild variant="outline" className="flex-1">
            <Link href="/login">Login</Link>
          </Button>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="mt-4 text-gray-500 hover:text-gray-700 text-sm"
          >
            Close
          </button>
        )}
      </div>
    </div>
  )
}

