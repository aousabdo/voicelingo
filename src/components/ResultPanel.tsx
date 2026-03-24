import { Download, Loader2 } from 'lucide-react'

interface Props {
  title: string
  placeholder: string
  text: string
  isLoading: boolean
  onAction: () => void
  actionLabel: string
  onDownload?: () => void
}

export default function ResultPanel({
  title,
  placeholder,
  text,
  isLoading,
  onAction,
  actionLabel,
  onDownload,
}: Props) {
  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] overflow-hidden backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
        <h2 className="text-base font-semibold text-white">{title}</h2>
        <div className="flex items-center gap-2">
          {onDownload && (
            <button
              onClick={onDownload}
              className="p-2 rounded-lg text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 transition-all"
              title="Download"
            >
              <Download className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Text area */}
      <div className="p-5">
        <textarea
          readOnly
          value={text}
          placeholder={placeholder}
          rows={8}
          className="w-full bg-transparent text-gray-200 placeholder-gray-600 text-sm leading-relaxed resize-none focus:outline-none"
        />
      </div>

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
