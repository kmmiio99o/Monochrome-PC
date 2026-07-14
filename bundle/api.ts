import { PluginManifest, PluginAPI, TrackInfo } from "./types";
import { communicate, getCurrentTrack } from "./utils";
import { bus } from "./bus";

const trackListeners: Array<(track: TrackInfo) => void> = [];
const playStateListeners: Array<(isPlaying: boolean) => void> = [];
const readyListeners: Array<() => void> = [];
let isReady = false;

export function notifyTrackChange(track: TrackInfo): void {
  for (const fn of trackListeners) {
    try { fn(track); } catch (e) { console.error("[API] track listener:", e); }
  }
}

export function notifyPlayStateChange(isPlaying: boolean): void {
  for (const fn of playStateListeners) {
    try { fn(isPlaying); } catch (e) { console.error("[API] playState listener:", e); }
  }
}

export function notifyReady(): void {
  isReady = true;
  for (const fn of readyListeners) {
    try { fn(); } catch (e) { console.error("[API] ready listener:", e); }
  }
  readyListeners.length = 0;
}

export function createPluginAPI(manifest: PluginManifest): PluginAPI {
  const S = "plugin:" + manifest.id + ":";
  const C = "plugin-settings:" + manifest.id + ":";

  return {
    manifest: { ...manifest },

    storage: {
      get: (k) => { try { return localStorage.getItem(S + k); } catch { return null; } },
      set: (k, v) => { try { localStorage.setItem(S + k, v); } catch {} },
      remove: (k) => { try { localStorage.removeItem(S + k); } catch {} },
    },

    ui: {
      injectCSS(css: string): void {
        const old = document.getElementById("plugin-css-" + manifest.id);
        if (old) old.remove();
        const s = document.createElement("style");
        s.id = "plugin-css-" + manifest.id;
        s.textContent = css;
        document.head.appendChild(s);
      },
      removeCSS(): void {
        document.getElementById("plugin-css-" + manifest.id)?.remove();
      },
      addSettingsTab(name, id, render) {
        const tabId = "plugin-tab-" + manifest.id + "-" + id;
        if (document.getElementById("settings-tab-" + tabId)) return;
        const tabs = document.querySelector(".settings-tabs");
        const page = document.getElementById("page-settings");
        if (!tabs || !page) return;

        const btn = document.createElement("button");
        btn.className = "settings-tab";
        btn.dataset.tab = tabId;
        btn.textContent = name;
        tabs.appendChild(btn);

        const content = document.createElement("div");
        content.className = "settings-tab-content";
        content.id = "settings-tab-" + tabId;
        page.appendChild(content);

        try { render(content); } catch (e) { console.error("[Plugin:" + manifest.id + "] render:", e); }
      },
      showNotification(text, duration) {
        communicate("plugin:notify:" + encodeURIComponent(text) + ":" + (duration || 3000));
      },
    },

    app: {
      onTrackChange: (cb) => {
        trackListeners.push(cb);
        if (isReady) { try { cb(getCurrentTrack()); } catch {} }
      },
      onPlayStateChange: (cb) => { playStateListeners.push(cb); },
      onReady: (cb) => {
        if (isReady) { try { cb(); } catch {} return; }
        readyListeners.push(cb);
      },
      getCurrentTrack,
      executeInPage(js) {
        try { return Promise.resolve(eval(js)); } catch (e) { return Promise.reject(e); }
      },
    },

    ipc: {
      send(ch, ...args) {
        communicate("plugin:ipc:" + ch + ":" + encodeURIComponent(JSON.stringify(args)));
      },
      on(ch, cb) {
        bus.on("ipc:" + manifest.id + ":" + ch, cb);
      },
    },

    settings: {
      get(k) { try { const r = localStorage.getItem(C + k); return r ? JSON.parse(r) : null; } catch { return null; } },
      set(k, v) { try { localStorage.setItem(C + k, JSON.stringify(v)); } catch {} },
    },

    bus: {
      emit: (ev, ...args) => bus.emit(ev, ...args),
      on: (ev, cb) => bus.on(ev, cb),
      off: (ev, cb) => bus.off(ev, cb),
    },
  };
}
