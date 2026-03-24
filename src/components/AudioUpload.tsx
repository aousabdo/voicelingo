import { useCallback, useRef } from 'react'
import { Upload, FileAudio, X } from 'lucide-react'

const ACCEPTED = '.mp3,.mp4,.mpeg,.m4a,.wav,.webm'
const MAX_SIZE = 25 * 1024 * 1024 // 25 MB

interface Props {
  file: File | null
  onFileChange: (file: File | null) => void
}

export default function AudioUpload({ file, onFileChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const f = e.dataTransfer.files[0]
      if (f && f.size <= MAX_SIZE) onFileChange(f)
    },
    [onFileChange],
  )

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0]
      if (f && f.size <= MAX_SIZE) onFileChange(f)
    },
    [onFileChange],
  )

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="max-w-lg mx-auto">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        onChange={handleFileSelect}
        className="hidden"
      />

      {!file ? (
        <div
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="group cursor-pointer border-2 border-dashed border-white/10 hover:border-purple-500/40 rounded-2xl p-8 text-center transition-all hover:bg-white/[0.02]"
        >
          <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-500/20 transition-colors">
            <Upload className="w-6 h-6 text-purple-400" />
          </div>
          <p className="text-sm text-gray-300 font-medium">
            Drop your audio file here or click to browse
          </p>
          <p className="text-xs text-gray-500 mt-2">
            MP3, MP4, MPEG, M4A, WAV, WebM &middot; Up to 25 MB
          </p>
        </div>
      ) : (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
          <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center shrink-0">
            <FileAudio className="w-5 h-5 text-purple-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{file.name}</p>
            <p className="text-xs text-gray-400">{formatSize(file.size)}</p>
          </div>
          <button
            onClick={() => {
              onFileChange(null)
              if (inputRef.current) inputRef.current.value = ''
            }}
            className="shrink-0 p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
