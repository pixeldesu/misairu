import { Misairu } from './misairu'

/**
 * Type describing the structure of the event cache
 */
export type EventCache = {
  [trackName: string]: string
}

/**
 * Type describing the available arguments of event functions
 */
export type EventFunction = (
  instance: Misairu,
  timingKey: string,
  track: string,
  time: number
) => void

/**
 * Type describing the structure of an event track
 */
export type EventTrack = {
  [timingKey: string]: EventFunction
}

/**
 * Type describing the structure of the timing object
 */
export type TimingObject = {
  [trackName: string]: EventTrack
}
