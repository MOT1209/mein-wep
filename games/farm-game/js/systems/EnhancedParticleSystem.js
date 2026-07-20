/**
 * EnhancedParticleSystem.js
 * ──────────────────────────────────────────────────────────────
 * نظام الجسيمات المحسّن مع Object Pooling لتقليل استهلاك الذاكرة
 * يتضمن: مطر، ثلج، أوراق، لمعان، غبار
 * 
 * Global: GAME.EnhancedParticleSystem
 * ──────────────────────────────────────────────────────────────
 */

(function () {
    'use strict';

    /* ── helper: reuse a Vector3 without allocation ── */
    var _tmpVec = (typeof THREE !== 'undefined') ? new THREE.Vector3() : { x: 0, y: 0, z: 0, set: function (x, y, z) { this.x = x; this.y = y; this.z = z; } };

    var EnhancedParticleSystem = {

        /* ── state ── */
        particles: [],
        pools: {},
        maxParticles: 500,
        game: null,
        _updateCounter: 0,
        _updateInterval: 2,          // update visuals every N frames (skip frames for perf)
        _enabled: true,

        /* ───────────────────── init ───────────────────── */
        init: function (game) {
            this.game = game || {};
            this.particles = [];
            this.pools = {};
            this._updateCounter = 0;
            this._enabled = true;
            this.setupPools();
            return this;
        },

        /* ───────────────────── pool setup ─────────────── */
        setupPools: function () {
            this.createPool('rain', this._factoryRain.bind(this));
            this.createPool('snow', this._factorySnow.bind(this));
            this.createPool('leaf', this._factoryLeaf.bind(this));
            this.createPool('sparkle', this._factorySparkle.bind(this));
            this.createPool('dust', this._factoryDust.bind(this));
        },

        createPool: function (type, factory) {
            this.pools[type] = {
                available: [],
                factory: factory
            };
        },

        /* ────────────── get / return ──────────────────── */
        getFromPool: function (type) {
            var pool = this.pools[type];
            if (!pool) return this._factoryRain(); // fallback
            return pool.available.length > 0
                ? pool.available.pop()
                : pool.factory();
        },

        returnToPool: function (type, particle) {
            var pool = this.pools[type];
            if (pool) {
                particle.active = false;
                pool.available.push(particle);
            }
        },

        /* ────────────── factories ─────────────────────── */
        _factoryRain: function () {
            return {
                type: 'rain',
                position: new THREE.Vector3(),
                velocity: new THREE.Vector3(),
                life: 0,
                maxLife: 1,
                active: false,
                _color: 0x6ec6ff
            };
        },

        _factorySnow: function () {
            return {
                type: 'snow',
                position: new THREE.Vector3(),
                velocity: new THREE.Vector3(),
                life: 0,
                maxLife: 3,
                active: false,
                wobble: 0,
                wobbleSpeed: 0,
                _color: 0xffffff
            };
        },

        _factoryLeaf: function () {
            return {
                type: 'leaf',
                position: new THREE.Vector3(),
                velocity: new THREE.Vector3(),
                life: 0,
                maxLife: 4,
                active: false,
                rotation: 0,
                rotSpeed: 0,
                _color: 0x4caf50
            };
        },

        _factorySparkle: function () {
            return {
                type: 'sparkle',
                position: new THREE.Vector3(),
                velocity: new THREE.Vector3(),
                life: 0,
                maxLife: 0.6,
                active: false,
                size: 0.1,
                _color: 0xffeb3b
            };
        },

        _factoryDust: function () {
            return {
                type: 'dust',
                position: new THREE.Vector3(),
                velocity: new THREE.Vector3(),
                life: 0,
                maxLife: 1.5,
                active: false,
                _color: 0x8d6e63
            };
        },

        /* ────────────────── emit ──────────────────────── */
        emit: function (type, count, options) {
            if (!this._enabled) return;
            options = options || {};

            var spread = options.spread || 1;
            var i, particle;

            for (i = 0; i < count; i++) {
                /* enforce hard cap */
                if (this.particles.length >= this.maxParticles) {
                    var oldest = this.particles.shift();
                    if (oldest) this.returnToPool(oldest.type, oldest);
                }

                particle = this.getFromPool(type);
                particle.type = type;
                particle.active = true;
                particle.life = particle.maxLife;

                /* position */
                if (options.position) {
                    particle.position.copy(options.position);
                } else {
                    particle.position.set(0, 0, 0);
                }

                /* velocity */
                if (options.velocity) {
                    particle.velocity.copy(options.velocity);
                } else {
                    particle.velocity.set(
                        (Math.random() - 0.5) * spread,
                        (Math.random() - 0.5) * spread,
                        (Math.random() - 0.5) * spread
                    );
                }

                /* type-specific init */
                if (type === 'rain') {
                    particle.velocity.set(
                        -0.5 + Math.random() * 0.3,
                        -(8 + Math.random() * 4),
                        -0.5 + Math.random() * 0.3
                    );
                    particle.maxLife = 0.8 + Math.random() * 0.4;
                    particle.life = particle.maxLife;
                } else if (type === 'snow') {
                    particle.wobble = Math.random() * Math.PI * 2;
                    particle.wobbleSpeed = 1 + Math.random() * 2;
                    particle.velocity.set(
                        (Math.random() - 0.5) * 0.5,
                        -(1 + Math.random() * 1.5),
                        (Math.random() - 0.5) * 0.5
                    );
                    particle.maxLife = 2 + Math.random() * 2;
                    particle.life = particle.maxLife;
                } else if (type === 'leaf') {
                    particle.rotation = Math.random() * Math.PI * 2;
                    particle.rotSpeed = (Math.random() - 0.5) * 4;
                    particle.velocity.set(
                        (Math.random() - 0.5) * 2,
                        -(0.5 + Math.random()),
                        (Math.random() - 0.5) * 2
                    );
                    particle.maxLife = 3 + Math.random() * 2;
                    particle.life = particle.maxLife;
                } else if (type === 'sparkle') {
                    particle.size = 0.05 + Math.random() * 0.15;
                    particle.velocity.set(
                        (Math.random() - 0.5) * 3,
                        Math.random() * 3,
                        (Math.random() - 0.5) * 3
                    );
                    particle.maxLife = 0.3 + Math.random() * 0.4;
                    particle.life = particle.maxLife;
                } else if (type === 'dust') {
                    particle.velocity.set(
                        (Math.random() - 0.5) * 1.5,
                        Math.random() * 0.5,
                        (Math.random() - 0.5) * 1.5
                    );
                    particle.maxLife = 1 + Math.random() * 1;
                    particle.life = particle.maxLife;
                }

                /* random offset from source position */
                if (options.offsetRadius) {
                    var r = options.offsetRadius * Math.random();
                    var a = Math.random() * Math.PI * 2;
                    particle.position.x += Math.cos(a) * r;
                    particle.position.z += Math.sin(a) * r;
                }

                this.particles.push(particle);
            }
        },

        /* ──────────── convenience emitters ────────────── */
        emitRain: function (position, count) {
            this.emit('rain', count || 20, { position: position, offsetRadius: 5 });
        },

        emitSnow: function (position, count) {
            this.emit('snow', count || 15, { position: position, offsetRadius: 8 });
        },

        emitLeaves: function (position, count) {
            this.emit('leaf', count || 10, { position: position, offsetRadius: 3, spread: 2 });
        },

        emitSparkles: function (position, count) {
            this.emit('sparkle', count || 8, { position: position, offsetRadius: 1, spread: 2 });
        },

        emitDust: function (position, count) {
            this.emit('dust', count || 12, { position: position, offsetRadius: 2, spread: 1 });
        },

        /* ────────────────── update ─────────────────────── */
        update: function (dt) {
            if (!this._enabled || this.particles.length === 0) return;

            this._updateCounter++;
            if (this._updateCounter % this._updateInterval !== 0) return; // skip frames

            var i, p, alpha, t;

            for (i = this.particles.length - 1; i >= 0; i--) {
                p = this.particles[i];

                /* physics */
                p.position.x += p.velocity.x * dt;
                p.position.y += p.velocity.y * dt;
                p.position.z += p.velocity.z * dt;

                /* type-specific update */
                if (p.type === 'rain') {
                    /* slight wind drift */
                    p.velocity.x += (Math.random() - 0.5) * 0.1 * dt;
                } else if (p.type === 'snow') {
                    p.wobble += p.wobbleSpeed * dt;
                    p.velocity.x += Math.sin(p.wobble) * 0.3 * dt;
                    p.velocity.z += Math.cos(p.wobble) * 0.3 * dt;
                    /* air resistance */
                    p.velocity.y *= (1 - 0.2 * dt);
                } else if (p.type === 'leaf') {
                    p.rotation += p.rotSpeed * dt;
                    p.wobble = (p.wobble || 0) + 2 * dt;
                    p.velocity.x += Math.sin(p.wobble) * 0.5 * dt;
                    p.velocity.y *= (1 - 0.1 * dt); // drag
                } else if (p.type === 'sparkle') {
                    /* gravity pull */
                    p.velocity.y -= 4 * dt;
                    /* shrink near end of life */
                    t = p.life / p.maxLife;
                    p.size = 0.1 * t;
                } else if (p.type === 'dust') {
                    /* gentle float upward */
                    p.velocity.y += 0.2 * dt;
                    p.velocity.x *= (1 - 0.3 * dt);
                    p.velocity.z *= (1 - 0.3 * dt);
                }

                /* life */
                p.life -= dt;

                /* calculate alpha for visual fade (0‑1) */
                alpha = Math.max(0, p.life / p.maxLife);

                /* attach computed alpha so renderers can use it */
                p.alpha = alpha;

                /* remove dead */
                if (p.life <= 0) {
                    this.returnToPool(p.type, p);
                    this.particles.splice(i, 1);
                }
            }
        },

        /* ──────────── rain / snow continuous helpers ──── */
        _rainTimer: 0,
        _snowTimer: 0,
        _rainActive: false,
        _snowActive: false,
        _rainPosition: null,
        _snowPosition: null,

        startRain: function (position, intensity) {
            this._rainActive = true;
            this._rainPosition = position ? position.clone() : new THREE.Vector3(0, 20, 0);
            this._rainIntensity = intensity || 20; // particles per tick
        },

        stopRain: function () {
            this._rainActive = false;
        },

        startSnow: function (position, intensity) {
            this._snowActive = true;
            this._snowPosition = position ? position.clone() : new THREE.Vector3(0, 25, 0);
            this._snowIntensity = intensity || 12;
        },

        stopSnow: function () {
            this._snowActive = false;
        },

        updateWeather: function (dt) {
            if (this._rainActive) {
                this._rainTimer += dt;
                if (this._rainTimer >= 0.1) {
                    this._rainTimer = 0;
                    this.emitRain(this._rainPosition, this._rainIntensity);
                }
            }
            if (this._snowActive) {
                this._snowTimer += dt;
                if (this._snowTimer >= 0.2) {
                    this._snowTimer = 0;
                    this.emitSnow(this._snowPosition, this._snowIntensity);
                }
            }
        },

        /* ────────────── clear / stats ─────────────────── */
        clear: function () {
            var i, p;
            for (i = this.particles.length - 1; i >= 0; i--) {
                p = this.particles[i];
                this.returnToPool(p.type, p);
            }
            this.particles = [];
            this._rainActive = false;
            this._snowActive = false;
        },

        getCount: function () {
            return this.particles.length;
        },

        getPoolStats: function () {
            var stats = {};
            for (var type in this.pools) {
                stats[type] = this.pools[type].available.length;
            }
            stats.totalActive = this.particles.length;
            stats.maxAllowed = this.maxParticles;
            return stats;
        },

        /* ────────────── enable / disable ──────────────── */
        enable: function () {
            this._enabled = true;
        },

        disable: function () {
            this._enabled = false;
            this.clear();
        },

        setMaxParticles: function (max) {
            this.maxParticles = Math.max(50, Math.min(max, 2000));
        },

        /* ──────────── dispose (cleanup all pools) ─────── */
        dispose: function () {
            this.clear();
            this.pools = {};
            this.game = null;
        }
    };

    /* ── attach to GAME ── */
    if (typeof GAME !== 'undefined') {
        GAME.EnhancedParticleSystem = EnhancedParticleSystem;
    } else {
        // fallback for standalone testing
        if (typeof window !== 'undefined') {
            window.GAME = window.GAME || {};
            window.GAME.EnhancedParticleSystem = EnhancedParticleSystem;
        }
    }

})();
