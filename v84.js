"use strict";
(function(){
  var TL_KEY="maintain:v8:timeline";
  var TREE_KEY="maintain:v1";

  function uid(){ return Date.now().toString(36)+Math.random().toString(36).slice(2,6); }
  function pad(n){ return (n<10?"0":"")+n; }
  function ymd(d){ return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate()); }

  function loadTL(){
    try{
      var raw=localStorage.getItem(TL_KEY);
      var p=raw?JSON.parse(raw):null;
      return Array.isArray(p)?p:[];
    }catch(e){ return []; }
  }
  function saveTL(list){
    try{ localStorage.setItem(TL_KEY, JSON.stringify(list)); }catch(e){}
  }
  function loadTree(){
    try{
      var raw=localStorage.getItem(TREE_KEY);
      return raw?JSON.parse(raw):null;
    }catch(e){ return null; }
  }

  function defaultTime(name){
    var n=String(name||"").toLowerCase();
    if(/dawn/.test(n)) return "07:30";
    if(/field/.test(n)) return "20:30";
    if(/breath/.test(n)) return "07:45";
    if(/gym|lift|workout/.test(n)) return "17:30";
    if(/meds|vitamin|stack/.test(n)) return "08:00";
    if(/remind/.test(n)) return "12:00";
    return "09:00";
  }

  function isTrackFolder(name){
    var n=String(name||"").toLowerCase();
    return /routine|protocol|remind/.test(n);
  }
  function isTrackItem(name){
    var n=String(name||"").toLowerCase();
    return /dawn|field protocol|remind/.test(n);
  }

  function collectTrackable(node, inTrack, out){
    if(!node) return;
    var here=inTrack || isTrackFolder(node.name);
    if(node.kind==="item"){
      if(here || isTrackItem(node.name)) out.push(node);
      return;
    }
    (node.children||[]).forEach(function(c){ collectTrackable(c, here, out); });
  }

  function syncHubToTracker(){
    var mem=loadTree();
    if(!mem||!mem.tree) return false;
    var items=[];
    collectTrackable(mem.tree, false, items);
    var tl=loadTL();
    var changed=false;
    var seen={};

    items.forEach(function(it){
      var hit=null;
      for(var i=0;i<tl.length;i++){
        if(tl[i].sourceId===it.id || (!tl[i].sourceId && tl[i].name===it.name && !tl[i].date)){
          hit=tl[i]; break;
        }
      }
      if(!hit){
        tl.push({
          id:"hub-"+it.id,
          sourceId:it.id,
          time:it.when||defaultTime(it.name),
          name:it.name,
          icon:it.icon||"\uD83D\uDD01",
          url:it.url||"",
          kind:"routine"
        });
        changed=true;
        hit=tl[tl.length-1];
      } else {
        if(!hit.sourceId){ hit.sourceId=it.id; changed=true; }
        if(it.when && hit.time!==it.when){ hit.time=it.when; changed=true; }
        if(hit.name!==it.name || (it.icon && hit.icon!==it.icon) || (it.url && hit.url!==it.url)){
          hit.name=it.name;
          if(it.icon) hit.icon=it.icon;
          if(it.url) hit.url=it.url;
          changed=true;
        }
      }
      seen[hit.id]=true;
    });

    var kept=[];
    tl.forEach(function(ev){
      if(ev.sourceId && !seen[ev.id]){
        var still=items.some(function(it){ return it.id===ev.sourceId; });
        if(!still){ changed=true; return; }
      }
      kept.push(ev);
    });
    if(changed) saveTL(kept);
    return changed;
  }

  function applyAndRefresh(force){
    var changed=false;
    try{ changed=syncHubToTracker(); }catch(e){}
    if(changed && window.MaintainTL && window.MaintainTL.save){
      window.MaintainTL.save(loadTL());
      return true;
    }
    if((changed||force) && window.MaintainTL && window.MaintainTL.refresh){
      window.MaintainTL.refresh();
      return true;
    }
    return changed;
  }

  if(typeof Store!=="undefined" && Store.commit){
    var _commit=Store.commit;
    Store.commit=function(){
      _commit();
      try{ applyAndRefresh(false); }catch(e){}
    };
  }

  var lastCal=null;
  var calGrid=document.getElementById("cal-grid");
  if(calGrid){
    calGrid.addEventListener("click", function(e){
      var b=e.target.closest("[data-cal]");
      if(!b) return;
      var key=b.getAttribute("data-cal");
      if(lastCal===key){
        var addBtn=document.getElementById("dl-add");
        if(addBtn) setTimeout(function(){ addBtn.click(); }, 30);
      }
      lastCal=key;
    }, true);
  }

  try{ applyAndRefresh(false); }catch(e){}

  var title=document.querySelector(".dl-range");
  if(title){
    title.title="Tracker follows Routine, reminders, and calendar adds";
  }
})();
