export const BAR_HEIGHT = 38;

const SVG = {
  back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>',
  forward:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>',
  reload:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-9-9"/><path d="M21 3v5h-5"/></svg>',
  minimize:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/></svg>',
  maximize:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/></svg>',
  close:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',
};

export function getShellHTML(showWindowControls: boolean): string {
  const winBtns = showWindowControls
    ? `
  <button class="win-btn" id="min-btn" title="Minimize">${SVG.minimize}</button>
  <button class="win-btn" id="max-btn" title="Maximize">${SVG.maximize}</button>
  <button class="win-btn" id="close-btn" title="Close">${SVG.close}</button>`
    : "";

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0a0a0a;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif}
#bar{height:${BAR_HEIGHT}px;display:flex;align-items:center;background:#0a0a0a;border-bottom:1px solid #2a2a2a;user-select:none;padding:0 4px;transition:opacity .15s,transform .15s}
#bar.hidden{opacity:0;pointer-events:none;transform:translateY(-${BAR_HEIGHT}px)}
#bar button{background:transparent;border:none;color:#888;width:32px;height:28px;border-radius:6px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .12s,color .12s}
#bar button:hover{background:#1a1a1a;color:#eee}
#bar button:active{background:#222}
#bar button svg{width:18px;height:18px;display:block}
#spacer{flex:1;height:100%;-webkit-app-region:drag}
.win-btn{width:36px!important;border-radius:6px!important}
.win-btn:hover{background:#222!important}
#close-btn:hover{background:#e81123!important;color:#fff!important}
#max-btn.maximized svg rect{transform:scale(.7)translate(4.5px,4.5px)}
#max-btn.maximized svg{transform:rotate(180deg)}
webview{position:fixed;top:${BAR_HEIGHT}px;left:0;right:0;bottom:0;transition:top .15s}
webview.fullscreen{top:0!important}
</style>
</head>
<body>
<div id="bar">
  <button id="back-btn" title="Back">${SVG.back}</button>
  <button id="forward-btn" title="Forward">${SVG.forward}</button>
  <button id="reload-btn" title="Reload">${SVG.reload}</button>
  <div id="spacer"></div>${winBtns}
</div>
<webview id="app" src="https://monochrome.tf" webpreferences="contextIsolation=yes, webSecurity=no"></webview>
<script>
var w=document.getElementById('app');
var bar=document.getElementById('bar');
document.getElementById('back-btn').onclick=function(){w.goBack()};
document.getElementById('forward-btn').onclick=function(){w.goForward()};
document.getElementById('reload-btn').onclick=function(){w.reload()};
${
  showWindowControls
    ? `
document.getElementById('min-btn').onclick=function(){window.electronNav?.minimize()};
document.getElementById('max-btn').onclick=function(){window.electronNav?.maximize()};
document.getElementById('close-btn').onclick=function(){window.electronNav?.close()};`
    : ""
}
w.addEventListener('did-navigate',function(){document.title=w.getTitle()||'Monochrome Player'});
w.addEventListener('page-title-updated',function(e){document.title=e.title||'Monochrome Player'});
window.electronNav?.onToggle(function(visible){
  bar.classList.toggle('hidden',!visible);
  w.classList.toggle('fullscreen',!visible);
});
</script>
</body>
</html>`;
}
