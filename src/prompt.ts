import { ipcRenderer, contextBridge } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  submit: function (value: string) {
    ipcRenderer.send("prompt:custom-status", value);
    window.close();
  },
});
