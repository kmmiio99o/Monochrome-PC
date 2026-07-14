import * as path from "path";
import { BrowserWindow } from "electron";
import { state } from "../state";

const SETTINGS_WIDTH = 480;
const SETTINGS_HEIGHT = 520;

function getSettingsHTML(pluginId: string, current: Record<string, unknown>): string {
  const css =
    "body{margin:0;padding:20px;background:#1a1c1e;color:#e3e2e6;font-family:system-ui,sans-serif}" +
    "h2{font-size:16px;font-weight:600;margin:0 0 4px;color:#f5f5f5}" +
    "p{font-size:12px;color:#888;margin:0 0 16px;line-height:1.4}" +
    "label{display:block;font-size:13px;margin-bottom:6px;color:#9aa0a6}" +
    "input[type=text],textarea{width:100%;padding:8px;border:1px solid rgba(255,255,255,0.12);border-radius:6px;background:rgba(255,255,255,0.06);color:#e3e2e6;font-size:13px;outline:none;box-sizing:border-box;font-family:inherit}" +
    "textarea{font-family:monospace;font-size:12px;resize:vertical}" +
    "input:focus,textarea:focus{border-color:#5865F2}" +
    ".row{display:flex;gap:8px;margin-bottom:12px}" +
    ".row>*{flex:1}" +
    "kbd{font-size:11px;color:#888;background:#222;padding:3px 8px;border-radius:4px;font-family:monospace}" +
    ".btns{display:flex;gap:8px;margin-top:16px}" +
    "button{padding:8px 16px;border:none;border-radius:6px;cursor:pointer;font-size:13px;font-weight:500}" +
    ".save{background:#5865F2;color:#fff}" +
    ".cancel{background:rgba(255,255,255,0.08);color:#e3e2e6}" +
    ".clear{background:transparent;border:1px solid #444;color:#aaa}" +
    ".shortcut-row{display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:6px;margin-bottom:6px}" +
    ".shortcut-label{font-size:13px;color:#e3e2e6}";

  if (pluginId === "core:theme-injector") {
    const cssVal = String(current.css || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
    return (
      "<!DOCTYPE html><html><head><meta charset='utf-8'><style>" + css + "</style></head><body>" +
      "<h2>Theme Injector</h2>" +
      "<p>Inject custom CSS to modify Monochrome's appearance.</p>" +
      "<label>Custom CSS</label>" +
      "<textarea id='css' rows='14' placeholder='/* Your CSS here */\n.now-playing-bar {\n  border-top: 2px solid #5865F2;\n}'>" + cssVal + "</textarea>" +
      "<div class='btns'>" +
      "<button class='save' onclick=\"pluginSettings.save('core:theme-injector',{css:document.getElementById('css').value})\">Save</button>" +
      "<button class='clear' onclick=\"document.getElementById('css').value=''\">Clear</button>" +
      "<button class='cancel' onclick=\"pluginSettings.close()\">Cancel</button>" +
      "</div></body></html>"
    );
  }

  if (pluginId === "core:shortcuts") {
    const shortcuts = [
      { key: "Space", label: "Play / Pause" },
      { key: "Ctrl+Right", label: "Next Track" },
      { key: "Ctrl+Left", label: "Previous Track" },
      { key: "Ctrl+Up", label: "Volume Up" },
      { key: "Ctrl+Down", label: "Volume Down" },
      { key: "M", label: "Mute / Unmute" },
      { key: "F", label: "Toggle Fullscreen" },
    ];

    let rows = "";
    for (const s of shortcuts) {
      rows +=
        "<div class='shortcut-row'>" +
        "<span class='shortcut-label'>" + s.label + "</span>" +
        "<kbd>" + s.key + "</kbd>" +
        "</div>";
    }

    return (
      "<!DOCTYPE html><html><head><meta charset='utf-8'><style>" + css + "</style></head><body>" +
      "<h2>Keyboard Shortcuts</h2>" +
      "<p>Shortcuts are active when not typing in an input field.</p>" +
      rows +
      "<div class='btns'>" +
      "<button class='cancel' onclick=\"pluginSettings.close()\">Close</button>" +
      "</div></body></html>"
    );
  }

  return (
    "<!DOCTYPE html><html><head><meta charset='utf-8'><style>" + css + "</style></head><body>" +
    "<h2>Plugin Settings</h2>" +
    "<p>No settings available for this plugin.</p>" +
    "<div class='btns'>" +
    "<button class='cancel' onclick=\"pluginSettings.close()\">Close</button>" +
    "</div></body></html>"
  );
}

export function openPluginSettings(pluginId: string, current: Record<string, unknown> = {}): void {
  if (!state.mainWindow || state.mainWindow.isDestroyed()) {
    console.error("[Plugin Settings] Main window not available");
    return;
  }

  const win = new BrowserWindow({
    width: SETTINGS_WIDTH,
    height: SETTINGS_HEIGHT,
    frame: false,
    resizable: true,
    parent: state.mainWindow,
    modal: true,
    backgroundColor: "#1a1c1e",
    webPreferences: {
      preload: path.join(__dirname, "..", "plugin-settings.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.webContents.on("did-fail-load", (_e, code, desc) => {
    console.error("[Plugin Settings] Load failed:", code, desc);
  });

  win.loadURL("data:text/html," + encodeURIComponent(getSettingsHTML(pluginId, current)));
}
