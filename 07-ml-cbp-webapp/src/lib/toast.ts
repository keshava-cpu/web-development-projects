export type AppToastTone = 'default' | 'success' | 'info'

export type AppToast = {
  id: number
  title: string
  message: string
  tone: AppToastTone
}

export function notifyApp(title: string, message: string, tone: AppToastTone = 'info') {
  if (typeof window === 'undefined') return

  window.dispatchEvent(
    new CustomEvent<AppToast>('app:toast', {
      detail: {
        id: Date.now() + Math.random(),
        title,
        message,
        tone,
      },
    }),
  )
}
