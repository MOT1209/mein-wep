var GAME = GAME || {};

GAME.DisposeManager = {
    // ═══════════════════════════════════════════════════════════
    // DisposeManager - Safe Three.js Object Disposal
    // Fixes memory leaks by properly cleaning up GPU resources
    // ═══════════════════════════════════════════════════════════

    _disposedCount: 0,

    // ───────────────────────────────────────────────────────────
    // disposeMesh(mesh) - Dispose a single mesh and all its children
    // ───────────────────────────────────────────────────────────
    disposeMesh: function(mesh) {
        if (!mesh) return;

        // Dispose geometry
        if (mesh.geometry) {
            mesh.geometry.dispose();
        }

        // Dispose material(s)
        if (mesh.material) {
            if (Array.isArray(mesh.material)) {
                mesh.material.forEach(function(m) {
                    this._disposeMaterial(m);
                }.bind(this));
            } else {
                this._disposeMaterial(mesh.material);
            }
        }

        // Dispose textures on the mesh itself
        if (mesh.texture) {
            mesh.texture.dispose();
        }

        // Recursively dispose children
        if (mesh.children && mesh.children.length > 0) {
            // Copy array since we're modifying it during iteration
            var childrenCopy = mesh.children.slice();
            childrenCopy.forEach(function(child) {
                this.disposeMesh(child);
            }.bind(this));
        }

        // Remove from parent
        if (mesh.parent) {
            mesh.parent.remove(mesh);
        }

        this._disposedCount++;
    },

    // ───────────────────────────────────────────────────────────
    // _disposeMaterial(material) - Safely dispose a material
    // ───────────────────────────────────────────────────────────
    _disposeMaterial: function(material) {
        if (!material) return;

        // Dispose all textures referenced by the material
        var textureKeys = [
            'map', 'normalMap', 'bumpMap', 'emissiveMap',
            'specularMap', 'envMap', 'alphaMap', 'aoMap',
            'gradientMap', 'lightMap', 'metalnessMap', 'roughnessMap'
        ];

        textureKeys.forEach(function(key) {
            if (material[key] && material[key].dispose) {
                material[key].dispose();
            }
        });

        // Dispose the material itself
        material.dispose();
    },

    // ───────────────────────────────────────────────────────────
    // disposeScene(scene) - Clean up an entire scene
    // ───────────────────────────────────────────────────────────
    disposeScene: function(scene) {
        if (!scene) return;

        var childrenCopy = scene.children.slice();
        childrenCopy.forEach(function(child) {
            this.disposeMesh(child);
        }.bind(this));
    },

    // ───────────────────────────────────────────────────────────
    // disposeObject(obj) - Dispose a generic Object3D
    // ───────────────────────────────────────────────────────────
    disposeObject: function(obj) {
        if (!obj) return;

        // If it's a mesh, use the full mesh disposal
        if (obj.isMesh) {
            this.disposeMesh(obj);
            return;
        }

        // For non-mesh objects, still clean up children and textures
        if (obj.geometry) obj.geometry.dispose();

        if (obj.children && obj.children.length > 0) {
            var childrenCopy = obj.children.slice();
            childrenCopy.forEach(function(child) {
                this.disposeObject(child);
            }.bind(this));
        }

        if (obj.parent) obj.parent.remove(obj);
    },

    // ───────────────────────────────────────────────────────────
    // disposeMeshArray(meshes) - Batch dispose an array of meshes
    // ───────────────────────────────────────────────────────────
    disposeMeshArray: function(meshes) {
        if (!meshes || !Array.isArray(meshes)) return;

        meshes.forEach(function(mesh) {
            this.disposeMesh(mesh);
        }.bind(this));
    },

    // ───────────────────────────────────────────────────────────
    // disposeTexture(texture) - Dispose a single texture
    // ───────────────────────────────────────────────────────────
    disposeTexture: function(texture) {
        if (texture && texture.dispose) {
            texture.dispose();
        }
    },

    // ───────────────────────────────────────────────────────────
    // disposeAll() - Dispose all known game objects
    // Called on scene reset, level change, or page unload
    // ───────────────────────────────────────────────────────────
    disposeAll: function() {
        this._disposedCount = 0;

        // Dispose world objects
        if (GAME.world && GAME.world.mesh) {
            this.disposeMesh(GAME.world.mesh);
        }

        // Dispose player
        if (GAME.player && GAME.player.mesh) {
            this.disposeMesh(GAME.player.mesh);
        }

        // Dispose animals
        if (GAME.AnimalsSystem && GAME.AnimalsSystem.animals) {
            var animals = GAME.AnimalsSystem.animals;
            if (Array.isArray(animals)) {
                this.disposeMeshArray(animals.map(function(a) { return a.mesh; }).filter(Boolean));
            }
        }

        // Dispose NPCs
        if (GAME.NPCsSystem && GAME.NPCsSystem.npcs) {
            var npcs = GAME.NPCsSystem.npcs;
            if (Array.isArray(npcs)) {
                this.disposeMeshArray(npcs.map(function(n) { return n.mesh; }).filter(Boolean));
            }
        }

        // Dispose buildings
        if (GAME.BuildingsSystem && GAME.BuildingsSystem.buildings) {
            var buildings = GAME.BuildingsSystem.buildings;
            if (Array.isArray(buildings)) {
                this.disposeMeshArray(buildings.map(function(b) { return b.mesh; }).filter(Boolean));
            }
        }

        // Dispose farm plots
        if (GAME.FarmingSystem && GAME.FarmingSystem.plots) {
            var plots = GAME.FarmingSystem.plots;
            if (Array.isArray(plots)) {
                this.disposeMeshArray(plots.map(function(p) { return p.mesh; }).filter(Boolean));
            }
        }

        // Dispose scene
        if (GAME.game && GAME.game.scene) {
            this.disposeScene(GAME.game.scene);
        }

        console.log('[DisposeManager] ✅ Disposed ' + this._disposedCount + ' objects');
        return this._disposedCount;
    },

    // ───────────────────────────────────────────────────────────
    // disposeByTag(tag) - Dispose all meshes with a specific userData tag
    // ───────────────────────────────────────────────────────────
    disposeByTag: function(tag) {
        if (!GAME.game || !GAME.game.scene) return;

        var scene = GAME.game.scene;
        var count = 0;

        scene.traverse(function(obj) {
            if (obj.isMesh && obj.userData && obj.userData.tag === tag) {
                this.disposeMesh(obj);
                count++;
            }
        }.bind(this));

        return count;
    },

    // ───────────────────────────────────────────────────────────
    // disposeOutsideRadius(center, radius) - Cull distant objects
    // Useful for world streaming / performance
    // ───────────────────────────────────────────────────────────
    disposeOutsideRadius: function(center, radius) {
        if (!GAME.game || !GAME.game.scene) return;

        var scene = GAME.game.scene;
        var count = 0;

        // Collect first, then dispose (to avoid modifying during traverse)
        var toDispose = [];
        scene.traverse(function(obj) {
            if (obj.isMesh && obj.position) {
                var dx = obj.position.x - center.x;
                var dz = obj.position.z - center.z;
                var dist = Math.sqrt(dx * dx + dz * dz);
                if (dist > radius) {
                    toDispose.push(obj);
                }
            }
        });

        toDispose.forEach(function(mesh) {
            this.disposeMesh(mesh);
            count++;
        }.bind(this));

        return count;
    },

    // ───────────────────────────────────────────────────────────
    // getStats() - Get disposal statistics
    // ───────────────────────────────────────────────────────────
    getStats: function() {
        return {
            totalDisposed: this._disposedCount
        };
    }
};

// Auto-init on load
console.log('[DisposeManager] ✅ Loaded — Safe Three.js disposal system ready');
