import { getSync } from "../../utils";
import { PluginManager } from "../../manager";
import { renderDesktopTab } from "./desktop-tab";
import { renderPluginsTab } from "./plugins-tab";

export function init(mgr: PluginManager): void {
  if (document.getElementById("settings-tab-electron-app")) return;
  const sync = getSync();
  renderDesktopTab(sync.appVersion || "");
  renderPluginsTab(mgr);
}
