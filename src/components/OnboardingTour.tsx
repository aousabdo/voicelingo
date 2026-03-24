import { useState, useEffect, useCallback, useRef } from 'react'
import { ArrowRight, ArrowLeft, X } from 'lucide-react'

interface TourStep {
  target: string // CSS selector or 'center' for modal
  title: string
  description: string
  position: 'top' | 'bottom' | 'left' | 'right'
}

const STEPS: TourStep[] = [
  {
    target: 'center',
    title: 'Welcome to VoiceLingo! 👋',
    description:
      "AI-powered audio transcription & translation. Let's take a quick tour of all the features.",
    position: 'bottom',
  },
  {
    target: '[data-tour="api-key"]',
    title: '1. Enter Your API Key 🔑',
    description:
      "Paste your OpenAI API key here. It's saved in your browser's local storage — never sent anywhere except OpenAI. You only need to enter it once.",
    position: 'bottom',
  },
  {
    target: '[data-tour="audio-upload"]',
    title: '2. Upload or Record Audio 🎵',
    description:
      'Drag & drop audio files (MP3, WAV, M4A, etc.) or switch to Record mode to capture audio live from your microphone with pause/resume.',
    position: 'bottom',
  },
  {
    target: '[data-tour="options"]',
    title: '3. Options ⚙️',
    description:
      'Enable timestamps to get segment-level timing for your transcription — great for subtitles and captions.',
    position: 'bottom',
  },
  {
    target: '[data-tour="transcription"]',
    title: '4. Transcription Panel ✍️',
    description:
      'Hit "Transcribe" and your audio text appears here. You can edit it, copy to clipboard, or export as .txt, .srt, or .vtt subtitle files.',
    position: 'top',
  },
  {
    target: '[data-tour="translation"]',
    title: '5. Translation to 30+ Languages 🌍',
    description:
      'Pick any target language from the dropdown — Spanish, Arabic, Chinese, French, and more. Translation is powered by GPT-4o for high quality results.',
    position: 'top',
  },
  {
    target: '[data-tour="ai-actions"]',
    title: '6. AI Superpowers ✨',
    description:
      'After transcribing, use "Summarize" for an instant AI summary with key points, or "Identify Speakers" to label who said what in a conversation.',
    position: 'top',
  },
]

interface Props {
  onComplete: () => void
}

export default function OnboardingTour({ onComplete }: Props) {
  const [currentStep, setCurrentStep] = useState(0)
  const [rect, setRect] = useState<DOMRect | null>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const step = STEPS[currentStep]
  const isLast = currentStep === STEPS.length - 1
  const isFirst = currentStep === 0
  const isCentered = step.target === 'center'

  // Measure & scroll to target element
  const measureTarget = useCallback(() => {
    if (step.target === 'center') {
      setRect(null)
      return
    }
    const el = document.querySelector(step.target)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      // Wait for scroll to settle then measure
      setTimeout(() => {
        const r = el.getBoundingClientRect()
        setRect(r)
      }, 350)
    } else {
      setRect(null)
    }
  }, [step.target])

  useEffect(() => {
    measureTarget()
    window.addEventListener('resize', measureTarget)
    return () => window.removeEventListener('resize', measureTarget)
  }, [measureTarget])

  // Tooltip positioning
  const getTooltipStyle = (): React.CSSProperties => {
    if (!rect || isCentered) {
      return {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      }
    }

    const pad = 16
    const tooltipW = Math.min(380, window.innerWidth - 32)

    switch (step.position) {
      case 'bottom':
        return {
          position: 'fixed',
          top: rect.bottom + pad,
          left: Math.max(16, Math.min(rect.left + rect.width / 2 - tooltipW / 2, window.innerWidth - tooltipW - 16)),
          width: tooltipW,
        }
      case 'top':
        return {
          position: 'fixed',
          bottom: window.innerHeight - rect.top + pad,
          left: Math.max(16, Math.min(rect.left + rect.width / 2 - tooltipW / 2, window.innerWidth - tooltipW - 16)),
          width: tooltipW,
        }
      case 'right':
        return {
          position: 'fixed',
          top: rect.top + rect.height / 2 - 60,
          left: rect.right + pad,
          width: tooltipW,
        }
      case 'left':
        return {
          position: 'fixed',
          top: rect.top + rect.height / 2 - 60,
          right: window.innerWidth - rect.left + pad,
          width: tooltipW,
        }
    }
  }

  // Arrow pointing from tooltip toward the target
  const getArrowStyle = (): React.CSSProperties & { className?: string } => {
    if (!rect || isCentered) return { display: 'none' }

    const arrowSize = 10
    switch (step.position) {
      case 'bottom':
        return {
          position: 'absolute',
          top: -arrowSize,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 0,
          height: 0,
          borderLeft: `${arrowSize}px solid transparent`,
          borderRight: `${arrowSize}px solid transparent`,
          borderBottom: `${arrowSize}px solid rgb(30, 30, 40)`,
        }
      case 'top':
        return {
          position: 'absolute',
          bottom: -arrowSize,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 0,
          height: 0,
          borderLeft: `${arrowSize}px solid transparent`,
          borderRight: `${arrowSize}px solid transparent`,
          borderTop: `${arrowSize}px solid rgb(30, 30, 40)`,
        }
      default:
        return { display: 'none' }
    }
  }

  // Spotlight cutout via clip-path
  const getOverlayClipPath = () => {
    if (!rect) return 'none'
    const p = 8 // padding around element
    const x = rect.left - p
    const y = rect.top - p
    const w = rect.width + p * 2
    const h = rect.height + p * 2
    const r = 16 // border radius

    // Create a polygon with a rounded-rect hole
    return `
      polygon(
        0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%,
        ${x + r}px ${y}px,
        ${x + w - r}px ${y}px,
        ${x + w}px ${y + r}px,
        ${x + w}px ${y + h - r}px,
        ${x + w - r}px ${y + h}px,
        ${x + r}px ${y + h}px,
        ${x}px ${y + h - r}px,
        ${x}px ${y + r}px,
        ${x + r}px ${y}px
      )
    `
  }

  return (
    <div className="fixed inset-0 z-50">
      {/* Dark overlay with spotlight cutout */}
      <div
        className="absolute inset-0 bg-black/75 transition-all duration-300"
        style={{
          clipPath: rect ? getOverlayClipPath() : 'none',
        }}
        onClick={onComplete}
      />
      {/* If no clip-path (centered modal), just a regular overlay */}
      {!rect && (
        <div className="absolute inset-0 bg-black/75" onClick={onComplete} />
      )}

      {/* Spotlight ring around target */}
      {rect && (
        <div
          className="absolute pointer-events-none rounded-2xl ring-2 ring-purple-500/60 transition-all duration-300"
          style={{
            top: rect.top - 8,
            left: rect.left - 8,
            width: rect.width + 16,
            height: rect.height + 16,
            boxShadow: '0 0 0 4000px rgba(0,0,0,0.75), 0 0 30px 4px rgba(168,85,247,0.3)',
          }}
        />
      )}

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        style={getTooltipStyle()}
        className="z-50 pointer-events-auto"
      >
        {/* Arrow */}
        <div style={getArrowStyle()} />

        <div className="bg-[rgb(30,30,40)] border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
          {/* Close */}
          <button
            onClick={onComplete}
            className="absolute top-3 right-3 p-1.5 rounded-full text-gray-500 hover:text-white hover:bg-white/10 transition-colors z-10"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          {/* Content */}
          <div className="p-5 pr-10">
            <h3 className="text-base font-bold text-white mb-1.5">{step.title}</h3>
            <p className="text-sm text-gray-400 leading-relaxed">{step.description}</p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-5 pb-4">
            {/* Dots */}
            <div className="flex items-center gap-1">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i === currentStep
                      ? 'w-5 bg-purple-500'
                      : i < currentStep
                        ? 'w-1.5 bg-purple-500/50'
                        : 'w-1.5 bg-white/15'
                  }`}
                />
              ))}
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-2">
              {!isFirst && (
                <button
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <ArrowLeft className="w-3 h-3" />
                  Back
                </button>
              )}
              {isFirst && (
                <button
                  onClick={onComplete}
                  className="px-3 py-1.5 rounded-lg text-xs text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
                >
                  Skip
                </button>
              )}
              <button
                onClick={() => (isLast ? onComplete() : setCurrentStep(currentStep + 1))}
                className={`flex items-center gap-1 px-4 py-1.5 rounded-lg text-xs font-medium text-white transition-all active:scale-[0.97] ${
                  isLast
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/20'
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg shadow-purple-500/20'
                }`}
              >
                {isLast ? (
                  "Got it!"
                ) : (
                  <>
                    Next
                    <ArrowRight className="w-3 h-3" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
