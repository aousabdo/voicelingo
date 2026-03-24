import { FileAudio, Loader2, Check, X, AlertCircle, Download } from 'lucide-react'

export interface BatchFile {
  file: File
  status: 'pending' | 'processing' | 'done' | 'error'
  transcription?: string
  error?: string
}

interface Props {
  files: BatchFile[]
  onRemove: (index: number) => void
  onProcess: () => void
  onDownloadAll: () => void
  isProcessing: boolean
}

export default function BatchPanel({ files, onRemove, onProcess, onDownloadAll, isProcessing }: Props) {
  const doneCount = files.filter((f) => f.status === 'done').length
  const allDone = doneCount === files.length

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] overflow-hidden backdrop-blur-sm">
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
        <h2 className="text-base font-semibold text-white">
          Batch Processing
          <span className="text-xs font-normal text-gray-400 ml-2">
            {files.length} file{files.length !== 1 ? 's' : ''}
          </span>
        </h2>
        {allDone && (
          <button
            onClick={onDownloadAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-purple-400 hover:bg-purple-500/10 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Download All
          </button>
        )}
      </div>

      <div className="max-h-64 overflow-y-auto">
        {files.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-3 px-5 py-3 border-b border-white/[0.04] last:border-b-0"
          >
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
              {item.status === 'processing' ? (
                <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
              ) : item.status === 'done' ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : item.status === 'error' ? (
                <AlertCircle className="w-4 h-4 text-red-400" />
              ) : (
                <FileAudio className="w-4 h-4 text-gray-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white truncate">{item.file.name}</p>
              <p className="text-xs text-gray-500">
                {formatSize(item.file.size)}
                {item.error && <span className="text-red-400 ml-2">{item.error}</span>}
              </p>
            </div>
            <button
              onClick={() => onRemove(i)}
              className="shrink-0 p-1 rounded text-gray-500 hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Progress */}
      {isProcessing && (
        <div className="px-5 py-2 bg-white/[0.02]">
          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${(doneCount / files.length) * 100}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1 text-center">
            {doneCount} of {files.length} complete
          </p>
        </div>
      )}

      <div className="px-5 py-4">
        <button
          onClick={onProcess}
          disabled={isProcessing || allDone}
          className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing Batch...
            </>
          ) : allDone ? (
            'All Complete!'
          ) : (
            'Transcribe All'
          )}
        </button>
      </div>
    </div>
  )
}
