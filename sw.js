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
    e.waitUntil(caches.open(cacheName).then((cache) => {
        console.log('[service worker] cache all')
        return cache.addAll(appShellFiles)
    }))
})

self.addEventListener('fetch', (e) => {
    e.respondWith(caches.match(e.request).then((r) => {
        console.log("[service worker] fetching resource", e.request)
        return r || fetch(e.request).then((response) => {
            return caches.open(cacheName).then(cache => {
                console.log("[service worker] caching new resource", e.request)
                cache.put(e.request, response.clone())
                return response
            })
        })
    }))
})