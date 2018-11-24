const APP_PREFIX = 'mecEdit'     // Identifier for this app (this needs to be consistent across every cache update)
const VERSION = 'v0.6.0'              // Version of the off-line cache (change this value everytime you want to update cache)
const CACHE_NAME = APP_PREFIX + '_' + VERSION
const URLS = [                            // Add URL you want to cache in this list.
  `/mecEdit/`,                     // If you have separate JS/CSS files,
  `/mecEdit/mecEdit.html`,            // add path to those files here
  `/mecEdit/vendor/bootstrap.min.css`,
  `/mecEdit/app.css`,
  `/mecEdit/vendor/codemirror/codemirror5.39.2.css`,
  `/mecEdit/vendor/codemirror/lucario.css`,
  `/mecEdit/vendor/codemirror/mdn-like.css`,
  `/mecEdit/vendor/bootstrap-native-v4.min.js`,
  `/mecEdit/vendor/draggabilly.pkgd.min.js`,
  `/mecEdit/vendor/codemirror/codemirror5.39.2.min.js`,
  `/mecEdit/vendor/codemirror/codemirror.jsmode5.39.2.js`,
  `/mecEdit/vendor/codemirror/matchbrackets.js`,
  `/mecEdit/scripts/g2.js`,
  // `https://gitcdn.xyz/repo/goessner/g2/master/src/g2.js`,
  `/mecEdit/scripts/g2.editor.js`,
  `/mecEdit/scripts/mec2.min.js`,
  // `/mecEdit/scripts/slider.js`,
  // `/mecEdit/scripts/mixin.js`,
  // `/mecEdit/scripts/ctxm-templates.js`,
  // `/mecEdit/scripts/appevents.js`,
  // `/mecEdit/scripts/examples.js`,
  // `/mecEdit/app.js`,
  `/mecEdit/app.min.js`,
  `/mecEdit/img/favicon/favicon-16x16.png`,
  `/mecEdit/img/favicon/favicon-32x32.png`,
  `/mecEdit/img/favicon/apple-touch-icon.png`,
  `/mecEdit/img/favicon/safari-pinned-tab.svg`,
  `/mecEdit/img/favicon/browserconfig.xml`,
  `/mecEdit/manifest.json`
]

// Respond with cached resources
self.addEventListener('fetch', function (e) {
  // console.log('fetch request : ' + e.request.url)
  e.respondWith(
    caches.match(e.request).then(function (request) {
      // if (request) { // if cache is available, respond with cache
      //   console.log('Responding with cache: ' + e.request.url)
      //   return request
      // } else {       // if there are no cache, try fetching request
      //   console.log('File is not cached, fetching: ' + e.request.url)
      //   return fetch(e.request)
      // }
      return request || fetch(e.request)
    })
    // .catch(function(error) {
    //   console.log('fetch error:', error);
    // })
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
    // .catch(function(error) {
    //   console.log('install error:', error);
    // })
  )
})

// Delete outdated caches
self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keyList) {
      // `keyList` contains all cache names under your username.github.io
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
    // .catch(function(error) {
    //   console.log('activate error:', error);
    // })
  )
})