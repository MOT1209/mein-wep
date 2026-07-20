/**
 * CombatSystem.js — Simple combat system for farm game
 * Enemy types: slime, skeleton, ghost
 * Spawns in forest/mine areas, attack with F key or button
 */
GAME.CombatSystem = {
  enemies: [],
  maxEnemies: 5,
  attackRange: 2.5,
  attackCooldown: 0,
  attackCooldownMax: 0.5,
  attackDamage: 10,
  isAttacking: false,
  attackAnimationTime: 0,

  enemyTypes: {
    slime: {
      health: 30, damage: 5, speed: 1.5, xp: 10,
      drops: { slimeGel: 1 }, color: 0x00ff00,
      scale: 0.6, name: 'Slime'
    },
    skeleton: {
      health: 50, damage: 10, speed: 2, xp: 25,
      drops: { bone: 2 }, color: 0xffffff,
      scale: 0.8, name: 'Skeleton'
    },
    ghost: {
      health: 40, damage: 8, speed: 2.5, xp: 20,
      drops: { ectoplasm: 1 }, color: 0x8888ff,
      scale: 0.7, name: 'Ghost'
    }
  },

  spawnAreas: {
    forest: { center: { x: -40, z: -30 }, radius: 15, types: ['slime', 'skeleton'] },
    mine: { center: { x: 40, z: -30 }, radius: 12, types: ['skeleton', 'ghost'] }
  },

  init: function(game) {
    this.game = game;
    this.scene = game.scene;
    this.attackCooldown = 0;
    this.isAttacking = false;
    this.attackAnimationTime = 0;
    this.spawnEnemies();
    this.bindInput();
    this.createAttackEffectPool();
  },

  update: function(dt) {
    this.updateCooldowns(dt);
    this.updateEnemies(dt);
    this.updateAttackAnimation(dt);
    this.checkPlayerDamage();
    this.respawnCheck();
  },

  // ─── Input ────────────────────────────────────────────
  bindInput: function() {
    var self = this;
    document.addEventListener('keydown', function(e) {
      if (e.key === 'f' || e.key === 'F') {
        self.attack();
      }
    });
  },

  // ─── Cooldowns ────────────────────────────────────────
  updateCooldowns: function(dt) {
    if (this.attackCooldown > 0) {
      this.attackCooldown -= dt;
    }
  },

  // ─── Attack ───────────────────────────────────────────
  attack: function() {
    if (this.attackCooldown > 0 || this.isAttacking) return;

    var playerPos = GAME.player.mesh.position;
    var hitSomething = false;

    for (var i = this.enemies.length - 1; i >= 0; i--) {
      var enemy = this.enemies[i];
      if (!enemy.alive) continue;
      var dist = playerPos.distanceTo(enemy.mesh.position);
      if (dist < this.attackRange) {
        enemy.health -= this.attackDamage;
        this.spawnAttackEffect(enemy.mesh.position);
        this.spawnDamageNumber(enemy.mesh.position, this.attackDamage);
        hitSomething = true;
        if (enemy.health <= 0) {
          this.killEnemy(i);
        }
      }
    }

    this.isAttacking = true;
    this.attackAnimationTime = 0.3;
    this.attackCooldown = this.attackCooldownMax;
  },

  // ─── Attack Animation ─────────────────────────────────
  updateAttackAnimation: function(dt) {
    if (!this.isAttacking) return;
    this.attackAnimationTime -= dt;
    if (this.attackAnimationTime <= 0) {
      this.isAttacking = false;
    }
  },

  // ─── Enemy Spawning ───────────────────────────────────
  spawnEnemies: function() {
    var areaNames = Object.keys(this.spawnAreas);
    for (var a = 0; a < areaNames.length; a++) {
      var area = this.spawnAreas[areaNames[a]];
      var count = Math.floor(this.maxEnemies / areaNames.length);
      for (var i = 0; i < count; i++) {
        var typeKey = area.types[Math.floor(Math.random() * area.types.length)];
        this.spawnEnemy(typeKey, area);
      }
    }
  },

  spawnEnemy: function(typeKey, area) {
    var type = this.enemyTypes[typeKey];
    var group = new THREE.Group();

    // Body
    var bodyGeo, bodyMat, bodyMesh;
    if (typeKey === 'slime') {
      bodyGeo = new THREE.SphereGeometry(type.scale, 12, 8);
      bodyMat = new THREE.MeshLambertMaterial({ color: type.color });
      bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
      bodyMesh.scale.y = 0.7;
    } else if (typeKey === 'skeleton') {
      bodyGeo = new THREE.CylinderGeometry(type.scale * 0.3, type.scale * 0.4, type.scale * 1.5, 8);
      bodyMat = new THREE.MeshLambertMaterial({ color: type.color });
      bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
      // Head
      var headGeo = new THREE.SphereGeometry(type.scale * 0.35, 8, 8);
      var headMat = new THREE.MeshLambertMaterial({ color: type.color });
      var head = new THREE.Mesh(headGeo, headMat);
      head.position.y = type.scale * 1.0;
      group.add(head);
      // Eyes
      var eyeGeo = new THREE.SphereGeometry(0.06, 6, 6);
      var eyeMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
      var eyeL = new THREE.Mesh(eyeGeo, eyeMat);
      eyeL.position.set(-0.1, type.scale * 1.05, 0.25);
      var eyeR = new THREE.Mesh(eyeGeo, eyeMat);
      eyeR.position.set(0.1, type.scale * 1.05, 0.25);
      group.add(eyeL, eyeR);
    } else {
      // ghost
      bodyGeo = new THREE.SphereGeometry(type.scale, 10, 8);
      bodyMat = new THREE.MeshLambertMaterial({
        color: type.color,
        transparent: true,
        opacity: 0.6
      });
      bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
      bodyMesh.scale.y = 1.2;
    }

    bodyMesh.position.y = type.scale;
    group.add(bodyMesh);

    // Health bar background
    var hbBgGeo = new THREE.PlaneGeometry(1, 0.12);
    var hbBgMat = new THREE.MeshBasicMaterial({ color: 0x333333, side: THREE.DoubleSide });
    var hbBg = new THREE.Mesh(hbBgGeo, hbBgMat);
    hbBg.position.y = type.scale * 2 + 0.3;
    hbBg.rotation.x = 0;
    group.add(hbBg);

    // Health bar fill
    var hbGeo = new THREE.PlaneGeometry(1, 0.1);
    var hbMat = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide });
    var hb = new THREE.Mesh(hbGeo, hbMat);
    hb.position.y = type.scale * 2 + 0.3;
    hb.position.z = 0.01;
    group.add(hb);

    // Position
    var angle = Math.random() * Math.PI * 2;
    var dist = Math.random() * area.radius;
    var x = area.center.x + Math.cos(angle) * dist;
    var z = area.center.z + Math.sin(angle) * dist;
    group.position.set(x, 0, z);

    this.scene.add(group);

    var enemy = {
      mesh: group,
      bodyMesh: bodyMesh,
      healthBar: hb,
      healthBarBg: hbBg,
      type: typeKey,
      health: type.health,
      maxHealth: type.health,
      damage: type.damage,
      speed: type.speed,
      xp: type.xp,
      drops: type.drops,
      alive: true,
      wobbleOffset: Math.random() * Math.PI * 2,
      originalY: 0,
      knockbackVel: new THREE.Vector3()
    };

    this.enemies.push(enemy);
    return enemy;
  },

  // ─── Enemy Update ─────────────────────────────────────
  updateEnemies: function(dt) {
    var playerPos = GAME.player.mesh.position;

    for (var i = 0; i < this.enemies.length; i++) {
      var enemy = this.enemies[i];
      if (!enemy.alive) continue;

      // Chase player if nearby
      var distToPlayer = playerPos.distanceTo(enemy.mesh.position);
      if (distToPlayer < 15 && distToPlayer > 1.5) {
        var dir = new THREE.Vector3()
          .subVectors(playerPos, enemy.mesh.position)
          .normalize();
        enemy.mesh.position.x += dir.x * enemy.speed * dt;
        enemy.mesh.position.z += dir.z * enemy.speed * dt;
      }

      // Wobble animation
      enemy.wobbleOffset += dt * 3;
      if (enemy.type === 'slime') {
        enemy.bodyMesh.scale.y = 0.7 + Math.sin(enemy.wobbleOffset) * 0.15;
        enemy.bodyMesh.scale.x = 1 + Math.sin(enemy.wobbleOffset + 1) * 0.1;
      } else if (enemy.type === 'ghost') {
        enemy.bodyMesh.position.y = enemy.bodyMesh.position.y + Math.sin(enemy.wobbleOffset) * dt * 0.5;
      }

      // Knockback
      if (enemy.knockbackVel.lengthSq() > 0.01) {
        enemy.mesh.position.add(enemy.knockbackVel.clone().multiplyScalar(dt));
        enemy.knockbackVel.multiplyScalar(0.9);
      }

      // Keep on ground
      enemy.mesh.position.y = enemy.originalY;

      // Health bar
      var ratio = enemy.health / enemy.maxHealth;
      enemy.healthBar.scale.x = Math.max(ratio, 0);
      enemy.healthBar.material.color.setHex(ratio > 0.5 ? 0x00ff00 : ratio > 0.25 ? 0xffaa00 : 0xff0000);

      // Face player
      var lookDir = new THREE.Vector3()
        .subVectors(playerPos, enemy.mesh.position);
      lookDir.y = 0;
      if (lookDir.lengthSq() > 0.01) {
        enemy.mesh.lookAt(
          enemy.mesh.position.x + lookDir.x,
          enemy.mesh.position.y,
          enemy.mesh.position.z + lookDir.z
        );
      }
    }
  },

  // ─── Kill Enemy ───────────────────────────────────────
  killEnemy: function(index) {
    var enemy = this.enemies[index];
    if (!enemy) return;

    enemy.alive = false;

    // Give XP
    if (GAME.player) {
      GAME.player.xp = (GAME.player.xp || 0) + enemy.xp;
    }

    // Drop items
    if (GAME.EconomySystem && enemy.drops) {
      var dropKeys = Object.keys(enemy.drops);
      for (var d = 0; d < dropKeys.length; d++) {
        var item = dropKeys[d];
        var qty = enemy.drops[item];
        if (GAME.EconomySystem.addItem) {
          GAME.EconomySystem.addItem(item, qty);
        } else if (GAME.player && GAME.player.inventory) {
          GAME.player.inventory[item] = (GAME.player.inventory[item] || 0) + qty;
        }
      }
    }

    // Death effect
    this.spawnDeathEffect(enemy.mesh.position.clone(), enemy.type);

    // Remove from scene
    if (enemy.mesh.parent) {
      enemy.mesh.parent.remove(enemy.mesh);
    }

    // Dispose
    enemy.mesh.traverse(function(child) {
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
    });

    // Remove from array
    this.enemies.splice(index, 1);
  },

  // ─── Player Damage Check ──────────────────────────────
  checkPlayerDamage: function() {
    if (!GAME.player || !GAME.player.mesh) return;
    var playerPos = GAME.player.mesh.position;
    var playerHealth = GAME.player.health || 100;

    for (var i = 0; i < this.enemies.length; i++) {
      var enemy = this.enemies[i];
      if (!enemy.alive) continue;
      var dist = playerPos.distanceTo(enemy.mesh.position);
      if (dist < 1.5) {
        // Damage player
        playerHealth -= enemy.damage * 0.016; // per frame approx
        GAME.player.health = playerHealth;

        // Knockback player
        var kb = new THREE.Vector3()
          .subVectors(playerPos, enemy.mesh.position)
          .normalize()
          .multiplyScalar(3);
        GAME.player.velocity = GAME.player.velocity || new THREE.Vector3();
        GAME.player.velocity.add(kb);
      }
    }
  },

  // ─── Respawn ──────────────────────────────────────────
  respawnCheck: function() {
    if (this.enemies.length < this.maxEnemies) {
      var areaNames = Object.keys(this.spawnAreas);
      var area = this.spawnAreas[areaNames[Math.floor(Math.random() * areaNames.length)]];
      var typeKey = area.types[Math.floor(Math.random() * area.types.length)];
      this.spawnEnemy(typeKey, area);
    }
  },

  // ─── Visual Effects ───────────────────────────────────
  createAttackEffectPool: function() {
    this.effectPool = [];
    for (var i = 0; i < 5; i++) {
      var ringGeo = new THREE.RingGeometry(0.3, 0.6, 16);
      var ringMat = new THREE.MeshBasicMaterial({
        color: 0xffff00,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide
      });
      var ring = new THREE.Mesh(ringGeo, ringMat);
      ring.visible = false;
      this.scene.add(ring);
      this.effectPool.push({ mesh: ring, active: false, time: 0 });
    }
  },

  spawnAttackEffect: function(position) {
    for (var i = 0; i < this.effectPool.length; i++) {
      var fx = this.effectPool[i];
      if (!fx.active) {
        fx.active = true;
        fx.time = 0.4;
        fx.mesh.visible = true;
        fx.mesh.position.copy(position);
        fx.mesh.position.y += 0.5;
        fx.mesh.lookAt(GAME.player.mesh.position);
        return;
      }
    }
  },

  spawnDeathEffect: function(position, type) {
    var colors = { slime: 0x00ff00, skeleton: 0xffffff, ghost: 0x8888ff };
    for (var i = 0; i < 6; i++) {
      var geo = new THREE.SphereGeometry(0.1, 6, 6);
      var mat = new THREE.MeshBasicMaterial({
        color: colors[type] || 0xffffff,
        transparent: true,
        opacity: 1
      });
      var particle = new THREE.Mesh(geo, mat);
      particle.position.copy(position);
      particle.position.y += 0.5;

      var vel = new THREE.Vector3(
        (Math.random() - 0.5) * 4,
        Math.random() * 3 + 1,
        (Math.random() - 0.5) * 4
      );

      this.scene.add(particle);

      (function(p, v, sc) {
        var startTime = Date.now();
        function animateParticle() {
          var elapsed = (Date.now() - startTime) / 1000;
          if (elapsed > 0.8) {
            sc.remove(p);
            p.geometry.dispose();
            p.material.dispose();
            return;
          }
          p.position.add(v.clone().multiplyScalar(0.016));
          v.y -= 9.8 * 0.016;
          p.material.opacity = 1 - elapsed / 0.8;
          p.scale.multiplyScalar(0.98);
          requestAnimationFrame(animateParticle);
        }
        animateParticle();
      })(particle, vel, this.scene);
    }
  },

  spawnDamageNumber: function(position, amount) {
    // Create floating damage text
    if (!this.game || !this.game.renderer) return;
    var canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 32;
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ff4444';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('-' + amount, 32, 24);

    var texture = new THREE.CanvasTexture(canvas);
    var spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
    var sprite = new THREE.Sprite(spriteMat);
    sprite.position.copy(position);
    sprite.position.y += 2;
    sprite.scale.set(1.5, 0.75, 1);
    this.scene.add(sprite);

    var startTime = Date.now();
    var self = this;
    function animateDmg() {
      var elapsed = (Date.now() - startTime) / 1000;
      if (elapsed > 1) {
        self.scene.remove(sprite);
        sprite.material.dispose();
        sprite.material.map.dispose();
        return;
      }
      sprite.position.y += 0.02;
      sprite.material.opacity = 1 - elapsed;
      requestAnimationFrame(animateDmg);
    }
    animateDmg();
  },

  // ─── Effects Update (call from main loop) ─────────────
  updateEffects: function(dt) {
    for (var i = 0; i < this.effectPool.length; i++) {
      var fx = this.effectPool[i];
      if (fx.active) {
        fx.time -= dt;
        fx.mesh.scale.addScalar(dt * 3);
        fx.mesh.material.opacity = Math.max(fx.time / 0.4, 0);
        if (fx.time <= 0) {
          fx.active = false;
          fx.mesh.visible = false;
          fx.mesh.scale.set(1, 1, 1);
          fx.mesh.material.opacity = 0.8;
        }
      }
    }
  },

  // ─── Save/Load ────────────────────────────────────────
  getSaveData: function() {
    var aliveEnemies = [];
    for (var i = 0; i < this.enemies.length; i++) {
      var e = this.enemies[i];
      if (e.alive) {
        aliveEnemies.push({
          type: e.type,
          x: e.mesh.position.x,
          z: e.mesh.position.z,
          health: e.health
        });
      }
    }
    return { enemies: aliveEnemies };
  },

  loadSaveData: function(data) {
    if (!data || !data.enemies) return;
    // Clear existing
    for (var i = this.enemies.length - 1; i >= 0; i--) {
      var e = this.enemies[i];
      if (e.mesh.parent) e.mesh.parent.remove(e.mesh);
    }
    this.enemies = [];
    // Restore
    for (var j = 0; j < data.enemies.length; j++) {
      var saved = data.enemies[j];
      var area = { center: { x: saved.x, z: saved.z }, radius: 1, types: [saved.type] };
      var enemy = this.spawnEnemy(saved.type, area);
      enemy.health = saved.health;
    }
  },

  // ─── Get Enemy Count ──────────────────────────────────
  getAliveCount: function() {
    var count = 0;
    for (var i = 0; i < this.enemies.length; i++) {
      if (this.enemies[i].alive) count++;
    }
    return count;
  },

  // ─── Cleanup ──────────────────────────────────────────
  dispose: function() {
    for (var i = this.enemies.length - 1; i >= 0; i--) {
      var e = this.enemies[i];
      if (e.mesh.parent) e.mesh.parent.remove(e.mesh);
      e.mesh.traverse(function(child) {
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
      });
    }
    this.enemies = [];

    for (var j = 0; j < this.effectPool.length; j++) {
      var fx = this.effectPool[j];
      if (fx.mesh.parent) fx.mesh.parent.remove(fx.mesh);
      fx.mesh.geometry.dispose();
      fx.mesh.material.dispose();
    }
    this.effectPool = [];
  }
};
