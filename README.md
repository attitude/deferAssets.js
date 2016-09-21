# Defer Assets

A simplistic approach to lazy loading and deferring of assets

## Usage

Include the script:

```html
<script src="/path/to/deferAssets.js"></script>
```

Call public method 'load' and array of assets to load:

```javascript
window.DeferAssets.load([
    {
        name: "firstLibrary",
        url:  "/path/to/firstLibrary.min.js",
        mount: function() { console.log('First library attached to DOM')},
        done: function() { console.log('First library loaded successfully')}
    },
    {
        url:     '/path/to/anotherLibrary.js',
        type:    'script',
        require: 'firstLibrary',
        mount: function() { console.log('Second library attached to DOM after firstLibrary loaded')},
        done: function() { console.log('Second library loaded successfully after firstLibrary loaded')}
    }
]);
```

## Asset loading arguments

Required:

- *(string)* `url`: path/url to asset

Optional:

- *(string)* `name`: use for dependency check using `require` argument
- *(string)* `type`: one of `'script'`, `'style'` or `'img'`
- *(string)* `require`: loads only after required resource finished loading
- *(function)* `done`: runs when asset is successfully loaded
- *(function)* `mount`: runs when asset is attached to DOM (not yet loaded)
- *(boolean)* `timestamp`: whether to timestamp request with `time`


A script by [@martin_adamko](https://twitter.com/martin_adamko)
