import { useCallback, useRef, useState, useEffect } from 'react'
import { Upload, FileAudio, X, Mic, Square, Pause, Play } from 'lucide-react'
import { useAudioRecorder } from '../hooks/useAudioRecorder'

const ACCEPTED = '.mp3,.mp4,.mpeg,.m4a,.wav,.webm,.ogg,.flac'
const MAX_SIZE = 25 * 1024 * 1024

interface Props {
  file: File | null
  onFileChange: (file: File | null) => void
  onBatchFiles?: (files: File[]) => void
}

export default function AudioUpload({ file, onFileChange, onBatchFiles }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [audioDuration, setAudioDuration] = useState<number | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [mode, setMode] = useState<'upload' | 'record'>('upload')

  const recorder = useAudioRecorder()

  // Create audio URL when file changes
  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file)
      setAudioUrl(url)
      return () => URL.revokeObjectURL(url)
    } else {
      setAudioUrl(null)
      setAudioDuration(null)
      setIsPlaying(false)
    }
  }, [file])

  // When recording stops, convert blob to file
  useEffect(() => {
    if (recorder.audioBlob && !recorder.isRecording) {
      const ext = recorder.audioBlob.type.includes('mp4') ? 'mp4' : 'webm'
      const recordedFile = recorder.blobToFile(
        recorder.audioBlob,
        `recording_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.${ext}`,
      )
      onFileChange(recordedFile)
    }
  }, [recorder.audioBlob, recorder.isRecording, recorder.blobToFile, onFileChange])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const files = Array.from(e.dataTransfer.files).filter((f) => f.size <= MAX_SIZE)
      if (files.length > 1 && onBatchFiles) {
        onBatchFiles(files)
      } else if (files[0]) {
        onFileChange(files[0])
      }
    },
    [onFileChange, onBatchFiles],
  )

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []).filter((f) => f.size <= MAX_SIZE)
      if (files.length > 1 && onBatchFiles) {
        onBatchFiles(files)
      } else if (files[0]) {
        onFileChange(files[0])
      }
    },
    [onFileChange, onBatchFiles],
  )

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m}:${String(s).padStart(2, '0')}`
  }

  const togglePlayback = () => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  return (
    <div className="max-w-lg mx-auto space-y-3">
      {/* Mode toggle */}
      <div className="flex items-center justify-center gap-1 p-1 rounded-xl bg-white/5 border border-white/10 w-fit mx-auto">
        <button
          onClick={() => setMode('upload')}
          className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
            mode === 'upload'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Upload className="w-3.5 h-3.5" />
            Upload File
          </span>
        </button>
        <button
          onClick={() => setMode('record')}
          className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
            mode === 'record'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Mic className="w-3.5 h-3.5" />
            Record
          </span>
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        onChange={handleFileSelect}
        className="hidden"
        multiple={!!onBatchFiles}
      />

      {/* Upload mode */}
      {mode === 'upload' && !file && (
        <div
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="group cursor-pointer border-2 border-dashed border-white/10 hover:border-purple-500/40 rounded-2xl p-8 text-center transition-all hover:bg-white/[0.02]"
        >
          <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-500/20 transition-colors">
            <Upload className="w-6 h-6 text-purple-400" />
          </div>
          <p className="text-sm text-gray-300 font-medium">Drop your audio file(s) here or click to browse</p>
          <p className="text-xs text-gray-500 mt-2">
            MP3, MP4, WAV, WebM, OGG, FLAC &middot; Up to 25 MB &middot; Multiple files supported
          </p>
        </div>
      )}

      {/* Record mode */}
      {mode === 'record' && !file && (
        <div className="border-2 border-dashed border-white/10 rounded-2xl p-8 text-center">
          {!recorder.isRecording ? (
            <>
              <button
                onClick={() => recorder.startRecording()}
                className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-400 flex items-center justify-center mx-auto mb-4 transition-colors shadow-lg shadow-red-500/30 hover:shadow-red-400/40 active:scale-95"
              >
                <Mic className="w-7 h-7 text-white" />
              </button>
              <p className="text-sm text-gray-300 font-medium">Click to start recording</p>
              <p className="text-xs text-gray-500 mt-1">Microphone access required</p>
            </>
          ) : (
            <>
              {/* Recording animation */}
              <div className="flex items-center justify-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1.5 bg-red-500 rounded-full animate-pulse"
                    style={{
                      height: `${20 + Math.random() * 20}px`,
                      animationDelay: `${i * 0.15}s`,
                      animationDuration: '0.8s',
                    }}
                  />
                ))}
              </div>
              <p className="text-lg font-mono text-red-400 mb-4">{formatDuration(recorder.duration)}</p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => (recorder.isPaused ? recorder.resumeRecording() : recorder.pauseRecording())}
                  className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  {recorder.isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                </button>
                <button
                  onClick={() => recorder.stopRecording()}
                  className="p-3 rounded-full bg-red-500 hover:bg-red-400 text-white transition-colors shadow-lg shadow-red-500/30"
                >
                  <Square className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                {recorder.isPaused ? 'Paused' : 'Recording...'}
              </p>
            </>
          )}
        </div>
      )}

      {/* File info card */}
      {file && (
        <div className="rounded-xl bg-purple-500/10 border border-purple-500/20 overflow-hidden">
          <div className="flex items-center gap-3 p-4">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center shrink-0">
              <FileAudio className="w-5 h-5 text-purple-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{file.name}</p>
              <p className="text-xs text-gray-400">
                {formatSize(file.size)}
                {audioDuration != null && ` \u00b7 ${formatDuration(audioDuration)}`}
              </p>
            </div>
            <button
              onClick={togglePlayback}
              className="shrink-0 p-2 rounded-lg text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 transition-colors"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
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
          {/* Audio player */}
          {audioUrl && (
            <audio
              ref={audioRef}
              src={audioUrl}
              onLoadedMetadata={() => {
                if (audioRef.current && isFinite(audioRef.current.duration)) {
                  setAudioDuration(audioRef.current.duration)
                }
              }}
              onEnded={() => setIsPlaying(false)}
              className="w-full h-8 px-4 pb-3"
              controls
            />
          )}
        </div>
      )}
    </div>
  )
}
