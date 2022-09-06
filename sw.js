let cacheName = "GameRecord_v1.0.0"
let appShellFiles = [
    './',
    './app.js',
    './index.html',
    './style.css',
    './functions/record/record.html',
    './functions/record/record.js',
    './functions/statistic/statistic.html',
    './functions/statistic/statistic.js'
]

self.addEventListener('install', (e) => {
    console.log('[service worker] install', e)
    self.skipWaiting()
    e.waitUntil(caches.open(cacheName).then((cache) => {
        console.log('[service worker] cache all')
        return cache.addAll(appShellFiles)
    }))
})

self.addEventListener('activate', (e) => {
    console.log('[service worker] activate', e)
    e.waitUntil(clients.claim())
})

self.addEventListener('fetch', (e) => {
    let fetchedMark = false
    e.respondWith(caches.match(e.request).then((r) => {
        console.log("[service worker] fetching resource", e.request)
        if(r){
            return r
        } else {
            fetchedMark = true
            return fetch(e.request).then((response) => {
                return caches.open(cacheName).then(cache => {
                    console.log("[service worker] caching new resource", e.request)
                    cache.put(e.request, response.clone())
                    return response
                })
            })
        }
    }))
    if(!fetchedMark){
        fetch(e.request).then((response) => {
            caches.open(cacheName).then(cache => {
                console.log("[service worker] caching new resource", e.request)
                cache.put(e.request, response.clone())
            })
        })
    }
})