(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))o(e);new MutationObserver(e=>{for(const r of e)if(r.type==="childList")for(const i of r.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&o(i)}).observe(document,{childList:!0,subtree:!0});function s(e){const r={};return e.integrity&&(r.integrity=e.integrity),e.referrerPolicy&&(r.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?r.credentials="include":e.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function o(e){if(e.ep)return;e.ep=!0;const r=s(e);fetch(e.href,r)}})();function f(){const t=document.body;window.innerWidth>800?t.style.overflow="hidden":t.style.overflow="auto"}const p="wss://api.lanyard.rest/socket",c={PRESENCE:0,HELLO:1,INITIALIZE:2,HEARTBEAT:3},E=["INIT_STATE","PRESENCE_UPDATE"],m="180456337518493697";function u(t){let n=new WebSocket(p);n.onmessage=({data:s})=>{const o=JSON.parse(s);switch(o.op){case c.HELLO:{n.send(JSON.stringify({op:c.INITIALIZE,d:{subscribe_to_id:m}})),setInterval(()=>{n.send(JSON.stringify({op:c.HEARTBEAT}))},1e3*30);break}case c.PRESENCE:{E.includes(o.t)&&t(o.d);break}}},n.onclose=()=>u(t)}u(t=>{I(t),setupSpotify(t)});function I({discord_user:t,discord_status:n,activities:s}){const{username:o,discriminator:e,avatar:r}=t,i={online:"#30d158",offline:"#8e8e93",idle:"#ffd60a",dnd:"#ff453a"};let d=n;for(const l of s)if(l.type===4){d=l.state;break}const a=document.getElementById("description");a.innerText=`@${o} [${d}]`,a.style.color=i[n]}window.addEventListener("resize",f);f();function y(){const s=new Date(2025,2,22)-new Date,o=Math.ceil(s/(1e3*60*60*24)),e=document.getElementById("bdaycd");o>0?e.textContent=`${o} days till bday`:o===0?e.textContent="my bday is today :D 🎉":e.textContent="update the date u moron"}y();setInterval(y,864e5);
