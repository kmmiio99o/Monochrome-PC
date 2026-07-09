import * as path from "path";
import { BrowserWindow } from "electron";
import { state } from "../state";
import { PROMPT_WINDOW_WIDTH, PROMPT_WINDOW_HEIGHT } from "../config";

export function promptCustomStatus(): void {
  const escapedStatus = state.rpcSettings.customStatus.replace(/"/g, "&quot;");

  const inputWindow = new BrowserWindow({
    width: PROMPT_WINDOW_WIDTH,
    height: PROMPT_WINDOW_HEIGHT,
    frame: false,
    resizable: false,
    parent: state.mainWindow ?? undefined,
    modal: true,
    backgroundColor: "#1a1c1e",
    webPreferences: {
      preload: path.join(__dirname, "..", "prompt.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  inputWindow.loadURL(
    "data:text/html," +
      encodeURIComponent(`
        <!DOCTYPE html>
        <html>
        <head>
        <style>
          body { margin:0; padding:16px; background:#1a1c1e; color:#e3e2e6; font-family:system-ui,sans-serif; }
          label { display:block; font-size:13px; margin-bottom:8px; color:#9aa0a6; }
          input { width:100%; padding:8px; border:1px solid rgba(255,255,255,0.12); border-radius:6px; background:rgba(255,255,255,0.06); color:#e3e2e6; font-size:14px; outline:none; box-sizing:border-box; }
          input:focus { border-color:#4a90d9; }
          .btns { display:flex; gap:8px; justify-content:flex-end; margin-top:12px; }
          button { padding:6px 16px; border:none; border-radius:6px; cursor:pointer; font-size:13px; }
          .ok { background:#4a90d9; color:#fff; }
          .cancel { background:rgba(255,255,255,0.08); color:#e3e2e6; }
        </style>
        </head>
        <body>
          <label>Custom Status Text (leave empty to use track info)</label>
          <input id="val" type="text" value="${escapedStatus}" />
          <div class="btns">
            <button class="cancel" onclick="window.close()">Cancel</button>
            <button class="ok" onclick="electronAPI.submit(document.getElementById('val').value)">Save</button>
          </div>
        </body>
        </html>
      `),
  );
}
