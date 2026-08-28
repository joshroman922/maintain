"use strict";
(function(){
  var LAT=38.2967, LON=-85.7600;
  var WX_URL="https://api.open-meteo.com/v1/forecast?latitude="+LAT+"&longitude="+LON+"&current=temperature_2m,weather_code,is_day&daily=sunrise,sunset&timezone=America/Indiana/Indianapolis&forecast_days=1&temperature_unit=fahrenheit";
  var TL_KEY="maintain:v8:timeline";
  var WEEKDAYS=[1,2,3,4,5];
  var DAY_START=5*60+30, DAY_END=21*60, DAY_SPAN=DAY_END-DAY_START;
  function pad(n){return (n<10?"0":"")+n;}
  function ymd(d){return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate());}
  function hmToMin(hhmm){var p=String(hhmm||"07:30").split(":");return (+p[0])*60+(+p[1]||0);}
  function fmtTime(d){var h=d.getHours(),m=d.getMinutes(),ap=h>=12?"PM":"AM";h=h%12;if(!h)h=12;return h+":"+pad(m)+" "+ap;}
  function defaults(){return[
    {id:"wake",time:"05:45",name:"Wake",icon:"\u23F0",kind:"alarm",days:WEEKDAYS.slice(),ping:"Maintain Wake"},
    {id:"leave",time:"07:10",name:"Leave",icon:"\uD83D\uDE97",kind:"leave",days:WEEKDAYS.slice()},
    {id:"leave-latest",time:"07:15",name:"Leave latest",icon:"\uD83D\uDEA8",kind:"leave",days:WEEKDAYS.slice(),ping:"Maintain Leave"},
    {id:"work",time:"07:30",end:"16:00",name:"Work",icon:"\uD83C\uDFED",kind:"work",days:WEEKDAYS.slice()},
    {id:"dawn",time:"07:30",name:"Dawn",icon:"\u2600\uFE0F",url:"dawn.html",kind:"protocol"},
    {id:"field",time:"20:30",name:"Field Protocol",icon:"\uD83C\uDF00",url:"field.html",kind:"protocol"}
  ];}
  function loadEvents(){
    var list=[],seeded=defaults();
    try{var raw=localStorage.getItem(TL_KEY);if(raw){var p=JSON.parse(raw);if(Array.isArray(p))list=p;}}catch(e){}
    seeded.forEach(function(ev){var hit=null,i;for(i=0;i<list.length;i++){if(list[i].id===ev.id||list[i].name===ev.name){hit=list[i];break;}}if(!hit)list.push(ev);else{if(!hit.time)hit.time=ev.time;if(ev.end&&!hit.end)hit.end=ev.end;if(ev.days&&!hit.days)hit.days=ev.days.slice();if(ev.ping&&!hit.ping)hit.ping=ev.ping;}});
    try{localStorage.setItem(TL_KEY,JSON.stringify(list));}catch(e){}
    return list;
  }
  var tlEvents=loadEvents();
  var selectedDay=new Date();selectedDay=new Date(selectedDay.getFullYear(),selectedDay.getMonth(),selectedDay.getDate());
  function eventsFor(d){var key=ymd(d),dow=d.getDay();return tlEvents.filter(function(ev){if(ev.skip&&ev.skip[key])return false;if(ev.days&&ev.days.indexOf(dow)<0)return false;return !ev.date||ev.date===key;});}
  function eventPct(ev){return Math.max(0,Math.min(1,(hmToMin(ev.time)-DAY_START)/DAY_SPAN));}
  function renderTimeline(){
    var track=document.getElementById("dl-track-wrap");if(!track)return;
    var now=new Date(),today=now.getFullYear()===selectedDay.getFullYear()&&now.getMonth()===selectedDay.getMonth()&&now.getDate()===selectedDay.getDate();
    var mins=now.getHours()*60+now.getMinutes();
    var pct=today?Math.max(0,Math.min(1,(mins-DAY_START)/DAY_SPAN)):0;
    var fill=document.getElementById("dl-fill"),nowEl=document.getElementById("dl-now"),pctEl=document.getElementById("dl-pct");
    if(fill)fill.style.width=(pct*100).toFixed(2)+"%";
    if(nowEl){nowEl.style.left=(pct*100).toFixed(2)+"%";nowEl.style.display=today?"":"none";}
    if(pctEl)pctEl.innerHTML=Math.round(pct*100)+"%<small>DAY</small>";
    Array.prototype.slice.call(track.querySelectorAll(".dl-ev,.dl-block")).forEach(function(n){n.remove();});
    eventsFor(selectedDay).forEach(function(ev){
      if(ev.end){var a=eventPct(ev),b=Math.max(a,Math.min(1,(hmToMin(ev.end)-DAY_START)/DAY_SPAN));var block=document.createElement("div");block.className="dl-block kind-"+(ev.kind||"work");block.style.left=(a*100).toFixed(2)+"%";block.style.width=((b-a)*100).toFixed(2)+"%";track.appendChild(block);}
      var el=document.createElement("button");el.type="button";el.className="dl-ev kind-"+(ev.kind||"event");el.style.left=(eventPct(ev)*100).toFixed(2)+"%";el.textContent=ev.icon||"\u2726";el.title=(ev.time||"")+" "+(ev.name||"");
      el.onclick=function(e){e.stopPropagation();if(ev.ping)location.href="shortcuts://run-shortcut?name="+encodeURIComponent(ev.ping);};
      track.appendChild(el);
    });
  }
  function paintClock(){
    var now=new Date();
    var t=document.getElementById("wx-time"),d=document.getElementById("wx-date");
    if(t)t.textContent=fmtTime(now);
    if(d)d.textContent=now.toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"});
  }
  function fetchWx(){
    fetch(WX_URL).then(function(r){return r.json();}).then(function(data){
      if(!data||!data.current)return;
      var temp=document.getElementById("wx-temp"),cond=document.getElementById("wx-cond");
      if(temp)temp.innerHTML=Math.round(data.current.temperature_2m)+"<small>\u00b0</small>";
      if(cond)cond.textContent=data.current.weather_code===0?"Clear":(data.current.weather_code<=2?"Partly Cloudy":"Cloudy");
    }).catch(function(){});
  }
  paintClock();renderTimeline();fetchWx();
  setInterval(function(){paintClock();renderTimeline();},1000);
  window.MaintainTL={refresh:renderTimeline,list:function(){return tlEvents;},save:function(list){tlEvents=list||tlEvents;try{localStorage.setItem(TL_KEY,JSON.stringify(tlEvents));}catch(e){}renderTimeline();}};
})();
