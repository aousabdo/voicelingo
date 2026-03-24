import { useState, useCallback } from 'react'
import Header from './components/Header'
import ApiKeyInput from './components/ApiKeyInput'
import AudioUpload from './components/AudioUpload'
import ResultPanel from './components/ResultPanel'
import Footer from './components/Footer'
import { transcribeAudio, translateAudio } from './lib/whisper'

function App() {
  const [apiKey, setApiKey] = useState('')
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [transcription, setTranscription] = useState('')
  const [translation, setTranslation] = useState('')
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [isTranslating, setIsTranslating] = useState(false)
  const [error, setError] = useState('')

  const handleTranscribe = useCallback(async () => {
    if (!apiKey || !audioFile) {
      setError('Please provide an API key and upload an audio file.')
      return
    }
    setError('')
    setIsTranscribing(true)
    try {
      const text = await transcribeAudio(audioFile, apiKey)
      setTranscription(text)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transcription failed.')
    } finally {
      setIsTranscribing(false)
    }
  }, [apiKey, audioFile])

  const handleTranslate = useCallback(async () => {
    if (!apiKey || !audioFile) {
      setError('Please provide an API key and upload an audio file.')
      return
    }
    setError('')
    setIsTranslating(true)
    try {
      const text = await translateAudio(audioFile, apiKey)
      setTranslation(text)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Translation failed.')
    } finally {
      setIsTranslating(false)
    }
  }, [apiKey, audioFile])

  const downloadText = (text: string, filename: string) => {
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen flex flex-col font-[Inter,system-ui,sans-serif]">
      {/* Background effects */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-purple-600/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-indigo-600/5 rounded-full blur-[100px]" />
      </div>

      <Header />

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 pb-16">
        {/* Input Section */}
        <div className="space-y-6 mb-10">
          <ApiKeyInput value={apiKey} onChange={setApiKey} />
          <AudioUpload file={audioFile} onFileChange={setAudioFile} />
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Results Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          <ResultPanel
            title="Transcription"
            placeholder="Transcribed text will appear here..."
            text={transcription}
            isLoading={isTranscribing}
            onAction={handleTranscribe}
            actionLabel="Transcribe"
            onDownload={
              transcription
                ? () => downloadText(transcription, `transcription_${new Date().toISOString().slice(0, 10)}.txt`)
                : undefined
            }
          />
          <ResultPanel
            title="Translation"
            placeholder="Translated text (to English) will appear here..."
            text={translation}
            isLoading={isTranslating}
            onAction={handleTranslate}
            actionLabel="Translate"
            onDownload={
              translation
                ? () => downloadText(translation, `translation_${new Date().toISOString().slice(0, 10)}.txt`)
                : undefined
            }
          />
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default App
