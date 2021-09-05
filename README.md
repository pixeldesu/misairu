# misairu  
_ミサイル // MISSILE_  

:rocket: Fire events for specific timeframes easily

## Getting it

**NPM:**

```
$ npm install misairu
```

**unpkg:**

```html
<script src="https://unpkg.com/misairu/misairu.js"></script>
```

Or you can go the traditional way, grab `misairu.js` from the repository and put it somewhere in your project with a `<script>` tag!

## Usage

**Text:**

```js
const media = document.getElementById('audioplayer')
const text = document.getElementById('text')

// define timings, tracks and their functions
const timings = {
  "default": {
    "0": function() {
      text.innerHTML = 'New text at start'
    }
  },
  "default:2": {
    "10": function() {
      document.body.style.backgroundColor = 'lightblue'
      text.innerHTML = 'New text and background color after 10 seconds'
    }
  }
}

// create misairu instance
const ev = new Misairu(media, timings)

// you only need this if your audiosource is external e.g. a link to an audio file
document.addEventListener('misairu.ready', function(event) {
  // start playback once misairu is ready
  ev.start()
})
```

## Reference

### `new Misairu(audioSource, timings)`

* **`audioSource`:** (required) Link to an audio file or `<audio>`-Tag DOM Element
* **`timings`:** (required) Object where the keys represent the time and the values are functions or function references

**Note on `audioSource`:**

If you use a `HTMLMediaElement`, misairu won't fire the `misairu.ready` event, as the content is already given. To be really
sure that everything starts when you want it to, give your media element the attribute `preload="auto"` to have it pre-buffer
ahead of usage.

### `misairu.start()`

This will start playback of the specified audio and execute the events at the given time. If your audio source is external, the audio buffer is 
loaded asynchronously and you should listen to the `misairu.ready` event on `document` and execute this function once
the event was emitted.

### `misairu.[un]pause()`

Pauses/Resumes playback and event execution.

### `misairu.[un]mute()`

(Un)mutes audio of the misairu instance.

### `misairu.volume = x`

Sets the volume to `x`, can be a value between -80 and 5.

### Anatomy of the `timings` object

```js
// timings object, you pass this to the misairu constructor
const timings = {
  // track object
  "default": {
    // timing key - function
    "0": function (instance, timingKey, track, time) {
      // instance - misairu instance
      // timingKey - current timing key ("0")
      // track - current track ("default")
      // time - current time (accurate time calculated from the start time and audio context time)

      // >> put some code here <<
    }
  }
}
```

All of the parameters passed to a timing function are optional and don't need to be used as they are only passed for convenience, so you can omit them.

### `repeat` tracks

It's possible to define repeating actions for a specific timeframe with special track type, following the naming scheme of `repeat:start-time:interval:end-time`.

As an example:

```js
const timings = {
  "repeat:1:2:10": myCoolFunction 
}
```

On creation of the `misairu` instance, the timing object gets compiled, so the repeat statement will be unfolded into:

```js
// misairu_instance.timings
{
  // the original track "repeat:1:2:10" was deleted 
  // and replaced with a repeat-randomhash track containing all timed events
  "repeat-xjas34f": { 
    "1": myCoolFunction,
    "3": myCoolFunction,
    "5": myCoolFunction,
    "7": myCoolFunction,
    "9": myCoolFunction
  }
}
```

## Shoutouts

* [Rocket](https://github.com/rocket/rocket) for basically being the "big brother" of this small project
* [coderobe](https://github.com/coderobe) for [microhues](https://github.com/coderobe/microhues), which helped me understanding the Web Audio APIs
* [ed](https://github.com/9001), as I'm basically building this to have an easy framework to build as creative things as he does

## License

misairu is licensed under the MIT license