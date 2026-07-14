import { $, el } from "../../utils";

export function showAbout(version: string): void {
  let overlay = $("electron-about-overlay");
  if (overlay) { overlay.style.display = "flex"; return; }

  overlay = el("div", {
    id: "electron-about-overlay",
    innerHTML:
      '<div id="electron-about-modal" style="background:#141414;border:1px solid #2a2a2a;border-radius:8px;padding:24px;max-width:360px;width:88%;text-align:center;transform:scale(.95);transition:transform .25s;box-shadow:0 25px 50px -12px rgba(0,0,0,.25)">' +
      '<img src="mono://icon" width="64" height="64" style="border-radius:12px;margin:0 auto 16px;display:block">' +
      '<div style="font-size:17px;font-weight:600;color:#f5f5f5;margin-bottom:2px">Monochrome Player</div>' +
      '<div style="font-size:13px;color:#a0a0a0;margin-bottom:16px">Version ' + version + "</div>" +
      '<div style="font-size:13px;color:#a0a0a0;line-height:1.5;margin-bottom:20px">Electron desktop wrapper for the Monochrome music player web app.</div>' +
      '<div style="display:flex;flex-direction:column;gap:8px;margin-bottom:20px">' +
      '<a href="https://github.com/kmmiio99o/Monochrome-PC" target="_blank" style="color:#e0e0e0;text-decoration:none;font-size:13px;padding:10px;border-radius:8px;background:#1f1f1f;font-weight:500">GitHub Repository \u2197</a>' +
      '<a href="https://github.com/kmmiio99o/Monochrome-PC/issues" target="_blank" style="color:#e0e0e0;text-decoration:none;font-size:13px;padding:10px;border-radius:8px;background:#1f1f1f;font-weight:500">Report Issue \u2197</a>' +
      "</div>" +
      '<div style="font-size:12px;color:#666;margin-bottom:16px">Developed by <span style="color:#a0a0a0">kmmiio99o</span></div>' +
      '<button id="electron-about-close" style="background:#f5f5f5;border:none;color:#0a0a0a;padding:10px 32px;border-radius:9999px;cursor:pointer;font-size:14px;font-weight:600">Close</button>' +
      "</div>",
  });

  overlay.style.cssText =
    "display:flex;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.7);z-index:10000;align-items:center;justify-content:center;opacity:0;transition:opacity .3s;backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px)";

  document.body.appendChild(overlay);

  const modal = $("electron-about-modal")!;
  const closeBtn = $("electron-about-close")!;

  requestAnimationFrame(() => {
    overlay!.style.opacity = "1";
    modal.style.transform = "scale(1)";
  });

  const close = () => {
    overlay!.style.opacity = "0";
    modal.style.transform = "scale(.95)";
    setTimeout(() => { overlay!.style.display = "none"; }, 250);
  };

  closeBtn.addEventListener("click", close);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });
}
