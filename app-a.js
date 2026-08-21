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
function fresh(){ return { v:8, tree:{id:"root",kind:"folder",name:"HUB",children:defaultTop()}, system:defaultSystem(), timeline:[], week:[false,false,false,false,false,false,false] }; }
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
return { v:8, tree:root, system:defaultSystem(), timeline:old.timeline||[] };
}
function load(){
if(mem) return mem;
try{
var raw=localStorage.getItem(KEY), p=raw?JSON.parse(raw):null;
if(!p) mem=fresh();
else if(p.tree){ mem=p; if(!mem.timeline) mem.timeline=[]; }
else if(p.sections) mem=migrate(p);
else mem=fresh();
}catch(e){ mem=fresh(); }
if(!mem||!mem.tree) mem=fresh();
if(!mem.system) mem.system=defaultSystem();
if(!mem.timeline) mem.timeline=[];
if(!mem.week || !mem.week.length) mem.week=[false,false,false,false,false,false,false];
return mem;
}
function save(){ try{ localStorage.setItem(KEY,JSON.stringify(mem)); }catch(e){} }
return { data:load, commit:save, reset:function(){ mem=fresh(); save(); }, defaultSystem:defaultSystem };
})();
/* Weather Clock stub - full logic in app-b */
console.log('app-a loaded');
