import { useState } from 'react'
import { KeyRound, Eye, EyeOff, Check, Trash2 } from 'lucide-react'

interface Props {
  value: string
  onChange: (val: string) => void
}

export default function ApiKeyInput({ value, onChange }: Props) {
  const [visible, setVisible] = useState(false)
  const isSaved = !!value && value === localStorage.getItem('voicelingo-api-key')?.replace(/"/g, '')

  return (
    <div className="max-w-lg mx-auto">
      <label className="block text-sm font-medium text-gray-300 mb-2">
        <span className="flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-purple-400" />
          OpenAI API Key
          {isSaved && (
            <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
              <Check className="w-3 h-3" /> Saved
            </span>
          )}
        </span>
      </label>
      <div className="relative">
        <input
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="sk-..."
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all pr-20"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="text-gray-500 hover:text-red-400 transition-colors p-1"
              title="Clear key"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setVisible(!visible)}
            className="text-gray-400 hover:text-gray-300 transition-colors p-1"
          >
            {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>
      <p className="mt-1.5 text-xs text-gray-500">
        Your key is saved in your browser's local storage and never sent to any server other than OpenAI.
      </p>
    </div>
  )
}
