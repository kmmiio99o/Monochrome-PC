import { bus } from "../../bus";

let toast: HTMLElement | null = null;
let timeout: ReturnType<typeof setTimeout> | null = null;

function show(text: string, duration: number): void {
  if (toast) toast.remove();
  if (timeout) clearTimeout(timeout);

  toast = document.createElement("div");
  toast.textContent = text;
  toast.style.cssText =
    "position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(20px);background:#1a1a1a;border:1px solid #333;color:#eee;padding:10px 20px;border-radius:8px;font-size:13px;z-index:9999;opacity:0;transition:opacity .25s,transform .25s;box-shadow:0 8px 24px rgba(0,0,0,.4);pointer-events:none";

  document.body.appendChild(toast);
  requestAnimationFrame(() => {
    if (toast) { toast.style.opacity = "1"; toast.style.transform = "translateX(-50%) translateY(0)"; }
  });

  timeout = setTimeout(() => {
    if (toast) {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(-50%) translateY(20px)";
      setTimeout(() => { toast?.remove(); toast = null; }, 250);
    }
  }, duration);
}

export function init(): void {
  bus.on("notification:show", (text, dur) => show(String(text), Number(dur) || 3000));
}
