const WHISPER_API_URL = 'https://api.openai.com/v1/audio'
const CHAT_API_URL = 'https://api.openai.com/v1/chat/completions'

// ── Types ────────────────────────────────────────────────────
export interface TimestampSegment {
  id: number
  start: number
  end: number
  text: string
  speaker?: string
}

export interface TranscriptionResult {
  text: string
  segments: TimestampSegment[]
  language?: string
  duration?: number
}

// ── Helpers ──────────────────────────────────────────────────
async function apiFetch(url: string, apiKey: string, body: FormData): Promise<Response> {
  let response: Response
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body,
    })
  } catch (e) {
    throw new Error(
      `Network error: Could not reach OpenAI. Please check your API key and internet connection. (${e instanceof Error ? e.message : 'Unknown error'})`,
    )
  }
  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err?.error?.message || `API error: ${response.status} ${response.statusText}`)
  }
  return response
}

// ── Transcribe with timestamps & verbose JSON ────────────────
export async function transcribeAudio(
  file: File,
  apiKey: string,
  options?: { timestamps?: boolean },
): Promise<TranscriptionResult> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('model', 'whisper-1')

  if (options?.timestamps) {
    formData.append('response_format', 'verbose_json')
    formData.append('timestamp_granularities[]', 'segment')
  }

  const response = await apiFetch(`${WHISPER_API_URL}/transcriptions`, apiKey, formData)
  const data = await response.json()

  if (options?.timestamps && data.segments) {
    return {
      text: data.text,
      segments: data.segments.map((s: Record<string, unknown>, i: number) => ({
        id: i,
        start: s.start as number,
        end: s.end as number,
        text: s.text as string,
      })),
      language: data.language,
      duration: data.duration,
    }
  }

  return { text: data.text, segments: [], language: data.language, duration: data.duration }
}

// ── Translate (Whisper built-in: always to English) ──────────
export async function translateAudio(file: File, apiKey: string): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('model', 'whisper-1')
  const response = await apiFetch(`${WHISPER_API_URL}/translations`, apiKey, formData)
  const data = await response.json()
  return data.text
}

// ── Translate text via GPT-4o to any target language ─────────
export async function translateText(
  text: string,
  targetLang: string,
  apiKey: string,
): Promise<string> {
  if (targetLang === 'English') {
    // Use Whisper's built-in translation if we have the audio
    // Fall through to GPT if we only have text
  }

  const response = await fetch(CHAT_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a professional translator. Translate the following text into ${targetLang}. Return ONLY the translation, nothing else. Preserve formatting, paragraph breaks, and punctuation style.`,
        },
        { role: 'user', content: text },
      ],
      temperature: 0.3,
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err?.error?.message || `Translation API error: ${response.status}`)
  }

  const data = await response.json()
  return data.choices[0].message.content.trim()
}

// ── Summarize text via GPT-4o ────────────────────────────────
export async function summarizeText(text: string, apiKey: string): Promise<string> {
  const response = await fetch(CHAT_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a concise summarizer. Provide a clear, well-structured summary of the following transcription. Use bullet points for key points. Start with a one-line TLDR, then provide a detailed summary. Keep it professional.',
        },
        { role: 'user', content: text },
      ],
      temperature: 0.3,
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err?.error?.message || `Summarization API error: ${response.status}`)
  }

  const data = await response.json()
  return data.choices[0].message.content.trim()
}

// ── Speaker Diarization via GPT-4o ──────────────────────────
export async function diarizeText(text: string, apiKey: string): Promise<string> {
  const response = await fetch(CHAT_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a conversation analyst. Given the following transcribed text, identify different speakers and reformat the text with speaker labels. Use "Speaker 1:", "Speaker 2:", etc. If you can detect more context about the speakers (interviewer/interviewee, host/guest, etc.), use those labels instead. Preserve the original text exactly but add speaker labels and line breaks between speaker turns.`,
        },
        { role: 'user', content: text },
      ],
      temperature: 0.2,
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err?.error?.message || `Diarization API error: ${response.status}`)
  }

  const data = await response.json()
  return data.choices[0].message.content.trim()
}

// ── Export helpers ───────────────────────────────────────────
function formatTimestamp(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  const ms = Math.floor((seconds % 1) * 1000)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(ms).padStart(3, '0')}`
}

function formatTimestampVTT(seconds: number): string {
  return formatTimestamp(seconds).replace(',', '.')
}

export function toSRT(segments: TimestampSegment[]): string {
  return segments
    .map(
      (seg, i) =>
        `${i + 1}\n${formatTimestamp(seg.start)} --> ${formatTimestamp(seg.end)}\n${seg.text.trim()}\n`,
    )
    .join('\n')
}

export function toVTT(segments: TimestampSegment[]): string {
  const lines = segments.map(
    (seg) => `${formatTimestampVTT(seg.start)} --> ${formatTimestampVTT(seg.end)}\n${seg.text.trim()}\n`,
  )
  return `WEBVTT\n\n${lines.join('\n')}`
}
