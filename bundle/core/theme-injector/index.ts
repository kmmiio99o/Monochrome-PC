import { communicate } from "../../utils";

const STORAGE_KEY = "plugin-settings:core:theme-injector";

function inject(css: string): void {
  const old = document.getElementById("plugin-css-core:theme-injector");
  if (old) old.remove();
  if (!css) return;
  const s = document.createElement("style");
  s.id = "plugin-css-core:theme-injector";
  s.textContent = css;
  document.head.appendChild(s);
}

export function init(): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      if (data.css) inject(data.css);
    }
  } catch {}

  window.addEventListener("message", (e) => {
    const data = e.data;
    if (data && data.type === "plugin-settings-save" && data.id === "core:theme-injector") {
      inject(data.css || "");
    }
  });
}
