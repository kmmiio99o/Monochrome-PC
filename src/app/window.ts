import * as path from "path";
import { BrowserWindow, session } from "electron";
import { state } from "../state";
import { WINDOW_WIDTH, WINDOW_HEIGHT, WINDOW_MIN_WIDTH, WINDOW_MIN_HEIGHT } from "../config";
import { startPlayerPolling, stopPlayerPolling } from "../player/poller";

function setupCspOverride(): void {
  session.defaultSession.webRequest.onHeadersReceived(
    { urls: ["*://*/*"] },
    (details, callback) => {
      const headers = Object.assign({}, details.responseHeaders);
      delete headers["content-security-policy"];
      delete headers["Content-Security-Policy"];
      delete headers["Content-Security-Policy-Report-Only"];
      delete headers["X-Content-Security-Policy"];
      delete headers["X-WebKit-CSP"];
      headers["Content-Security-Policy"] = [
        "default-src * 'unsafe-inline' 'unsafe-eval' data: blob: mediastream:; " +
        "script-src * 'unsafe-inline' 'unsafe-eval' data: blob:; " +
        "style-src * 'unsafe-inline' data: blob:; " +
        "img-src * data: blob:; " +
        "media-src * data: blob: mediastream:; " +
        "connect-src * data: blob:; " +
        "font-src * data:; " +
        "worker-src * data: blob:; " +
        "frame-src *;",
      ];
      callback({ responseHeaders: headers });
    },
  );
}

export function createWindow(): void {
  setupCspOverride();

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
