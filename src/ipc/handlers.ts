import { ipcMain, app, shell } from "electron";
import { state } from "../state";
import { INJECT_SETTINGS_TAB } from "../inject/settings-tab";

let _onRpcChanged: (() => void) | null = null;

app.on("web-contents-created", (_event, contents) => {
  if (contents.getType() !== "webview") return;
  state.webviewWC = contents;

  contents.on("console-message", (_event2, _level, message) => {
    if (!message.startsWith("ELECTRON_SETTING:")) return;
    const msg = message.slice(17);
    handleSettingsMessage(msg);
  });

  contents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });

  contents.on("did-finish-load", () => {
    injectSettingsTab();
  });
});

export function injectSettingsTab(): void {
  if (!state.webviewWC || state.webviewWC.isDestroyed()) return;
  state.webviewWC.executeJavaScript(INJECT_SETTINGS_TAB).catch(() => {});
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
  };
  const script = 'window.__electronSettingsSync=' + JSON.stringify(payload) + ';(function(){var s=window.__electronSettingsSync;var c=function(id,v){var el=document.getElementById(id);if(el&&el.type==="checkbox")el.checked=v};var se=function(id,v){var el=document.getElementById(id);if(el&&el.tagName==="SELECT")el.value=v};var ti=function(id,v){var el=document.getElementById(id);if(el&&el.type==="text")el.value=v};c("electron-navbar-toggle",s.showNavigationBar);c("electron-closetotray-toggle",s.closeToTray);c("electron-rpc-toggle",s.rpcEnabled);c("electron-rpc-title-toggle",s.rpcShowTitle);c("electron-rpc-artist-toggle",s.rpcShowArtist);c("electron-rpc-idle-toggle",s.rpcShowOnIdle);c("electron-rpc-timestamp-toggle",s.rpcShowTimestamp);se("electron-rpc-activity-type",s.rpcActivityType);ti("electron-rpc-custom-details",s.rpcCustomDetails||"");ti("electron-rpc-large-image-text",s.rpcLargeImageText||"");ti("electron-rpc-small-image-key",s.rpcSmallImageKey||"");ti("electron-rpc-small-image-text",s.rpcSmallImageText||"");ti("electron-rpc-button1-label",s.rpcButton1Label||"");ti("electron-rpc-button1-url",s.rpcButton1Url||"");ti("electron-rpc-button2-label",s.rpcButton2Label||"");ti("electron-rpc-button2-url",s.rpcButton2Url||"");var st=document.getElementById("electron-rpc-status");if(st)st.textContent=s.rpcConnected?"Connected":"Disconnected";})()';
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
        const [sub, val] = payload.includes(":") ? [payload.slice(0, payload.indexOf(":")), payload.slice(payload.indexOf(":") + 1)] : [payload, ""];
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
    case "sync": {
      syncWebviewState();
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

  ipcMain.on("nav:back", () => {
    void state.mainWindow?.webContents.goBack();
  });

  ipcMain.on("nav:forward", () => {
    void state.mainWindow?.webContents.goForward();
  });

  ipcMain.on("nav:reload", () => {
    state.mainWindow?.webContents.reload();
  });

  ipcMain.on("nav:minimize", () => {
    state.mainWindow?.minimize();
  });

  ipcMain.on("nav:maximize", () => {
    if (state.mainWindow?.isMaximized()) state.mainWindow.unmaximize();
    else state.mainWindow?.maximize();
  });

  ipcMain.on("nav:close", () => {
    state.mainWindow?.close();
  });

  ipcMain.handle("nav:toggle", async () => {
    const { updateNavBar } = await import("../app/window");
    await updateNavBar();
    return state.showNavigationBar;
  });
}
