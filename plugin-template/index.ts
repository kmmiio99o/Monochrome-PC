/**
 * My Example Plugin for Monochrome Player (TypeScript version)
 *
 * This is the TypeScript source. To use it:
 * 1. Compile with: tsc (or use the build script)
 * 2. The output JS will be what gets loaded as the plugin code
 * 3. Host the compiled JS + manifest.json, or combine into a single file
 *
 * For TypeScript plugins, you'll need the plugin-api.d.ts type definitions.
 * See the plugin-template/types.ts file for the API interface.
 */

interface PluginAPI {
  manifest: {
    id: string;
    name: string;
    version: string;
    author: string;
    description: string;
  };
  storage: {
    get(key: string): string | null;
    set(key: string, value: string): void;
    remove(key: string): void;
  };
  ui: {
    injectCSS(css: string): void;
    removeCSS(): void;
    addSettingsTab(name: string, id: string, render: (container: HTMLElement) => void): void;
    showNotification(text: string, duration?: number): void;
  };
  app: {
    onTrackChange(callback: (track: { title: string; artist: string; albumArt: string }) => void): void;
    onPlayStateChange(callback: (isPlaying: boolean) => void): void;
    getCurrentTrack(): { title: string; artist: string; albumArt: string; isPlaying: boolean };
    executeInPage(js: string): Promise<unknown>;
  };
  ipc: {
    send(channel: string, ...args: unknown[]): void;
    on(channel: string, callback: (...args: unknown[]) => void): void;
  };
  settings: {
    get(key: string): unknown;
    set(key: string, value: unknown): void;
  };
}

declare function init(api: PluginAPI): void;

interface LastTrack {
  title: string;
  artist: string;
  timestamp: number;
}

function init(api: PluginAPI): void {
  const { manifest } = api;
  console.log(`[Plugin:${manifest.id}] Loaded v${manifest.version}`);

  api.ui.injectCSS(`
    .now-playing-bar {
      border-top: 2px solid rgba(88, 101, 242, 0.5) !important;
    }
    .now-playing-bar .track-info .details .title {
      text-shadow: 0 0 8px rgba(88, 101, 242, 0.3);
    }
  `);

  api.app.onTrackChange((track) => {
    console.log(`[Plugin:${manifest.id}] Now playing: ${track.title} by ${track.artist}`);
    api.storage.set(
      "lastTrack",
      JSON.stringify({ title: track.title, artist: track.artist, timestamp: Date.now() } as LastTrack),
    );
  });

  api.app.onPlayStateChange((isPlaying) => {
    console.log(`[Plugin:${manifest.id}] Play state: ${isPlaying ? "playing" : "paused"}`);
  });

  api.ui.addSettingsTab("Example Plugin", "example", (container) => {
    const lastTrackRaw = api.storage.get("lastTrack");
    const lastTrack: LastTrack | null = lastTrackRaw ? JSON.parse(lastTrackRaw) : null;

    container.innerHTML = `
      <div style="padding:16px">
        <div style="font-size:14px;font-weight:600;color:var(--text-color,#eee);margin-bottom:8px">
          ${manifest.name}
        </div>
        <div style="font-size:12px;color:var(--text-secondary,#888);margin-bottom:16px">
          ${manifest.description}
        </div>
        <div style="background:var(--input-bg,#1a1a1a);border:1px solid var(--border-color,#333);border-radius:8px;padding:12px;margin-bottom:12px">
          <div style="font-size:13px;font-weight:500;color:var(--text-color,#eee);margin-bottom:4px">Last Played Track</div>
          <div style="font-size:12px;color:var(--text-secondary,#888)">
            ${lastTrack ? `${lastTrack.title} by ${lastTrack.artist}` : "No tracks played yet"}
          </div>
        </div>
        <div style="background:var(--input-bg,#1a1a1a);border:1px solid var(--border-color,#333);border-radius:8px;padding:12px">
          <div style="font-size:13px;font-weight:500;color:var(--text-color,#eee);margin-bottom:4px">Plugin Info</div>
          <div style="font-size:12px;color:var(--text-secondary,#888)">
            Version: ${manifest.version} | Author: ${manifest.author}
          </div>
        </div>
      </div>
    `;
  });

  api.ipc.send("plugin-ready", manifest.id);
  api.ipc.on("plugin-message", (data) => {
    console.log(`[Plugin:${manifest.id}] Received:`, data);
  });

  const installCount = parseInt(api.storage.get("installCount") || "0", 10) + 1;
  api.storage.set("installCount", String(installCount));
  console.log(`[Plugin:${manifest.id}] Enabled ${installCount} time(s)`);

  api.ui.showNotification(`Plugin ${manifest.name} activated!`, 3000);
}
