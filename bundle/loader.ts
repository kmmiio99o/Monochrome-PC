import { PluginManifest } from "./types";
import { PluginManager } from "./manager";

export async function loadFromURL(mgr: PluginManager, url: string): Promise<boolean> {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("HTTP " + res.status);

    const ct = res.headers.get("content-type") || "";
    let manifest: PluginManifest;
    let code: string;

    if (ct.includes("application/json")) {
      const data = (await res.json()) as { manifest: PluginManifest; code: string };
      manifest = data.manifest;
      code = data.code || "";
    } else {
      const text = await res.text();
      const lines = text.split("\n");
      const mLines: string[] = [];
      const cLines: string[] = [];
      let inM = false;

      for (const line of lines) {
        const t = line.trim();
        if (t === "// ==PLUGIN_MANIFEST==") { inM = true; continue; }
        if (t === "// ==/PLUGIN_MANIFEST==") { inM = false; continue; }
        (inM ? mLines : cLines).push(line);
      }

      if (mLines.length === 0) {
        manifest = JSON.parse(text);
        code = "";
      } else {
        manifest = JSON.parse(mLines.join("\n"));
        code = cLines.join("\n");
      }
    }

    if (!manifest!.id || !manifest!.name || !manifest!.version) {
      console.error("[Loader] Invalid manifest from:", url);
      return false;
    }

    return mgr.register(manifest!, code);
  } catch (e) {
    console.error("[Loader] Failed:", url, e);
    return false;
  }
}
