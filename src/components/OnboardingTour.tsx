import { useState } from 'react'
import {
  KeyRound,
  Upload,
  Mic,
  Languages,
  Sparkles,
  Users,
  Clock,
  Download,
  Files,
  ArrowRight,
  ArrowLeft,
  X,
  Rocket,
} from 'lucide-react'

interface Step {
  icon: React.ReactNode
  title: string
  description: string
  color: string
}

const STEPS: Step[] = [
  {
    icon: <Rocket className="w-8 h-8" />,
    title: 'Welcome to VoiceLingo!',
    description:
      'AI-powered audio transcription & translation built by Analytica Data Science Solutions. Let us show you around.',
    color: 'from-purple-500 to-indigo-500',
  },
  {
    icon: <KeyRound className="w-8 h-8" />,
    title: 'Enter Your API Key',
    description:
      'Paste your OpenAI API key to get started. It\'s saved securely in your browser and never sent anywhere except OpenAI.',
    color: 'from-purple-500 to-violet-500',
  },
  {
    icon: <Upload className="w-8 h-8" />,
    title: 'Upload or Record',
    description:
      'Drag & drop audio files (MP3, WAV, M4A, etc.) or switch to Record mode to capture audio directly from your microphone.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: <Mic className="w-8 h-8" />,
    title: 'Live Microphone Recording',
    description:
      'Record directly in the browser with pause/resume controls. Perfect for meetings, interviews, or quick voice notes.',
    color: 'from-red-500 to-pink-500',
  },
  {
    icon: <Languages className="w-8 h-8" />,
    title: 'Translate to 30+ Languages',
    description:
      'Transcribe in any language, then translate to English, Spanish, Arabic, Chinese, French, and many more using GPT-4o.',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    icon: <Sparkles className="w-8 h-8" />,
    title: 'AI Summarization',
    description:
      'Get an instant AI-generated summary of your transcription with key points and a TLDR — perfect for long recordings.',
    color: 'from-amber-500 to-orange-500',
  },
  {
    icon: <Users className="w-8 h-8" />,
    title: 'Speaker Identification',
    description:
      'AI-powered speaker diarization labels different speakers in your conversation (Speaker 1, Speaker 2, etc.).',
    color: 'from-cyan-500 to-blue-500',
  },
  {
    icon: <Clock className="w-8 h-8" />,
    title: 'Timestamps',
    description:
      'Get segment-level timestamps for your transcription. See exactly when each part was spoken.',
    color: 'from-violet-500 to-purple-500',
  },
  {
    icon: <Download className="w-8 h-8" />,
    title: 'Export in Multiple Formats',
    description:
      'Download your results as plain text (.txt), subtitles (.srt), or WebVTT (.vtt) — ready for video editing or captions.',
    color: 'from-pink-500 to-rose-500',
  },
  {
    icon: <Files className="w-8 h-8" />,
    title: 'Batch Processing',
    description:
      'Drop multiple audio files at once and transcribe them all in one go. Download all results with a single click.',
    color: 'from-indigo-500 to-blue-500',
  },
]

interface Props {
  onComplete: () => void
}

export default function OnboardingTour({ onComplete }: Props) {
  const [currentStep, setCurrentStep] = useState(0)
  const step = STEPS[currentStep]
  const isLast = currentStep === STEPS.length - 1
  const isFirst = currentStep === 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onComplete}
      />

      {/* Card */}
      <div className="relative w-full max-w-md animate-in fade-in zoom-in">
        <div className="rounded-3xl bg-gray-900 border border-white/10 shadow-2xl shadow-purple-500/10 overflow-hidden">
          {/* Close button */}
          <button
            onClick={onComplete}
            className="absolute top-4 right-4 p-2 rounded-full text-gray-500 hover:text-white hover:bg-white/10 transition-colors z-10"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Icon header */}
          <div className={`bg-gradient-to-br ${step.color} p-8 flex items-center justify-center`}>
            <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white shadow-lg">
              {step.icon}
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
            <p className="text-sm text-gray-400 leading-relaxed">{step.description}</p>
          </div>

          {/* Progress dots */}
          <div className="flex items-center justify-center gap-1.5 pb-4">
            {STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentStep(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === currentStep
                    ? 'w-6 bg-purple-500'
                    : i < currentStep
                      ? 'w-1.5 bg-purple-500/50'
                      : 'w-1.5 bg-white/20'
                }`}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between px-6 pb-6">
            <button
              onClick={() => (isFirst ? onComplete() : setCurrentStep(currentStep - 1))}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              {isFirst ? (
                'Skip tour'
              ) : (
                <>
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </>
              )}
            </button>

            <button
              onClick={() => (isLast ? onComplete() : setCurrentStep(currentStep + 1))}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium text-white transition-all active:scale-[0.97] ${
                isLast
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 shadow-lg shadow-emerald-500/20'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-500/20'
              }`}
            >
              {isLast ? (
                "Let's Go!"
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
