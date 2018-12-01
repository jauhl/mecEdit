const APP_PREFIX = 'mecEdit'
const VERSION = 'v0.6.1'
const CACHE_NAME = APP_PREFIX + '_' + VERSION
const URLS = [
  `./`,
  `./mecEdit.html`,
  `./vendor/bootstrap.min.css`,
  `./app.css`,
  `./vendor/codemirror/codemirror5.39.2.css`,
  `./vendor/codemirror/lucario.css`,
  `./vendor/codemirror/mdn-like.css`,
  `./vendor/bootstrap-native-v4.min.js`,
  `./vendor/draggabilly.pkgd.min.js`,
  `./vendor/codemirror/codemirror5.39.2.min.js`,
  `./vendor/codemirror/codemirror.jsmode5.39.2.js`,
  `./vendor/codemirror/matchbrackets.js`,
  `./scripts/g2.js`,
  // `https://gitcdn.xyz/repo/goessner/g2/master/src/g2.js`,
  `./scripts/g2.editor.js`,
  `./scripts/mec2.min.js`,
  // `./scripts/slider.js`,
  // `./scripts/mixin.js`,
  // `./scripts/ctxm-templates.js`,
  // `./scripts/appevents.js`,
  // `./scripts/examples.js`,
  // `./app.js`,
  `./app.min.js`,
  `./img/favicon/favicon-16x16.png`,
  `./img/favicon/favicon-32x32.png`,
  `./img/favicon/apple-touch-icon.png`,
  `./img/favicon/safari-pinned-tab.svg`,
  `./img/favicon/browserconfig.xml`,
  `./manifest.json`
]

// Respond with cached resources
self.addEventListener('fetch', function (e) {
  // console.log('fetch request : ' + e.request.url)
  e.respondWith(
    caches.match(e.request).then(function (response) {
      // if (response) { // if cache is available, respond with cache
      //   console.log('Responding with cache: ' + response.url)
      //   return response
      // } else {       // if there are no cache, try fetching request
      //   console.log('File is not cached, fetching: ' + e.request.url)
      //   return fetch(e.request)
      // }
      return response || fetch(e.request)
    })
    .catch(function(error) {
      console.log('sw fetch error:', error);
    })
  )
})

// Cache resources
self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      console.log('Installing cache: ' + CACHE_NAME)
      return cache.addAll(URLS)
                  .then(() => self.skipWaiting());
    })
    .catch(function(error) {
      console.log('sw install error:', error);
    })
  )
})

// Delete outdated caches
self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keyList) {
      // `keyList` contains all cache names under jauhl.github.io
      // filter out ones that has this app prefix to create white list
      const cacheWhitelist = keyList.filter(function (key) {
        return key.indexOf(APP_PREFIX)
      })
      // add current cache name to white list
      cacheWhitelist.push(CACHE_NAME)

      return Promise.all(keyList.map(function (key, i) {
        if (cacheWhitelist.indexOf(key) === -1) {
          console.log('Deleting cache: ' + keyList[i] )
          return caches.delete(keyList[i])
        }
      }))
    })
    .catch(function(error) {
      console.log('sw activation error:', error);
    })
  )
})