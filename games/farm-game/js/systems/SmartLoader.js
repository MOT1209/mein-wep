/**
 * SmartLoader.js — نظام تحميل ذكي
 * تحميل تدريجي للموارد، caching، preloading للمناطق القادمة
 * Phase 3: Performance Optimization
 */
(function () {
  'use strict';

  GAME.SmartLoader = {
    loadedResources: {},
    loadingQueue: [],
    isPreloading: false,

    init: function (game) {
      this.game = game;
      this.setupCache();
      console.log('📦 SmartLoader initialized');
    },

    // ── Service Worker Registration ──────────────────────────────
    setupCache: function () {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').catch(function () {
          // SW not available — graceful degradation
        });
      }
    },

    // ── Texture Loading (with cache) ─────────────────────────────
    loadTexture: function (path) {
      var self = this;
      return new Promise(function (resolve, reject) {
        if (self.loadedResources[path]) {
          resolve(self.loadedResources[path]);
          return;
        }

        var loader = new THREE.TextureLoader();
        loader.load(
          path,
          function (texture) {
            self.loadedResources[path] = texture;
            resolve(texture);
          },
          undefined,
          reject
        );
      });
    },

    // ── GLTF Model Loading (with cache) ──────────────────────────
    loadModel: function (path) {
      var self = this;
      return new Promise(function (resolve, reject) {
        if (self.loadedResources[path]) {
          resolve(self.loadedResources[path]);
          return;
        }

        var loader = new THREE.GLTFLoader();
        loader.load(
          path,
          function (gltf) {
            self.loadedResources[path] = gltf;
            resolve(gltf);
          },
          undefined,
          reject
        );
      });
    },

    // ── Batch Preloading ─────────────────────────────────────────
    preloadAssets: function (assetList) {
      var self = this;
      this.isPreloading = true;

      var promises = assetList.map(function (asset) {
        if (asset.type === 'texture') {
          return self.loadTexture(asset.path);
        } else if (asset.type === 'model') {
          return self.loadModel(asset.path);
        }
      });

      return Promise.all(promises).then(function () {
        self.isPreloading = false;
      });
    },

    // ── Zone-based Preloading ────────────────────────────────────
    preloadZoneAssets: function (zoneId) {
      var zoneAssets = {
        farm: [
          { type: 'texture', path: 'assets/textures/grass.jpg' },
          { type: 'texture', path: 'assets/textures/dirt.jpg' }
        ],
        village: [
          { type: 'texture', path: 'assets/textures/stone.jpg' },
          { type: 'model', path: 'assets/models/house.glb' }
        ],
        forest: [
          { type: 'texture', path: 'assets/textures/bark.jpg' },
          { type: 'model', path: 'assets/models/tree.glb' }
        ],
        mine: [
          { type: 'texture', path: 'assets/textures/rock.jpg' },
          { type: 'model', path: 'assets/models/crystal.glb' }
        ],
        beach: [
          { type: 'texture', path: 'assets/textures/sand.jpg' },
          { type: 'texture', path: 'assets/textures/water.jpg' }
        ],
        mountain: [
          { type: 'texture', path: 'assets/textures/snow.jpg' },
          { type: 'model', path: 'assets/models/mountain.glb' }
        ]
      };

      var assets = zoneAssets[zoneId] || [];
      return this.preloadAssets(assets);
    },

    // ── Cache Management ─────────────────────────────────────────
    clearCache: function () {
      this.loadedResources = {};
    },

    getCacheSize: function () {
      var size = 0;
      for (var key in this.loadedResources) {
        if (this.loadedResources[key] && this.loadedResources[key].image) {
          size += this.loadedResources[key].image.data.byteLength || 0;
        }
      }
      return size;
    }
  };
})();
