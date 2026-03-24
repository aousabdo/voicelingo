import { useState, useCallback } from 'react'
import Header from './components/Header'
import ApiKeyInput from './components/ApiKeyInput'
import AudioUpload from './components/AudioUpload'
import ResultPanel, { type ExportFormat } from './components/ResultPanel'
import LanguageSelector from './components/LanguageSelector'
import BatchPanel, { type BatchFile } from './components/BatchPanel'
import OnboardingTour from './components/OnboardingTour'
import Footer from './components/Footer'
import { useLocalStorage } from './hooks/useLocalStorage'
import {
  transcribeAudio,
  translateText,
  summarizeText,
  diarizeText,
  toSRT,
  toVTT,
  type TranscriptionResult,
  type TimestampSegment,
} from './lib/whisper'
import {
  Sparkles,
  Users,
  Clock,
  Loader2,
} from 'lucide-react'

function App() {
  const [showTour, setShowTour] = useLocalStorage('voicelingo-show-tour', true)
  const [apiKey, setApiKey] = useLocalStorage('voicelingo-api-key', '')
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [transcription, setTranscription] = useState('')
  const [translation, setTranslation] = useState('')
  const [summary, setSummary] = useState('')
  const [segments, setSegments] = useState<TimestampSegment[]>([])
  const [targetLang, setTargetLang] = useLocalStorage('voicelingo-target-lang', 'English')

  const [isTranscribing, setIsTranscribing] = useState(false)
  const [isTranslating, setIsTranslating] = useState(false)
  const [isSummarizing, setIsSummarizing] = useState(false)
  const [isDiarizing, setIsDiarizing] = useState(false)
  const [useTimestamps, setUseTimestamps] = useState(true)
  const [error, setError] = useState('')

  // Batch processing
  const [batchFiles, setBatchFiles] = useState<BatchFile[]>([])
  const [isBatchProcessing, setIsBatchProcessing] = useState(false)

  // ── Transcribe ─────────────────────────────────────────────
  const handleTranscribe = useCallback(async () => {
    if (!apiKey || !audioFile) {
      setError('Please provide an API key and upload an audio file.')
      return
    }
    setError('')
    setIsTranscribing(true)
    try {
      const result: TranscriptionResult = await transcribeAudio(audioFile, apiKey, {
        timestamps: useTimestamps,
      })
      setTranscription(result.text)
      if (result.segments.length > 0) setSegments(result.segments)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transcription failed.')
    } finally {
      setIsTranscribing(false)
    }
  }, [apiKey, audioFile, useTimestamps])

  // ── Translate ──────────────────────────────────────────────
  const handleTranslate = useCallback(async () => {
    if (!apiKey) {
      setError('Please provide an API key.')
      return
    }
    if (!transcription && !audioFile) {
      setError('Please transcribe audio first, or type text to translate.')
      return
    }
    setError('')
    setIsTranslating(true)
    try {
      const sourceText = transcription || ''
      if (!sourceText) {
        setError('No text to translate. Please transcribe first.')
        setIsTranslating(false)
        return
      }
      const result = await translateText(sourceText, targetLang, apiKey)
      setTranslation(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Translation failed.')
    } finally {
      setIsTranslating(false)
    }
  }, [apiKey, audioFile, transcription, targetLang])

  // ── Summarize ──────────────────────────────────────────────
  const handleSummarize = useCallback(async () => {
    if (!apiKey || !transcription) {
      setError('Please transcribe audio first.')
      return
    }
    setError('')
    setIsSummarizing(true)
    try {
      const result = await summarizeText(transcription, apiKey)
      setSummary(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Summarization failed.')
    } finally {
      setIsSummarizing(false)
    }
  }, [apiKey, transcription])

  // ── Diarize ────────────────────────────────────────────────
  const handleDiarize = useCallback(async () => {
    if (!apiKey || !transcription) {
      setError('Please transcribe audio first.')
      return
    }
    setError('')
    setIsDiarizing(true)
    try {
      const result = await diarizeText(transcription, apiKey)
      setTranscription(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Speaker diarization failed.')
    } finally {
      setIsDiarizing(false)
    }
  }, [apiKey, transcription])

  // ── Batch Processing ───────────────────────────────────────
  const handleBatchFiles = useCallback((files: File[]) => {
    setBatchFiles(files.map((f) => ({ file: f, status: 'pending' as const })))
  }, [])

  const handleBatchProcess = useCallback(async () => {
    if (!apiKey) {
      setError('Please provide an API key.')
      return
    }
    setIsBatchProcessing(true)
    setError('')

    for (let i = 0; i < batchFiles.length; i++) {
      if (batchFiles[i].status === 'done') continue
      setBatchFiles((prev) => prev.map((f, j) => (j === i ? { ...f, status: 'processing' } : f)))
      try {
        const result = await transcribeAudio(batchFiles[i].file, apiKey)
        setBatchFiles((prev) =>
          prev.map((f, j) => (j === i ? { ...f, status: 'done', transcription: result.text } : f)),
        )
      } catch (err) {
        setBatchFiles((prev) =>
          prev.map((f, j) =>
            j === i ? { ...f, status: 'error', error: err instanceof Error ? err.message : 'Failed' } : f,
          ),
        )
      }
    }
    setIsBatchProcessing(false)
  }, [apiKey, batchFiles])

  const handleBatchDownloadAll = useCallback(() => {
    const content = batchFiles
      .filter((f) => f.transcription)
      .map((f) => `=== ${f.file.name} ===\n\n${f.transcription}\n`)
      .join('\n' + '='.repeat(50) + '\n\n')
    downloadText(content, `batch_transcriptions_${new Date().toISOString().slice(0, 10)}.txt`)
  }, [batchFiles])

  // ── Download helpers ───────────────────────────────────────
  const downloadText = (text: string, filename: string) => {
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleExportTranscription = (format: ExportFormat) => {
    const date = new Date().toISOString().slice(0, 10)
    if (format === 'txt') {
      downloadText(transcription, `transcription_${date}.txt`)
    } else if (format === 'srt' && segments.length > 0) {
      downloadText(toSRT(segments), `transcription_${date}.srt`)
    } else if (format === 'vtt' && segments.length > 0) {
      downloadText(toVTT(segments), `transcription_${date}.vtt`)
    } else {
      downloadText(transcription, `transcription_${date}.txt`)
    }
  }

  const handleExportTranslation = (format: ExportFormat) => {
    const date = new Date().toISOString().slice(0, 10)
    downloadText(translation, `translation_${targetLang}_${date}.${format === 'txt' ? 'txt' : format}`)
  }

  return (
    <div className="min-h-screen flex flex-col font-[Inter,system-ui,sans-serif]">
      {/* Background effects */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-purple-600/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-indigo-600/5 rounded-full blur-[100px]" />
      </div>

      {/* Onboarding Tour */}
      {showTour && (
        <OnboardingTour onComplete={() => setShowTour(false)} />
      )}

      <Header onTakeTour={() => setShowTour(true)} />

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 pb-16">
        {/* Input Section */}
        <div className="space-y-6 mb-10">
          <ApiKeyInput value={apiKey} onChange={setApiKey} />
          <AudioUpload
            file={audioFile}
            onFileChange={setAudioFile}
            onBatchFiles={handleBatchFiles}
          />
        </div>

        {/* Batch Panel */}
        {batchFiles.length > 0 && (
          <div className="mb-8">
            <BatchPanel
              files={batchFiles}
              onRemove={(i) => setBatchFiles((prev) => prev.filter((_, j) => j !== i))}
              onProcess={handleBatchProcess}
              onDownloadAll={handleBatchDownloadAll}
              isProcessing={isBatchProcessing}
            />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Options bar */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={useTimestamps}
              onChange={(e) => setUseTimestamps(e.target.checked)}
              className="w-4 h-4 rounded border-white/20 bg-white/5 text-purple-500 focus:ring-purple-500/50"
            />
            <span className="flex items-center gap-1.5 text-sm text-gray-300">
              <Clock className="w-3.5 h-3.5" />
              Timestamps
            </span>
          </label>
        </div>

        {/* Results Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          <ResultPanel
            title="Transcription"
            placeholder="Transcribed text will appear here..."
            text={transcription}
            onChange={setTranscription}
            isLoading={isTranscribing}
            onAction={handleTranscribe}
            actionLabel="Transcribe"
            onExport={transcription ? handleExportTranscription : undefined}
            hasTimestamps={segments.length > 0}
          />
          <ResultPanel
            title="Translation"
            placeholder="Translated text will appear here..."
            text={translation}
            onChange={setTranslation}
            isLoading={isTranslating}
            onAction={handleTranslate}
            actionLabel={`Translate to ${targetLang}`}
            onExport={translation ? handleExportTranslation : undefined}
          >
            <LanguageSelector value={targetLang} onChange={setTargetLang} />
          </ResultPanel>
        </div>

        {/* AI Actions row */}
        {transcription && (
          <div className="mt-6 grid sm:grid-cols-2 gap-4">
            {/* Summarize */}
            <button
              onClick={handleSummarize}
              disabled={isSummarizing}
              className="flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-white/[0.03] border border-white/[0.08] text-gray-300 hover:text-white hover:bg-white/[0.06] hover:border-purple-500/30 transition-all disabled:opacity-50"
            >
              {isSummarizing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 text-amber-400" />
              )}
              <span className="text-sm font-medium">
                {isSummarizing ? 'Summarizing...' : 'Summarize'}
              </span>
            </button>

            {/* Speaker Diarization */}
            <button
              onClick={handleDiarize}
              disabled={isDiarizing}
              className="flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-white/[0.03] border border-white/[0.08] text-gray-300 hover:text-white hover:bg-white/[0.06] hover:border-purple-500/30 transition-all disabled:opacity-50"
            >
              {isDiarizing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Users className="w-4 h-4 text-cyan-400" />
              )}
              <span className="text-sm font-medium">
                {isDiarizing ? 'Identifying Speakers...' : 'Identify Speakers'}
              </span>
            </button>
          </div>
        )}

        {/* Summary display */}
        {summary && (
          <div className="mt-6 rounded-2xl bg-amber-500/5 border border-amber-500/15 p-6">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-amber-300">AI Summary</h3>
            </div>
            <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{summary}</div>
          </div>
        )}

        {/* Timestamp segments display */}
        {segments.length > 0 && (
          <div className="mt-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-white/[0.06]">
              <Clock className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-semibold text-white">
                Timestamps
                <span className="text-xs font-normal text-gray-500 ml-2">{segments.length} segments</span>
              </h3>
            </div>
            <div className="max-h-64 overflow-y-auto divide-y divide-white/[0.04]">
              {segments.map((seg) => (
                <div key={seg.id} className="flex gap-4 px-5 py-3 hover:bg-white/[0.02] transition-colors">
                  <span className="text-xs font-mono text-purple-400 shrink-0 pt-0.5">
                    {formatTS(seg.start)}
                  </span>
                  <p className="text-sm text-gray-300">{seg.text.trim()}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

function formatTS(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default App
