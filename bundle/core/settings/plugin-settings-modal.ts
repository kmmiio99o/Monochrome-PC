import { $, el, communicate } from "../../utils";

const OVERLAY_CSS =
  "display:flex;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.7);z-index:10000;align-items:center;justify-content:center;opacity:0;transition:opacity .3s;backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px)";

const MODAL_CSS =
  "background:#141414;border:1px solid #2a2a2a;border-radius:12px;padding:24px;max-width:480px;width:90%;max-height:80vh;display:flex;flex-direction:column;transform:scale(.95);transition:transform .25s;box-shadow:0 25px 50px -12px rgba(0,0,0,.5)";

const MODAL_INNER_CSS =
  "h2{font-size:16px;font-weight:600;margin:0 0 4px;color:#f5f5f5}" +
  "p{font-size:12px;color:#888;margin:0 0 16px;line-height:1.4}" +
  "label{display:block;font-size:13px;margin-bottom:6px;color:#9aa0a6}" +
  "textarea{width:100%;padding:8px;border:1px solid rgba(255,255,255,0.12);border-radius:6px;background:rgba(255,255,255,0.06);color:#e3e2e6;font-size:12px;outline:none;box-sizing:border-box;font-family:monospace;resize:vertical}" +
  "textarea:focus{border-color:#5865F2}" +
  ".btns{display:flex;gap:8px;margin-top:16px}" +
  ".shortcut-row{display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:6px;margin-bottom:6px}" +
  ".shortcut-label{font-size:13px;color:#e3e2e6}" +
  "kbd{font-size:11px;color:#888;background:#222;padding:3px 8px;border-radius:4px;font-family:monospace}";

function closeOverlay(overlay: HTMLElement): void {
  const modal = overlay.querySelector<HTMLElement>(":scope > div");
  overlay.style.opacity = "0";
  if (modal) modal.style.transform = "scale(.95)";
  setTimeout(() => { overlay.style.display = "none"; }, 300);
}

function buildThemeInjectorModal(): HTMLElement {
  const STORAGE_KEY = "plugin-settings:core:theme-injector";
  let currentCss = "";
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) { const d = JSON.parse(raw); currentCss = d.css || ""; }
  } catch {}

  const modal = el("div", { innerHTML: "" });
  modal.style.cssText = MODAL_CSS;

  const escapedCss = currentCss
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

  modal.innerHTML =
    '<style>' + MODAL_INNER_CSS + "</style>" +
    "<h2>Theme Injector</h2>" +
    "<p>Inject custom CSS to modify Monochrome's appearance.</p>" +
    "<label>Custom CSS</label>" +
    "<textarea id='plugin-modal-css' rows='14' placeholder='/* Your CSS here */\n.now-playing-bar {\n  border-top: 2px solid #5865F2;\n}'>" + escapedCss + "</textarea>" +
    "<div class='btns'>" +
    "<button id='plugin-modal-save' style='background:#5865F2;color:#fff;padding:8px 16px;border:none;border-radius:6px;cursor:pointer;font-size:13px;font-weight:500'>Save</button>" +
    "<button id='plugin-modal-clear' style='background:transparent;border:1px solid #444;color:#aaa;padding:8px 16px;border-radius:6px;cursor:pointer;font-size:13px;font-weight:500'>Clear</button>" +
    "<button id='plugin-modal-cancel' style='background:rgba(255,255,255,0.08);color:#e3e2e6;padding:8px 16px;border:none;border-radius:6px;cursor:pointer;font-size:13px;font-weight:500'>Cancel</button>" +
    "</div>";

  const textarea = modal.querySelector<HTMLTextAreaElement>("#plugin-modal-css")!;

  modal.querySelector("#plugin-modal-save")!.addEventListener("click", () => {
    const css = textarea.value;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ css }));
    const old = document.getElementById("plugin-css-core:theme-injector");
    if (old) old.remove();
    if (css) {
      const s = document.createElement("style");
      s.id = "plugin-css-core:theme-injector";
      s.textContent = css;
      document.head.appendChild(s);
    }
    communicate("plugin:settings-saved:core:theme-injector");
  });

  modal.querySelector("#plugin-modal-clear")!.addEventListener("click", () => {
    textarea.value = "";
  });

  return modal;
}

function buildShortcutsModal(): HTMLElement {
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

  const modal = el("div", { innerHTML: "" });
  modal.style.cssText = MODAL_CSS;

  modal.innerHTML =
    '<style>' + MODAL_INNER_CSS + "</style>" +
    "<h2>Keyboard Shortcuts</h2>" +
    "<p>Shortcuts are active when not typing in an input field.</p>" +
    rows +
    "<div class='btns'>" +
    "<button id='plugin-modal-cancel' style='background:rgba(255,255,255,0.08);color:#e3e2e6;padding:8px 16px;border:none;border-radius:6px;cursor:pointer;font-size:13px;font-weight:500'>Close</button>" +
    "</div>";

  return modal;
}

export function openPluginSettingsModal(pluginId: string): void {
  const existing = $("plugin-settings-overlay");
  if (existing) existing.remove();

  const overlay = el("div", { id: "plugin-settings-overlay" });
  overlay.style.cssText = OVERLAY_CSS;

  let modal: HTMLElement;
  if (pluginId === "core:theme-injector") {
    modal = buildThemeInjectorModal();
  } else if (pluginId === "core:shortcuts") {
    modal = buildShortcutsModal();
  } else {
    const m = el("div", { innerHTML: MODAL_CSS.replace("flex-direction:column", "") });
    m.style.cssText = MODAL_CSS;
    m.innerHTML =
      '<style>' + MODAL_INNER_CSS + "</style>" +
      "<h2>Plugin Settings</h2>" +
      "<p>No settings available for this plugin.</p>" +
      "<div class='btns'>" +
      "<button id='plugin-modal-cancel' style='background:rgba(255,255,255,0.08);color:#e3e2e6;padding:8px 16px;border:none;border-radius:6px;cursor:pointer;font-size:13px;font-weight:500'>Close</button>" +
      "</div>";
    modal = m;
  }

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  requestAnimationFrame(() => {
    overlay.style.opacity = "1";
    modal.style.transform = "scale(1)";
  });

  const close = () => closeOverlay(overlay);

  overlay.querySelector<HTMLButtonElement>("#plugin-modal-cancel")?.addEventListener("click", close);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });

  document.addEventListener("keydown", function handler(e: KeyboardEvent) {
    if (e.key === "Escape") { close(); document.removeEventListener("keydown", handler); }
  });
}
