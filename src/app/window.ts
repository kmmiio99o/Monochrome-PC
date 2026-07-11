import * as path from "path";
import { BrowserWindow, Menu } from "electron";
import { state } from "../state";
import { WINDOW_WIDTH, WINDOW_HEIGHT, WINDOW_MIN_WIDTH, WINDOW_MIN_HEIGHT } from "../config";
import { startPlayerPolling, stopPlayerPolling } from "../player/poller";

export function createWindow(): void {

  state.mainWindow = new BrowserWindow({
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
    minWidth: WINDOW_MIN_WIDTH,
    minHeight: WINDOW_MIN_HEIGHT,
    frame: true,
    backgroundColor: "#000000",
    title: "Monochrome Player",
    icon: path.join(__dirname, "..", "..", "assets", "icon.png"),
    webPreferences: {
      preload: path.join(__dirname, "..", "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
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

  state.mainWindow.loadURL("https://monochrome.tf");

  state.mainWindow.webContents.on("did-finish-load", () => {
    startPlayerPolling();
  });
}
