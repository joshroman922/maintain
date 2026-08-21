
"use strict";

function esc(s){ return String(s==null?"":s)
  .replace(/&/g,"&"+"amp;").replace(/</g,"&"+"lt;").replace(/>/g,"&"+"gt;")
  .replace(/\"/g,"&"+"quot;").replace(/'/g,"&#39;"); }
function safeUrl(u){
  u=(u||"").trim(); if(!u) return "";
  if(/^\s*(javascript|data|vbscript|blob|file):/i.test(u)) return "";
  if(/^[a-z][a-z0-9.+-]*:/i.test(u)) return u;
  if(/^\/\//.test(u)) return "https:"+u;
  if(/\./.test(u)) return "https://"+u;
  return "";
}
function uid(){ return Date.now().toString(36)+Math.random().toString(36).slice(2,6); }
function iconOr(n){ return (n&&n.icon) ? n.icon : "\u2726"; }
function openUrl(url){ var a=document.createElement("a"); a.href=url; a.target="_blank"; a.rel="noopener"; document.body.appendChild(a); a.click(); a.remove(); }

var Store=(function(){
  var KEY="maintain:v1", mem=null;
  function folder(name,icon,kids){ return {id:uid(),kind:"folder",name:name,icon:icon,children:kids||[]}; }
  function item(name,icon,url){ return {id:uid(),kind:"item",name:name,icon:icon,url:url||"",note:"",ts:Date.now()}; }
  function defaultTop(){ return [
    folder("Social","\uD83D\uDCAC",[
      item("Instagram","\uD83D\uDCF7","shortcuts://run-shortcut?name="+encodeURIComponent("Maintain Insta")),
      item("Facebook","\uD83D\uDC65","shortcuts://run-shortcut?name="+encodeURIComponent("Maintain Facebook")),
      item("Messenger","\uD83D\uDCAC","shortcuts://run-shortcut?name="+encodeURIComponent("Maintain Messenger")),
      item("X","\u26A1","https://x.com")
    ]),
    folder("Health","\uD83E\uDE7A"),
    folder("Routine / Protocol","\uD83D\uDD01",[
      item("Field Protocol","\uD83C\uDF00","field.html"),
      item("Dawn","\u2600\uFE0F","dawn.html")
    ]),
    folder("Work","\uD83D\uDEE0\uFE0F"),
    folder("Files","\uD83D\uDDC2\uFE0F"),
    folder("Study / Journal","\uD83D\uDCD3")
  ];}
  function defaultSystem(){ return {
    how:"Your top categories always circle the core. Tap any category to descend. The centre neon core opens the System panel.",
    subagents:"Planned: each node can hand off to a Gemini sub-agent via proxy.",
    buttons:"Orb body — back one level.\nCentre neon core — System panel.\nBottom Command Belt — Phone, Messages, Camera + Gemini.\nLeft gears — Settings.",
    goal:"Maintain is a personal life-OS console pinned to the iPhone home screen.",
    handoff:"PROJECT: Maintain — single-file HTML life-OS console.",
    rules:"WIP = 1. No API keys in the static site. Keep it a single self-contained HTML file.",
    files:"This file (index.html) is the whole app."
  };}
  function fresh(){ return { v:7, tree:{id:"root",kind:"folder",name:"HUB",children:defaultTop()}, system:defaultSystem() }; }
  function migrate(old){
    var root={id:"root",kind:"folder",name:"HUB",children:[]};
    (old.sections||[]).forEach(function(s){
      var f={id:s.id||uid(),kind:"folder",name:s.name||"Untitled",icon:s.icon,children:[]};
      (((old.items||{})[s.id])||[]).forEach(function(it){
        f.children.push({id:it.id||uid(),kind:"item",name:it.title||"Untitled",url:it.url||"",note:it.note||"",ts:it.ts});
      });
      root.children.push(f);
    });
    if(!root.children.length) root.children=defaultTop();
    return { v:7, tree:root, system:defaultSystem() };
  }
  function load(){
    if(mem) return mem;
    try{
      var raw=localStorage.getItem(KEY), p=raw?JSON.parse(raw):null;
      if(!p) mem=fresh();
      else if(p.tree) mem=p;
      else if(p.sections) mem=migrate(p);
      else mem=fresh();
    }catch(e){ mem=fresh(); }
    if(!mem||!mem.tree) mem=fresh();
    if(!mem.system) mem.system=defaultSystem();
    return mem;
  }
  function save(){ try{ localStorage.setItem(KEY,JSON.stringify(mem)); }catch(e){} }
  return { data:load, commit:save, reset:function(){ mem=fresh(); save(); }, defaultSystem:defaultSystem };
})();

function hexPts(cx,cy,r){ var p=[]; for(var k=0;k<6;k++){ var a=(k*60-90)*Math.PI/180; p.push((cx+r*Math.cos(a)).toFixed(1)+","+(cy+r*Math.sin(a)).toFixed(1)); } return p.join(" "); }
function orbSVG(){
  var cells="", rings=[[0,0]], R=16.5;
  [[32,6],[56,12],[78,18]].forEach(function(cfg){ var rad=cfg[0],n=cfg[1];
    for(var k=0;k<n;k++){ var a=(360/n*k)*Math.PI/180; rings.push([rad*Math.cos(a),rad*Math.sin(a)]); } });
  rings.forEach(function(c){ var d=Math.hypot(c[0],c[1]); var lit=d<22||(Math.random()<0.22);
    var fill=lit?'rgba(110,230,250,.58)':'rgba(18,48,62,.55)';
    cells+='<polygon points="'+hexPts(100+c[0],100+c[1],R)+'" fill="'+fill+'" stroke="rgba(160,245,255,.5)" stroke-width="0.9"/>'; });
  return '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><defs>'
    +'<radialGradient id="og" cx="40%" cy="34%" r="68%"><stop offset="0%" stop-color="#e8fcff"/>'
    +'<stop offset="22%" stop-color="#7ad4e8"/><stop offset="48%" stop-color="#1e7a92"/>'
    +'<stop offset="78%" stop-color="#0a2a38"/><stop offset="100%" stop-color="#020c12"/></radialGradient>'
    +'<radialGradient id="spec" cx="35%" cy="28%" r="40%"><stop offset="0%" stop-color="rgba(255,255,255,.45)"/>'
    +'<stop offset="100%" stop-color="rgba(255,255,255,0)"/></radialGradient>'
    +'<clipPath id="oc"><circle cx="100" cy="100" r="90"/></clipPath></defs>'
    +'<g clip-path="url(#oc)"><circle cx="100" cy="100" r="90" fill="url(#og)"/>'+cells
    +'<ellipse cx="72" cy="60" rx="34" ry="20" fill="url(#spec)"/>'
    +'<ellipse cx="118" cy="128" rx="22" ry="12" fill="rgba(0,20,40,.25)"/></g>'
    +'<circle cx="100" cy="100" r="90" fill="none" stroke="rgba(170,250,255,.7)" stroke-width="1.8"/>'
    +'<circle cx="100" cy="100" r="93" fill="none" stroke="rgba(90,214,230,.25)" stroke-width="3"/></svg>';
}

var root=Store.data().tree;
var path=[root];
var open=true;
function cur(){ return path[path.length-1]; }
var ORB_SVG=orbSVG();

var stage=document.getElementById("stage");
var orbit=document.getElementById("orbit");
var hint=document.getElementById("hint");
var crumb=document.getElementById("crumb");
var flash=document.getElementById("flash");
var veil=document.getElementById("veil");
var sheet=document.getElementById("sheet");

function fit(){
  if(!stage) return;
  stage.style.height="";
  var box=stage.getBoundingClientRect();
  var need=348;
  var s=Math.max(0.62, Math.min(1, Math.min(box.width-12, box.height-12)/need));
  document.documentElement.style.setProperty("--hub-scale", s.toFixed(3));
}

function buildStage(){
  var c=document.createElement("div"); c.className="core"; c.id="core";
  c.addEventListener("click",function(e){ e.stopPropagation(); systemSheet(false); });
  orbit.appendChild(c);
  renderLayers();
}

function project(){
  open=true;
  renderLayers(); setCrumb();
  var deep=path.length>1;
  hint.textContent = deep ? "Tap centre to go back" : "";
  hint.style.opacity = deep ? "" : "0";
}
function closeOrbit(){ path=[root]; project(); }
function setOrb(){ var l=document.getElementById("orbLbl"); if(!l) return; var c=cur();
  l.textContent=(c===root)?"MAINTAIN":(c.name.length>12?c.name.slice(0,11)+"…":c.name.toUpperCase()); }
function setCrumb(){ crumb.innerHTML=path.map(function(n,i){ var nm=(n===root?"HUB":n.name).toUpperCase();
  return i===path.length-1?"<b>"+esc(nm)+"</b>":esc(nm); }).join(" › "); }

function renderLayers(){
  Array.prototype.slice.call(orbit.querySelectorAll(".layer")).forEach(function(l){l.remove();});
  var top=path.length-1;
  var box=stage.getBoundingClientRect();
  var R=Math.min(128, Math.max(78, box.width/2 - 52), Math.max(78, box.height/2 - 42));
  var Rsub=Math.min(100, Math.max(64, box.width/2 - 48), Math.max(64, box.height/2 - 52));
  path.forEach(function(level,depth){
    var dTop=top-depth, isFront=(dTop===0), isRoot=(depth===0);
    var layer=document.createElement("div"); layer.className="layer"+(isFront?" front":" settled");
    if(isRoot){
      layer.innerHTML=
         '<div class="ring ticks"></div><div class="ring r1"></div><div class="sweep"></div>'
        +'<div class="ring r2"></div><div class="ring r3"></div><div class="base"></div>'
        +'<div class="orb" id="orb"><div class="glow"></div>'+ORB_SVG+'<span class="lbl" id="orbLbl">MAINTAIN</span></div>';
      [0,90,180,270].forEach(function(deg){
        var aa=(deg-90)*Math.PI/180, rr=150;
        var t=document.createElement("div"); t.className="tri";
        t.style.transform="translate("+(Math.cos(aa)*rr-6).toFixed(1)+"px,"+(Math.sin(aa)*rr-4).toFixed(1)+"px) rotate("+deg+"deg)";
        layer.appendChild(t);
      });
    } else {
      var hub=document.createElement("div"); hub.className="hub";
      hub.style.setProperty("--hx","0px"); hub.style.setProperty("--hy","0px");
      hub.innerHTML='<span class="hi">'+esc(iconOr(level))+'</span><span class="hc">'+esc(level.name)+'</span>';
      if(isFront) hub.addEventListener("click",function(e){ e.stopPropagation(); ascend(); });
      layer.appendChild(hub);
    }
    var kids=(level.children||[]).map(function(k){return {t:"node",node:k};});
    if(isFront) kids.push({t:"add"});
    var n=Math.max(kids.length,1), radius=isRoot?R:Rsub;
    kids.forEach(function(sl,idx){
      var a=(-90 + 360/n*idx)*Math.PI/180;
      var el=document.createElement("div");
      el.style.setProperty("--x",(Math.cos(a)*radius).toFixed(1)+"px");
      el.style.setProperty("--y",(Math.sin(a)*radius).toFixed(1)+"px");
      if(isFront) el.style.transitionDelay=(idx*0.03)+"s";
      if(sl.t==="add"){
        el.className="node addch"+(isRoot?"":" sub"); el.innerHTML='<span class="ni">+</span><span class="cap">Add</span>';
        if(isFront) wire(el, function(){ addSheet(); }, null);
      }else{
        var nd=sl.node, isFolder=(nd.kind!=="item");
        el.className="node"+(isRoot?"":" sub")+(isFolder?" folder":"");
        var badge=isFolder ? (nd.children&&nd.children.length?'<span class="ct">'+nd.children.length+'</span>':'')
                           : (safeUrl(nd.url)?'<span class="lk">↗</span>':'');
        el.innerHTML='<span class="ni">'+esc(iconOr(nd))+'</span>'+badge+'<span class="cap">'+esc(nd.name)+'</span>';
        if(isFront) wire(el, function(){ isFolder?descend(nd):openItem(nd); }, function(){ manage(nd); });
      }
      layer.appendChild(el);
    });
    if(!isFront){
      var sc=Math.pow(0.86,dTop), op=(0.3*Math.pow(0.6,dTop-1));
      layer.style.transform="scale("+sc.toFixed(3)+")";
      layer.style.opacity=op.toFixed(3);
      layer.style.filter="blur(1.3px)";
      layer.style.pointerEvents="none";
    }
    orbit.appendChild(layer);
    if(isFront){ requestAnimationFrame(function(){ requestAnimationFrame(function(){ layer.classList.add("on"); }); }); }
  });
}

function wire(el,onTap,onHold){
  var timer=null, held=false;
  el.addEventListener("touchstart",function(){ held=false; if(onHold) timer=setTimeout(function(){ held=true; if(navigator.vibrate)navigator.vibrate(10); onHold(); },480); },{passive:true});
  el.addEventListener("touchmove",function(){ clearTimeout(timer); },{passive:true});
  el.addEventListener("touchend",function(e){ clearTimeout(timer); if(held){ e.preventDefault(); } },{passive:false});
  el.addEventListener("click",function(e){ e.stopPropagation(); if(held){ held=false; return; } onTap(); });
}

function descend(node){
  var front=orbit.querySelector(".layer.front");
  if(front){
    front.classList.remove("front");
    front.style.transform="scale(0.86)"; front.style.opacity="0.3";
    front.style.filter="blur(1.3px)"; front.style.pointerEvents="none";
    setTimeout(function(){ path.push(node); project(); }, 280);
  } else { path.push(node); project(); }
}
function ascend(){
  if(path.length<=1) return;
  var front=orbit.querySelector(".layer.front");
  if(front){ front.classList.remove("on"); front.style.pointerEvents="none";
    setTimeout(function(){ path.pop(); project(); }, 240);
  } else { path.pop(); project(); }
}
function openItem(node){ var url=safeUrl(node.url);
  if(url) return openUrl(url);
  if(node.note) return showFlash(node.note);
  showFlash(node.name); }
function showFlash(msg){ flash.textContent=msg; flash.classList.add("on"); clearTimeout(showFlash._t); showFlash._t=setTimeout(function(){ flash.classList.remove("on"); },1900); }

function showSheet(html){ sheet.innerHTML=html; veil.classList.add("on"); }
function closeSheet(){ veil.classList.remove("on"); }

var formTarget=null;
function formHTML(title,cid,kind,vals){
  vals=vals||{};
  return '<div class="grip"></div>'
    +'<div class="shead"><button class="back" data-act="sheet-close" aria-label="Close">›</button>'
    +'<div class="tt"><div class="cid">'+esc(cid)+'</div><div class="nm">'+esc(title)+'</div></div></div>'
    +'<div class="mform '+kind+'" id="mform">'
    +'<div class="seg"><button data-kind="folder" class="'+(kind==="folder"?"on":"")+'">Folder</button>'
    +'<button data-kind="item" class="'+(kind==="item"?"on":"")+'">Link / note</button></div>'
    +'<div class="fld"><label>Name</label><div class="rowin">'
    +'<input id="f-icon" class="ic" autocomplete="off" placeholder="✦" maxlength="3" value="'+esc(vals.icon||"")+'">'
    +'<input id="f-name" autocomplete="off" placeholder="What is it?" value="'+esc(vals.name||"")+'"></div></div>'
    +'<div class="linkonly">'
    +'<div class="fld"><label>Link (optional)</label><input id="f-url" autocomplete="off" inputmode="url" placeholder="https:// or app link" value="'+esc(vals.url||"")+'"></div>'
    +'<div class="fld"><label>Note (optional)</label><textarea id="f-note" placeholder="Details…">'+esc(vals.note||"")+'</textarea></div>'
    +'</div></div>'
    +'<div class="acts"><button class="btn ghost" data-act="sheet-close">Cancel</button><button class="btn go" data-act="form-save">Save</button></div>';
}
function addSheet(){ formTarget=null; showSheet(formHTML("New in "+cur().name,"ADD","folder",{}));
  setTimeout(function(){var t=document.getElementById("f-name"); if(t)t.focus();},60); }
function editSheet(node){ formTarget=node; showSheet(formHTML("Edit","EDIT",(node.kind==="item"?"item":"folder"),node));
  setTimeout(function(){var t=document.getElementById("f-name"); if(t)t.focus();},60); }
function formSave(){
  var mform=document.getElementById("mform");
  var kind=mform.classList.contains("item")?"item":"folder";
  var name=(document.getElementById("f-name").value||"").trim();
  if(!name){ document.getElementById("f-name").focus(); return; }
  var icon=(document.getElementById("f-icon").value||"").trim();
  var url=kind==="item"?(document.getElementById("f-url").value||"").trim():"";
  var note=kind==="item"?(document.getElementById("f-note").value||"").trim():"";
  if(formTarget){
    formTarget.name=name; formTarget.icon=icon||formTarget.icon;
    if(kind==="item"){ formTarget.kind="item"; formTarget.url=url; formTarget.note=note; delete formTarget.children; }
    else if(formTarget.kind==="item"){ formTarget.kind="folder"; formTarget.children=formTarget.children||[]; delete formTarget.url; delete formTarget.note; }
  }else{
    cur().children.push( kind==="item"
      ? {id:uid(),kind:"item",name:name,icon:icon,url:url,note:note,ts:Date.now()}
      : {id:uid(),kind:"folder",name:name,icon:icon,children:[]} );
  }
  Store.commit(); closeSheet(); project();
}

function manage(node){
  formTarget=node; var url=safeUrl(node.url);
  showSheet(
    '<div class="grip"></div>'
    +'<div class="shead"><button class="back" data-act="sheet-close" aria-label="Close">›</button>'
    +'<div class="tt"><div class="cid">'+(node.kind==="item"?"ITEM":"FOLDER")+'</div><div class="nm">'+esc(node.name)+'</div></div></div>'
    +(node.note?'<div class="doc" style="margin-bottom:12px">'+esc(node.note)+'</div>':'')
    +(url?'<button class="btn go full" data-act="open-managed">Open link</button>':'')
    +'<button class="btn ghost full" data-act="edit-managed">Edit</button>'
    +'<button class="btn danger full" data-act="del-managed">Delete</button>'
  );
}
function delManaged(){
  var node=formTarget; if(!node) return;
  var kids=cur().children, n=(node.children&&node.children.length)||0;
  if(n>0 && !confirm('Delete "'+node.name+'" and everything inside it?')) return;
  for(var i=0;i<kids.length;i++){ if(kids[i].id===node.id){ kids.splice(i,1); break; } }
  Store.commit(); closeSheet(); project();
}

var SYS_SECS=[["how","How it works"],["subagents","Subagents"],["buttons","Buttons — layout & functions"],
  ["goal","Goal"],["handoff","Handoff"],["rules","Rules"],["files","Attached files"]];
function systemSheet(edit){
  var sys=Store.data().system||{};
  if(edit){
    var flds=SYS_SECS.map(function(s){
      return '<div class="fld"><label>'+esc(s[1])+'</label><textarea id="sys-'+s[0]+'">'+esc(sys[s[0]]||"")+'</textarea></div>';
    }).join("");
    showSheet(
      '<div class="grip"></div>'
      +'<div class="shead"><button class="back" data-act="sys-view" aria-label="Back">‹</button>'
      +'<div class="tt"><div class="cid">SYSTEM</div><div class="nm">Edit</div></div></div>'
      +'<div class="list">'+flds+'</div>'
      +'<div class="acts"><button class="btn ghost" data-act="sys-view">Cancel</button><button class="btn go" data-act="sys-save">Save</button></div>'
    );
    return;
  }
  var body=SYS_SECS.map(function(s){
    var v=(sys[s[0]]||"").trim();
    return '<div class="sec"><div class="sh">'+esc(s[1])+'</div>'
      +'<div class="sb'+(v?"":" empty")+'">'+(v?esc(v):"(not set — tap Edit)")+'</div></div>';
  }).join("");
  showSheet(
    '<div class="grip"></div>'
    +'<div class="shead"><button class="back" data-act="sheet-close" aria-label="Close">›</button>'
    +'<div class="tt"><div class="cid">SYSTEM</div><div class="nm">How Maintain works</div></div>'
    +'<button class="kill" data-act="sys-edit">EDIT</button></div>'
    +'<div class="doc list">'+body+'</div>'
    +'<button class="btn ghost full" data-act="reset">Reset to defaults</button>'
    +'<div class="ver">MAINTAIN v8.0 · weather clock</div>'
  );
}
function sysSave(){
  var sys=Store.data().system||(Store.data().system={});
  SYS_SECS.forEach(function(s){ var el=document.getElementById("sys-"+s[0]); if(el) sys[s[0]]=el.value; });
  Store.commit(); systemSheet(false);
}

document.addEventListener("click",function(e){
  var t=e.target.closest("[data-act],[data-kind]"); if(!t) return;
  if(t.hasAttribute("data-kind")){
    var mf=document.getElementById("mform"); if(!mf) return;
    mf.classList.remove("folder","item"); mf.classList.add(t.getAttribute("data-kind"));
    Array.prototype.slice.call(mf.querySelectorAll(".seg button")).forEach(function(b){ b.classList.toggle("on",b===t); });
    return;
  }
  switch(t.getAttribute("data-act")){
    case "sheet-close": return closeSheet();
    case "form-save": return formSave();
    case "open-managed": var u=safeUrl(formTarget&&formTarget.url); closeSheet(); if(u) openUrl(u); return;
    case "edit-managed": return editSheet(formTarget);
    case "del-managed": return delManaged();
    case "sys-view": return systemSheet(false);
    case "sys-edit": return systemSheet(true);
    case "sys-save": return sysSave();
    case "reset": if(confirm("Reset Maintain to defaults? Clears all categories and system notes.")){ Store.reset(); root=Store.data().tree; path=[root]; closeSheet(); project(); } return;
  }
});
veil.addEventListener("click",function(e){ if(e.target===veil) closeSheet(); });
document.addEventListener("click",function(e){
  if(veil.classList.contains("on")) return;
  if(e.target.closest(".orb,.node,.hub,.core,#cmd-belt,#ai-wrap,#gears-btn,.hud-top,#wx-clock,#dayline,#mp-fab,#mp-wrap")) return;
  if(path.length>1){ ascend(); }
});
window.addEventListener("resize",function(){ fit(); renderLayers(); });

function runShortcut(name){
  var url = "shortcuts://run-shortcut?name=" + encodeURIComponent(name);
  window.location.href = url;
}

document.getElementById("cmd-phone").onclick = function(){ runShortcut("Maintain Phone"); };
document.getElementById("cmd-msg").onclick = function(){ runShortcut("Maintain Messages"); };
document.getElementById("cmd-cam").onclick = function(){ runShortcut("maintain Camara"); };
document.getElementById("gears-btn").onclick = function(){ runShortcut("Maintain Settings"); };

document.getElementById("cmd-ai").onclick = function(){
  document.getElementById("ai-wrap").classList.add("open");
};
document.getElementById("ai-close").onclick = function(){
  document.getElementById("ai-wrap").classList.remove("open");
};
document.getElementById("ai-wrap").onclick = function(e){
  if(e.target === document.getElementById("ai-wrap")) document.getElementById("ai-wrap").classList.remove("open");
};
document.getElementById("ai-send").onclick = function(){
  var input = document.getElementById("ai-input");
  var txt = (input.value || "").trim();
  if(!txt) return;
  var body = document.getElementById("ai-body");
  body.innerHTML += '<div class="msg bot" style="margin-left:auto;background:rgba(90,214,230,.08)">'+esc(txt)+'</div>';
  body.innerHTML += '<div class="msg bot">Proxy not connected yet. Real Gemini replies need the backend.</div>';
  input.value = "";
  body.scrollTop = body.scrollHeight;
};

fit();
try{ buildStage(); project(); }
catch(err){
  fit();
  orbit.innerHTML='<div style="position:fixed;left:16px;right:16px;top:80px;color:#5ad6e6;font:12px ui-monospace,monospace;line-height:1.5;text-align:center">Init error — tell Grok:<br>'+String((err&&err.message)||err)+'</div>';
}


(function(){
  var K={url:"mp.url",secret:"mp.secret"};
  var $=function(id){return document.getElementById(id);};
  function get(k){try{return localStorage.getItem(k)||"";}catch(e){return"";}}
  function set(k,v){try{localStorage.setItem(k,v);}catch(e){}}
  function say(msg,err){var s=$("mp-status");s.textContent=msg;s.className=err?"err":"";}
  $("mp-url").value=get(K.url);
  $("mp-secret").value=get(K.secret);
  $("mp-fab").onclick=function(){$("mp-wrap").classList.add("open");};
  $("mp-close").onclick=function(){$("mp-wrap").classList.remove("open");};
  $("mp-wrap").onclick=function(e){if(e.target===$("mp-wrap"))$("mp-wrap").classList.remove("open");};
  $("mp-save").onclick=function(){
    set(K.url,$("mp-url").value.trim());
    set(K.secret,$("mp-secret").value);
    say("Config saved on this device.");
  };
  function cfg(){
    var url=get(K.url),secret=get(K.secret);
    if(!url||!secret){say("Set the URL and secret in ⚙︎ Setup first.",true);return null;}
    return {url:url,secret:secret};
  }
  $("mp-pull").onclick=function(){
    var c=cfg();if(!c)return;
    var path=$("mp-path").value.trim()||"index.html";
    say("Pulling "+path+" …");
    fetch(c.url,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},
      body:JSON.stringify({secret:c.secret,path:path,mode:"read"})})
      .then(function(r){return r.json();})
      .then(function(d){
        if(d.error){say("Error: "+d.error,true);return;}
        if(d.exists===false){say("File doesn't exist yet — you can create it by pushing.");$("mp-content").value="";return;}
        $("mp-content").value=d.content||"";
        say("Loaded "+path+" ("+(d.content?d.content.length:0)+" chars). Edit, then Push.");
      })
      .catch(function(e){say("Network error: "+e,true);});
  };
  $("mp-push").onclick=function(){
    var c=cfg();if(!c)return;
    var path=$("mp-path").value.trim()||"index.html";
    var content=$("mp-content").value;
    if(!content){say("Nothing to push — content is empty.",true);return;}
    if(!confirm("Commit "+content.length+" chars to "+path+"?"))return;
    say("Pushing "+path+" …");
    fetch(c.url,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},
      body:JSON.stringify({secret:c.secret,path:path,mode:"write",
        content:content,message:$("mp-msg").value.trim()||"Maintain update"})})
      .then(function(r){return r.json();})
      .then(function(d){
        if(d.error){say("Error: "+d.error,true);return;}
        var st=d.status||(d.body&&d.body.commit?200:0);
        if(st>=200&&st<300){
          var sha=d.body&&d.body.commit?d.body.commit.sha:"";
          say("✓ Committed"+(sha?" ("+sha.slice(0,7)+")":"")+".\nGitHub Pages will redeploy in ~1 min.");
        } else {
          say("GitHub responded "+st+":\n"+JSON.stringify(d.body||d,null,2),true);
        }
      })
      .catch(function(e){say("Network error: "+e,true);});
  };
})();

/* ——— v8 weather clock + day timeline ——— */
(function(){
  var LAT=38.2967, LON=-85.7600;
  var WX_URL="https://api.open-meteo.com/v1/forecast?latitude="+LAT+"&longitude="+LON
    +"&current=temperature_2m,weather_code,is_day,cloud_cover,apparent_temperature"
    +"&hourly=temperature_2m,weather_code,precipitation_probability,is_day,cloud_cover"
    +"&daily=sunrise,sunset&timezone=America/Indiana/Indianapolis&forecast_days=1&temperature_unit=fahrenheit";
  var WX_CACHE="maintain:v8:wx";
  var TL_KEY="maintain:v8:timeline";

  function skyKey(code, isDay){
    var d=!!isDay;
    if(code==null) return d?"clear-day":"clear-night";
    if(code===0) return d?"clear-day":"clear-night";
    if(code<=2) return d?"cloudy-day":"cloudy-night";
    if(code===3) return "overcast";
    if(code===45||code===48) return "overcast";
    if(code>=71&&code<=77) return "snow";
    if(code>=85&&code<=86) return "snow";
    if(code>=95) return "storm";
    if(code>=51) return "rain";
    return d?"cloudy-day":"cloudy-night";
  }
  function wmoLabel(code){
    var map={0:"Clear",1:"Mostly Clear",2:"Partly Cloudy",3:"Overcast",
      45:"Fog",48:"Rime Fog",51:"Light Drizzle",53:"Drizzle",55:"Heavy Drizzle",
      61:"Light Rain",63:"Rain",65:"Heavy Rain",71:"Snow",73:"Snow",75:"Heavy Snow",
      80:"Showers",81:"Showers",82:"Heavy Showers",95:"Thunderstorm",96:"T-Storm",99:"T-Storm"};
    return map[code]||"Partly Cloudy";
  }
  function wmoIco(code, isDay){
    if(code==null) return isDay?"☀️":"🌙";
    if(code===0) return isDay?"☀️":"🌙";
    if(code<=2) return isDay?"⛅":"☁️";
    if(code===3||code===45||code===48) return "☁️";
    if(code>=71&&code<=86) return "❄️";
    if(code>=95) return "⚡";
    if(code>=51) return "🌧️";
    return "☁️";
  }
  function pad(n){ return (n<10?"0":"")+n; }
  function fmtTime(d){
    var h=d.getHours(), m=d.getMinutes(), ap=h>=12?"PM":"AM";
    h=h%12; if(!h) h=12;
    return h+":"+pad(m)+" "+ap;
  }
  function fmtDate(d){
    return d.toLocaleDateString("en-US",{weekday:"short", month:"short", day:"numeric"});
  }
  function parseISO(s){
    if(!s) return null;
    var d=new Date(s);
    return isNaN(d.getTime())?null:d;
  }
  function hmToMin(hhmm){
    var p=String(hhmm||"07:30").split(":");
    return (+p[0])*60+(+p[1]||0);
  }
  function minToHM(mins){
    mins=((mins%1440)+1440)%1440;
    return pad(Math.floor(mins/60))+":"+pad(mins%60);
  }

  /* clock geometry: 24 at top, 6 right, 12 bottom, 18 left */
  function hourAngle(h){ return (h/24)*Math.PI*2 - Math.PI/2; }

  function buildDial(root){
    var dial=root.querySelector(".wx-dial");
    dial.innerHTML="";
    var i, a, el, rTick, rNum, rHour, rBead;
    function pxR(frac){ return (root.clientWidth/2)*frac; }
    rTick = 0.91; rNum=1.04; rHour=1.16; rBead=0.91;
    for(i=0;i<24;i++){
      a=(i/24)*360;
      el=document.createElement("div");
      el.className="wx-tick"+(i%6===0?" major":"");
      el.style.transform="rotate("+a+"deg) translateY(-"+Math.round(pxR(rTick))+"px)";
      dial.appendChild(el);
    }
    [["24",0],["6",6],["12",12],["18",18]].forEach(function(pair){
      var ang=hourAngle(pair[1]);
      el=document.createElement("div");
      el.className="wx-num";
      el.textContent=pair[0];
      el.style.transform="translate("+Math.round(Math.cos(ang)*pxR(rNum))+"px,"+Math.round(Math.sin(ang)*pxR(rNum))+"px)";
      dial.appendChild(el);
    });
    for(i=3;i<24;i+=6){
      var angH=hourAngle(i);
      el=document.createElement("div");
      el.className="wx-hour";
      el.id="wx-h-"+i;
      el.innerHTML='<span class="ico"></span>';
      el.style.left="50%"; el.style.top="50%";
      el.style.transform="translate("+Math.round(Math.cos(angH)*pxR(rHour))+"px,"+Math.round(Math.sin(angH)*pxR(rHour))+"px)";
      dial.appendChild(el);
    }
    el=document.createElement("div");
    el.className="wx-bead"; el.id="wx-bead";
    dial.appendChild(el);
  }

  function placeBead(fracHour){
    var root=document.getElementById("wx-clock");
    var bead=document.getElementById("wx-bead");
    if(!root||!bead) return;
    var r=(root.clientWidth/2)*0.91;
    var ang=hourAngle(fracHour);
    bead.style.transform="translate("+Math.round(Math.cos(ang)*r)+"px,"+Math.round(Math.sin(ang)*r)+"px)";
  }

  function applySky(key){
    var sky=document.getElementById("wx-sky");
    if(!sky) return;
    sky.style.backgroundImage="url('wx/"+key+".jpg')";
    sky.classList.toggle("night", /night/.test(key));
  }

  function paintClock(now, data){
    document.getElementById("wx-time").textContent=fmtTime(now);
    document.getElementById("wx-date").textContent=fmtDate(now);
    var cur=data&&data.current;
    if(cur){
      var t=Math.round(cur.temperature_2m);
      document.getElementById("wx-temp").innerHTML=esc(String(t))+"<small>°</small>";
      document.getElementById("wx-cond").textContent=wmoLabel(cur.weather_code);
      applySky(skyKey(cur.weather_code, cur.is_day));
      var isDay=!!cur.is_day;
      var sunEl=document.getElementById("wx-sun");
      var rise=data.daily&&parseISO(data.daily.sunrise&&data.daily.sunrise[0]);
      var set=data.daily&&parseISO(data.daily.sunset&&data.daily.sunset[0]);
      var riseS=rise?fmtTime(rise).replace(" ",""):"";
      var setS=set?fmtTime(set).replace(" ",""):"";
      sunEl.innerHTML="<b>"+(isDay?"DAY":"NIGHT")+"</b><span>"+esc(riseS)+" → "+esc(setS)+"</span>";
    }
    if(data&&data.hourly&&data.hourly.weather_code){
      var codes=data.hourly.weather_code, days=data.hourly.is_day;
      for(var h=3;h<24;h+=6){
        var node=document.getElementById("wx-h-"+h);
        if(!node) continue;
        var ico=node.querySelector(".ico");
        if(ico) ico.textContent=wmoIco(codes[h], days&&days[h]);
      }
    }
    placeBead(now.getHours()+now.getMinutes()/60+now.getSeconds()/3600);
  }

  var wxData=null;
  try{ wxData=JSON.parse(localStorage.getItem(WX_CACHE)||"null"); }catch(e){ wxData=null; }
  if(!wxData||!wxData.current){
    wxData={current:{temperature_2m:72,weather_code:2,is_day:1},daily:{sunrise:["2026-08-21T07:02:00"],sunset:["2026-08-21T20:24:00"]},hourly:{weather_code:[0,0,0,0,0,1,2,2,2,2,2,3,3,2,2,2,2,1,0,0,0,0,0,0],is_day:[0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0]}};
  }

  function tickWx(){
    paintClock(new Date(), wxData);
  }

  function fetchWx(){
    fetch(WX_URL).then(function(r){ return r.json(); }).then(function(d){
      if(!d||!d.current) return;
      wxData=d;
      try{ localStorage.setItem(WX_CACHE, JSON.stringify(d)); }catch(e){}
      paintClock(new Date(), wxData);
    }).catch(function(){ /* keep cache / clock still runs */ });
  }

  /* ——— Timeline 7:30–21:00 ——— */
  var DAY_START=7*60+30, DAY_END=21*60;
  var DAY_SPAN=DAY_END-DAY_START;
  function defaultEvents(){
    return [
      {id:"dawn", time:"07:30", name:"Dawn", icon:"☀️", url:"dawn.html", kind:"protocol"},
      {id:"field", time:"20:30", name:"Field Protocol", icon:"🌀", url:"field.html", kind:"protocol"}
    ];
  }
  function loadEvents(){
    try{
      var raw=localStorage.getItem(TL_KEY);
      if(raw){ var p=JSON.parse(raw); if(Array.isArray(p)&&p.length) return p; }
    }catch(e){}
    var seeded=defaultEvents();
    saveEvents(seeded);
    return seeded;
  }
  function saveEvents(list){ try{ localStorage.setItem(TL_KEY, JSON.stringify(list)); }catch(e){} }

  var tlEvents=loadEvents();
  var tlTarget=null;

  function dayPct(now){
    var mins=now.getHours()*60+now.getMinutes()+now.getSeconds()/60;
    var p=(mins-DAY_START)/DAY_SPAN;
    return Math.max(0, Math.min(1, p));
  }
  function eventPct(ev){
    var p=(hmToMin(ev.time)-DAY_START)/DAY_SPAN;
    return Math.max(0, Math.min(1, p));
  }

  function renderTimeline(){
    var track=document.getElementById("dl-track-wrap");
    if(!track) return;
    var now=new Date();
    var pct=dayPct(now);
    document.getElementById("dl-fill").style.width=(pct*100).toFixed(2)+"%";
    document.getElementById("dl-now").style.left=(pct*100).toFixed(2)+"%";
    document.getElementById("dl-pct").innerHTML=Math.round(pct*100)+"%<small>DAY</small>";
    Array.prototype.slice.call(track.querySelectorAll(".dl-ev")).forEach(function(n){ n.remove(); });
    tlEvents.forEach(function(ev){
      var el=document.createElement("button");
      el.type="button";
      el.className="dl-ev"+(eventPct(ev)<=pct?" past":"");
      el.style.left=(eventPct(ev)*100).toFixed(2)+"%";
      el.innerHTML=esc(ev.icon||"✦");
      el.title=(ev.time||"")+" "+(ev.name||"");
      el.addEventListener("click", function(e){ e.stopPropagation(); openEvent(ev); });
      track.appendChild(el);
    });
  }

  function openEvent(ev){
    tlTarget=ev;
    var url=safeUrl(ev.url);
    showSheet(
      '<div class="grip"></div>'
      +'<div class="shead"><button class="back" data-act="sheet-close" aria-label="Close">›</button>'
      +'<div class="tt"><div class="cid">'+(ev.kind||"EVENT").toUpperCase()+' · '+esc(ev.time)+'</div>'
      +'<div class="nm">'+esc(ev.icon||"")+' '+esc(ev.name)+'</div></div></div>'
      +(url?'<button class="btn go full" data-act="tl-open">Open</button>':'')
      +'<button class="btn ghost full" data-act="tl-edit">Edit</button>'
      +'<button class="btn danger full" data-act="tl-del">Remove from today</button>'
    );
  }
  function addEventSheet(vals){
    vals=vals||{};
    tlTarget=vals.id?vals:null;
    showSheet(
      '<div class="grip"></div>'
      +'<div class="shead"><button class="back" data-act="sheet-close" aria-label="Close">›</button>'
      +'<div class="tt"><div class="cid">TODAY</div><div class="nm">'+(tlTarget?"Edit event":"Add reminder")+'</div></div></div>'
      +'<div class="fld"><label>Time</label><input id="tl-time" type="time" value="'+esc(vals.time||"12:00")+'"></div>'
      +'<div class="fld"><label>Name</label><div class="rowin">'
      +'<input id="tl-icon" class="ic" maxlength="3" placeholder="✦" value="'+esc(vals.icon||"")+'" autocomplete="off">'
      +'<input id="tl-name" placeholder="Dawn, Field, reminder…" value="'+esc(vals.name||"")+'" autocomplete="off"></div></div>'
      +'<div class="fld"><label>Link (optional)</label><input id="tl-url" placeholder="dawn.html or https://" value="'+esc(vals.url||"")+'" autocomplete="off"></div>'
      +'<div class="acts"><button class="btn ghost" data-act="sheet-close">Cancel</button>'
      +'<button class="btn go" data-act="tl-save">Save</button></div>'
    );
    setTimeout(function(){ var n=document.getElementById("tl-name"); if(n) n.focus(); }, 50);
  }
  function saveEventFromForm(){
    var time=(document.getElementById("tl-time").value||"").trim();
    var name=(document.getElementById("tl-name").value||"").trim();
    if(!time||!name){ (name?document.getElementById("tl-time"):document.getElementById("tl-name")).focus(); return; }
    var icon=(document.getElementById("tl-icon").value||"").trim()||"✦";
    var url=(document.getElementById("tl-url").value||"").trim();
    if(tlTarget&&tlTarget.id){
      tlTarget.time=time; tlTarget.name=name; tlTarget.icon=icon; tlTarget.url=url;
    } else {
      tlEvents.push({id:uid(), time:time, name:name, icon:icon, url:url, kind:"routine"});
    }
    tlEvents.sort(function(a,b){ return hmToMin(a.time)-hmToMin(b.time); });
    saveEvents(tlEvents);
    closeSheet();
    renderTimeline();
  }
  function delEvent(){
    if(!tlTarget) return;
    tlEvents=tlEvents.filter(function(e){ return e.id!==tlTarget.id; });
    saveEvents(tlEvents);
    closeSheet();
    renderTimeline();
  }

  document.addEventListener("click", function(e){
    var t=e.target.closest("[data-act]"); if(!t) return;
    switch(t.getAttribute("data-act")){
      case "tl-open":
        var u=safeUrl(tlTarget&&tlTarget.url); closeSheet(); if(u) openUrl(u); return;
      case "tl-edit": return addEventSheet(tlTarget||{});
      case "tl-del": return delEvent();
      case "tl-save": return saveEventFromForm();
    }
  });

  var wxRoot=document.getElementById("wx-clock");
  if(wxRoot){
    buildDial(wxRoot);
    applySky("clear-night");
    paintClock(new Date(), wxData);
    fetchWx();
    setInterval(function(){ tickWx(); renderTimeline(); }, 1000);
    window.addEventListener("resize", function(){ buildDial(wxRoot); paintClock(new Date(), wxData); });
  }
  var addBtn=document.getElementById("dl-add");
  if(addBtn) addBtn.addEventListener("click", function(e){ e.stopPropagation(); addEventSheet({}); });
  renderTimeline();
  if(typeof fit==="function") fit();
})();
