# mediaEvents
:musical_note: Fire events for specific timeframes easily

## Getting it

**NPM:**

```
$ npm install mediaevents
```

**unpkg:**

```html
<script src="https://unpkg.com/mediaevents@3.0.0/mediaevents.js"></script>
```

Or you can go the traditional way, grab `mediaevents.js` from the repository and put it somewhere in your project with a `<script>` tag!

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

// create mediaEvents instance
const ev = new mediaEvents(media, timings)

document.addEventListener('mediaEvents.ready', function(event) {
  // start playback once mediaEvents is ready
  ev.start()
})
```

## Reference

### `new mediaEvents(audioSource, timings)`

* **`audioSource`:** (required) Link to an audio file or `<audio>`-Tag DOM Element
* **`timings`:** (required) Object where the keys represent the time and the values are functions or function references

### `mediaEvents.start()`

This will start playback of the specified audio and execute the events at the given time. As the audio buffer is always
loaded asynchronously you should listen to the `mediaEvents.ready` event on `document` and execute this function once
the event was emitted.

## License

mediaEvents is licensed under the MIT license