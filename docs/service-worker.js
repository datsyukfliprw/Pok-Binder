/* Poké Pack Lab offline support. All game rules, coins and binder run locally. */
const CACHE='poke-pack-lab-shell-v16';
const ART_CACHE='poke-pack-lab-art-v1';
const SHELL=['./','./index.html','./play.html','./chat-config.js','./private-chat.js','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png','./icons/icon.svg'];
self.addEventListener('install',event=>{
 event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
 event.waitUntil(Promise.all([
  caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('poke-pack-lab-')&& ![CACHE,ART_CACHE].includes(k)).map(k=>caches.delete(k)))),
  self.clients.claim()
 ]));
});
const artHosts=new Set(['assets.tcgdex.net','images.pokemontcg.io','raw.githubusercontent.com']);
self.addEventListener('fetch',event=>{
 const req=event.request;
 if(req.method!=='GET')return;
 const url=new URL(req.url);
 if(url.origin===self.location.origin){
  // Prefer the newest online HTML; fall back to the offline cache when disconnected.
  if(req.mode==='navigate' || /\/(?:index|play)\.html$/.test(url.pathname)){
    event.respondWith(fetch(req).then(res=>{
      if(res.ok){const copy=res.clone();caches.open(CACHE).then(cache=>cache.put(req,copy));}
      return res;
    }).catch(()=>caches.match(req).then(hit=>hit||caches.match('./index.html'))));
    return;
  }
  event.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(res=>{
    if(res.ok) {const copy=res.clone();caches.open(CACHE).then(c=>c.put(req,copy));}
    return res;
  }).catch(()=>caches.match('./index.html'))));
  return;
 }
 if(req.destination==='image' && artHosts.has(url.hostname)){
  event.respondWith(caches.open(ART_CACHE).then(async cache=>{
    const hit=await cache.match(req);
    if(hit)return hit;
    try {
      const res=await fetch(req);
      if(res.ok || res.type==='opaque'){
        await cache.put(req,res.clone());
        const keys=await cache.keys();
        if(keys.length>70) await Promise.all(keys.slice(0,keys.length-70).map(k=>cache.delete(k)));
      }
      return res;
    }catch(e){return Response.error();}
  }));
 }
});