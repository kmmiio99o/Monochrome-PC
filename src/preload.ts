import { ipcRenderer } from "electron";

function showToast(data: { title?: string; artist?: string }): void {
  let container = document.getElementById("m3-toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "m3-toast-container";
    container.style.cssText =
      "position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:100000;display:flex;flex-direction:column-reverse;gap:8px;pointer-events:none";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.style.cssText =
    "background:#2d2f33;color:#e3e2e6;padding:12px 24px;border-radius:8px;font-size:13px;box-shadow:0 4px 12px rgba(0,0,0,0.4);max-width:400px;text-align:center";

  const titleSpan = document.createElement("span");
  titleSpan.style.cssText = "font-weight:500";
  titleSpan.textContent = data.title || "Now Playing";
  toast.appendChild(titleSpan);

  if (data.artist) {
    toast.appendChild(document.createTextNode(" \u2014 "));
    const artistSpan = document.createElement("span");
    artistSpan.style.cssText = "color:#9aa0a6";
    artistSpan.textContent = data.artist;
    toast.appendChild(artistSpan);
  }

  container.appendChild(toast);

  toast
    .animate(
      [
        { opacity: "0", transform: "translateY(16px)" },
        { opacity: "1", transform: "translateY(0)" },
      ],
      { duration: 300, easing: "ease-out" },
    )
    .finished.catch(function () {});

  setTimeout(function () {
    const anim = toast.animate(
      [
        { opacity: "1", transform: "translateY(0)" },
        { opacity: "0", transform: "translateY(16px)" },
      ],
      { duration: 300, easing: "ease-in" },
    );
    anim.finished.then(function () { toast.remove() }).catch(function () {});
  }, 3000);
}

ipcRenderer.on("show-toast", (_event: Electron.IpcRendererEvent, data: { title?: string; artist?: string }) => showToast(data));
