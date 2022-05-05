self.addEventListener('activate', function(event) {
    console.log('activate', event);
});

// self.addEventListener('install', function(event) {
//     console.log('install', event);
// });

let CACHE_NAME = 'app_serviceworker_v_1',

    cacheUrls = [
        'css/backs.css',
        'css/buttons.css',
        'css/labels.css',
        'css/modal.css',
        'css/style.css',
        'js/main.js',
        'js/position.js',
        'js/tetris.js',
        'js/tetromino.js',
        //. '/test_serviceworker/css/custom.css',
        // '/test_serviceworker/images/icon.png',
        'index.html'
    ];

self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            return cache.addAll(cacheUrls);
        })
    );
});


self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request).then(function(cachedResponse) {

            if (cachedResponse) {
                return cachedResponse;
            }

            return fetch(event.request);
        })
    );
});