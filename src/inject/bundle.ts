import * as fs from "fs";
import * as path from "path";
import { app } from "electron";
import { StoredPlugin } from "../types";

function pluginsPath(): string {
  return path.join(app.getPath("userData"), "plugins.json");
}

export function loadPlugins(): StoredPlugin[] {
  try {
    const raw = fs.readFileSync(pluginsPath(), "utf8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as StoredPlugin[];
  } catch {}
  return [];
}

export function savePlugins(plugins: StoredPlugin[]): void {
  try {
    const dir = path.dirname(pluginsPath());
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(pluginsPath(), JSON.stringify(plugins, null, 2));
  } catch {}
}

export function addPlugin(plugin: StoredPlugin): void {
  const plugins = loadPlugins();
  const idx = plugins.findIndex((p) => p.id === plugin.id);
  if (idx >= 0) {
    plugins[idx] = plugin;
  } else {
    plugins.push(plugin);
  }
  savePlugins(plugins);
}

export function removePluginById(id: string): void {
  const plugins = loadPlugins().filter((p) => p.id !== id);
  savePlugins(plugins);
}

export function updatePluginEnabled(id: string, enabled: boolean): void {
  const plugins = loadPlugins();
  const plugin = plugins.find((p) => p.id === id);
  if (plugin) {
    plugin.enabled = enabled;
    savePlugins(plugins);
  }
}

export function getBundlePath(): string {
  const candidates = [
    path.join(__dirname, "..", "..", "dist-bundle", "index.js"),
    path.join(__dirname, "..", "dist-bundle", "index.js"),
    path.join(__dirname, "dist-bundle", "index.js"),
  ];

  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }

  return candidates[0];
}

export function loadBundleCode(): string {
  const bundlePath = getBundlePath();
  try {
    return fs.readFileSync(bundlePath, "utf8");
  } catch {
    console.error("[Injector] Failed to load bundle from:", bundlePath);
    return "";
  }
}
