import { ipcMain, app, shell } from "electron";
import { state } from "../state";
import { loadBundleCode, loadPlugins, addPlugin, removePluginById, updatePluginEnabled } from "../inject/bundle";
import { APP_VERSION } from "../config";

let _onRpcChanged: (() => void) | null = null;
let _bundleCode: string | null = null;

function getBundleCode(): string {
  if (_bundleCode === null) _bundleCode = loadBundleCode();
  return _bundleCode;
}

function recompileBundle(): void {
  _bundleCode = loadBundleCode();
}

function execInWebview(js: string): void {
  if (state.webviewWC && !state.webviewWC.isDestroyed()) {
    state.webviewWC.executeJavaScript(js).catch(() => {});
  }
}

const SHORTCUT_JS: Record<string, string> = {
  "play-pause": "(function(){var b=document.querySelector('.now-playing-bar .play-pause-btn');if(b)b.click()})()",
  next: "(function(){var b=document.querySelector('#next-btn');if(b)b.click()})()",
  prev: "(function(){var b=document.querySelector('#prev-btn');if(b)b.click()})()",
  "volume-up": "(function(){var a=document.querySelector('#audio-player');if(a)a.volume=Math.min(1,a.volume+0.05)})()",
  "volume-down": "(function(){var a=document.querySelector('#audio-player');if(a)a.volume=Math.max(0,a.volume-0.05)})()",
  mute: "(function(){var a=document.querySelector('#audio-player');if(a)a.muted=!a.muted})()",
  fullscreen: "(function(){if(document.fullscreenElement)document.exitFullscreen();else document.documentElement.requestFullscreen()})()",
};

function setupShortcuts(): void {
  if (!state.mainWindow || state.mainWindow.isDestroyed()) return;

  state.mainWindow.webContents.on("before-input-event", (_event, input) => {
    if (input.type !== "keyDown") return;

    const ctrl = input.control || input.meta;
    const key = input.key;

    if (ctrl && key === "Right") { execInWebview(SHORTCUT_JS.next); return; }
    if (ctrl && key === "Left") { execInWebview(SHORTCUT_JS.prev); return; }
    if (ctrl && key === "Up") { execInWebview(SHORTCUT_JS["volume-up"]); return; }
    if (ctrl && key === "Down") { execInWebview(SHORTCUT_JS["volume-down"]); return; }
    if (key === " " || key === "Spacebar") { execInWebview(SHORTCUT_JS["play-pause"]); return; }
    if (!ctrl && !input.alt && key.length === 1) {
      const lower = key.toLowerCase();
      if (lower === "m") { execInWebview(SHORTCUT_JS.mute); return; }
      if (lower === "f") { execInWebview(SHORTCUT_JS.fullscreen); return; }
    }
  });
}

app.on("web-contents-created", (_event, contents) => {
  if (contents.getType() !== "webview") return;
  state.webviewWC = contents;

  contents.session.setPermissionRequestHandler((_wc, _permission, callback) => {
    callback(true);
  });
  contents.session.setPermissionCheckHandler(() => true);

  contents.on("console-message", (_event2, _level, message) => {
    if (!message.startsWith("ELECTRON_SETTING:")) return;
    const raw = message.slice(17);
    try {
      handleSettingsMessage(raw);
    } catch (err) {
      console.error("[IPC] Failed to handle message:", raw, err);
    }
  });

  contents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });

  contents.on("did-finish-load", () => {
    injectBundle();
  });

  contents.on("render-process-gone", () => {
    contents.reload();
  });
});

export function injectBundle(): void {
  if (!state.webviewWC || state.webviewWC.isDestroyed()) {
    console.error("[IPC] Cannot inject bundle: webview not ready");
    return;
  }
  state.appVersion = APP_VERSION;
  const code = getBundleCode();
  if (!code) {
    console.error("[IPC] Cannot inject bundle: no code loaded");
    return;
  }
  state.webviewWC.executeJavaScript(code).catch((err) => {
    console.error("[IPC] Bundle injection failed:", err);
  });
}

export function syncWebviewState(): void {
  if (!state.webviewWC || state.webviewWC.isDestroyed()) return;
  const s = state.rpcSettings;
  const payload = {
    showNavigationBar: state.showNavigationBar,
    closeToTray: state.closeToTray,
    rpcEnabled: s.enabled,
    rpcShowTitle: s.showTitle,
    rpcShowArtist: s.showArtist,
    rpcShowOnIdle: s.showOnIdle,
    rpcShowOnPause: s.showOnPause,
    rpcShowTimestamp: s.showTimestamp,
    rpcActivityType: s.activityType,
    rpcCustomDetails: s.customDetails,
    rpcLargeImageText: s.largeImageText,
    rpcSmallImageKey: s.smallImageKey,
    rpcSmallImageText: s.smallImageText,
    rpcButton1Label: s.button1Label,
    rpcButton1Url: s.button1Url,
    rpcButton2Label: s.button2Label,
    rpcButton2Url: s.button2Url,
    rpcConnected: state.discordConnected,
    currentTrackTitle: state.currentTrack.title,
    currentTrackArtist: state.currentTrack.artist,
    currentTrackAlbumArt: state.currentTrack.albumArt || "",
    isPlaying: state.isPlaying,
    appVersion: APP_VERSION,
    plugins: state.plugins,
  };
  const script =
    "window.__electronSettingsSync=" +
    JSON.stringify(payload) +
    ";(function(){var s=window.__electronSettingsSync;var c=function(id,v){var el=document.getElementById(id);if(el&&el.type==='checkbox')el.checked=v};var se=function(id,v){var el=document.getElementById(id);if(el&&el.tagName==='SELECT')el.value=v};var ti=function(id,v){var el=document.getElementById(id);if(el&&el.type==='text')el.value=v};c('electron-navbar-toggle',s.showNavigationBar);c('electron-closetotray-toggle',s.closeToTray);c('electron-rpc-toggle',s.rpcEnabled);c('electron-rpc-title-toggle',s.rpcShowTitle);c('electron-rpc-artist-toggle',s.rpcShowArtist);c('electron-rpc-idle-toggle',s.rpcShowOnIdle);c('electron-rpc-pause-toggle',s.rpcShowOnPause);c('electron-rpc-timestamp-toggle',s.rpcShowTimestamp);se('electron-rpc-activity-type',s.rpcActivityType);ti('electron-rpc-custom-details',s.rpcCustomDetails||'');ti('electron-rpc-large-image-text',s.rpcLargeImageText||'');ti('electron-rpc-small-image-key',s.rpcSmallImageKey||'');ti('electron-rpc-small-image-text',s.rpcSmallImageText||'');ti('electron-rpc-button1-label',s.rpcButton1Label||'');ti('electron-rpc-button1-url',s.rpcButton1Url||'');ti('electron-rpc-button2-label',s.rpcButton2Label||'');ti('electron-rpc-button2-url',s.rpcButton2Url||'');var st=document.getElementById('electron-rpc-status');if(st)st.textContent=s.rpcConnected?'Connected':'Disconnected';})()";
  state.webviewWC.executeJavaScript(script).catch(() => {});
}

function handleSettingsMessage(msg: string): void {
  const sep = msg.indexOf(":");
  const action = sep >= 0 ? msg.slice(0, sep) : msg;
  const payload = sep >= 0 ? msg.slice(sep + 1) : "";

  switch (action) {
    case "nav":
      void import("../app/window").then((m) => m.updateNavBar());
      break;
    case "closeToTray":
      state.closeToTray = payload === "1";
      break;
    case "rpc": {
      const [sub, val] = payload.includes(":")
        ? [payload.slice(0, payload.indexOf(":")), payload.slice(payload.indexOf(":") + 1)]
        : [payload, ""];
      switch (sub) {
        case "toggle":
          state.rpcSettings.enabled = !state.rpcSettings.enabled;
          _onRpcChanged?.();
          break;
        case "showTitle":
          state.rpcSettings.showTitle = val === "1";
          _onRpcChanged?.();
          break;
        case "showArtist":
          state.rpcSettings.showArtist = val === "1";
          _onRpcChanged?.();
          break;
        case "showOnIdle":
          state.rpcSettings.showOnIdle = val === "1";
          _onRpcChanged?.();
          break;
        case "showOnPause":
          state.rpcSettings.showOnPause = val === "1";
          _onRpcChanged?.();
          break;
        case "showTimestamp":
          state.rpcSettings.showTimestamp = val === "1";
          _onRpcChanged?.();
          break;
        case "activityType":
          state.rpcSettings.activityType = Number(val);
          _onRpcChanged?.();
          break;
        case "customDetails":
          state.rpcSettings.customDetails = decodeURIComponent(val);
          _onRpcChanged?.();
          break;
        case "largeImageText":
          state.rpcSettings.largeImageText = decodeURIComponent(val);
          _onRpcChanged?.();
          break;
        case "smallImageKey":
          state.rpcSettings.smallImageKey = decodeURIComponent(val);
          _onRpcChanged?.();
          break;
        case "smallImageText":
          state.rpcSettings.smallImageText = decodeURIComponent(val);
          _onRpcChanged?.();
          break;
        case "button1Label":
          state.rpcSettings.button1Label = decodeURIComponent(val);
          _onRpcChanged?.();
          break;
        case "button1Url":
          state.rpcSettings.button1Url = decodeURIComponent(val);
          _onRpcChanged?.();
          break;
        case "button2Label":
          state.rpcSettings.button2Label = decodeURIComponent(val);
          _onRpcChanged?.();
          break;
        case "button2Url":
          state.rpcSettings.button2Url = decodeURIComponent(val);
          _onRpcChanged?.();
          break;
        case "customStatus":
          state.rpcSettings.customStatus = decodeURIComponent(val);
          _onRpcChanged?.();
          break;
        case "reconnect":
          void import("../discord/client").then((m) => m.reconnectDiscordRpc());
          break;
      }
      break;
    }
    case "sync":
      syncWebviewState();
      break;
    case "plugin": {
      const pSep = payload.indexOf(":");
      const pAction = pSep >= 0 ? payload.slice(0, pSep) : payload;
      const pPayload = pSep >= 0 ? payload.slice(pSep + 1) : "";
      switch (pAction) {
        case "sync":
          state.plugins = loadPlugins();
          break;
        case "notify": {
          const text = decodeURIComponent(pPayload.split(":")[0] || "");
          if (state.mainWindow && !state.mainWindow.isDestroyed()) {
            state.mainWindow.webContents.send("show-toast", { title: text, artist: "Plugin" });
          }
          break;
        }
        case "settings-saved": {
          const savedId = decodeURIComponent(pPayload);
          console.log("[IPC] Plugin settings saved:", savedId);
          break;
        }
        case "ipc": {
          const ipcSep = pPayload.indexOf(":");
          const channel = ipcSep >= 0 ? pPayload.slice(0, ipcSep) : pPayload;
          const argsRaw = ipcSep >= 0 ? pPayload.slice(ipcSep + 1) : "[]";
          try {
            const args = JSON.parse(decodeURIComponent(argsRaw));
            if (state.mainWindow && !state.mainWindow.isDestroyed()) {
              state.mainWindow.webContents.send("plugin-ipc:" + channel, ...args);
            }
          } catch {}
          break;
        }
      }
      break;
    }
  }
}

export function registerIpcHandlers(onRpcChanged: () => void): void {
  _onRpcChanged = onRpcChanged;

  ipcMain.handle("rpc:getState", () => ({ ...state.rpcSettings }));
  ipcMain.handle("rpc:toggle", () => {
    state.rpcSettings.enabled = !state.rpcSettings.enabled;
    onRpcChanged();
    return state.rpcSettings;
  });

  ipcMain.on("prompt:custom-status", (_event, value: string) => {
    state.rpcSettings.customStatus = value || "";
    onRpcChanged();
  });

  ipcMain.on("nav:back", () => void state.mainWindow?.webContents.goBack());
  ipcMain.on("nav:forward", () => void state.mainWindow?.webContents.goForward());
  ipcMain.on("nav:reload", () => state.mainWindow?.webContents.reload());
  ipcMain.on("nav:minimize", () => state.mainWindow?.minimize());
  ipcMain.on("nav:maximize", () => {
    if (state.mainWindow?.isMaximized()) state.mainWindow.unmaximize();
    else state.mainWindow?.maximize();
  });
  ipcMain.on("nav:close", () => state.mainWindow?.close());

  ipcMain.handle("nav:toggle", async () => {
    const { updateNavBar } = await import("../app/window");
    await updateNavBar();
    return state.showNavigationBar;
  });

  ipcMain.handle("plugins:getAll", () => state.plugins);
  ipcMain.handle("plugins:add", (_event, plugin) => {
    addPlugin(plugin);
    state.plugins = loadPlugins();
    injectBundle();
    return state.plugins;
  });
  ipcMain.handle("plugins:remove", (_event, id: string) => {
    removePluginById(id);
    state.plugins = loadPlugins();
    injectBundle();
    return state.plugins;
  });
  ipcMain.handle("plugins:toggle", (_event, id: string, enabled: boolean) => {
    updatePluginEnabled(id, enabled);
    state.plugins = loadPlugins();
    injectBundle();
    return state.plugins;
  });
  ipcMain.handle("plugins:reload", () => {
    recompileBundle();
    injectBundle();
  });

  ipcMain.on("plugin:settings:save", (_event, id: string, data: Record<string, unknown>) => {
    console.log("[IPC] plugin:settings:save called (legacy path):", id);
  });

  ipcMain.on("plugin:settings:close", () => {});

  setupShortcuts();
}
