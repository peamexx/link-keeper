import * as React from "react"

interface ToastProps {
  message: string
  duration?: number
  onClose: () => void
}

export function Toast({ message, duration = 3000, onClose }: ToastProps) {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, duration)
    return () => clearTimeout(timer)
  }, [duration, onClose])

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-black text-white px-4 py-2 rounded-md shadow-lg">
        {message}
      </div>
    </div>
  )
}

interface ToastContextType {
  showToast: (message: string) => void
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = React.useState<{ message: string } | null>(null)

  const showToast = React.useCallback((message: string) => {
    setToast({ message })
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <Toast
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within ToastProvider")
  }
  return context
}
