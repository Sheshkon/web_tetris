self.addEventListener('activate', function(event) {
    console.log('activate', event);
});

// self.addEventListener('install', function(event) {
//     console.log('install', event);
// });

let CACHE_NAME = 'app_serviceworker_v_1',

    cacheUrls = [
        '/web_tetris/',
        '/web_tetris/css/backs.css',
        '/web_tetris/css/buttons.css',
        '/web_tetris/css/labels.css',
        '/web_tetris/css/modal.css',
        '/web_tetris/css/style.css',
        '/web_tetris/js/main.js',
        '/web_tetris/js/position.js',
        '/web_tetris/js/tetris.js',
        '/web_tetris/js/tetromino.js',
        //. '/test_serviceworker/css/custom.css',
        // '/test_serviceworker/images/icon.png',
        '/web_tetris/index.html'
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