"use client"

import { useEffect } from "react"
import { Check, AlertCircle, AlertTriangle, Info, X } from "lucide-react"

interface ToastProps {
  type: "success" | "error" | "warning" | "info"
  message: string
  onClose: () => void
  duration?: number
}

export default function Toast({ type, message, onClose, duration = 4000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [onClose, duration])

  const icons = {
    success: Check,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  }

  const colors = {
    success: { bg: "bg-emerald-50", border: "border-emerald-200", icon: "text-emerald-600", text: "text-emerald-900" },
    error: { bg: "bg-red-50", border: "border-red-200", icon: "text-red-600", text: "text-red-900" },
    warning: { bg: "bg-amber-50", border: "border-amber-200", icon: "text-amber-600", text: "text-amber-900" },
    info: { bg: "bg-blue-50", border: "border-blue-200", icon: "text-blue-600", text: "text-blue-900" },
  }

  const Icon = icons[type]
  const color = colors[type]

  return (
    <div className="toast-container">
      <div
        className={`${color.bg} border ${color.border} rounded-lg p-4 shadow-lg flex items-start gap-4 max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-200`}
        role="status"
        aria-live="polite"
        aria-label={`${type} notification`}
      >
        <Icon className={`w-5 h-5 ${color.icon} flex-shrink-0 mt-0.5`} strokeWidth={2} />
        <p className={`text-sm ${color.text} flex-1`}>{message}</p>
        <button
          onClick={onClose}
          className={`${color.icon} hover:opacity-70 transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent focus:ring-current rounded p-0.5`}
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
