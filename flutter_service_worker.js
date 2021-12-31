'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "assets/AssetManifest.json": "7a10c11653361455abd091d1c9e270a8",
"assets/assets/about.html": "cca535e84bb3f1ad20cd1423638d0253",
"assets/assets/arduino.png": "6d41bdb70df59613037a60b019cded1e",
"assets/assets/behance.png": "b6e0a8570ffa0d1fbaa594361fed39d4",
"assets/assets/carlos.png": "4b8c68ad6fca1b0f34f0a8b2c4e70af5",
"assets/assets/dart.png": "9271c5feaa7176d4bc87467c11eaa8c0",
"assets/assets/espressif.png": "5ee59ad347ccef2d6fa2e030b014da3f",
"assets/assets/facebook.png": "021ada146ffb7c1753557ff29618d04c",
"assets/assets/figma.png": "9379d1914917bc2699dd5ee5eff78d57",
"assets/assets/firebase.png": "bb5d30fec65686babae2e8caa53666c3",
"assets/assets/flutter.png": "67642a0b80f3d50277c44cde8f450e50",
"assets/assets/FontManifest.json": "59c37979205b4b43589051e92e27cbcd",
"assets/assets/github.png": "d22ee3727a7216019c3848df6eafa024",
"assets/assets/gmail.png": "d04efe7341f7f30d7094cd39a5396c5c",
"assets/assets/GoogleSansRegular.ttf": "b5c77a6aed75cdad9489effd0d5ea411",
"assets/assets/hackster.png": "df23ea0991d898c79f66a67a95d1891e",
"assets/assets/instagram.png": "26631a4043b14dff84180bdf51c3cacb",
"assets/assets/linkedin.png": "926e2dcf5ab4220a359867614556df68",
"assets/assets/medium.png": "fb86f4060325caef8ea1f0fad0d25f40",
"assets/assets/medium_light.png": "bd516690c99267a778885736015befe8",
"assets/assets/moon.png": "cc9a54adef0f29ab71f187b1606f8c29",
"assets/assets/node.png": "f1088aa7bfb900c3a6b0d6153eb6f21b",
"assets/assets/projects.png": "73b6903e22f90d2c91ff5d17afb8f667",
"assets/assets/sun.png": "ff33f0de4f88c23349289bcb5798cd42",
"assets/assets/twitter.png": "8f35a40403a84631c4125c4f1859c7a6",
"assets/assets/user_active.png": "4772f40f76b76552ddbc84b3398c6b66",
"assets/assets/user_inactive.png": "73b71895c36c81d66ba95aee7fcd8315",
"assets/assets/xd.png": "e73e4a836f46d32f4a4fa4da1439d1ba",
"assets/FontManifest.json": "dc3d03800ccca4601324923c0b1d6d57",
"assets/fonts/MaterialIcons-Regular.otf": "1288c9e28052e028aba623321f7826ac",
"assets/NOTICES": "24fa596c85f447d5bd242d9e84289332",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "6d342eb68f170c97609e9da345464e5e",
"favicon.png": "2f15bf5c81a76a8092e660f782e3edd5",
"icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
"icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1",
"index.html": "63454a66a2b1f21d68d36582f4cbfc4c",
"/": "63454a66a2b1f21d68d36582f4cbfc4c",
"main.dart.js": "75d690253b8468703cf8aac1c6dadb00",
"manifest.json": "0a457002a9bbc8ec18d0087d4282fed2",
"version.json": "a0944075e8c4fb333d0831b1f850d091"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "/",
"main.dart.js",
"index.html",
"assets/NOTICES",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value + '?revision=' + RESOURCES[value], {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache.
        return response || fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
