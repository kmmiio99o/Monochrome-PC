import { PluginManifest, PluginInstance } from "./types";
import { createPluginAPI } from "./api";
import { communicate } from "./utils";

const STORAGE_KEY = "monochrome-plugins";

export class PluginManager {
  private plugins = new Map<string, PluginInstance>();
  private enabledIds = new Set<string>();

  constructor() {
    this.loadEnabled();
  }

  private loadEnabled(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) arr.forEach((id: string) => this.enabledIds.add(id));
      }
    } catch {}
  }

  private saveEnabled(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...this.enabledIds]));
      communicate("plugin:sync");
    } catch {}
  }

  register(manifest: PluginManifest, code: string): boolean {
    if (this.plugins.has(manifest.id)) return false;

    const api = createPluginAPI(manifest);
    const inst: PluginInstance = { manifest, enabled: false, api, code };
    this.plugins.set(manifest.id, inst);

    if (this.enabledIds.has(manifest.id)) {
      this.enable(inst);
    }
    return true;
  }

  registerCore(manifest: PluginManifest, enabled = true): PluginInstance {
    if (this.plugins.has(manifest.id)) return this.plugins.get(manifest.id)!;

    const api = createPluginAPI(manifest);
    const inst: PluginInstance = { manifest, enabled: false, api, code: "" };
    this.plugins.set(manifest.id, inst);

    if (enabled) this.enable(inst);
    return inst;
  }

  enable(inst: PluginInstance): void {
    if (inst.enabled) return;
    inst.enabled = true;
    this.enabledIds.add(inst.manifest.id);
    this.saveEnabled();
  }

  disable(inst: PluginInstance): void {
    if (!inst.enabled) return;
    inst.api.ui.removeCSS();
    inst.enabled = false;
    this.enabledIds.delete(inst.manifest.id);
    this.saveEnabled();
  }

  toggle(inst: PluginInstance): void {
    if (inst.enabled) this.disable(inst);
    else this.enable(inst);
  }

  remove(id: string): void {
    const inst = this.plugins.get(id);
    if (inst) { this.disable(inst); this.plugins.delete(id); }
  }

  get(id: string): PluginInstance | undefined { return this.plugins.get(id); }
  all(): PluginInstance[] { return [...this.plugins.values()]; }
  isEnabled(id: string): boolean { return this.enabledIds.has(id); }
}
