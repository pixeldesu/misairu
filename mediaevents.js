/* mediaEvents
 * https://github.com/pixeldesu/mediaEvents
 * 
 * 
 * Copyright pixeldesu and other contributors
 * Licensed under the MIT License
 * https://github.com/pixeldesu/mediaEvents/blob/master/LICENSE
 */

class mediaEvents {
  constructor (timings) {
    if (timings === null) console.error('You need to specify a timings object')
    this.timings = timings

    this.cache = {
      timeupdate: null,
      seeked: null
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

  executeEvent (timingKey) {
    this.timings[timingKey]()
  }

  isCache (event, timingKey) {
    if (this.cache[event] == timingKey) return true

    return false
  }

  setCache (event, timingKey) {
    this.cache[event] = timingKey
  }

  bind (mediaNode) {
    let eventListeners = ['timeupdate', 'seeked']

    eventListeners.forEach((eventListener) => {
      mediaNode.addEventListener(eventListener, () => {
        let timingKey = this.getActiveTimingKey(mediaNode.currentTime)
  
        if (timingKey !== null && !this.isCache(eventListener, timingKey)) {
          this.executeEvent(timingKey)
          this.setCache(eventListener, timingKey)
        }
      })
    })
  }
}

if (typeof module === 'object' && module.exports) {
  module.exports = mediaEvents;
}
