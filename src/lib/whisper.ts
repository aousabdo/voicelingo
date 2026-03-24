const WHISPER_API_URL = 'https://api.openai.com/v1/audio'

export async function transcribeAudio(file: File, apiKey: string): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('model', 'whisper-1')

  let response: Response
  try {
    response = await fetch(`${WHISPER_API_URL}/transcriptions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: formData,
    })
  } catch (e) {
    throw new Error(
      `Network error: Could not reach OpenAI. Please check your API key and internet connection. (${e instanceof Error ? e.message : 'Unknown error'})`
    )
  }

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err?.error?.message || `API error: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  return data.text
}

export async function translateAudio(file: File, apiKey: string): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('model', 'whisper-1')

  let response: Response
  try {
    response = await fetch(`${WHISPER_API_URL}/translations`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: formData,
    })
  } catch (e) {
    throw new Error(
      `Network error: Could not reach OpenAI. Please check your API key and internet connection. (${e instanceof Error ? e.message : 'Unknown error'})`
    )
  }

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err?.error?.message || `API error: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  return data.text
}
