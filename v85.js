"use strict";
(function(){
  var PING_KEY="maintain:v8:pinged";

  function pad(n){ return (n<10?"0":"")+n; }
  function ymd(d){ return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate()); }
  function hm(d){ return pad(d.getHours())+":"+pad(d.getMinutes()); }

  var range=document.querySelector(".dl-range");
  if(range) range.textContent="5:30 AM \u2013 9:00 PM";

  function enhanceChips(){
    var list=document.getElementById("dl-list");
    if(!list) return;
    Array.prototype.slice.call(list.querySelectorAll(".dl-chip")).forEach(function(chip){
      var t=chip.textContent||"";
      if(/\b(daily|once)\b/i.test(t)) return;
      if(chip.classList.contains("once") || /once/i.test(chip.title||"")) chip.textContent=t+" \u00b7 once";
      else chip.textContent=t+" \u00b7 daily";
    });
  }
  setInterval(enhanceChips, 1000);
  enhanceChips();

  function loadPinged(){
    try{ return JSON.parse(localStorage.getItem(PING_KEY)||"{}"); }catch(e){ return {}; }
  }
  function savePinged(m){ try{ localStorage.setItem(PING_KEY, JSON.stringify(m)); }catch(e){}
  }

  function maybePing(){
    if(!window.MaintainTL || !window.MaintainTL.list) return;
    var now=new Date();
    var dow=now.getDay();
    if(dow===0||dow===6) return;
    var stamp=ymd(now)+"@"+hm(now);
    var map=loadPinged();
    window.MaintainTL.list().forEach(function(ev){
      if(!ev.ping) return;
      if(ev.days && ev.days.indexOf(dow)<0) return;
      if(ev.time!==hm(now)) return;
      if(ev.skip && ev.skip[ymd(now)]) return;
      if(map[ev.id+"|"+stamp]) return;
      map[ev.id+"|"+stamp]=1;
      savePinged(map);
      window.location.href="shortcuts://run-shortcut?name="+encodeURIComponent(ev.ping);
    });
  }
  setInterval(maybePing, 15000);
  setTimeout(maybePing, 2500);

  if("Notification" in window && Notification.permission==="default"){
    try{ Notification.requestPermission(); }catch(e){}
  }
})();
