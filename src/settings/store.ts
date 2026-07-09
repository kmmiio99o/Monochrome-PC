import * as path from "path";
import * as fs from "fs";
import { app } from "electron";
import { RpcSettings } from "../types";
import { DEFAULT_RPC_SETTINGS } from "../config";
import { state } from "../state";

function settingsPath(): string {
  return path.join(app.getPath("userData"), "rpc-settings.json");
}

export function loadSettings(): void {
  try {
    const raw = fs.readFileSync(settingsPath(), "utf8");
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      if (typeof parsed.enabled === "boolean") state.rpcSettings.enabled = parsed.enabled;
      if (typeof parsed.showTitle === "boolean") state.rpcSettings.showTitle = parsed.showTitle;
      if (typeof parsed.showArtist === "boolean") state.rpcSettings.showArtist = parsed.showArtist;
      if (typeof parsed.customStatus === "string") state.rpcSettings.customStatus = parsed.customStatus;
    }
  } catch {
    // File doesn't exist or is invalid — use defaults
  }
}

export function saveSettings(): void {
  try {
    const dir = path.dirname(settingsPath());
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(settingsPath(), JSON.stringify(state.rpcSettings, null, 2));
  } catch {
    // Silently fail on write errors
  }
}
