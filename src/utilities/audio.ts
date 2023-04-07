/**
 * Method to turn the passed decibel values into volume values for the audio playback
 *
 * @param db decibel value
 * @returns volume value
 */
export function dbToVolume(db: number): number {
  return Math.pow(10, db / 20)
}

/**
 * Clamps the volume to a min/max value to prevent accidental oversetting to way too loud measures
 */
export function clampGain(volume: number): number {
  if (volume < -80) {
    return -80
  } else if (volume > 5) {
    return 5
  }

  return volume
}