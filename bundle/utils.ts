import { ElectronSync, TrackInfo } from "./types";

export function communicate(msg: string): void {
  console.debug("ELECTRON_SETTING:" + msg);
}

export function getSync(): ElectronSync {
  return ((window as unknown as Record<string, unknown>).__electronSettingsSync || {}) as ElectronSync;
}

export function getCurrentTrack(): TrackInfo & { isPlaying: boolean } {
  const s = getSync();
  return {
    title: s.currentTrackTitle || "Not Playing",
    artist: s.currentTrackArtist || "",
    albumArt: s.currentTrackAlbumArt || "",
    isPlaying: s.isPlaying || false,
  };
}

export function $(id: string): HTMLElement | null {
  return document.getElementById(id);
}

export function $$(selector: string): Element | null {
  return document.querySelector(selector);
}

export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs?: Record<string, string>,
  ...children: (Node | string)[]
): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  if (attrs) {
    for (const [k, v] of Object.entries(attrs)) {
      if (k === "className") e.className = v;
      else if (k === "textContent") e.textContent = v;
      else if (k === "innerHTML") e.innerHTML = v;
      else e.setAttribute(k, v);
    }
  }
  for (const c of children) {
    if (typeof c === "string") e.appendChild(document.createTextNode(c));
    else e.appendChild(c);
  }
  return e;
}

export function addTab(name: string, id: string): HTMLElement {
  const tabs = $$(".settings-tabs");
  const page = $("page-settings");
  if (!tabs || !page) return el("div");

  tabs.appendChild(
    el("button", { className: "settings-tab", "data-tab": id, textContent: name }),
  );

  const content = el("div", {
    className: "settings-tab-content",
    id: "settings-tab-" + id,
  });
  page.appendChild(content);
  return content;
}

export function settingItem(label: string, desc: string, controlHtml: string): string {
  return (
    '<div class="setting-item"><div class="info">' +
    '<span class="label">' + label + "</span>" +
    (desc ? '<span class="description">' + desc + "</span>" : "") +
    "</div>" + controlHtml + "</div>"
  );
}

export function toggle(id: string, checked: boolean): string {
  return (
    '<label class="toggle-switch"><input type="checkbox" id="' + id + '"' +
    (checked ? " checked" : "") + '><span class="slider"></span></label>'
  );
}

export function textInput(id: string, val: string, placeholder: string): string {
  return (
    '<input type="text" id="' + id + '" value="' + val + '" placeholder="' + placeholder +
    '" style="background:var(--input-bg,#1a1a1a);border:1px solid var(--border-color,#333);color:var(--text-color,#eee);padding:6px 10px;border-radius:6px;width:180px">'
  );
}

export function selectInput(id: string, opts: Array<[string | number, string]>, val: string | number): string {
  let h = '<select id="' + id + '" style="background:var(--input-bg,#1a1a1a);border:1px solid var(--border-color,#333);color:var(--text-color,#eee);padding:6px 10px;border-radius:6px">';
  for (const [value, label] of opts) {
    h += '<option value="' + value + '"' + (value === val ? " selected" : "") + ">" + label + "</option>";
  }
  return h + "</select>";
}

export function actionBtn(id: string, label: string, color: string): string {
  return (
    '<button id="' + id + '" style="background:' + color +
    ";border:none;color:#fff;padding:8px 16px;border-radius:6px;cursor:pointer;font-size:13px;font-weight:500\">" +
    label + "</button>"
  );
}

export function inputStyle(): string {
  return 'style="background:var(--input-bg,#1a1a1a);border:1px solid var(--border-color,#333);color:var(--text-color,#eee);padding:8px 12px;border-radius:6px;width:100%;box-sizing:border-box;outline:none;font-size:13px"';
}

const readyCallbacks: Array<() => void> = [];
let readyFired = false;

export function onReady(cb: () => void): void {
  if (readyFired) { try { cb(); } catch {} return; }
  readyCallbacks.push(cb);
}

export function fireReady(): void {
  readyFired = true;
  for (const cb of readyCallbacks) {
    try { cb(); } catch (e) { console.error("[Ready]", e); }
  }
  readyCallbacks.length = 0;
}
