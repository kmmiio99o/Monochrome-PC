import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronNav", {
  back: () => ipcRenderer.send("nav:back"),
  forward: () => ipcRenderer.send("nav:forward"),
  reload: () => ipcRenderer.send("nav:reload"),
  minimize: () => ipcRenderer.send("nav:minimize"),
  maximize: () => ipcRenderer.send("nav:maximize"),
  close: () => ipcRenderer.send("nav:close"),
  onToggle: (callback: (visible: boolean) => void) => {
    ipcRenderer.on("nav:toggle-visibility", (_event, visible: boolean) => {
      callback(visible);
    });
  },
});
