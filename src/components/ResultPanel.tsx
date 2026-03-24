import { useState, useRef, useEffect } from 'react'
import { Download, Loader2, Copy, Check, ChevronDown } from 'lucide-react'

export type ExportFormat = 'txt' | 'srt' | 'vtt'

interface Props {
  title: string
  placeholder: string
  text: string
  onChange: (text: string) => void
  isLoading: boolean
  onAction: () => void
  actionLabel: string
  onExport?: (format: ExportFormat) => void
  hasTimestamps?: boolean
  children?: React.ReactNode
}

export default function ResultPanel({
  title,
  placeholder,
  text,
  onChange,
  isLoading,
  onAction,
  actionLabel,
  onExport,
  hasTimestamps,
  children,
}: Props) {
  const [copied, setCopied] = useState(false)
  const [showExport, setShowExport] = useState(false)
  const exportRef = useRef<HTMLDivElement>(null)

  // Close export dropdown on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setShowExport(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleCopy = async () => {
    if (!text) return
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0
  const charCount = text.length

  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] overflow-hidden backdrop-blur-sm flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
        <h2 className="text-base font-semibold text-white">{title}</h2>
        <div className="flex items-center gap-1">
          {/* Copy */}
          {text && (
            <button
              onClick={handleCopy}
              className="p-2 rounded-lg text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 transition-all"
              title="Copy to clipboard"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          )}

          {/* Export dropdown */}
          {text && onExport && (
            <div className="relative" ref={exportRef}>
              <button
                onClick={() => setShowExport(!showExport)}
                className="p-2 rounded-lg text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 transition-all flex items-center gap-0.5"
                title="Export"
              >
                <Download className="w-4 h-4" />
                <ChevronDown className="w-3 h-3" />
              </button>
              {showExport && (
                <div className="absolute right-0 top-full mt-1 w-36 rounded-xl bg-gray-900 border border-white/10 shadow-xl shadow-black/50 z-20 overflow-hidden">
                  <button
                    onClick={() => { onExport('txt'); setShowExport(false) }}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    .txt (Plain text)
                  </button>
                  {hasTimestamps && (
                    <>
                      <button
                        onClick={() => { onExport('srt'); setShowExport(false) }}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors border-t border-white/5"
                      >
                        .srt (Subtitles)
                      </button>
                      <button
                        onClick={() => { onExport('vtt'); setShowExport(false) }}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors border-t border-white/5"
                      >
                        .vtt (WebVTT)
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Extra controls (language selector etc.) */}
      {children && (
        <div className="px-5 py-3 border-b border-white/[0.04] bg-white/[0.01]">
          {children}
        </div>
      )}

      {/* Text area */}
      <div className="p-5 flex-1">
        <textarea
          value={text}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={10}
          className="w-full h-full min-h-[200px] bg-transparent text-gray-200 placeholder-gray-600 text-sm leading-relaxed resize-none focus:outline-none"
        />
      </div>

      {/* Word count */}
      {text && (
        <div className="px-5 pb-2 flex items-center gap-3 text-xs text-gray-500">
          <span>{wordCount.toLocaleString()} words</span>
          <span>&middot;</span>
          <span>{charCount.toLocaleString()} chars</span>
        </div>
      )}

      {/* Action button */}
      <div className="px-5 pb-5">
        <button
          onClick={onAction}
          disabled={isLoading}
          className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 active:scale-[0.98] flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing...
            </>
          ) : (
            actionLabel
          )}
        </button>
      </div>
    </div>
  )
}
