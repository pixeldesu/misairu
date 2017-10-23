# mediaEvents
:musical_note: Fire events for specific timeframes easily

## Getting it

**NPM:**

```
$ npm install mediaevents
```

**unpkg:**

```html
<script src="https://unpkg.com/mediaevents@1.0.1/mediaevents.js"></script>
```

Or you can go the traditional way, grab `mediaevents.js` from the repository and put it somewhere in your project with a `<script>` tag!

## Usage

**Text:**

```js
const media = document.getElementById('audioplayer')
const text = document.getElementById('text')

const timings = {
  "0": "Introduction",
  "10": "This text shows up after 10 seconds",
  "15": "And this one after 15"
}

const ev = new mediaEvents(timings, 'text', text)
ev.bind(media)
```

**Event:**

```js
const media = document.getElementById('audioplayer')

const timings = {
  "0": "handleIntro",
  "10": "handleTen"
}

function handleIntro () {
  console.log("This executes at 0 seconds")
}

function handleTen () {
  console.log("This text shows up after 10 seconds")
}

const ev = new mediaEvents(timings)
ev.bind(media)
```

## Reference

### `new mediaEvents(timings, type, textNode)`

* **`timings`:** (required) Object where the keys represent the time and the values either are text or function names (accessible on `window`)
* **`type`:** (optional) Type of event handling, can be either `text` or `events` (`events` by default)
* **`textNode`:** (optional) If the `text` event type is used, this is required. Reference of a DOMNode where the text should be put in.

### `mediaEvents.bind(mediaNode)`

* **`mediaNode`:** (required) media element (can be `video` or `audio` tag or anything that supplies a `currentTime` parameter) the events should be attached to.

## Known Issues

The `timeupdate` event that is used by mediaEvents is not updated every millisecond or at a fixed interval, so it's not really accurate.

You can use floats as timing values, but it's not guaranteed it will make it more accurate. Seconds work just fine in all cases.

## License

mediaEvents is licensed under the MIT license