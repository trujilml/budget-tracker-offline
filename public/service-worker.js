const APP_PREFIX = 'BudgetTrack-';
const VERSION = 'version_01';
const CACHE_NAME = APP_PREFIX + VERSION;
const DATA_CACHE_NAME = "DATA_CACHE_" + VERSION;
const FILES_TO_CACHE = [
    '/',
    './index.html',
    './css/styles.css',
    './js/index.js',
    './js/idb.js',
    './manifest.json',
    './icons/icon-512x512.png',
    './icons/icon-384x384.png',
    './icons/icon-192x192.png',
    './icons/icon-152x152.png',
    './icons/icon-144x144.png',
    './icons/icon-128x128.png',
    './icons/icon-96x96.png',
    './icons/icon-72x72.png'
];

self.addEventListener('install', function (e) {
    e.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            console.log("Caches have been installed!" + CACHE_NAME);
            return cache.addAll(FILES_TO_CACHE)
        })
    );
});

self.addEventListener('activate', function (e) {
    e.waitUntil(
        caches.keys().then(function (keyList) {
            let cacheKeepList = keyList.filter(function (key) {
                return key.indexOf(APP_PREFIX);
            });
            cacheKeepList.push(CACHE_NAME);

            return Promise.all(
                keyList.map(function (key, i) {
                    if (cacheKeepList.indexOf(key) === -1 ) {
                        console.log("Deleting the cache : " + keyList[i]);
                        return caches.delete(keyList[i]);
                    }
                })
            );
        })
    );
});

// self.addEventListener('fetch', function (e) {
//     console.log("Fetching the request..." + e.request.url);
//     e.respondWith( 
//         caches.match(e.request).then(function (request) {
//             if (request) {
//                 console.log("Responding with cache: " + e.request.url);
//                 return request;
//             } else {
//                 console.log("The file is not cached, fetching : " + e.request.url);
//                 return fetch(e.request);
//             }
//         })
//     );
// });

self.addEventListener("fetch", function(event) {
    // cache all get requests to /api routes
    if (event.request.url.includes("/api/")) {
      event.respondWith(
        caches.open(DATA_CACHE_NAME).then(cache => {
          return fetch(event.request)
            .then(response => {
              // If the response was good, clone it and store it in the cache.
              if (response.status === 200) {
                cache.put(event.request.url, response.clone());
              }
              return response;
            })
            .catch(err => {
              // Network request failed, try to get it from the cache.
              return cache.match(event.request);
            });
        }).catch(err => console.log(err))
      );
      return;
    }
    event.respondWith(
      fetch(event.request).catch(function() {
        return caches.match(event.request).then(function(response) {
          if (response) {
            return response;
          } else if (event.request.headers.get("accept").includes("text/html")) {
            // return the cached home page for all requests for html pages
            return caches.match("/");
          }
        });
      })
    );
  });