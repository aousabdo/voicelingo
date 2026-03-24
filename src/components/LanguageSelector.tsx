import { Globe } from 'lucide-react'

export const LANGUAGES = [
  'English',
  'Spanish',
  'French',
  'German',
  'Italian',
  'Portuguese',
  'Arabic',
  'Chinese (Simplified)',
  'Chinese (Traditional)',
  'Japanese',
  'Korean',
  'Hindi',
  'Russian',
  'Turkish',
  'Dutch',
  'Polish',
  'Swedish',
  'Vietnamese',
  'Thai',
  'Indonesian',
  'Malay',
  'Filipino',
  'Hebrew',
  'Greek',
  'Czech',
  'Romanian',
  'Hungarian',
  'Ukrainian',
  'Bengali',
  'Urdu',
  'Persian',
  'Swahili',
] as const

interface Props {
  value: string
  onChange: (lang: string) => void
}

export default function LanguageSelector({ value, onChange }: Props) {
  return (
    <div className="flex items-center gap-2">
      <Globe className="w-4 h-4 text-purple-400 shrink-0" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-white/5 border border-white/10 text-gray-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500/50 appearance-none cursor-pointer hover:bg-white/10 transition-colors"
      >
        {LANGUAGES.map((lang) => (
          <option key={lang} value={lang} className="bg-gray-900 text-white">
            {lang}
          </option>
        ))}
      </select>
    </div>
  )
}
