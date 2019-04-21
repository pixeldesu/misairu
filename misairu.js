/* misairu
 * https://github.com/pixeldesu/misairu
 * 
 * 
 * Copyright pixeldesu and other contributors
 * Licensed under the MIT License
 * https://github.com/pixeldesu/misairu/blob/master/LICENSE
 */

class misairu {
  constructor (audioSource, timings) {
    if (timings === null) console.error('You need to specify a timings object');
    this.timings = timings;

    this.audioContext = new AudioContext();
    this.audioElement = null;

    this.gainNode = this.audioContext.createGain();
    this.gainNode.connect(this.audioContext.destination);

    this.audioSource = audioSource;

    this.eventHandler = null;

    this.cache = {};

    this.compile();
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
    } else if (typeof audioSource == "object" && (audioSource.tagName == "AUDIO" || audioSource.tagName == "VIDEO")) {
      this.attachAudioElementSource(audioSource);
    }
  }

  get audioSource () {
    return this._audioSource;
  }

  set gainNode (gainNode) {
    this._gainNode = gainNode;
  }

  get gainNode () {
    return this._gainNode;
  }

  set audioElement (audioElement) {
    this._audioElement = audioElement;
  }

  get audioElement () {
    return this._audioElement;
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

  set eventHandler (eventHandler) {
    this._eventHandler = eventHandler; 
  }

  get eventHandler () {
    return this._eventHandler;
  }

  set muted (muted) {
    this._muted = muted;
  }

  get muted () {
    return this._muted;
  }

  set volume (db) {
    this._volume = db;
    this.clampGain();

    if (!this.muted) {
      this.gainNode.gain.value = this.dbToVolume(this._volume);
    }
  }

  get volume () {
    return this._volume;
  }

  set paused (paused) {
    this._paused = paused;
  }

  get paused () {
    return this._paused;
  }

  clampGain () {
    if (this._volume < -80) {
      this._volume = -80;
    } else if (this._volume > 5) {
      this._volume = 5;
    }
  }

  dbToVolume (db) {
    return Math.pow(10, db / 20);
  }

  mute() {
    if (!this.muted) {
      this.muted = true;
      this.gainNode.gain.value = 0;
    }
  }

  unmute() {
    if (this.muted) {
      this.muted = false;
      this.gainNode.gain.value = this.dbToVolume(this._volume);
    }
  }

  pause () {
    if (!this.paused) {
      this.audioContext.suspend();
      this.paused = true;
    }
  }

  unpause () {
    if (this.paused) {
      this.audioContext.resume();
      this.paused = false;
    }
  }

  setCacheEntry (track, entry) {
    this.cache[track] = entry;
  }

  getTrackCache (track) {
    return this.cache[track];
  }

  getAllTracks () {
    return Object.keys(this.timings);
  }

  getActiveTimingKey (track, currentTime) {
    const timingKeys = Object.keys(this.timings[track]);

    var activeTimings = timingKeys.filter(function (timing) {
      if (currentTime >= parseFloat(timing)) {
        return true;
      }
    })
  
    return activeTimings[activeTimings.length - 1];
  }

  compile () {
    this.getAllTracks().forEach((track) => {
      if (track.startsWith('repeat:')) {
        this.compileRepeat(track);
      }
    })
  }

  compileRepeat (track) {
    if (typeof this.timings[track] != 'function')
      throw Error(`The value of repeat track "${track}" is not a function`);

    let repeatTrackArgs = track.split(":");

    if (repeatTrackArgs.length != 4)
      throw Error(`The repeat track "${track}" does not supply the valid amount of arguments`);

    const startTime = parseFloat(repeatTrackArgs[1]);
    const interval = parseFloat(repeatTrackArgs[2]);
    const endTime = parseFloat(repeatTrackArgs[3]);

    let time = startTime;
    let tempTrack = {};

    do {
      tempTrack[time.toString()] = this.timings[track];
      time += interval;
    } while (time < endTime)

    delete this.timings[track];

    this.timings[`repeat-${Math.random().toString(36).substring(7)}`] = tempTrack;
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

          document.dispatchEvent(new Event('misairu.ready'));
          this._audioSource = source;
        })
    })
  }

  attachAudioElementSource (audioSource) {
    let source = this.audioContext.createMediaElementSource(audioSource);
    this.audioElement = audioSource;
    
    source.connect(this.gainNode);
    this._audioSource = source;
  }

  start () {
    this.startTime = this.audioContext.currentTime;

    if (this.audioElement !== null) {
      this.audioElement.play();
    } else {
      this.audioSource.start();
    }

    this.startEventHandling();
  }

  startEventHandling () {
    if (this.eventHandler == null) {
      this.eventHandler = window.requestAnimationFrame(this.handleEvents.bind(this));
    }
  }

  handleEvents () {
    let time = this.audioContext.currentTime - this.startTime;

    this.getAllTracks().forEach(function (track) {
      let timingKey = this.getActiveTimingKey(track, time);

      if (timingKey !== null && !(this.getTrackCache(track) == timingKey)) {
        this.executeEvent(track, timingKey, time);
        this.setCacheEntry(track, timingKey);
      }
    }.bind(this))

    this.eventHandler = window.requestAnimationFrame(this.handleEvents.bind(this));
  }

  executeEvent (track, timingKey, time) {
    this.timings[track][timingKey](this, timingKey, track, time);
  }
}

if (typeof module === 'object' && module.exports) {
  module.exports = misairu;
}
