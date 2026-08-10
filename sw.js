// GymCoach Pro — Service Worker
// Cachea el "app shell" (HTML/CSS/JS/iconos) para que la app abra al instante
// aunque haya poca cobertura, y deja pasar las llamadas a la API siempre a red.
const CACHE_VERSION = 'gcp-v2';
const APP_SHELL = [
  './atleta.html',
  './index.html',
  './manifest.json',
  './manifest-coach.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png'
];

self.addEventListener('install', function(e){
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_VERSION).then(function(cache){
      return cache.addAll(APP_SHELL).catch(function(){ /* si falla algún recurso, no bloquea la instalación */ });
    })
  );
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){return k!==CACHE_VERSION;}).map(function(k){return caches.delete(k);}));
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e){
  var url = e.request.url;

  // Nunca cachear llamadas a Google Apps Script / API: siempre red, datos frescos.
  if(url.indexOf('script.google.com') > -1 || url.indexOf('googleapis.com') > -1){
    e.respondWith(fetch(e.request).catch(function(){
      return new Response(JSON.stringify({ok:false,offline:true}),{headers:{'Content-Type':'application/json'}});
    }));
    return;
  }

  if(e.request.method !== 'GET') return;

  // App shell: cache-first con actualización en segundo plano (stale-while-revalidate)
  e.respondWith(
    caches.match(e.request).then(function(cached){
      var fetchPromise = fetch(e.request).then(function(networkResponse){
        if(networkResponse && networkResponse.ok){
          var copy = networkResponse.clone();
          caches.open(CACHE_VERSION).then(function(cache){ cache.put(e.request, copy); });
        }
        return networkResponse;
      }).catch(function(){ return cached; });
      return cached || fetchPromise;
    })
  );
});
