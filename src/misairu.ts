import { EventCache, TimingObject } from './types'

export class Misairu {
  private readonly _audioContext: AudioContext
  private _audioElement: HTMLMediaElement | null = null
  private _audioSource: AudioBufferSourceNode | MediaElementAudioSourceNode | null = null
  private _cache: EventCache = {}
  private _eventHandler: number | null = null
  private readonly _gainNode: GainNode
  private _muted: boolean = false
  private _paused: boolean = false
  private _startTime: number = 0
  private _timings: TimingObject
  private _volume: number = 0

  get volume () {
    return this._volume
  }

  set volume (db: number) {
    this._volume = db
    this.clampGain()

    if (!this._muted) {
      this._gainNode.gain.value = this.dbToVolume(this._volume)
    }
  }

  constructor (audioSource: string | HTMLMediaElement, timings: TimingObject) {
    if (timings === null) console.error('You need to specify a timings object')
    this._timings = timings

    this._audioContext = new AudioContext()

    this._gainNode = this._audioContext.createGain()
    this._gainNode.connect(this._audioContext.destination)

    this.getOptimalAudioSource(audioSource)

    this.compile()
  }

  getOptimalAudioSource (audioSource: string | HTMLMediaElement) {
    if (typeof audioSource == 'string') {
      this.fetchAudioSource(audioSource)
    } else if (typeof audioSource == 'object' && (audioSource.tagName == 'AUDIO' || audioSource.tagName == 'VIDEO')) {
      this.attachAudioElementSource(audioSource)
    }
  }

  clampGain () {
    if (this._volume < -80) {
      this._volume = -80
    } else if (this._volume > 5) {
      this._volume = 5
    }
  }

  dbToVolume (db: number) {
    return Math.pow(10, db / 20)
  }

  mute() {
    if (!this._muted) {
      this._muted = true
      this._gainNode.gain.value = 0
    }
  }

  unmute() {
    if (this._muted) {
      this._muted = false
      this._gainNode.gain.value = this.dbToVolume(this._volume)
    }
  }

  pause () {
    if (!this._paused) {
      this._audioContext.suspend()
      this._paused = true
    }
  }

  unpause () {
    if (this._paused) {
      this._audioContext.resume()
      this._paused = false
    }
  }

  setCacheEntry (track: string, entry: string) {
    this._cache[track] = entry
  }

  getCacheEntry (track: string) {
    return this._cache[track]
  }

  getAllTracks () {
    return Object.keys(this._timings)
  }

  getActiveTimingKey (track: string, currentTime: number) {
    const timingKeys = Object.keys(this._timings[track])

    var activeTimings = timingKeys.filter((timing) => {
      if (currentTime >= parseFloat(timing)) {
        return true
      }
    })
  
    return activeTimings[activeTimings.length - 1]
  }

  compile () {
    this.getAllTracks().forEach((track) => {
      if (track.startsWith('repeat:')) {
        this.compileRepeat(track)
      }
    })
  }

  compileRepeat (track: string) {
    if (typeof this._timings[track] != 'function')
      throw Error(`The value of repeat track "${track}" is not a function`)

    let repeatTrackArgs = track.split(':')

    if (repeatTrackArgs.length != 4)
      throw Error(`The repeat track "${track}" does not supply the valid amount of arguments`)

    const startTime = parseFloat(repeatTrackArgs[1])
    const interval = parseFloat(repeatTrackArgs[2])
    const endTime = parseFloat(repeatTrackArgs[3])

    let time = startTime
    let tempTrack = {}

    do {
      tempTrack[time.toString()] = this._timings[track]
      time += interval
    } while (time < endTime)

    delete this._timings[track]

    this._timings[`repeat-${Math.random().toString(36).substring(7)}`] = tempTrack
  }

  fetchAudioSource (audioSource: string) {
    let that = this
    let source = this._audioContext.createBufferSource()

    fetch(audioSource).then((response) => {
      return response.arrayBuffer()
    }).then((arrayBuffer) => {
      that._audioContext.decodeAudioData(arrayBuffer)
        .then((buffer) => {
          source.buffer = buffer
          source.connect(this._gainNode)

          document.dispatchEvent(new Event('misairu.ready'))
          this._audioSource = source
        })
    })
  }

  attachAudioElementSource (audioSource: HTMLMediaElement) {
    let source = this._audioContext.createMediaElementSource(audioSource)
    this._audioElement = audioSource
    
    source.connect(this._gainNode)
    this._audioSource = source
  }

  start () {
    this._startTime = this._audioContext.currentTime

    if (this._audioElement !== null) {
      this._audioElement.play()
    } else {
      (this._audioSource as AudioBufferSourceNode).start()
    }

    this.startEventHandling()
  }

  startEventHandling () {
    if (this._eventHandler == null) {
      this._eventHandler = window.requestAnimationFrame(() => { this.handleEvents() })
    }
  }

  handleEvents () {
    let time = this._audioContext.currentTime - this._startTime

    this.getAllTracks().forEach((track) => {
      let timingKey = this.getActiveTimingKey(track, time)

      if (timingKey !== null && !(this.getCacheEntry(track) == timingKey)) {
        this.executeEvent(track, timingKey, time)
        this.setCacheEntry(track, timingKey)
      }
    })

    this._eventHandler = window.requestAnimationFrame(() => { this.handleEvents() })
  }

  executeEvent (track: string, timingKey: string, time: number) {
    this._timings[track][timingKey](this, timingKey, track, time)
  }
}
