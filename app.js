"use strict";
function esc(s){return String(s==null?"":s).replace(/&/g,"&"+"amp;").replace(/</g,"&"+"lt;").replace(/>/g,"&"+"gt;").replace(/"/g,"&"+"quot;").replace(/'/g,"&#39;");}
function safeUrl(u){u=(u||"").trim();if(!u)return"";if(/^\s*(javascript|data|vbscript|blob|file):/i.test(u))return"";if(/^[a-z][a-z0-9.+-]*:/i.test(u))return u;if(/^\/\//.test(u))return"https:"+u;if(/\./.test(u))return"https://"+u;return"";}
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,6);}
function iconOr(n){return (n&&n.icon)?n.icon:"\u2726";}
function openUrl(url){var a=document.createElement("a");a.href=url;a.target="_blank";a.rel="noopener";document.body.appendChild(a);a.click();a.remove();}
var Store=(function(){
  var KEY="maintain:v1",mem=null;
  function folder(name,icon,kids){return{id:uid(),kind:"folder",name:name,icon:icon,children:kids||[]};}
  function item(name,icon,url){return{id:uid(),kind:"item",name:name,icon:icon,url:url||"",note:"",ts:Date.now()};}
  function defaultTop(){return[
    folder("Social","\uD83D\uDCAC",[item("Instagram","\uD83D\uDCF7","shortcuts://run-shortcut?name="+encodeURIComponent("Maintain Insta")),item("Facebook","\uD83D\uDC65","shortcuts://run-shortcut?name="+encodeURIComponent("Maintain Facebook")),item("Messenger","\uD83D\uDCAC","shortcuts://run-shortcut?name="+encodeURIComponent("Maintain Messenger")),item("X","\u26A1","https://x.com")]),
    folder("Health","\uD83E\uDE7A"),
    folder("Routine / Protocol","\uD83D\uDD01",[item("Field Protocol","\uD83C\uDF00","field.html"),item("Dawn","\u2600\uFE0F","dawn.html")]),
    folder("Work","\uD83D\uDEE0\uFE0F"),
    folder("Files","\uD83D\uDDC2\uFE0F"),
    folder("Study / Journal","\uD83D\uDCD3")
  ];}
  function defaultSystem(){return{how:"Tap a category to open it. Centre core opens System.",goal:"Maintain life-OS on the home screen."};}
  function fresh(){return{v:7,tree:{id:"root",kind:"folder",name:"HUB",children:defaultTop()},system:defaultSystem()};}
  function load(){
    if(mem)return mem;
    try{var raw=localStorage.getItem(KEY),p=raw?JSON.parse(raw):null;mem=(p&&p.tree)?p:fresh();}catch(e){mem=fresh();}
    if(!mem||!mem.tree)mem=fresh();
    if(!mem.system)mem.system=defaultSystem();
    return mem;
  }
  function save(){try{localStorage.setItem(KEY,JSON.stringify(mem));}catch(e){}}
  return{data:load,commit:save,reset:function(){mem=fresh();save();}};
})();
function hexPts(cx,cy,r){var p=[],k,a;for(k=0;k<6;k++){a=(k*60-90)*Math.PI/180;p.push((cx+r*Math.cos(a)).toFixed(1)+","+(cy+r*Math.sin(a)).toFixed(1));}return p.join(" ");}
function orbSVG(){
  var cells="",rings=[[0,0]],R=16.5;
  [[32,6],[56,12],[78,18]].forEach(function(cfg){var rad=cfg[0],n=cfg[1],k,a;for(k=0;k<n;k++){a=(360/n*k)*Math.PI/180;rings.push([rad*Math.cos(a),rad*Math.sin(a)]);}});
  rings.forEach(function(c){var d=Math.hypot(c[0],c[1]);var lit=d<22||(Math.random()<0.22);var fill=lit?"rgba(110,230,250,.58)":"rgba(18,48,62,.55)";cells+="<polygon points=\""+hexPts(100+c[0],100+c[1],R)+"\" fill=\""+fill+"\" stroke=\"rgba(160,245,255,.5)\" stroke-width=\"0.9\"/>";});
  return "<svg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"><defs><radialGradient id=\"og\" cx=\"40%\" cy=\"34%\" r=\"68%\"><stop offset=\"0%\" stop-color=\"#e8fcff\"/><stop offset=\"22%\" stop-color=\"#7ad4e8\"/><stop offset=\"48%\" stop-color=\"#1e7a92\"/><stop offset=\"78%\" stop-color=\"#0a2a38\"/><stop offset=\"100%\" stop-color=\"#020c12\"/></radialGradient><clipPath id=\"oc\"><circle cx=\"100\" cy=\"100\" r=\"90\"/></clipPath></defs><g clip-path=\"url(#oc)\"><circle cx=\"100\" cy=\"100\" r=\"90\" fill=\"url(#og)\"/>"+cells+"</g><circle cx=\"100\" cy=\"100\" r=\"90\" fill=\"none\" stroke=\"rgba(170,250,255,.7)\" stroke-width=\"1.8\"/></svg>";
}
var root=Store.data().tree,path=[root],ORB_SVG=orbSVG();
function cur(){return path[path.length-1];}
var stage=document.getElementById("stage"),orbit=document.getElementById("orbit"),hint=document.getElementById("hint"),crumb=document.getElementById("crumb"),flash=document.getElementById("flash"),veil=document.getElementById("veil"),sheet=document.getElementById("sheet");
function fit(){if(!stage)return;var box=stage.getBoundingClientRect(),need=348,s=Math.max(0.62,Math.min(1,Math.min(box.width-12,box.height-12)/need));document.documentElement.style.setProperty("--hub-scale",s.toFixed(3));}
function setCrumb(){if(!crumb)return;crumb.innerHTML=path.map(function(n,i){var nm=(n===root?"HUB":n.name).toUpperCase();return i===path.length-1?"<b>"+esc(nm)+"</b>":esc(nm);}).join(" \u203a ");}
function wire(el,onTap,onHold){var timer=null,held=false;el.addEventListener("touchstart",function(){held=false;if(onHold)timer=setTimeout(function(){held=true;if(navigator.vibrate)navigator.vibrate(10);onHold();},480);},{passive:true});el.addEventListener("touchmove",function(){clearTimeout(timer);},{passive:true});el.addEventListener("touchend",function(e){clearTimeout(timer);if(held)e.preventDefault();},{passive:false});el.addEventListener("click",function(e){e.stopPropagation();if(held){held=false;return;}onTap();});}
function project(){renderLayers();setCrumb();var deep=path.length>1;if(hint){hint.textContent=deep?"Tap centre to go back":"";hint.style.opacity=deep?"":"0";}}
function descend(node){var front=orbit.querySelector(".layer.front");if(front){front.classList.remove("front");front.style.transform="scale(0.86)";front.style.opacity="0.3";front.style.filter="blur(1.3px)";front.style.pointerEvents="none";setTimeout(function(){path.push(node);project();},280);}else{path.push(node);project();}}
function ascend(){if(path.length<=1)return;var front=orbit.querySelector(".layer.front");if(front){front.classList.remove("on");front.style.pointerEvents="none";setTimeout(function(){path.pop();project();},240);}else{path.pop();project();}}
function openItem(node){var url=safeUrl(node.url);if(url)return openUrl(url);showFlash(node.note||node.name);}
function showFlash(msg){if(!flash)return;flash.textContent=msg;flash.classList.add("on");clearTimeout(showFlash._t);showFlash._t=setTimeout(function(){flash.classList.remove("on");},1900);}
function showSheet(html){sheet.innerHTML=html;veil.classList.add("on");}
function closeSheet(){veil.classList.remove("on");}
var formTarget=null;
function addSheet(){formTarget=null;showSheet('<div class="grip"></div><div class="shead"><button class="back" data-act="sheet-close">\u203a</button><div class="tt"><div class="cid">ADD</div><div class="nm">New in '+esc(cur().name)+'</div></div></div><div class="mform folder" id="mform"><div class="seg"><button data-kind="folder" class="on">Folder</button><button data-kind="item">Link / note</button></div><div class="fld"><label>Name</label><div class="rowin"><input id="f-icon" class="ic" maxlength="3" placeholder="\u2726"><input id="f-name" placeholder="What is it?"></div></div><div class="linkonly"><div class="fld"><label>Link</label><input id="f-url" placeholder="https://"></div><div class="fld"><label>Time on tracker</label><input id="f-time" type="time"></div></div></div><div class="acts"><button class="btn ghost" data-act="sheet-close">Cancel</button><button class="btn go" data-act="form-save">Save</button></div>');setTimeout(function(){var t=document.getElementById("f-name");if(t)t.focus();},60);}
function formSave(){var mform=document.getElementById("mform");if(!mform)return;var kind=mform.classList.contains("item")?"item":"folder";var name=(document.getElementById("f-name").value||"").trim();if(!name)return;var icon=(document.getElementById("f-icon").value||"").trim();var url=kind==="item"?((document.getElementById("f-url")||{}).value||"").trim():"";var when=((document.getElementById("f-time")||{}).value||"").trim();if(formTarget){formTarget.name=name;formTarget.icon=icon||formTarget.icon;if(kind==="item"){formTarget.kind="item";formTarget.url=url;formTarget.when=when;}}else{cur().children.push(kind==="item"?{id:uid(),kind:"item",name:name,icon:icon,url:url,when:when,ts:Date.now()}:{id:uid(),kind:"folder",name:name,icon:icon,children:[]});}Store.commit();closeSheet();project();if(window.MaintainTL&&window.MaintainTL.refresh)window.MaintainTL.refresh();}
function manage(node){formTarget=node;var url=safeUrl(node.url);showSheet('<div class="grip"></div><div class="shead"><button class="back" data-act="sheet-close">\u203a</button><div class="tt"><div class="cid">'+(node.kind==="item"?"ITEM":"FOLDER")+'</div><div class="nm">'+esc(node.name)+'</div></div></div>'+(url?'<button class="btn go full" data-act="open-managed">Open</button>':'')+'<button class="btn danger full" data-act="del-managed">Delete</button>');}
function delManaged(){var node=formTarget;if(!node)return;var kids=cur().children,i;for(i=0;i<kids.length;i++){if(kids[i].id===node.id){kids.splice(i,1);break;}}Store.commit();closeSheet();project();}
function systemSheet(){showSheet('<div class="grip"></div><div class="shead"><button class="back" data-act="sheet-close">\u203a</button><div class="tt"><div class="cid">SYSTEM</div><div class="nm">Maintain</div></div></div><div class="doc">Hub categories live on this phone. Add folders and links from the + node.</div><button class="btn ghost full" data-act="reset">Reset to defaults</button><div class="ver">MAINTAIN v8.5.1</div>');}
function renderLayers(){
  Array.prototype.slice.call(orbit.querySelectorAll(".layer")).forEach(function(l){l.remove();});
  var top=path.length-1,box=stage.getBoundingClientRect();
  var R=Math.min(128,Math.max(78,box.width/2-52),Math.max(78,box.height/2-42));
  var Rsub=Math.min(100,Math.max(64,box.width/2-48),Math.max(64,box.height/2-52));
  path.forEach(function(level,depth){
    var dTop=top-depth,isFront=(dTop===0),isRoot=(depth===0);
    var layer=document.createElement("div");layer.className="layer"+(isFront?" front":" settled");
    if(isRoot){
      layer.innerHTML='<div class="ring ticks"></div><div class="ring r1"></div><div class="sweep"></div><div class="ring r2"></div><div class="ring r3"></div><div class="base"></div><div class="orb" id="orb"><div class="glow"></div>'+ORB_SVG+'<span class="lbl" id="orbLbl">MAINTAIN</span></div>';
    }else{
      var hub=document.createElement("div");hub.className="hub";hub.innerHTML='<span class="hi">'+esc(iconOr(level))+'</span><span class="hc">'+esc(level.name)+'</span>';
      if(isFront)hub.addEventListener("click",function(e){e.stopPropagation();ascend();});
      layer.appendChild(hub);
    }
    var kids=(level.children||[]).map(function(k){return{t:"node",node:k};});
    if(isFront)kids.push({t:"add"});
    var n=Math.max(kids.length,1),radius=isRoot?R:Rsub;
    kids.forEach(function(sl,idx){
      var a=(-90+360/n*idx)*Math.PI/180,el=document.createElement("div");
      el.style.setProperty("--x",(Math.cos(a)*radius).toFixed(1)+"px");
      el.style.setProperty("--y",(Math.sin(a)*radius).toFixed(1)+"px");
      if(sl.t==="add"){el.className="node addch"+(isRoot?"":" sub");el.innerHTML='<span class="ni">+</span><span class="cap">Add</span>';if(isFront)wire(el,function(){addSheet();},null);}
      else{var nd=sl.node,isFolder=(nd.kind!=="item");el.className="node"+(isRoot?"":" sub")+(isFolder?" folder":"");el.innerHTML='<span class="ni">'+esc(iconOr(nd))+'</span><span class="cap">'+esc(nd.name)+'</span>';if(isFront)wire(el,function(){isFolder?descend(nd):openItem(nd);},function(){manage(nd);});}
      layer.appendChild(el);
    });
    if(!isFront){layer.style.transform="scale("+Math.pow(0.86,dTop).toFixed(3)+")";layer.style.opacity=(0.3*Math.pow(0.6,dTop-1)).toFixed(3);layer.style.filter="blur(1.3px)";layer.style.pointerEvents="none";}
    orbit.appendChild(layer);
    if(isFront)requestAnimationFrame(function(){requestAnimationFrame(function(){layer.classList.add("on");});});
  });
}
document.addEventListener("click",function(e){
  var t=e.target.closest("[data-act],[data-kind]");if(!t)return;
  if(t.hasAttribute("data-kind")){var mf=document.getElementById("mform");if(!mf)return;mf.className="mform "+t.getAttribute("data-kind");Array.prototype.slice.call(mf.querySelectorAll(".seg button")).forEach(function(b){b.classList.toggle("on",b===t);});return;}
  var act=t.getAttribute("data-act");
  if(act==="sheet-close")return closeSheet();
  if(act==="form-save")return formSave();
  if(act==="open-managed"){var u=safeUrl(formTarget&&formTarget.url);closeSheet();if(u)openUrl(u);return;}
  if(act==="del-managed")return delManaged();
  if(act==="reset"){if(confirm("Reset Maintain to defaults?")){Store.reset();root=Store.data().tree;path=[root];closeSheet();project();}}
});
if(veil)veil.addEventListener("click",function(e){if(e.target===veil)closeSheet();});
document.addEventListener("click",function(e){if(veil&&veil.classList.contains("on"))return;if(e.target.closest(".orb,.node,.hub,.core,#cmd-belt,#ai-wrap,#gears-btn,.hud-top,#wx-clock,#dayline,#cal,#mp-fab,#mp-wrap"))return;if(path.length>1)ascend();});
window.addEventListener("resize",function(){fit();renderLayers();});
function runShortcut(name){window.location.href="shortcuts://run-shortcut?name="+encodeURIComponent(name);}
var _el=function(id){return document.getElementById(id);};
if(_el("cmd-phone"))_el("cmd-phone").onclick=function(){runShortcut("Maintain Phone");};
if(_el("cmd-msg"))_el("cmd-msg").onclick=function(){runShortcut("Maintain Messages");};
if(_el("cmd-cam"))_el("cmd-cam").onclick=function(){runShortcut("maintain Camara");};
if(_el("gears-btn"))_el("gears-btn").onclick=function(){runShortcut("Maintain Settings");};
if(_el("cmd-ai"))_el("cmd-ai").onclick=function(){if(_el("ai-wrap"))_el("ai-wrap").classList.add("open");};
if(_el("ai-close"))_el("ai-close").onclick=function(){_el("ai-wrap").classList.remove("open");};
fit();
try{var core=document.createElement("div");core.className="core";core.id="core";core.addEventListener("click",function(e){e.stopPropagation();systemSheet();});orbit.appendChild(core);project();}
catch(err){if(orbit)orbit.innerHTML='<div style="position:fixed;left:16px;right:16px;top:80px;color:#5ad6e6;font:12px ui-monospace,monospace;text-align:center">Init error: '+String((err&&err.message)||err)+"</div>";}
