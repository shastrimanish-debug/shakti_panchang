/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If the loader is already loaded, just stop.
if (!self.define) {
  let registry = {};

  // Used for `eval` and `importScripts` where we can't get script URL by other means.
  // In both cases, it's safe to use a global var because those functions are synchronous.
  let nextDefineUri;

  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + ".js", parentUri).href;
    return registry[uri] || (
      
        new Promise(resolve => {
          if ("document" in self) {
            const script = document.createElement("script");
            script.src = uri;
            script.onload = resolve;
            document.head.appendChild(script);
          } else {
            nextDefineUri = uri;
            importScripts(uri);
            resolve();
          }
        })
      
      .then(() => {
        let promise = registry[uri];
        if (!promise) {
          throw new Error(`Module ${uri} didn’t register its module`);
        }
        return promise;
      })
    );
  };

  self.define = (depsNames, factory) => {
    const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
    if (registry[uri]) {
      // Module is already loading or loaded.
      return;
    }
    let exports = {};
    const require = depUri => singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require
    };
    registry[uri] = Promise.all(depsNames.map(
      depName => specialDeps[depName] || require(depName)
    )).then(deps => {
      factory(...deps);
      return exports;
    });
  };
}
define(['./workbox-afac4cd2'], (function (workbox) { 'use strict';

  self.skipWaiting();
  workbox.clientsClaim();
  /**
   * The precacheAndRoute() method efficiently caches and responds to
   * requests for URLs in the manifest.
   * See https://goo.gl/S9QRab
   */
  workbox.precacheAndRoute([{
    "url": "screenshot-5-global.png",
    "revision": "31bae6557adaebadf5072c7883ae2398"
  }, {
    "url": "screenshot-4-yatra.png",
    "revision": "ff50947b93ba0c4124b2a5337c561c35"
  }, {
    "url": "screenshot-3-milan.png",
    "revision": "3a77c3150545d34caafdb0bf7fda060d"
  }, {
    "url": "screenshot-2-kundali.png",
    "revision": "ebacc6351d76b917357d41724b3a74b2"
  }, {
    "url": "screenshot-1-panchang.png",
    "revision": "63209f13c688cd4a107698bd6d4b6c7b"
  }, {
    "url": "playstore-icon-512x512.png",
    "revision": "065c72a74c4091ae22d0ada697bbf61d"
  }, {
    "url": "logo.svg",
    "revision": "0ff9a61b7c53c131a1e74a5129f90c9e"
  }, {
    "url": "logo.png",
    "revision": "da1ef67b5e4c6149fbf5eb01c0643209"
  }, {
    "url": "index.html",
    "revision": "3a956952209f198e75ac7c6eb8cc88ef"
  }, {
    "url": "icon-512.png",
    "revision": "05a9b6942636510d060420468cd18b1a"
  }, {
    "url": "icon-192.png",
    "revision": "9e56ebaec90916c6f4f672cbfae785de"
  }, {
    "url": "feature-graphic.png",
    "revision": "7d23a958fe333a681d823ab6c627eac3"
  }, {
    "url": "feature-graphic-1024x500.png",
    "revision": "7d23a958fe333a681d823ab6c627eac3"
  }, {
    "url": "favicon.png",
    "revision": "ca0673a7abb0bce121068f6266f77e61"
  }, {
    "url": "assets/vendor-DK8IkU_w.js",
    "revision": null
  }, {
    "url": "assets/purify.es-CYR4BTuT.js",
    "revision": null
  }, {
    "url": "assets/index.es-DNLf5HAe.js",
    "revision": null
  }, {
    "url": "assets/index-BYXOQu47.js",
    "revision": null
  }, {
    "url": "assets/index-BACBtMIn.css",
    "revision": null
  }, {
    "url": "assets/html2canvas.esm-QH1iLAAe.js",
    "revision": null
  }, {
    "url": "assets/astronomy-D_JbEct0.js",
    "revision": null
  }, {
    "url": "logo.png",
    "revision": "da1ef67b5e4c6149fbf5eb01c0643209"
  }, {
    "url": "manifest.json",
    "revision": "767f8394d0ec717ba55473afe4c5c1a8"
  }, {
    "url": "manifest.webmanifest",
    "revision": "de84aff6b590dd61fc4bc05380d27739"
  }], {});
  workbox.cleanupOutdatedCaches();
  workbox.registerRoute(new workbox.NavigationRoute(workbox.createHandlerBoundToURL("index.html")));
  workbox.registerRoute(/^https:\/\/fonts\.googleapis\.com\/.*/i, new workbox.CacheFirst({
    "cacheName": "google-fonts-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 10,
      maxAgeSeconds: 31536000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');
  workbox.registerRoute(/^https:\/\/fonts\.gstatic\.com\/.*/i, new workbox.CacheFirst({
    "cacheName": "gstatic-fonts-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 10,
      maxAgeSeconds: 31536000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');

}));
