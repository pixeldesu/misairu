/* mediaEvents
 * https://github.com/pixeldesu/mediaEvents
 * 
 * 
 * Copyright pixeldesu and other contributors
 * Licensed under the MIT License
 * https://github.com/pixeldesu/mediaEvents/blob/master/LICENSE
 */

class mediaEvents {
  constructor (timings, type, textNode) {
    if (type !== null) {
      this.type = type
    } else {
      this.type = 'events'
    }
    if (type === 'text' && textNode === null) console.error('You need to add a DOMNode for the "text" event to attach to')
    this.textNode = textNode

    if (timings === null) console.error('You need to specify a timings object')
    this.timings = timings

    this.cache = {
      timeupdate: null,
      seeked: null
    }
  }

  getActiveTimingValue (currentTime) {
    const timingKeys = Object.keys(this.timings)

    var activeTimings = timingKeys.filter(function (timing) {
      if (currentTime >= parseFloat(timing)) {
        return true
      }
    })
  
    return this.timings[activeTimings[activeTimings.length - 1]]
  }

  executeEvent (timingKey) {
    window[timingKey]()
  }

  setText (timingKey) {
    this.textNode.innerHTML = timingKey
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
        let timingKey = this.getActiveTimingValue(mediaNode.currentTime)
  
        if (timingKey !== null && !this.isCache(eventListener, timingKey)) {
          if (this.type == 'text') {
            this.setText(timingKey)
          }
          else if (this.type == 'events') {
            this.executeEvent(timingKey)
          }

          this.setCache(eventListener, timingKey)
        }
      })
    })
  }
}

if (typeof module === 'object' && module.exports) {
  module.exports = mediaEvents;
}
