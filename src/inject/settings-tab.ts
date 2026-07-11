export const INJECT_SETTINGS_TAB = `
(function(){
  if (document.getElementById('settings-tab-electron-app')) return;
  var sel=document.querySelector('.settings-tabs');
  var sp=document.getElementById('page-settings');
  if(!sel||!sp)return;

  var c=function(v){console.log('ELECTRON_SETTING:'+v)};

  function addTab(name,id){
    var b=document.createElement('button');
    b.className='settings-tab';b.dataset.tab=id;b.textContent=name;
    sel.appendChild(b);
    var d=document.createElement('div');
    d.className='settings-tab-content';d.id='settings-tab-'+id;
    sp.appendChild(d);
    return d;
  }

  function item(label,desc,html){
    return '<div class="setting-item"><div class="info"><span class="label">'+label+'</span>'+(desc?'<span class="description">'+desc+'</span>':'')+'</div>'+html+'</div>';
  }

  function toggle(id,checked){
    return '<label class="toggle-switch"><input type="checkbox" id="'+id+'"'+(checked?' checked':'')+'><span class="slider"></span></label>';
  }

  function textInput(id,val,placeholder){
    return '<input type="text" id="'+id+'" value="'+val+'" placeholder="'+placeholder+'" style="background:var(--input-bg,#1a1a1a);border:1px solid var(--border-color,#333);color:var(--text-color,#eee);padding:6px 10px;border-radius:6px;width:180px">';
  }

  function btn(id,label,color){
    return '<button id="'+id+'" style="background:'+color+';border:none;color:#fff;padding:8px 16px;border-radius:6px;cursor:pointer;font-size:13px;font-weight:500">'+label+'</button>';
  }

  function makeSelect(id,opts,val){
    var h='<select id="'+id+'" style="background:var(--input-bg,#1a1a1a);border:1px solid var(--border-color,#333);color:var(--text-color,#eee);padding:6px 10px;border-radius:6px">';
    for(var i=0;i<opts.length;i++){h+='<option value="'+opts[i][0]+'"'+(opts[i][0]==val?' selected':'')+'>'+opts[i][1]+'</option>';}
    return h+'</select>';
  }

  var is=function(){return 'style="background:var(--input-bg,#1a1a1a);border:1px solid var(--border-color,#333);color:var(--text-color,#eee);padding:8px 12px;border-radius:6px;width:100%;box-sizing:border-box;outline:none;font-size:13px"';};

  var advItem=function(label,desc,html){
    return '<div style="margin:12px 0;padding:0 8px">'+
      '<div style="font-size:13px;font-weight:500;color:var(--text-color,#eee);margin-bottom:2px">'+label+'</div>'+
      '<div style="font-size:12px;color:var(--text-secondary,#888);margin-bottom:6px;line-height:1.4">'+desc+'</div>'+
      html+'</div>';
  };

  var tab=addTab('Desktop App','electron-app');
  tab.innerHTML='<div class="settings-list"><div class="settings-group">'+
    item('Navigation Bar','Show navigation controls in the desktop window',toggle('electron-navbar-toggle',false))+
    item('Close to Tray','Minimize to system tray instead of quitting',toggle('electron-closetotray-toggle',true))+
  '</div><div class="settings-group"><h3 class="group-title" style="font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;color:var(--text-secondary,#888);margin:24px 0 8px 8px">Discord Rich Presence</h3>'+
    item('Enable RPC','Show your listening activity on Discord',toggle('electron-rpc-toggle',true))+
    item('Show Track Title','Display the current track name',toggle('electron-rpc-title-toggle',true))+
    item('Show Artist','Display the artist name',toggle('electron-rpc-artist-toggle',true))+
    item('Show on Idle','Show Discord activity when not playing music',toggle('electron-rpc-idle-toggle',false))+
    item('Show Timestamp','Display elapsed and remaining time',toggle('electron-rpc-timestamp-toggle',true))+
    item('Activity Type','Choose how your activity appears',makeSelect('electron-rpc-activity-type',[[0,'Playing'],[2,'Listening'],[3,'Watching'],[5,'Competing']],2))+
    item('Custom Status','Override status text — {song_name}, {artist}, {status}',textInput('electron-rpc-custom-status','','e.g. Listening to {song_name}'))+
    '<div class="setting-item"><div class="info"><span class="label">Connection</span><span class="description" id="electron-rpc-status">Checking...</span></div>'+
    btn('electron-rpc-reconnect','Reconnect','#5865F2')+
    '</div>'+
  '</div>'+
  '<div class="settings-group">'+
    '<style>.electron-adv{max-height:0;overflow:hidden;transition:max-height .35s ease,opacity .35s ease;opacity:0}.electron-adv.open{max-height:3000px;opacity:1}</style>'+
    '<h3 class="group-title" id="electron-rpc-advanced-header" style="font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;color:var(--text-secondary,#888);margin:24px 0 8px 8px;cursor:pointer;user-select:none">▸ Advanced</h3>'+
    '<div id="electron-rpc-advanced-body" class="electron-adv">'+
    advItem('Custom Details','Override the first line — {song_name}, {artist}, {status}','<input type="text" id="electron-rpc-custom-details" placeholder="e.g. {song_name}" '+is()+'>')+
    advItem('Large Image Text','Tooltip when hovering album art — {song_name}, {artist}','<input type="text" id="electron-rpc-large-image-text" placeholder="Now playing {song_name}" '+is()+'>')+
    advItem('Small Image Key','Discord asset key for a small icon','<input type="text" id="electron-rpc-small-image-key" placeholder="e.g. monochrome_logo" '+is()+'>')+
    advItem('Small Image Text','Tooltip for the small icon — {song_name}, {artist}','<input type="text" id="electron-rpc-small-image-text" placeholder="{status}" '+is()+'>')+
    advItem('','','')+
    '<div style="margin:0 8px;padding-top:12px;border-top:1px solid var(--border-color,#222)">'+
    '<div style="font-size:13px;font-weight:500;color:var(--text-color,#eee);margin-bottom:2px">Custom Buttons</div>'+
    '<div style="font-size:12px;color:var(--text-secondary,#888);margin-bottom:10px;line-height:1.4">Add up to 2 buttons to your activity. Both label and URL required.</div>'+
    '<div style="display:flex;flex-direction:column;gap:10px">'+
    '<div style="display:flex;gap:8px">'+
    '<input type="text" id="electron-rpc-button1-label" placeholder="Button 1 label" '+is()+'>'+
    '<input type="text" id="electron-rpc-button1-url" placeholder="https://..." '+is()+'>'+
    '</div>'+
    '<div style="display:flex;gap:8px">'+
    '<input type="text" id="electron-rpc-button2-label" placeholder="Button 2 label" '+is()+'>'+
    '<input type="text" id="electron-rpc-button2-url" placeholder="https://..." '+is()+'>'+
    '</div>'+
    '</div></div>'+
    '</div>'+
  '</div>'+
  '<div class="settings-group"><h3 class="group-title" style="font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;color:var(--text-secondary,#888);margin:24px 0 8px 8px">About</h3>'+
    '<div style="padding:0 8px">'+
    '<div style="margin:12px 0 4px;font-size:14px;font-weight:600;color:var(--text-color,#eee)">Monochrome Player</div>'+
    '<div style="font-size:12px;color:var(--text-secondary,#888);margin-bottom:4px">Version 1.0.0</div>'+
    '<div style="font-size:12px;color:var(--text-secondary,#888);line-height:1.5;margin-bottom:14px">Electron desktop wrapper for the Monochrome music player web app.</div>'+
    '<a href="https://github.com/kmmiio99o/Monochrome-PC" target="_blank" style="display:inline-flex;align-items:center;gap:4px;color:var(--accent,#5865F2);text-decoration:none;font-size:13px;margin-bottom:6px">GitHub Repository <span style="font-size:11px;opacity:.6">↗</span></a><br>'+
    '<a href="https://github.com/kmmiio99o/Monochrome-PC/issues" target="_blank" style="display:inline-flex;align-items:center;gap:4px;color:var(--accent,#5865F2);text-decoration:none;font-size:13px;margin-bottom:14px">Report Issue <span style="font-size:11px;opacity:.6">↗</span></a>'+
    '<div style="font-size:12px;color:var(--text-secondary,#888);margin-bottom:6px">Developed by kmmiio99o</div>'+
    '</div>'+
  '</div></div>';

  document.getElementById('electron-navbar-toggle').addEventListener('change',function(){c('nav:toggle')});
  document.getElementById('electron-closetotray-toggle').addEventListener('change',function(){c('closeToTray:'+(this.checked?'1':'0'))});
  document.getElementById('electron-rpc-toggle').addEventListener('change',function(){c('rpc:toggle')});
  document.getElementById('electron-rpc-title-toggle').addEventListener('change',function(){c('rpc:showTitle:'+(this.checked?'1':'0'))});
  document.getElementById('electron-rpc-artist-toggle').addEventListener('change',function(){c('rpc:showArtist:'+(this.checked?'1':'0'))});
  document.getElementById('electron-rpc-idle-toggle').addEventListener('change',function(){c('rpc:showOnIdle:'+(this.checked?'1':'0'))});
  document.getElementById('electron-rpc-timestamp-toggle').addEventListener('change',function(){c('rpc:showTimestamp:'+(this.checked?'1':'0'))});
  document.getElementById('electron-rpc-activity-type').addEventListener('change',function(){c('rpc:activityType:'+this.value)});
  document.getElementById('electron-rpc-custom-status').addEventListener('change',function(){c('rpc:customStatus:'+encodeURIComponent(this.value))});
  document.getElementById('electron-rpc-custom-details').addEventListener('change',function(){c('rpc:customDetails:'+encodeURIComponent(this.value))});
  document.getElementById('electron-rpc-large-image-text').addEventListener('change',function(){c('rpc:largeImageText:'+encodeURIComponent(this.value))});
  document.getElementById('electron-rpc-small-image-key').addEventListener('change',function(){c('rpc:smallImageKey:'+encodeURIComponent(this.value))});
  document.getElementById('electron-rpc-small-image-text').addEventListener('change',function(){c('rpc:smallImageText:'+encodeURIComponent(this.value))});
  document.getElementById('electron-rpc-button1-label').addEventListener('change',function(){c('rpc:button1Label:'+encodeURIComponent(this.value))});
  document.getElementById('electron-rpc-button1-url').addEventListener('change',function(){c('rpc:button1Url:'+encodeURIComponent(this.value))});
  document.getElementById('electron-rpc-button2-label').addEventListener('change',function(){c('rpc:button2Label:'+encodeURIComponent(this.value))});
  document.getElementById('electron-rpc-button2-url').addEventListener('change',function(){c('rpc:button2Url:'+encodeURIComponent(this.value))});
  document.getElementById('electron-rpc-advanced-header').addEventListener('click',function(){
    var b=document.getElementById('electron-rpc-advanced-body');
    b.classList.toggle('open');
    this.textContent=(b.classList.contains('open')?'▾':'▸')+' Advanced';
  });
  document.getElementById('electron-rpc-reconnect').addEventListener('click',function(){c('rpc:reconnect')});

  c('sync:request');
})();
`;
