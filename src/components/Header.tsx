import { AudioLines } from 'lucide-react'

export default function Header() {
  return (
    <header className="pt-12 pb-8 px-4 text-center">
      <div className="flex items-center justify-center gap-3 mb-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
          <AudioLines className="w-7 h-7 text-white" />
        </div>
      </div>
      <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent">
        VoiceLingo
      </h1>
      <p className="mt-3 text-lg sm:text-xl text-gray-400 max-w-xl mx-auto">
        AI-Powered Audio Transcription & Translation
      </p>
      <p className="mt-2 text-sm text-gray-500">
        Powered by{' '}
        <a
          href="https://openai.com/research/whisper"
          target="_blank"
          rel="noopener noreferrer"
          className="text-purple-400 hover:text-purple-300 underline underline-offset-2 transition-colors"
        >
          OpenAI Whisper
        </a>
      </p>
    </header>
  )
}
