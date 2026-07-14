import { ipcRenderer, contextBridge } from "electron";

contextBridge.exposeInMainWorld("pluginSettings", {
  save: (id: string, data: Record<string, unknown>) => {
    ipcRenderer.send("plugin:settings:save", id, data);
  },
  close: () => {
    ipcRenderer.send("plugin:settings:close");
  },
});
