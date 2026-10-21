/* Service worker : l'appli s'ouvre hors ligne. Changer VERSION à chaque mise à jour du site. */
const VERSION='jardin-v2-3';
const SHELL=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(VERSION).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSION&&k!=='jardin-img').map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);
  if(u.origin===location.origin){
    /* appli : réseau d'abord (mises à jour), cache si hors ligne */
    e.respondWith(fetch(r).then(res=>{const cp=res.clone();caches.open(VERSION).then(c=>c.put(r,cp));return res}).catch(()=>caches.match(r).then(m=>m||caches.match('./index.html'))));
    return;
  }
  if(u.hostname==='upload.wikimedia.org'){
    /* photos : cache d'abord */
    e.respondWith(caches.open('jardin-img').then(c=>c.match(r).then(m=>m||fetch(r).then(res=>{c.put(r,res.clone());return res}).catch(()=>m))));
  }
  /* météo et API : toujours le réseau (gérés par l'appli) */
});
