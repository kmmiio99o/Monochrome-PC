import { app } from "electron";
import * as path from "path";
import { state } from "./state";
import { loadSettings, saveSettings } from "./settings/store";
import { createWindow } from "./app/window";
import { createTray, updateTray } from "./app/tray";
import { registerMediaKeys, unregisterMediaKeys } from "./app/media-keys";
import { registerIpcHandlers } from "./ipc/handlers";
import { initDiscordRpc, destroyDiscordRpc } from "./discord/client";
import { updateDiscordPresence, clearDiscordPresence } from "./discord/presence";
import { stopPlayerPolling } from "./player/poller";

function onRpcChanged(): void {
  saveSettings();
  if (!state.rpcSettings.enabled) clearDiscordPresence();
  else updateDiscordPresence();
  updateTray();

  try {
    if (state.mainWindow && !state.mainWindow.isDestroyed()) {
      state.mainWindow.webContents.send("rpc-settings", state.rpcSettings);
    }
  } catch {}
}

const gotLock = app.requestSingleInstanceLock();

if (!gotLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (state.mainWindow) {
      if (state.mainWindow.isMinimized()) state.mainWindow.restore();
      state.mainWindow.show();
      state.mainWindow.focus();
    }
  });

  if (process.defaultApp) {
    if (process.argv.length >= 2) {
      app.setAsDefaultProtocolClient("monochrome-player", process.execPath, [path.resolve(process.argv[1])]);
    }
  } else {
    app.setAsDefaultProtocolClient("monochrome-player");
  }

  registerIpcHandlers(onRpcChanged);

  app.whenReady().then(async () => {
    loadSettings();
    createWindow();
    createTray();
    registerMediaKeys();

    try {
      await initDiscordRpc();
    } catch {
      // Discord RPC init failed silently
    }
  });

  app.on("window-all-closed", () => {
    unregisterMediaKeys();

    if (state.tray) {
      state.tray.destroy();
      state.tray = null;
    }

    destroyDiscordRpc();
    stopPlayerPolling();

    if (process.platform !== "darwin") app.quit();
  });

  app.on("activate", () => {
    if (state.mainWindow === null) createWindow();
    else state.mainWindow.show();
  });
}
