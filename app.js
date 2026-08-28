
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
