import { useState } from 'react'
import { KeyRound, Eye, EyeOff } from 'lucide-react'

interface Props {
  value: string
  onChange: (val: string) => void
}

export default function ApiKeyInput({ value, onChange }: Props) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="max-w-lg mx-auto">
      <label className="block text-sm font-medium text-gray-300 mb-2">
        <span className="flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-purple-400" />
          OpenAI API Key
        </span>
      </label>
      <div className="relative">
        <input
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="sk-..."
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all pr-12"
        />
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
        >
          {visible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>
      <p className="mt-1.5 text-xs text-gray-500">
        Your key stays in your browser and is never stored or sent to any server other than OpenAI.
      </p>
    </div>
  )
}
