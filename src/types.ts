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

/**
 * Interface describing required methods/members for track processors
 */
export interface ITrackProcessor {
  /**
   * Member describing if the processed track should be deleted
   */
  deleteOriginTrack: boolean

  /**
   * Method to check if the track name matches to determine if the processor
   * should process it
   * 
   * @param name name oƒ a track
   */
  matches(name: string): boolean

  /**
   * Main processing method
   * 
   * @param name name of the track to be processed
   * @param track content of the track to be processed
   */
  process(name: string, track: EventTrack | EventFunction): [string, EventTrack]
}
