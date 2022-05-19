self.addEventListener('activate', function(event) {
    console.log('activate', event);
});

// self.addEventListener('install', function(event) {
//     console.log('install', event);
// });

const CACHE_NAME = 'app_serviceworker_v_1',

    cacheUrls = [
        '/web_tetris/',
        '/web_tetris/index.html',
        '/web_tetris/css/backs.css',
        '/web_tetris/css/buttons.css',
        '/web_tetris/css/labels.css',
        '/web_tetris/css/modal.css',
        '/web_tetris/css/style.css',
        '/web_tetris/js/main.js',
        '/web_tetris/js/position.js',
        '/web_tetris/js/tetris.js',
        '/web_tetris/js/db.js',
        '/web_tetris/js/tetromino.js',
        '/web_tetris/js/bot.js',
        '/web_tetris/img/clockwise.svg',
        '/web_tetris/img/counterclockwise.svg',
        '/web_tetris/img/down.svg',
        '/web_tetris/img/fullscreen-svgrepo-com.svg',
        '/web_tetris/img/harddrop.svg',
        '/web_tetris/img/help.svg',
        '/web_tetris/img/left.svg',
        '/web_tetris/img/line.svg',
        '/web_tetris/img/music.svg',
        '/web_tetris/img/next.svg',
        '/web_tetris/img/pattern-2.svg',
        '/web_tetris/img/right.svg',
        '/web_tetris/img/theme_light_dark_icon_137104.svg',
        '/web_tetris/img/leaderboard.svg',
        '/web_tetris/img/icon.png',
        '/web_tetris/audio/background/1.mp3',
        'https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js',
        'https://cdn.jsdelivr.net/npm/idb@7/build/umd.js',
        'https://fonts.cdnfonts.com/css/minecrafter-alt'

    ];

self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            return cache.addAll(cacheUrls);
        })
    );
});



const MAX_AGE = 86400000;

self.addEventListener('fetch', function(event) {

    event.respondWith(
        caches.match(event.request).then(function(cachedResponse) {
            let lastModified, fetchRequest;

            if (cachedResponse) {
                lastModified = new Date(cachedResponse.headers.get('last-modified'));
                if (lastModified && (Date.now() - lastModified.getTime()) > MAX_AGE) {
                    fetchRequest = event.request.clone();
                    return fetch(fetchRequest).then(function(response) {
                        if (!response || response.status !== 200) {
                            return cachedResponse;
                        }
                        caches.open(CACHE_NAME).then(function(cache) {
                            cache.put(event.request, response.clone());
                        });
                        return response;
                    }).catch(function() {
                        return cachedResponse;
                    });
                }
                return cachedResponse;
            }

            return fetch(event.request);
        })
    );
});