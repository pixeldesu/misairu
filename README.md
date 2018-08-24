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
<script src="https://unpkg.com/misairu@3.1.0/mediaevents.js"></script>
```

Or you can go the traditional way, grab `misairu.js` from the repository and put it somewhere in your project with a `<script>` tag!

## Usage

**Text:**

```js
const media = document.getElementById('audioplayer')
const text = document.getElementById('text')

// define timings and their functions
const timings = {
  "0": function() {
    text.innerHTML = 'New text at start'
  },
  "10": function() {
    document.body.style.backgroundColor = 'lightblue'
    text.innerHTML = 'New text and background color after 10 seconds'
  }
}

// create misairu instance
const ev = new misairu(media, timings)

document.addEventListener('misairu.ready', function(event) {
  // start playback once misairu is ready
  ev.start()
})
```

## Reference

### `new misairu(audioSource, timings)`

* **`audioSource`:** (required) Link to an audio file or `<audio>`-Tag DOM Element
* **`timings`:** (required) Object where the keys represent the time and the values are functions or function references

### `misairu.start()`

This will start playback of the specified audio and execute the events at the given time. As the audio buffer is always
loaded asynchronously you should listen to the `misairu.ready` event on `document` and execute this function once
the event was emitted.

### `misairu.[un]pause()`

Pauses/Resumes playback and event execution.

### `misairu.[un]mute()`

(Un)mutes audio of the misairu instance.

### `misairu.volume = x`

Sets the volume to `x`, can be a value between -80 and 5.

## Shoutouts

* [Rocket](https://github.com/rocket/rocket) for basically being the "big brother" of this small project
* [coderobe](https://github.com/coderobe) for [microhues](https://github.com/coderobe/microhues), which helped me understanding the Web Audio APIs
* [ed](https://github.com/9001), as I'm basically building this to have an easy framework to build as creative things as he does

## License

misairu is licensed under the MIT license