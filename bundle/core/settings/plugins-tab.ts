import { addTab, $, communicate } from "../../utils";
import { PluginManager } from "../../manager";
import { loadFromURL } from "../../loader";
import { openPluginSettingsModal } from "./plugin-settings-modal";

const TRASH_SVG = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>';

const SETTINGS_SVG = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>';

const CORE_IDS = new Set(["core:settings", "core:theme-injector", "core:notifications", "core:media-info", "core:shortcuts"]);
const SETTINGS_IDS = new Set(["core:theme-injector", "core:shortcuts"]);

function buildCard(inst: { manifest: { id: string; name: string; version: string; author: string; description: string; icon?: string }; enabled: boolean }): string {
  const m = inst.manifest;
  const isCore = CORE_IDS.has(m.id);
  const hasSettings = SETTINGS_IDS.has(m.id);

  let actions = "";

  if (!isCore) {
    actions +=
      '<button data-plugin-remove="' + m.id + '" title="Remove plugin" style="background:transparent;border:none;color:#666;cursor:pointer;padding:4px;display:flex;align-items:center;border-radius:4px">' +
      TRASH_SVG + "</button>";
  }

  if (hasSettings) {
    actions +=
      '<button data-plugin-settings="' + m.id + '" title="Settings" style="background:transparent;border:none;color:#888;cursor:pointer;padding:4px;display:flex;align-items:center;border-radius:4px">' +
      SETTINGS_SVG + "</button>";
  }

  actions +=
    '<label class="toggle-switch"><input type="checkbox" data-plugin-toggle="' + m.id + '"' +
    (inst.enabled ? " checked" : "") + '><span class="slider"></span></label>';

  return (
    '<div style="flex:1;min-width:0">' +
    '<div style="font-size:14px;font-weight:600;color:var(--text-color,#eee);margin-bottom:2px;display:flex;align-items:center;gap:8px">' +
    (m.icon ? '<img src="' + m.icon + '" style="width:20px;height:20px;border-radius:4px">' : "") +
    m.name +
    (isCore ? '<span style="font-size:10px;background:#333;color:#aaa;padding:2px 6px;border-radius:4px;font-weight:500">CORE</span>' : "") +
    '<span style="font-size:11px;font-weight:400;color:var(--text-secondary,#888)">' + m.version + "</span></div>" +
    '<div style="font-size:12px;color:var(--text-secondary,#888);margin-bottom:2px">' + m.author + "</div>" +
    '<div style="font-size:12px;color:var(--text-secondary,#888);line-height:1.4">' + m.description + "</div></div>" +
    '<div style="display:flex;gap:4px;flex-shrink:0;align-items:center">' + actions + "</div>"
  );
}

export function renderPluginsTab(mgr: PluginManager): void {
  if ($("settings-tab-plugins")) return;

  const tab = addTab("Plugins", "plugins");
  tab.innerHTML =
    '<div class="settings-list" style="padding:16px">' +
    '<div style="display:flex;gap:8px;margin-bottom:16px">' +
    '<input type="text" id="plugin-url-input" placeholder="Paste plugin URL or JSON..." ' +
    'style="flex:1;background:var(--input-bg,#1a1a1a);border:1px solid var(--border-color,#333);color:var(--text-color,#eee);padding:8px 12px;border-radius:6px;font-size:13px;outline:none">' +
    '<button id="plugin-install-btn" style="background:#5865F2;border:none;color:#fff;padding:8px 16px;border-radius:6px;cursor:pointer;font-size:13px;font-weight:500;white-space:nowrap">Install</button>' +
    "</div>" +
    '<div id="plugin-list"></div>' +
    '<div id="plugin-empty" style="text-align:center;padding:32px 0;color:var(--text-secondary,#888);font-size:13px">No plugins installed. Paste a plugin URL above to get started.</div>' +
    "</div>";

  const list = $("plugin-list")!;
  const empty = $("plugin-empty")!;
  const input = $("plugin-url-input") as HTMLInputElement;

  function renderList(): void {
    const plugins = mgr.all();
    empty.style.display = plugins.length ? "none" : "block";
    list.innerHTML = "";

    for (const inst of plugins) {
      const card = document.createElement("div");
      card.style.cssText = "background:var(--input-bg,#1a1a1a);border:1px solid var(--border-color,#333);border-radius:8px;padding:12px;margin-bottom:8px;display:flex;align-items:center;gap:10px";
      card.innerHTML = buildCard(inst);
      list.appendChild(card);
    }

    bindEvents();
  }

  function bindEvents(): void {
    list.querySelectorAll<HTMLElement>("[data-plugin-toggle]").forEach((el) => {
      el.addEventListener("change", () => {
        const id = el.dataset.pluginToggle;
        if (!id) return;
        const inst = mgr.get(id);
        if (inst) mgr.toggle(inst);
      });
    });

    list.querySelectorAll<HTMLElement>("[data-plugin-remove]").forEach((el) => {
      el.addEventListener("click", () => {
        const id = el.dataset.pluginRemove;
        if (id) { mgr.remove(id); renderList(); }
      });
    });

    list.querySelectorAll<HTMLElement>("[data-plugin-settings]").forEach((el) => {
      el.addEventListener("click", () => {
        const id = el.dataset.pluginSettings;
        if (id) openPluginSettingsModal(id);
      });
    });
  }

  $("plugin-install-btn")?.addEventListener("click", async () => {
    const url = input?.value?.trim();
    if (!url) return;
    if (await loadFromURL(mgr, url)) { input.value = ""; renderList(); }
  });

  input?.addEventListener("keydown", (e) => { if (e.key === "Enter") $("plugin-install-btn")?.click(); });

  renderList();
}
