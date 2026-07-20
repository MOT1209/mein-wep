/**
 * MemoryManager.js - نظام تحسين الذاكرة
 * مراقبة استهلاك الذاكرة وتنظيف تلقائي
 * تحرير الكائنات غير المستخدمة ومنع تسريب الذاكرة
 */

if (typeof GAME === 'undefined') var GAME = {};

GAME.MemoryManager = {
  cleanupInterval: 30000,
  lastCleanup: 0,
  memoryThreshold: 500, // MB
  monitoringActive: false,
  _monitorInterval: null,

  init: function(game) {
    this.game = game;
    this.startMonitoring();
    console.log('[MemoryManager] Initialized - threshold:', this.memoryThreshold, 'MB');
  },

  startMonitoring: function() {
    if (this.monitoringActive) return;
    var self = this;
    this.monitoringActive = true;
    this._monitorInterval = setInterval(function() {
      self.monitor();
    }, 5000);
  },

  stopMonitoring: function() {
    if (this._monitorInterval) {
      clearInterval(this._monitorInterval);
      this._monitorInterval = null;
    }
    this.monitoringActive = false;
  },

  monitor: function() {
    var now = Date.now();

    // Check memory usage
    if (performance.memory) {
      var usedMB = performance.memory.usedJSHeapSize / 1024 / 1024;

      // Force cleanup if memory is high
      if (usedMB > this.memoryThreshold) {
        this.forceCleanup();
      }

      // Periodic cleanup
      if (now - this.lastCleanup > this.cleanupInterval) {
        this.cleanup();
        this.lastCleanup = now;
      }
    }
  },

  cleanup: function() {
    // Dispose unused geometries
    this.disposeUnusedGeometries();

    // Dispose unused materials
    this.disposeUnusedMaterials();

    // Dispose unused textures
    this.disposeUnusedTextures();

    // Clear event listeners
    this.clearOldEventListeners();

    // Clear caches
    this.clearCaches();

    // Run object pools cleanup if available
    if (GAME.ObjectPool) {
      // ObjectPool handles its own cleanup internally
    }

    console.log('[MemoryManager] Cleanup completed');
  },

  forceCleanup: function() {
    console.log('[MemoryManager] Memory threshold exceeded, forcing cleanup...');

    // Run standard cleanup first
    this.cleanup();

    // Clear SmartLoader cache aggressively
    if (GAME.SmartLoader) {
      GAME.SmartLoader.clearCache();
    }

    // Force garbage collection if available (dev mode)
    if (window.gc) {
      try {
        window.gc();
      } catch (e) {
        // gc() not available in production
      }
    }

    // Log memory state after cleanup
    this.logMemory();
  },

  disposeUnusedGeometries: function() {
    if (!GAME.scene) return;

    var geometries = [];
    GAME.scene.traverse(function(obj) {
      if (obj.geometry && !obj.parent) {
        geometries.push(obj.geometry);
      }
    });

    var disposed = 0;
    geometries.forEach(function(geo) {
      if (geo && !geo._disposed) {
        geo.dispose();
        geo._disposed = true;
        disposed++;
      }
    });

    if (disposed > 0) {
      console.log('[MemoryManager] Disposed', disposed, 'unused geometries');
    }
  },

  disposeUnusedMaterials: function() {
    var materials = [];

    // Check scene materials
    if (GAME.scene) {
      GAME.scene.traverse(function(obj) {
        if (obj.material && !obj.parent) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach(function(m) { materials.push(m); });
          } else {
            materials.push(obj.material);
          }
        }
      });
    }

    var disposed = 0;
    materials.forEach(function(mat) {
      if (mat && !mat._disposed) {
        if (mat.map) mat.map.dispose();
        if (mat.normalMap) mat.normalMap.dispose();
        if (mat.roughnessMap) mat.roughnessMap.dispose();
        if (mat.metalnessMap) mat.metalnessMap.dispose();
        if (mat.alphaMap) mat.alphaMap.dispose();
        if (mat.emissiveMap) mat.emissiveMap.dispose();
        mat.dispose();
        mat._disposed = true;
        disposed++;
      }
    });

    if (disposed > 0) {
      console.log('[MemoryManager] Disposed', disposed, 'unused materials');
    }
  },

  disposeUnusedTextures: function() {
    if (!GAME.renderer) return;

    var disposed = 0;
    try {
      // Access renderer properties for texture cache
      var properties = GAME.renderer.properties;
      if (properties && properties.textures) {
        properties.textures.forEach(function(tex) {
          if (tex && !tex._disposed) {
            tex.dispose();
            tex._disposed = true;
            disposed++;
          }
        });
      }
    } catch (e) {
      // Fallback: manual texture tracking
    }

    if (disposed > 0) {
      console.log('[MemoryManager] Disposed', disposed, 'unused textures');
    }
  },

  clearOldEventListeners: function() {
    // Clear any old event listeners tracked by the game
    if (GAME.eventListeners && Array.isArray(GAME.eventListeners)) {
      var count = GAME.eventListeners.length;
      GAME.eventListeners = [];
      if (count > 0) {
        console.log('[MemoryManager] Cleared', count, 'old event listeners');
      }
    }
  },

  clearCaches: function() {
    // Clear SmartLoader cache if it exceeds 100MB
    if (GAME.SmartLoader && typeof GAME.SmartLoader.getCacheSize === 'function') {
      var cacheSize = GAME.SmartLoader.getCacheSize();
      if (cacheSize > 100 * 1024 * 1024) { // 100MB
        console.log('[MemoryManager] SmartLoader cache exceeds 100MB, clearing...');
        GAME.SmartLoader.clearCache();
      }
    }

    // Clear renderer texture cache if available
    if (GAME.renderer && GAME.renderer.info) {
      var textureCount = GAME.renderer.info.memory.textures;
      if (textureCount > 200) {
        console.log('[MemoryManager] High texture count:', textureCount);
      }
    }
  },

  getMemoryStats: function() {
    if (!performance.memory) return null;

    return {
      used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
      total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
      limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024),
      percentage: Math.round((performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100)
    };
  },

  getRendererStats: function() {
    if (!GAME.renderer || !GAME.renderer.info) return null;

    return {
      geometries: GAME.renderer.info.memory.geometries,
      textures: GAME.renderer.info.memory.textures,
      programs: GAME.renderer.info.memory.programs,
      calls: GAME.renderer.info.render.calls,
      triangles: GAME.renderer.info.render.triangles
    };
  },

  logMemory: function() {
    var stats = this.getMemoryStats();
    var rendererStats = this.getRendererStats();

    if (stats) {
      console.log(
        '[MemoryManager] Memory:',
        stats.used + 'MB / ' + stats.limit + 'MB',
        '(' + stats.percentage + '%)'
      );
    }

    if (rendererStats) {
      console.log(
        '[MemoryManager] Renderer:',
        'Geometries:', rendererStats.geometries,
        'Textures:', rendererStats.textures,
        'Programs:', rendererStats.programs
      );
    }
  },

  /**
   * Get full diagnostic report for debugging
   */
  getReport: function() {
    return {
      memory: this.getMemoryStats(),
      renderer: this.getRendererStats(),
      monitoring: this.monitoringActive,
      threshold: this.memoryThreshold,
      lastCleanup: this.lastCleanup,
      timeSinceLastCleanup: Date.now() - this.lastCleanup
    };
  }
};
