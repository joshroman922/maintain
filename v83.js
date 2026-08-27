"use strict";
(function(){
  function esc(s){ return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
  function uid(){ return Date.now().toString(36)+Math.random().toString(36).slice(2,6); }

  try{
    var KEY="maintain:v1";
    var raw=localStorage.getItem(KEY);
    var mem=raw?JSON.parse(raw):null;
    if(mem&&mem.tree&&Array.isArray(mem.tree.children)){
      function folder(name, icon){
        var f=mem.tree.children.filter(function(n){return n&&n.kind!=="item"&&n.name===name;})[0];
        if(!f){ f={id:uid(),kind:"folder",name:name,icon:icon||"\u2726",children:[]}; mem.tree.children.push(f); }
        if(!f.children) f.children=[];
        return f;
      }
      function add(f,name,icon,url,note){
        if(f.children.some(function(c){return c.name===name;})) return;
        f.children.push({id:uid(),kind:"item",name:name,icon:icon,url:url||"",note:note||"",ts:Date.now()});
      }
      var health=folder("Health","\uD83E\uDE7A");
      add(health,"Dawn","\u2600\uFE0F","dawn.html");
      add(health,"Field Protocol","\uD83C\uDF00","field.html");
      add(health,"Breathwork","\uD83E\uDE7A","field.html");
      var work=folder("Work","\uD83D\uDEE0\uFE0F");
      add(work,"Gage Block Checker","\uD83D\uDCCF","https://joshroman922.github.io/gage-block-checker/");
      add(work,"Industrial Physics","\uD83C\uDFED","https://industrialphysics.com/");
      add(work,"Maintain repo","\u26A1","https://github.com/joshroman922/maintain");
      var files=folder("Files","\uD83D\uDDC2\uFE0F");
      add(files,"Ghost Hunter","\uD83D\uDC7B","https://joshroman922.github.io/ghost-hunter-app/");
      add(files,"GitHub","\uD83D\uDCC2","https://github.com/joshroman922");
      var journal=folder("Study / Journal","\uD83D\uDCD3");
      add(journal,"Today note","\u270D\uFE0F","","Tap Edit to write.");
      localStorage.setItem(KEY, JSON.stringify(mem));
      if(!sessionStorage.getItem("maintain:v83:seeded")){
        sessionStorage.setItem("maintain:v83:seeded","1");
        location.reload();
        return;
      }
    }
  }catch(e){}

  var cam=document.getElementById("cmd-cam");
  if(cam){
    cam.onclick=function(){
      window.location.href="shortcuts://run-shortcut?name="+encodeURIComponent("Maintain Camera");
      setTimeout(function(){
        window.location.href="shortcuts://run-shortcut?name="+encodeURIComponent("maintain Camara");
      },700);
    };
  }

  function markMinor(){
    Array.prototype.slice.call(document.querySelectorAll(".wx-num")).forEach(function(el,i){
      if(i%3!==0) el.classList.add("minor");
    });
  }
  markMinor();
  setTimeout(markMinor,400);

  function enhanceTimeline(){
    var track=document.getElementById("dl-track-wrap");
    var list=document.getElementById("dl-list");
    var pctEl=document.getElementById("dl-pct");
    if(pctEl) pctEl.textContent=(pctEl.textContent||"").replace(/DAY/g,"").replace(/\s+/g,"").replace("%","")+"%";
    if(!track||!list) return;
    list.innerHTML="";
    Array.prototype.slice.call(track.querySelectorAll(".dl-ev")).forEach(function(ev){
      var chip=document.createElement("button");
      chip.type="button";
      chip.className="dl-chip"+(ev.className.indexOf("past")>=0?" past":"");
      chip.textContent=(ev.title||ev.textContent||"event").trim();
      chip.addEventListener("click",function(e){ e.stopPropagation(); ev.click(); });
      list.appendChild(chip);
    });
  }
  enhanceTimeline();
  setInterval(enhanceTimeline,1000);

  var GKEY="maintain:v8:geminiKey";
  var cfg=document.getElementById("ai-cfg");
  var row=document.getElementById("ai-cfg-row");
  var keyEl=document.getElementById("ai-key");
  var saveBtn=document.getElementById("ai-key-save");
  var input=document.getElementById("ai-input");
  var body=document.getElementById("ai-body");
  var send=document.getElementById("ai-send");
  function getKey(){ try{return localStorage.getItem(GKEY)||"";}catch(e){return "";} }
  if(keyEl) keyEl.value=getKey();
  if(cfg) cfg.onclick=function(){ if(row) row.classList.toggle("on"); };
  if(saveBtn) saveBtn.onclick=function(){
    try{ localStorage.setItem(GKEY,(keyEl.value||"").trim()); }catch(e){}
    if(body) body.innerHTML += '<div class="msg bot">Key saved on this phone only.</div>';
    if(row) row.classList.remove("on");
  };
  function addMsg(cls,text){
    if(!body) return;
    body.innerHTML += '<div class="msg '+cls+'">'+esc(text)+'</div>';
    body.scrollTop=body.scrollHeight;
  }
  function talk(){
    var txt=(input&&input.value||"").trim();
    if(!txt) return;
    input.value="";
    addMsg("you",txt);
    var key=getKey();
    if(!key){
      addMsg("bot","No API key yet. Tap \u2699, paste a Gemini key from Google AI Studio, Save.");
      if(row) row.classList.add("on");
      return;
    }
    addMsg("bot","\u2026");
    var thinking=body.lastChild;
    fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key="+encodeURIComponent(key),{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        systemInstruction:{parts:[{text:"You are Gemini inside Maintain, a personal life-OS PWA. Be concise and direct."}]},
        contents:[{role:"user",parts:[{text:txt}]}]
      })
    }).then(function(r){ return r.json().then(function(d){ return {ok:r.ok,d:d}; }); })
    .then(function(res){
      var d=res.d||{};
      var t=((((d.candidates||[])[0]||{}).content||{}).parts||[]).map(function(p){return p.text||"";}).join("\n").trim();
      var err=(d.error&&d.error.message)||(!res.ok?"HTTP error":"");
      if(thinking) thinking.textContent=t||err||"No reply.";
    }).catch(function(e){ if(thinking) thinking.textContent="Network error: "+e; });
  }
  if(send){ send.onclick=talk; }
  if(input) input.addEventListener("keydown",function(e){ if(e.key==="Enter") talk(); });
})();
