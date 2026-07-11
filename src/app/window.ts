import * as path from "path";
import { BrowserWindow, dialog } from "electron";
import { state } from "../state";
import { WINDOW_WIDTH, WINDOW_HEIGHT, WINDOW_MIN_WIDTH, WINDOW_MIN_HEIGHT } from "../config";
import { startPlayerPolling, stopPlayerPolling } from "../player/poller";
import { getShellHTML } from "./nav-bar";

export async function updateNavBar(): Promise<void> {
  const next = !state.showNavigationBar;

  if (!next && !state.isTilingWM) {
    const result = await dialog.showMessageBox({
      type: "warning",
      title: "Disable Navigation Bar?",
      message:
        "Without the navigation bar, you won't be able to drag the window, " +
        "minimize, maximize, or close it using the UI.\n\nUse Alt+F4 to close the window.",
      buttons: ["Cancel", "Disable"],
      defaultId: 0,
      cancelId: 0,
    });

    if (result.response === 0) return;
  }

  state.showNavigationBar = next;

  try {
    if (state.mainWindow && !state.mainWindow.isDestroyed()) {
      state.mainWindow.webContents.send("nav:toggle-visibility", next);
    }
  } catch {
    // ignore
  }
}

export function createWindow(): void {
  state.mainWindow = new BrowserWindow({
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
    minWidth: WINDOW_MIN_WIDTH,
    minHeight: WINDOW_MIN_HEIGHT,
    frame: false,
    backgroundColor: "#000000",
    title: "Monochrome Player",
    icon: path.join(__dirname, "..", "..", "assets", "icon.png"),
    webPreferences: {
      preload: path.join(__dirname, "..", "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      webviewTag: true,
    },
  });

  state.mainWindow.on("close", (event) => {
    if (state.closeToTray && !state.isQuitting) {
      event.preventDefault();
      state.mainWindow?.hide();
      return false;
    }
  });

  state.mainWindow.on("closed", () => {
    state.mainWindow = null;
    stopPlayerPolling();
  });

  state.mainWindow.loadURL(`data:text/html,${encodeURIComponent(getShellHTML(!state.isTilingWM))}`);

  state.mainWindow.webContents.on("page-title-updated", (event) => {
    event.preventDefault();
  });

  state.mainWindow.webContents.on("did-finish-load", () => {
    startPlayerPolling();
  });
}
