/**
 * My Example Plugin for Monochrome Player
 *
 * This plugin demonstrates the plugin API:
 * - Custom CSS injection
 * - Track change notifications
 * - Custom settings tab
 * - Local storage
 * - IPC communication
 *
 * To use this plugin:
 * 1. Build with: npm run build (or tsc)
 * 2. Host the output files somewhere (GitHub Gist, raw URL, etc.)
 * 3. In Monochrome Player, go to Settings > Plugins > paste the URL
 *
 * The URL can point to either:
 * - A JSON file with { "manifest": {...}, "code": "..." }
 * - A JS file with a // ==PLUGIN_MANIFEST== header block
 */

// The init function is called when the plugin is enabled.
// `api` is the PluginAPI object provided by the host.
function init(api) {
  var manifest = api.manifest;
  console.log("[Plugin:" + manifest.id + "] Loaded v" + manifest.version);

  // Example 1: Inject custom CSS
  api.ui.injectCSS(
    ".now-playing-bar { " +
    "  border-top: 2px solid rgba(88, 101, 242, 0.5) !important;" +
    "}" +
    ".now-playing-bar .track-info .details .title { " +
    "  text-shadow: 0 0 8px rgba(88, 101, 242, 0.3);" +
    "}"
  );

  // Example 2: Listen for track changes
  api.app.onTrackChange(function(track) {
    console.log("[Plugin:" + manifest.id + "] Now playing:", track.title, "by", track.artist);

    // Store the last played track
    api.storage.set("lastTrack", JSON.stringify({
      title: track.title,
      artist: track.artist,
      timestamp: Date.now()
    }));
  });

  // Example 3: Listen for play state changes
  api.app.onPlayStateChange(function(isPlaying) {
    console.log("[Plugin:" + manifest.id + "] Play state:", isPlaying ? "playing" : "paused");
  });

  // Example 4: Custom settings tab
  api.ui.addSettingsTab("Example Plugin", "example", function(container) {
    var lastTrack = api.storage.get("lastTrack");
    var parsed = lastTrack ? JSON.parse(lastTrack) : null;

    container.innerHTML =
      '<div style="padding:16px">' +
      '  <div style="font-size:14px;font-weight:600;color:var(--text-color,#eee);margin-bottom:8px">' +
         manifest.name +
      '  </div>' +
      '  <div style="font-size:12px;color:var(--text-secondary,#888);margin-bottom:16px">' +
         manifest.description +
      '  </div>' +
      '  <div style="background:var(--input-bg,#1a1a1a);border:1px solid var(--border-color,#333);border-radius:8px;padding:12px;margin-bottom:12px">' +
      '    <div style="font-size:13px;font-weight:500;color:var(--text-color,#eee);margin-bottom:4px">Last Played Track</div>' +
      '    <div style="font-size:12px;color:var(--text-secondary,#888)">' +
           (parsed ? parsed.title + " by " + parsed.artist : "No tracks played yet") +
      '    </div>' +
      '  </div>' +
      '  <div style="background:var(--input-bg,#1a1a1a);border:1px solid var(--border-color,#333);border-radius:8px;padding:12px">' +
      '    <div style="font-size:13px;font-weight:500;color:var(--text-color,#eee);margin-bottom:4px">Plugin Info</div>' +
      '    <div style="font-size:12px;color:var(--text-secondary,#888)">' +
             "Version: " + manifest.version + " | Author: " + manifest.author +
      '    </div>' +
      '  </div>' +
      '</div>';
  });

  // Example 5: Send IPC message to main process
  api.ipc.send("plugin-ready", manifest.id);

  // Example 6: Listen for IPC messages from main process
  api.ipc.on("plugin-message", function(data) {
    console.log("[Plugin:" + manifest.id + "] Received:", data);
  });

  // Example 7: Store/retrieve persistent data
  var installCount = parseInt(api.storage.get("installCount") || "0", 10);
  installCount++;
  api.storage.set("installCount", String(installCount));
  console.log("[Plugin:" + manifest.id + "] This plugin has been enabled " + installCount + " time(s)");

  // Example 8: Show a notification
  api.ui.showNotification("Plugin " + manifest.name + " activated!", 3000);
}
