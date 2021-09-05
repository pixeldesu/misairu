import { Misairu } from './misairu'

export type EventCache = {
  [trackName: string]: string
}

export type EventFunction = (instance: Misairu, timingKey: string, track: string, time: number) => void

export type EventTrack = {
  [timingKey: string]: EventFunction
}

export type TimingObject = {
  [trackName: string]: EventTrack
}