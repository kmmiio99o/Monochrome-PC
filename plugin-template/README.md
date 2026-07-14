# Monochrome Player Plugin Template

This is a template for creating plugins for Monochrome Player.

## Quick Start

1. Copy this directory
2. Edit `manifest.json` with your plugin info
3. Edit `index.ts` (or `index.js`) with your plugin code
4. Build: `npm run build`
5. Host the output files (GitHub Gist, raw URL, etc.)
6. In Monochrome Player: Settings > Plugins > paste the URL

## Plugin Format

Plugins can be delivered in two formats:

### Format 1: JSON bundle
A JSON file with `{ "manifest": {...}, "code": "..." }`.

### Format 2: Annotated JS file
A JavaScript file with manifest headers:
```js
// ==PLUGIN_MANIFEST==
{ "id": "my-plugin", "name": "My Plugin", "version": "1.0.0", "author": "Me", "description": "...", "main": "index.js" }
// ==/PLUGIN_MANIFEST==

function init(api) {
  // your code here
}
```

## Plugin API

The `init(api)` function receives a `PluginAPI` object with:

### `api.manifest`
Plugin manifest info (id, name, version, author, description).

### `api.storage`
Persistent key-value storage scoped to your plugin.
- `get(key)` - Get a stored value
- `set(key, value)` - Store a value
- `remove(key)` - Remove a stored value

### `api.ui`
- `injectCSS(css)` - Inject CSS into the page
- `removeCSS()` - Remove previously injected CSS
- `addSettingsTab(name, id, renderFn)` - Add a custom settings tab
- `showNotification(text, duration?)` - Show a toast notification

### `api.app`
- `onTrackChange(callback)` - Listen for track changes
- `onPlayStateChange(callback)` - Listen for play/pause changes
- `getCurrentTrack()` - Get current track info
- `executeInPage(js)` - Execute JavaScript in the page context

### `api.ipc`
- `send(channel, ...args)` - Send a message to the main process
- `on(channel, callback)` - Listen for messages from main process

### `api.settings`
- `get(key)` - Get a settings value (JSON parsed)
- `set(key, value)` - Store a settings value (JSON serialized)
