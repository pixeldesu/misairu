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
  "0": function() {
    text.innerHTML = 'New text at start'
  },
  "10": function() {
    document.body.style.backgroundColor = 'lightblue'
    text.innerHTML = 'New text and background color after 10 seconds'
  }
}

const ev = new mediaEvents(timings)
ev.bind(media)
```

## Reference

### `new mediaEvents(timings)`

* **`timings`:** (required) Object where the keys represent the time and the values are functions or function references

### `mediaEvents.bind(mediaNode)`

* **`mediaNode`:** (required) media element (can be `video` or `audio` tag or anything that supplies a `currentTime` parameter) the events should be attached to.

## Known Issues

The `timeupdate` event that is used by mediaEvents is not updated every millisecond or at a fixed interval, so it's not really accurate.

You can use floats as timing values, but it's not guaranteed it will make it more accurate. Seconds work just fine in all cases.

## License

mediaEvents is licensed under the MIT license