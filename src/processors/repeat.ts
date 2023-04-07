import { EventFunction, EventTrack, ITrackProcessor } from "../types";

const REPEAT_NAME_REGEX = new RegExp(/repeat:\d:\d:\d/)

export class RepeatTrackProcessor implements ITrackProcessor {
  deleteOriginTrack = true;

  matches(name: string): boolean {
    return name.match(REPEAT_NAME_REGEX) !== null
  }

  process(name: string, track: EventFunction): [string, EventTrack] {
    if (typeof track != 'function')
      throw Error(`The value of repeat track "${track}" is not a function`)

    const repeatTrackArgs = name.split(':')

    if (repeatTrackArgs.length != 4)
      throw Error(`The repeat track "${name}" does not supply the valid amount of arguments`)

    const startTime = parseFloat(repeatTrackArgs[1])
    const interval = parseFloat(repeatTrackArgs[2])
    const endTime = parseFloat(repeatTrackArgs[3])

    let time = startTime
    const tempTrack = {}

    do {
      tempTrack[time.toString()] = track
      time += interval
    } while (time < endTime)

    return [`repeat-${Math.random().toString(36).substring(7)}`, tempTrack]
  }
}