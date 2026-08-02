/**
 * AnimalsSystem.js - نظام الحيوانات المتقدم
 * Farm Game 3D - Production Quality
 * 
 * يدعم:
 * - 5 أنواع حيوانات (دجاجة، بقرة، خنزير، بطة، حصان)
 * - إنتاج يومي لكل حيوان
 * - نظام سعادة وصحة
 * - نظام إطعام وتغذية
 * - نظام تكاثر بسيط
 * - AI للحركة والبحث عن الطعام
 * - حفظ وتحميل الحالة
 */

var GAME = GAME || {};

// ============================================================
// 🐄 بيانات الحيوانات
// ============================================================
GAME.ANIMALS_DATA = {
  chicken: {
    name: 'Chicken', nameAr: 'دجاجة',
    buyPrice: 400, sellPrice: 200,
    product: { name: 'Egg', nameAr: 'بيضة', sellPrice: 50, icon: '🥚' },
    habitat: 'coop',
    maxHealth: 100, maxHappiness: 100,
    feedType: 'grain', feedCost: 10,
    productTime: 24, // ساعات لإنتاج منتج واحد
    color: 0xF5F5DC, // لون أبيض مائل للأصفر
    size: { width: 0.4, height: 0.4, depth: 0.5 },
    speed: 1.5,
    breedingChance: 0.05, // 5% فرصة التكاثر يومياً
    breedingCooldown: 7, // أيام بين كل تكاثر
    needsShelter: true,
    productsPerDay: 1
  },
  cow: {
    name: 'Cow', nameAr: 'بقرة',
    buyPrice: 1500, sellPrice: 800,
    product: { name: 'Milk', nameAr: 'حليب', sellPrice: 125, icon: '🥛' },
    habitat: 'barn',
    maxHealth: 100, maxHappiness: 100,
    feedType: 'hay', feedCost: 20,
    productTime: 24,
    color: 0xFFFFFF,
    size: { width: 0.8, height: 0.7, depth: 1.2 },
    speed: 1.0,
    breedingChance: 0.03,
    breedingCooldown: 14,
    needsShelter: true,
    productsPerDay: 1
  },
  pig: {
    name: 'Pig', nameAr: 'خنزير',
    buyPrice: 1600, sellPrice: 900,
    product: { name: 'Truffle', nameAr: 'كمأة', sellPrice: 200, icon: '🍄' },
    habitat: 'barn',
    maxHealth: 100, maxHappiness: 100,
    feedType: 'vegetable', feedCost: 30,
    productTime: 48, // يحتاج وقت أطول
    color: 0xFFB6C1, // لون وردي
    size: { width: 0.6, height: 0.5, depth: 0.8 },
    speed: 1.2,
    breedingChance: 0.04,
    breedingCooldown: 10,
    needsShelter: true,
    productsPerDay: 1,
    specialAbility: 'forage' // يبحث عن كمأة في الغابة
  },
  duck: {
    name: 'Duck', nameAr: 'بطة',
    buyPrice: 500, sellPrice: 250,
    product: { name: 'Duck Egg', nameAr: 'بيضة بطة', sellPrice: 60, icon: '🥚' },
    habitat: 'coop',
    maxHealth: 100, maxHappiness: 100,
    feedType: 'grain', feedCost: 15,
    productTime: 24,
    color: 0x87CEEB, // لون أزرق فاتح
    size: { width: 0.35, height: 0.35, depth: 0.45 },
    speed: 1.8,
    breedingChance: 0.04,
    breedingCooldown: 7,
    needsShelter: true,
    productsPerDay: 1,
    canSwim: true
  },
  horse: {
    name: 'Horse', nameAr: 'حصان',
    buyPrice: 5000, sellPrice: 2500,
    product: null, // لا ينتج منتجات يومية
    habitat: 'stable',
    maxHealth: 100, maxHappiness: 100,
    feedType: 'hay', feedCost: 40,
    productTime: 0,
    color: 0x8B4513, // لون بني
    size: { width: 0.8, height: 1.0, depth: 1.5 },
    speed: 3.0,
    breedingChance: 0.02,
    breedingCooldown: 30,
    needsShelter: true,
    productsPerDay: 0,
    canMount: true, // يمكن ركوبه
    mountSpeed: 5.0
  }
};

// ============================================================
// 🏠 بيانات المباني (الأكواخ والمخازن)
// ============================================================
GAME.ANIMAL_BUILDINGS = {
  coop: {
    name: 'Coop', nameAr: 'دجاجة',
    capacity: 4,
    upgradeCost: 500,
    requiredFor: ['chicken', 'duck'],
    position: { x: 15, z: -10 }
  },
  barn: {
    name: 'Barn', nameAr: 'حديقة حيوان',
    capacity: 4,
    upgradeCost: 1000,
    requiredFor: ['cow', 'pig'],
    position: { x: -15, z: -10 }
  },
  stable: {
    name: 'Stable', nameAr: 'إسطبل',
    capacity: 2,
    upgradeCost: 2000,
    requiredFor: ['horse'],
    position: { x: 0, z: -20 }
  }
};

// ============================================================
// 🐔 نظام الحيوانات
// ============================================================
GAME.AnimalsSystem = {
  animals: [],
  buildings: {},
  scene: null,
  animalMeshMap: new Map(),
  productTimer: 0,
  maxAnimals: 50,

  // تهيئة النظام
  init: function(scene) {
    this.scene = scene;
    this.animals = [];
    this.animalMeshMap.clear();
    this.productTimer = 0;

    // إنشاء المباني الافتراضية
    this.buildings = {};
    for (var buildingType in GAME.ANIMAL_BUILDINGS) {
      this.buildings[buildingType] = {
        type: buildingType,
        level: 1,
        animals: [],
        capacity: GAME.ANIMAL_BUILDINGS[buildingType].capacity,
        built: true
      };
    }

    console.log('[AnimalsSystem] ✅ Initialized with ' + Object.keys(GAME.ANIMALS_DATA).length + ' animal types');
  },

  // ============================================================
  // 🐄 إدارة الحيوانات
  // ============================================================

  // شراء حيوان جديد
  buyAnimal: function(animalType, buildingType) {
    var animalData = GAME.ANIMALS_DATA[animalType];
    if (!animalData) {
      GAME.ui.showNotification('❌ Unknown animal!', 'error');
      return false;
    }

    // التحقق من المبنى المناسب
    if (!buildingType) {
      buildingType = animalData.habitat;
    }

    var building = this.buildings[buildingType];
    if (!building || !building.built) {
      GAME.ui.showNotification('❌ Need to build ' + buildingType + ' first!', 'error');
      return false;
    }

    // التحقق من السعة
    if (building.animals.length >= building.capacity) {
      GAME.ui.showNotification('❌ Building is full!', 'error');
      return false;
    }

    // التحقق من المال
    if (GAME.game.state.money < animalData.buyPrice) {
      GAME.ui.showNotification('❌ Need $' + animalData.buyPrice + '!', 'error');
      return false;
    }

    // خصم المال
    GAME.game.state.money -= animalData.buyPrice;

    // إنشاء الحيوان
    var animal = this.createAnimal(animalType, buildingType);
    building.animals.push(animal.id);

    // إنشاء الـ visual
    this._createAnimalVisual(animal);

    // جسيمات الشراء
    GAME.game.spawnParticles(animal.x, 0.5, animal.z, 0x00ff00, 20, 3, 0.15, 1.0);

    GAME.ui.showNotification('🎉 Bought ' + animalData.name + '! -$' + animalData.buyPrice, 'success');
    GAME.game.addXP(20);
    GAME.quests.track('buyAnimal', 1);
    GAME.game.state.stats.totalAnimals++;

    return true;
  },

  // إنشاء حيوان جديد
  createAnimal: function(type, buildingType) {
    var animalData = GAME.ANIMALS_DATA[type];
    var building = GAME.ANIMAL_BUILDINGS[buildingType];
    var position = building.position;

    var animal = {
      id: Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      type: type,
      name: animalData.nameAr,
      building: buildingType,
      x: position.x + (Math.random() - 0.5) * 8,
      z: position.z + (Math.random() - 0.5) * 8,
      y: 0,
      health: animalData.maxHealth,
      happiness: 50,
      hunger: 50,
      thirst: 50,
      productTimer: 0,
      productsReady: 0,
      lastProductDay: 0,
      breedingCooldown: 0,
      isFedToday: false,
      isWateredToday: false,
      age: 0,
      // AI state
      aiState: 'idle',
      targetX: null,
      targetZ: null,
      movementTimer: 0,
      direction: Math.random() * Math.PI * 2
    };

    this.animals.push(animal);
    return animal;
  },

  // بيع حيوان
  sellAnimal: function(animalId) {
    var animalIndex = this.animals.findIndex(a => a.id === animalId);
    if (animalIndex === -1) {
      GAME.ui.showNotification('❌ Animal not found!', 'error');
      return false;
    }

    var animal = this.animals[animalIndex];
    var animalData = GAME.ANIMALS_DATA[animal.type];

    // إضافة المال
    GAME.game.state.money += animalData.sellPrice;

    // إزالة من المبنى
    var building = this.buildings[animal.building];
    var buildingAnimalIndex = building.animals.indexOf(animal.id);
    if (buildingAnimalIndex !== -1) {
      building.animals.splice(buildingAnimalIndex, 1);
    }

    // إزالة الـ visual
    this._removeAnimalVisual(animal);

    // حذف الحيوان
    this.animals.splice(animalIndex, 1);

    GAME.ui.showNotification('💰 Sold ' + animalData.name + ' for $' + animalData.sellPrice, 'success');
    GAME.game.state.stats.totalAnimalsSold++;

    return true;
  },

  // ============================================================
  // 🍽️ نظام الإطعام
  // ============================================================

  // إطعام حيوان
  feedAnimal: function(animalId) {
    var animal = this.animals.find(a => a.id === animalId);
    if (!animal) {
      GAME.ui.showNotification('❌ Animal not found!', 'error');
      return false;
    }

    if (animal.isFedToday) {
      GAME.ui.showNotification('❌ Already fed today!', 'error');
      return false;
    }

    var animalData = GAME.ANIMALS_DATA[animal.type];

    // التحقق من وجود الطعام
    var inventory = GAME.game.state.inventory;
    var feedKey = animalData.feedType + '_feed';
    if (!inventory[feedKey] || inventory[feedKey] <= 0) {
      GAME.ui.showNotification('❌ No ' + animalData.feedType + ' feed!', 'error');
      return false;
    }

    // خصم الطعام
    inventory[feedKey]--;

    // تطبيق التغذية
    animal.isFedToday = true;
    animal.hunger = Math.min(100, animal.hunger + 40);
    animal.happiness = Math.min(100, animal.happiness + 10);

    // جسيمات الإطعام
    GAME.game.spawnParticles(animal.x, 0.5, animal.z, 0xFFA500, 10, 2, 0.1, 0.5);

    GAME.ui.showNotification('🍽️ Fed ' + animalData.nameAr + '!', 'success');
    GAME.game.addXP(5);
    GAME.quests.track('feedAnimal', 1);

    return true;
  },

  // إطعام جميع الحيوانات
  feedAllAnimals: function() {
    var fedCount = 0;
    for (var i = 0; i < this.animals.length; i++) {
      if (!this.animals[i].isFedToday) {
        if (this.feedAnimal(this.animals[i].id)) {
          fedCount++;
        }
      }
    }

    if (fedCount > 0) {
      GAME.ui.showNotification('🍽️ Fed ' + fedCount + ' animals!', 'success');
    } else {
      GAME.ui.showNotification('❌ No hungry animals or no feed!', 'error');
    }

    return fedCount;
  },

  // ============================================================
  // 🥚 نظام الإنتاج
  // ============================================================

  // جمع المنتجات
  collectProduct: function(animalId) {
    var animal = this.animals.find(a => a.id === animalId);
    if (!animal) {
      GAME.ui.showNotification('❌ Animal not found!', 'error');
      return false;
    }

    if (animal.productsReady <= 0) {
      GAME.ui.showNotification('❌ No products ready!', 'error');
      return false;
    }

    var animalData = GAME.ANIMALS_DATA[animal.type];
    if (!animalData.product) {
      GAME.ui.showNotification('❌ This animal does not produce!', 'error');
      return false;
    }

    // جمع المنتجات
    var quantity = animal.productsReady;
    var productKey = animalData.product.name.toLowerCase().replace(' ', '_');
    
    // إضافة للمخزون
    if (!GAME.game.state.inventory.products) {
      GAME.game.state.inventory.products = {};
    }
    GAME.game.state.inventory.products[productKey] = 
      (GAME.game.state.inventory.products[productKey] || 0) + quantity;

    // إعادة تعيين المنتجات
    animal.productsReady = 0;
    animal.productTimer = 0;
    animal.lastProductDay = GAME.TimeSystem ? GAME.TimeSystem.day : 1;

    // جسيمات الجمع
    GAME.game.spawnParticles(animal.x, 1.0, animal.z, 0xFFD700, 15, 3, 0.12, 0.8);

    GAME.ui.showNotification('🥚 Collected ' + quantity + ' ' + animalData.product.name + '!', 'success');
    GAME.game.addXP(10);
    GAME.quests.track('collectProduct', quantity);
    GAME.game.state.stats.totalProductsCollected += quantity;

    return true;
  },

  // جمع جميع المنتجات
  collectAllProducts: function() {
    var collectedCount = 0;
    for (var i = 0; i < this.animals.length; i++) {
      if (this.animals[i].productsReady > 0) {
        if (this.collectProduct(this.animals[i].id)) {
          collectedCount++;
        }
      }
    }

    if (collectedCount > 0) {
      GAME.ui.showNotification('🥚 Collected from ' + collectedCount + ' animals!', 'success');
    } else {
      GAME.ui.showNotification('❌ No products ready to collect!', 'error');
    }

    return collectedCount;
  },

  // ============================================================
  // 💕 نظام التكاثر
  // ============================================================

  // محاولة تكاثر حيوانات
  tryBreeding: function() {
    var bredCount = 0;

    for (var i = 0; i < this.animals.length; i++) {
      var animal = this.animals[i];
      var animalData = GAME.ANIMALS_DATA[animal.type];

      // التحقق من الشروط
      if (animal.breedingCooldown > 0) continue;
      if (animal.happiness < 70) continue;
      if (animal.health < 70) continue;

      // فرصة التكاثر
      if (Math.random() < animalData.breedingChance) {
        // التحقق من وجود مكان في المبنى
        var building = this.buildings[animal.building];
        if (building.animals.length < building.capacity) {
          // إنشاء حيوان جديد
          var baby = this.createAnimal(animal.type, animal.building);
          building.animals.push(baby.id);
          this._createAnimalVisual(baby);

          // تعيين مدة التبريد
          animal.breedingCooldown = animalData.breedingCooldown;

          // إعلام
          GAME.ui.showNotification('🐣 New ' + animalData.nameAr + ' born!', 'success');
          GAME.game.addXP(50);
          GAME.quests.track('breedAnimal', 1);

          bredCount++;
        }
      }
    }

    return bredCount;
  },

  // ============================================================
  // 🤖 نظام الذكاء الاصطناعي
  // ============================================================

  // تحديث AI للحيوان
  updateAnimalAI: function(animal, delta) {
    var animalData = GAME.ANIMALS_DATA[animal.type];
    
    // تحديث مؤقتات الحركة
    animal.movementTimer -= delta;

    // تحديث المستويات الأساسية
    animal.hunger = Math.max(0, animal.hunger - 0.1 * delta);
    animal.thirst = Math.max(0, animal.thirst - 0.15 * delta);

    // تأثير الجوع والعطش على السعادة
    if (animal.hunger < 20) {
      animal.happiness = Math.max(0, animal.happiness - 0.2 * delta);
    }
    if (animal.thirst < 20) {
      animal.happiness = Math.max(0, animal.happiness - 0.15 * delta);
    }

    // تحديث الحركة حسب الحالة
    switch (animal.aiState) {
      case 'idle':
        this._handleIdleState(animal, animalData, delta);
        break;
      case 'moving':
        this._handleMovingState(animal, animalData, delta);
        break;
      case 'seeking_food':
        this._handleSeekingFoodState(animal, animalData, delta);
        break;
      case 'returning':
        this._handleReturningState(animal, animalData, delta);
        break;
    }

    // تحديث الموقع في المشهد
    if (animal.mesh) {
      animal.mesh.position.set(animal.x, animal.y + 0.3, animal.z);
      animal.mesh.rotation.y = animal.direction;
    }
  },

  // حالة الخمول - البحث عن نشاط عشوائي
  _handleIdleState: function(animal, animalData, delta) {
    if (animal.movementTimer <= 0) {
      // فرصة البحث عن طعام
      if (animal.hunger < 40) {
        animal.aiState = 'seeking_food';
        animal.movementTimer = 5;
        return;
      }

      // تحديد هدف عشوائي
      var building = GAME.ANIMAL_BUILDINGS[animal.building];
      var radius = 8;
      
      animal.targetX = building.position.x + (Math.random() - 0.5) * radius * 2;
      animal.targetZ = building.position.z + (Math.random() - 0.5) * radius * 2;
      animal.aiState = 'moving';
      animal.movementTimer = 3 + Math.random() * 3;
    }
  },

  // حالة الحركة
  _handleMovingState: function(animal, animalData, delta) {
    if (animal.targetX === null || animal.targetZ === null) {
      animal.aiState = 'idle';
      return;
    }

    // الحساب نحو الهدف
    var dx = animal.targetX - animal.x;
    var dz = animal.targetZ - animal.z;
    var distance = Math.sqrt(dx * dx + dz * dz);

    if (distance < 0.3) {
      animal.aiState = 'idle';
      animal.movementTimer = 2 + Math.random() * 4;
      return;
    }

    // الحركة
    var speed = animalData.speed * delta * 0.5;
    animal.x += (dx / distance) * speed;
    animal.z += (dz / distance) * speed;
    animal.direction = Math.atan2(dx, dz);
  },

  // حالة البحث عن الطعام
  _handleSeekingFoodState: function(animal, animalData, delta) {
    // البحث عن أقرب منطقة إطعام
    var building = GAME.ANIMAL_BUILDINGS[animal.building];
    var feedArea = {
      x: building.position.x,
      z: building.position.z
    };

    var dx = feedArea.x - animal.x;
    var dz = feedArea.z - animal.z;
    var distance = Math.sqrt(dx * dx + dz * dz);

    if (distance < 2) {
      // وصل إلى منطقة الطعام
      animal.hunger = Math.min(100, animal.hunger + 20);
      animal.aiState = 'idle';
      animal.movementTimer = 3;
      return;
    }

    // الحركة نحو الطعام
    var speed = animalData.speed * delta * 0.7;
    animal.x += (dx / distance) * speed;
    animal.z += (dz / distance) * speed;
    animal.direction = Math.atan2(dx, dz);
  },

  // حالة العودة للمبنى
  _handleReturningState: function(animal, animalData, delta) {
    var building = GAME.ANIMAL_BUILDINGS[animal.building];
    var dx = building.position.x - animal.x;
    var dz = building.position.z - animal.z;
    var distance = Math.sqrt(dx * dx + dz * dz);

    if (distance < 2) {
      animal.aiState = 'idle';
      animal.movementTimer = 5;
      return;
    }

    var speed = animalData.speed * delta;
    animal.x += (dx / distance) * speed;
    animal.z += (dz / distance) * speed;
    animal.direction = Math.atan2(dx, dz);
  },

  // ============================================================
  // 🎨 إدارة الـ Visual
  // ============================================================

  // إنشاء الـ visual للحيوان
  _createAnimalVisual: function(animal) {
    if (!this.scene) return;

    var animalData = GAME.ANIMALS_DATA[animal.type];
    var group = new THREE.Group();

    // الجسم
    var bodyGeo = new THREE.BoxGeometry(
      animalData.size.width,
      animalData.size.height,
      animalData.size.depth
    );
    var bodyMat = new THREE.MeshLambertMaterial({ color: animalData.color });
    var body = new THREE.Mesh(bodyGeo, bodyMat);
    body.castShadow = true;
    group.add(body);

    // الرأس
    var headSize = animalData.size.width * 0.6;
    var headGeo = new THREE.BoxGeometry(headSize, headSize, headSize);
    var headMat = new THREE.MeshLambertMaterial({ color: animalData.color });
    var head = new THREE.Mesh(headGeo, headMat);
    head.position.z = animalData.size.depth * 0.4;
    head.position.y = animalData.size.height * 0.3;
    head.castShadow = true;
    group.add(head);

    // العيون
    var eyeGeo = new THREE.SphereGeometry(0.03, 6, 6);
    var eyeMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    
    var leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-headSize * 0.25, headSize * 0.15, animalData.size.depth * 0.5);
    group.add(leftEye);

    var rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(headSize * 0.25, headSize * 0.15, animalData.size.depth * 0.5);
    group.add(rightEye);

    // الأرجل
    var legGeo = new THREE.BoxGeometry(0.1, 0.2, 0.1);
    var legMat = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    
    var legPositions = [
      { x: -animalData.size.width * 0.3, z: -animalData.size.depth * 0.3 },
      { x: animalData.size.width * 0.3, z: -animalData.size.depth * 0.3 },
      { x: -animalData.size.width * 0.3, z: animalData.size.depth * 0.3 },
      { x: animalData.size.width * 0.3, z: animalData.size.depth * 0.3 }
    ];

    for (var i = 0; i < 4; i++) {
      var leg = new THREE.Mesh(legGeo, legMat);
      leg.position.set(legPositions[i].x, -animalData.size.height * 0.3, legPositions[i].z);
      leg.castShadow = true;
      group.add(leg);
    }

    // إضافة للمشهد
    group.position.set(animal.x, animal.y + 0.3, animal.z);
    this.scene.add(group);
    animal.mesh = group;
    this.animalMeshMap.set(animal.id, group);
  },

  // إزالة الـ visual للحيوان
  _removeAnimalVisual: function(animal) {
    if (animal.mesh) {
      this.scene.remove(animal.mesh);
      this.animalMeshMap.delete(animal.id);
      animal.mesh = null;
    }
  },

  // ============================================================
  // 📅 تحديث يومي
  // ============================================================

  // تطبيق التحديثات اليومية
  applyDailyUpdate: function() {
    var currentDay = GAME.TimeSystem ? GAME.TimeSystem.day : 1;

    for (var i = 0; i < this.animals.length; i++) {
      var animal = this.animals[i];
      var animalData = GAME.ANIMALS_DATA[animal.type];

      // تحديث العمر
      animal.age++;

      // إعادة تعيين حالة الإطعام والشرب
      animal.isFedToday = false;
      animal.isWateredToday = false;

      // خفض السعادة إذا لم يُطعم
      if (!animal.isFedToday) {
        animal.happiness = Math.max(0, animal.happiness - 15);
        animal.hunger = Math.max(0, animal.hunger - 20);
      }

      // تحديث مؤقت الإنتاج
      if (animalData.product && animal.happiness > 50 && animal.hunger > 30) {
        animal.productTimer++;
        
        // التحقق من إنتاج منتج جديد
        if (animal.productTimer >= animalData.productTime / 24) {
          animal.productsReady += animalData.productsPerDay;
          animal.productTimer = 0;
          animal.lastProductDay = currentDay;
          
          // جسيمات الإنتاج
          GAME.game.spawnParticles(animal.x, 1.0, animal.z, 0xFFD700, 8, 2, 0.08, 0.5);
        }
      }

      // تحديث مدة تبريد التكاثر
      if (animal.breedingCooldown > 0) {
        animal.breedingCooldown--;
      }

      // تحديث الصحة بناءً على السعادة
      if (animal.happiness > 70) {
        animal.health = Math.min(animalData.maxHealth, animal.health + 2);
      } else if (animal.happiness < 30) {
        animal.health = Math.max(0, animal.health - 3);
      }
    }

    // محاولة التكاثر
    this.tryBreeding();

    console.log('[AnimalsSystem] 📅 Daily update applied to ' + this.animals.length + ' animals');
  },

  // ============================================================
  // 🔄 التحديث الرئيسي
  // ============================================================

  // تحديث النظام كل إطار
  update: function(delta) {
    if (!GAME.game || !GAME.game.state || GAME.game.isPaused) return;

    // تحديث AI لكل حيوان
    for (var i = 0; i < this.animals.length; i++) {
      this.updateAnimalAI(this.animals[i], delta);
    }

    // التحقق من تغير اليوم
    var currentDay = GAME.TimeSystem ? GAME.TimeSystem.day : 1;
    if (this._lastUpdateDay && this._lastUpdateDay !== currentDay) {
      this.applyDailyUpdate();
    }
    this._lastUpdateDay = currentDay;
  },

  // ============================================================
  // 💾 حفظ وتحميل
  // ============================================================

  // حفظ حالة نظام الحيوانات
  save: function() {
    return {
      animals: this.animals.map(function(animal) {
        return {
          id: animal.id,
          type: animal.type,
          name: animal.name,
          building: animal.building,
          x: animal.x,
          z: animal.z,
          health: animal.health,
          happiness: animal.happiness,
          hunger: animal.hunger,
          thirst: animal.thirst,
          productTimer: animal.productTimer,
          productsReady: animal.productsReady,
          lastProductDay: animal.lastProductDay,
          breedingCooldown: animal.breedingCooldown,
          isFedToday: animal.isFedToday,
          isWateredToday: animal.isWateredToday,
          age: animal.age
        };
      }),
      buildings: {}
    };
  },

  // تحميل حالة نظام الحيوانات
  load: function(data) {
    if (!data) return;

    // مسح الحيوانات الحالية
    for (var i = 0; i < this.animals.length; i++) {
      this._removeAnimalVisual(this.animals[i]);
    }
    this.animals = [];

    // تحميل الحيوانات
    if (data.animals) {
      for (var i = 0; i < data.animals.length; i++) {
        var savedAnimal = data.animals[i];
        var animalData = GAME.ANIMALS_DATA[savedAnimal.type];
        
        if (!animalData) continue;

        // إعادة إنشاء الحيوان
        var animal = {
          id: savedAnimal.id,
          type: savedAnimal.type,
          name: savedAnimal.name || animalData.nameAr,
          building: savedAnimal.building,
          x: savedAnimal.x,
          z: savedAnimal.z,
          y: 0,
          health: savedAnimal.health,
          happiness: savedAnimal.happiness,
          hunger: savedAnimal.hunger,
          thirst: savedAnimal.thirst,
          productTimer: savedAnimal.productTimer,
          productsReady: savedAnimal.productsReady,
          lastProductDay: savedAnimal.lastProductDay,
          breedingCooldown: savedAnimal.breedingCooldown,
          isFedToday: savedAnimal.isFedToday,
          isWateredToday: savedAnimal.isWateredToday,
          age: savedAnimal.age,
          // AI state
          aiState: 'idle',
          targetX: null,
          targetZ: null,
          movementTimer: 0,
          direction: Math.random() * Math.PI * 2,
          mesh: null
        };

        this.animals.push(animal);
        this._createAnimalVisual(animal);

        // إعادة بناء علاقات المباني
        var building = this.buildings[animal.building];
        if (building && !building.animals.includes(animal.id)) {
          building.animals.push(animal.id);
        }
      }
    }

    // تحميل المباني
    if (data.buildings) {
      for (var buildingType in data.buildings) {
        if (this.buildings[buildingType]) {
          this.buildings[buildingType] = {
            ...this.buildings[buildingType],
            ...data.buildings[buildingType]
          };
        }
      }
    }

    console.log('[AnimalsSystem] 💾 Loaded ' + this.animals.length + ' animals');
  },

  // ============================================================
  // 🔧 دوال مساعدة
  // ============================================================

  // الحصول على حيوان بالـ ID
  getAnimalById: function(id) {
    return this.animals.find(a => a.id === id);
  },

  // الحصول على حيوانات حسب النوع
  getAnimalsByType: function(type) {
    return this.animals.filter(a => a.type === type);
  },

  // الحصول على حيوانات في مبنى معين
  getAnimalsInBuilding: function(buildingType) {
    return this.animals.filter(a => a.building === buildingType);
  },

  // الحصول على إحصائيات النظام
  getStats: function() {
    var stats = {
      totalAnimals: this.animals.length,
      byType: {},
      byBuilding: {},
      totalProductsReady: 0
    };

    // إحصائيات حسب النوع
    for (var type in GAME.ANIMALS_DATA) {
      stats.byType[type] = this.animals.filter(a => a.type === type).length;
    }

    // إحصائيات حسب المبنى
    for (var building in this.buildings) {
      stats.byBuilding[building] = this.animals.filter(a => a.building === building).length;
    }

    // المنتجات الجاهزة
    stats.totalProductsReady = this.animals.reduce(function(sum, a) {
      return sum + a.productsReady;
    }, 0);

    return stats;
  },

  // البحث عن أقرب حيوان
  findClosestAnimal: function(x, z, type, maxDist) {
    maxDist = maxDist || 5;
    var closest = null;
    var minDist = maxDist;

    for (var i = 0; i < this.animals.length; i++) {
      var animal = this.animals[i];
      if (type && animal.type !== type) continue;

      var dx = x - animal.x;
      var dz = z - animal.z;
      var dist = Math.sqrt(dx * dx + dz * dz);

      if (dist < minDist) {
        minDist = dist;
        closest = animal;
      }
    }

    return closest;
  },

  // التحقق من إمكانية بناء مبنى
  canBuild: function(buildingType) {
    if (this.buildings[buildingType] && this.buildings[buildingType].built) {
      return false; // المبنى موجود بالفعل
    }
    return true;
  },

  // ترقية مبنى
  upgradeBuilding: function(buildingType) {
    var building = this.buildings[buildingType];
    if (!building || !building.built) {
      GAME.ui.showNotification('❌ Building not found!', 'error');
      return false;
    }

    var buildingData = GAME.ANIMAL_BUILDINGS[buildingType];
    var upgradeCost = buildingData.upgradeCost * building.level;

    if (GAME.game.state.money < upgradeCost) {
      GAME.ui.showNotification('❌ Need $' + upgradeCost + '!', 'error');
      return false;
    }

    GAME.game.state.money -= upgradeCost;
    building.level++;
    building.capacity += 2;

    // تحديث الـ visual للمبنى
    this._updateBuildingVisual(buildingType);

    GAME.ui.showNotification('🏗️ Upgraded ' + buildingData.name + '! Capacity: ' + building.capacity, 'success');
    GAME.game.addXP(30);

    return true;
  },

  // تحديث الـ visual للمبنى
  _updateBuildingVisual: function(buildingType) {
    // سيتم تنفيذه عند دمج نظام المباني
    console.log('[AnimalsSystem] Building visual update for: ' + buildingType);
  },

  // الحصول على حالة الحيوان بالنص
  getAnimalStatusText: function(animalId) {
    var animal = this.getAnimalById(animalId);
    if (!animal) return '';

    var animalData = GAME.ANIMALS_DATA[animal.type];
    var status = animalData.nameAr + '\n';
    status += '❤️ Health: ' + Math.round(animal.health) + '/100\n';
    status += '😊 Happiness: ' + Math.round(animal.happiness) + '/100\n';
    status += '🍖 Hunger: ' + Math.round(animal.hunger) + '/100\n';
    
    if (animalData.product) {
      status += '🥚 Products: ' + animal.productsReady + '\n';
      status += '⏱️ Next: ' + Math.round((animalData.productTime / 24) - animal.productTimer) + ' days\n';
    }
    
    status += '📅 Age: ' + animal.age + ' days';

    return status;
  }
};

console.log('[AnimalsSystem] 💾 Animal system loaded');
