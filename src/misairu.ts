import { EventCache, TimingObject } from './types'
import { dbToVolume, clampGain } from './utilities/audio'
import { fetchAudioSource, attachAudioElementSource } from './utilities/source'

/**
 * Main misairu class
 */
export class Misairu {
  /**
   * The HTML5 AudioContext used for accurately timing our events
   */
  private readonly _audioContext: AudioContext

  /**
   * A source node to play our audio from, either a buffered source from a downloaded media file or a media element source
   *
   * @default null
   */
  private _audioSource: HTMLMediaElement | AudioBufferSourceNode | MediaElementAudioSourceNode | null = null

  /**
   * A object containing the last executed time key per track to not execute an event on every tick
   *
   * @default {}
   */
  private _cache: EventCache = {}

  /**
   * Reference to the `requestAnimationFrame` handler
   *
   * @default null
   */
  private _eventHandler: number | null = null

  /**
   * Gain node from our audio context to control audio volume
   */
  private readonly _gainNode: GainNode

  /**
   * Boolean value describing if this instance is currently muted
   */
  private _muted = false

  /**
   * Boolean value describing if this instance is currently paused
   */
  private _paused = false

  /**
   * The time when event handling was started, based on the audio contexts `currentTime` when `start()` was called
   */
  private _startTime = 0

  /**
   * Object containing all timing tracks and events to be executed
   */
  private _timings: TimingObject

  /**
   * Volume of the current instance
   */
  private _volume = 0

  get volume(): number {
    return this._volume
  }

  set volume(db: number) {
    this._volume = clampGain(db)

    if (!this._muted) {
      this._gainNode.gain.value = dbToVolume(this._volume)
    }
  }

  /**
   * misairu constructor
   *
   * @param audioSource a string or HTML element to be used as audio source
   * @param timings a object containing event timing information
   */
  constructor(audioSource: string | HTMLMediaElement, timings: TimingObject) {
    if (timings === null) console.error('You need to specify a timings object')
    this._timings = timings

    this._audioContext = new AudioContext()

    this._gainNode = this._audioContext.createGain()
    this._gainNode.connect(this._audioContext.destination)

    this.getOptimalAudioSource(audioSource)

    this.compile()
  }

  /**
   * Method to figure out the best course of action to take with the passed audio source
   *
   * @param audioSource the audio source `Misairu` has been constructed with
   * @internal
   */
  private getOptimalAudioSource(audioSource: string | HTMLMediaElement): void {
    if (typeof audioSource == 'string') {
      fetchAudioSource(audioSource, this._audioContext).then((audioSource) => {
        this._audioSource = audioSource
        this._audioSource.connect(this._gainNode)

        document.dispatchEvent(new Event('misairu.ready'))
      })
    } else if (
      typeof audioSource == 'object' &&
      (audioSource.tagName == 'AUDIO' || audioSource.tagName == 'VIDEO')
    ) {
      this._audioSource = attachAudioElementSource(audioSource, this._audioContext)
      this._audioSource.connect(this._gainNode)
    }
  }

  /**
   * Mutes the instance audio
   *
   * @public
   */
  public mute(): void {
    if (!this._muted) {
      this._muted = true
      this._gainNode.gain.value = 0
    }
  }

  /**
   * Unmutes the instance audio
   *
   * @public
   */
  public unmute(): void {
    if (this._muted) {
      this._muted = false
      this._gainNode.gain.value = dbToVolume(this._volume)
    }
  }

  /**
   * Pauses instance playback
   *
   * @public
   */
  public pause(): void {
    if (!this._paused) {
      this._audioContext.suspend()
      this._paused = true
    }
  }

  /**
   * Resumes instance playback
   *
   * @public
   */
  public unpause(): void {
    if (this._paused) {
      this._audioContext.resume()
      this._paused = false
    }
  }

  /**
   * Set a cache entry for the given track
   *
   * @param track track to set a cache entry for
   * @param entry value of the cache entry
   * @internal
   */
  private setCacheEntry(track: string, entry: string): void {
    this._cache[track] = entry
  }

  /**
   * Get cache entry for the given track
   *
   * @param track track to get a cache entry for
   * @returns a cache entry
   * @internal
   */
  private getCacheEntry(track: string): string {
    return this._cache[track]
  }

  /**
   * Get all tracks from the timing configuration
   *
   * @returns a list of all track names
   * @internal
   */
  private getAllTracks(): string[] {
    return Object.keys(this._timings)
  }

  /**
   * Returns the current active timing key for a given track
   *
   * @param track track to get the timing key from
   * @param currentTime current playback time
   * @returns the current active timing key
   * @internal
   */
  private getActiveTimingKey(track: string, currentTime: number): string {
    const timingKeys = Object.keys(this._timings[track])

    const activeTimings = timingKeys.filter((timing) => {
      if (currentTime >= parseFloat(timing)) {
        return true
      }
    })

    return activeTimings[activeTimings.length - 1]
  }

  /**
   * Main method to compile special sections in the timing configuration
   *
   * @internal
   */
  private compile(): void {
    this.getAllTracks().forEach((track) => {
      if (track.startsWith('repeat:')) {
        this.compileRepeat(track)
      }
    })
  }

  /**
   * Method to compile tracks whose name starts with `repeat:`
   *
   * @param track track to compile the repeat method for
   * @internal
   */
  private compileRepeat(track: string): void {
    if (typeof this._timings[track] != 'function')
      throw Error(`The value of repeat track "${track}" is not a function`)

    const repeatTrackArgs = track.split(':')

    if (repeatTrackArgs.length != 4)
      throw Error(`The repeat track "${track}" does not supply the valid amount of arguments`)

    const startTime = parseFloat(repeatTrackArgs[1])
    const interval = parseFloat(repeatTrackArgs[2])
    const endTime = parseFloat(repeatTrackArgs[3])

    let time = startTime
    const tempTrack = {}

    do {
      tempTrack[time.toString()] = this._timings[track]
      time += interval
    } while (time < endTime)

    delete this._timings[track]

    this._timings[`repeat-${Math.random().toString(36).substring(7)}`] = tempTrack
  }

  /**
   * Start audio playback and event handling
   *
   * @public
   */
  public start(): void {
    this._startTime = this._audioContext.currentTime

    ;(this._audioSource as AudioBufferSourceNode).start()

    this.startEventHandling()
  }

  /**
   * Method to start event handler loop
   *
   * @internal
   */
  private startEventHandling(): void {
    if (this._eventHandler == null) {
      this._eventHandler = window.requestAnimationFrame(() => {
        this.handleEvents()
      })
    }
  }

  /**
   * Event handler method, is running in a loop using `requestAnimationFrame`
   *
   * @internal
   */
  private handleEvents(): void {
    const time = this._audioContext.currentTime - this._startTime

    this.getAllTracks().forEach((track) => {
      const timingKey = this.getActiveTimingKey(track, time)

      if (timingKey !== null && !(this.getCacheEntry(track) == timingKey)) {
        this.executeEvent(track, timingKey, time)
        this.setCacheEntry(track, timingKey)
      }
    })

    this._eventHandler = window.requestAnimationFrame(() => {
      this.handleEvents()
    })
  }

  /**
   * Method to execute the event for a given timing key on a given track
   *
   * @param track the track to execute the event on
   * @param timingKey the timing key to execute
   * @param time current playback time
   * @internal
   */
  private executeEvent(track: string, timingKey: string, time: number): void {
    this._timings[track][timingKey](this, timingKey, track, time)
  }
}
