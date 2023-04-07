/**
 * Method to fetch the external audio file (if the audio source parameter was a string)
 * and turning it into a `AudioBufferSourceNode`
 *
 * @param audioSource the audio source `Misairu` has been constructed with
 * @internal
 */
export async function fetchAudioSource(audioSource: string, audioContext: AudioContext): Promise<AudioBufferSourceNode> {
  const source = audioContext.createBufferSource()

  const response = await fetch(audioSource)
  const arrayBuffer = await response.arrayBuffer()
  const buffer = await audioContext.decodeAudioData(arrayBuffer)

  source.buffer = buffer

  return source
}

/**
 * Method to get an `MediaElementAudioSourceNode` from the passed audio source
 *
 * @param audioSource the audio source `Misairu` has been constructed with
 * @internal
 */
export function attachAudioElementSource(audioSource: HTMLMediaElement, audioContext: AudioContext): MediaElementAudioSourceNode {
  return audioContext.createMediaElementSource(audioSource)
}