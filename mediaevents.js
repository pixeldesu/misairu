/* mediaEvents
 * https://github.com/pixeldesu/mediaEvents
 * 
 * 
 * Copyright pixeldesu and other contributors
 * Licensed under the MIT License
 * https://github.com/pixeldesu/mediaEvents/blob/master/LICENSE
 */

class mediaEvents {
  constructor (audioSource, timings) {
    if (timings === null) console.error('You need to specify a timings object');
    this.timings = timings;

    this.audioContext = new AudioContext();
    this.audioSource = audioSource;

    this.gainNode = this.audioContext.createGain();
    this.gainNode.connect(this.audioContext.destination);

    this.eventHandler = null;

    this.cache = null;
  }

  set audioContext (audioContext) {
    this._audioContext = audioContext;
  }

  get audioContext () {
    return this._audioContext;
  }

  set audioSource (audioSource) {
    if (typeof audioSource == "string") {
      this.fetchAudioSource(audioSource);
    } else if (typeof audioSource == "object" && audioSource.tagName == "AUDIO") {
      this.fetchAudioSource(audioSource.src);
    }
  }

  get audioSource () {
    return this._audioSource;
  }

  set startTime (startTime) {
    this._startTime = startTime;
  }

  get startTime () {
    return this._startTime;
  }

  set timings (timings) {
    this._timings = timings;
  }

  get timings () {
    return this._timings;
  }

  set cache (cache) {
    this._cache = cache;
  }

  get cache () {
    return this._cache;
  }

  set muted (muted) {
    this._muted = muted
  }

  get muted () {
    return this._muted
  }

  set volume (db) {
    this._volume = db
    this.clampGain()

    if (!this.muted) {
      this.gainNode.gain.value = this.dbToVolume(this._volume)
    }
  }

  get volume () {
    return this._volume
  }

  clampGain () {
    if (this._volume < -80) {
      this._volume = -80
    } else if (this._volume > 5) {
      this._volume = 5
    }
  }

  dbToVolume (db) {
    return Math.pow(10, db / 20)
  }

  mute() {
    if (!this.muted) {
      this.muted = true
      this.gainNode.gain.value = 0
    }
  }

  unmute() {
    if (this.muted) {
      this.muted = false
      this.gainNode.gain.value = this.dbToVolume(this._volume)
    }
  }

  getActiveTimingKey (currentTime) {
    const timingKeys = Object.keys(this.timings)

    var activeTimings = timingKeys.filter(function (timing) {
      if (currentTime >= parseFloat(timing)) {
        return true
      }
    })
  
    return activeTimings[activeTimings.length - 1]
  }

  set eventHandler (eventHandler) {
    this._eventHandler = eventHandler; 
  }

  get eventHandler () {
    return this._eventHandler;
  }

  fetchAudioSource (audioSource) {
    let that = this;
    let source = this.audioContext.createBufferSource();

    fetch(audioSource).then((response) => {
      return response.arrayBuffer()
    }).then((arrayBuffer) => {
      that.audioContext.decodeAudioData(arrayBuffer)
        .then((buffer) => {
          source.buffer = buffer;
          source.connect(this.gainNode);

          document.dispatchEvent(new Event('mediaEvents.ready'));
          this._audioSource = source;
        })
    })
  }

  start () {
    this.startTime = this.audioContext.currentTime;
    this.audioSource.start();
    this.startEventHandling();
  }

  startEventHandling () {
    if (this.eventHandler == null) {
      this.eventHandler = window.requestAnimationFrame(this.handleEvents.bind(this));
    }
  }

  handleEvents () {
    let time = this.audioContext.currentTime - this.startTime;
    let timingKey = this.getActiveTimingKey(time);

    if (timingKey !== null && !(this.cache == timingKey)) {
      this.executeEvent(timingKey);
      this.cache = timingKey;
    }

    this.eventHandler = window.requestAnimationFrame(this.handleEvents.bind(this));
  }

  executeEvent (timingKey) {
    this.timings[timingKey]();
  }
}

if (typeof module === 'object' && module.exports) {
  module.exports = mediaEvents;
}
