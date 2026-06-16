import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

console.log("Rust Survival Engine v2.5: Initializing with Collision Physics...");

// ==================== CONFIGURATION ====================
const CONFIG = {
    WORLD_SIZE: 400,
    TREE_COUNT: 70,
    ROCK_COUNT: 40,
    SULFUR_COUNT: 25,
    BARREL_COUNT: 30,
    BUILD_DISTANCE: 7,
    INTERACT_DISTANCE: 5.0,
    PLAYER_SPEED: 95,
    FRICTION: 10.0,
    GRAVITY: 26.0,
    JUMP_FORCE: 9.5,
    PLAYER_RADIUS: 0.8,
    DAY_LENGTH: 800,
    RAD_ZONE_RADIUS: 25,
    TC_RADIUS: 25
};

// ==================== STATE ====================
const state = {
    inventory: [
        { id: 'wood', count: 2000 },
        { id: 'stone', count: 1000 },
        { id: 'frag', count: 500 },
        { id: 'hqm', count: 100 },
        { id: 'building_plan', count: 1 },
        { id: 'hammer', count: 1 }
    ],
    gear: { head: null, chest: null, legs: null, feet: null },
    belt: ['building_plan', 'hammer', null, null, null, null],
    stats: { health: 100, hunger: 100, thirst: 100, radiation: 0 },
    buildMode: false,
    viewMode: 'first',
    controls: { forward: false, backward: false, left: false, right: false, jump: false, canJump: false, crouch: false },
    selectedCategory: 'common',
    selectedItem: null,
    craftQty: 1,
    time: 300,
    // Building System
    building: {
        blueprintOpen: false,
        selectedBlueprint: null, // 'foundation', 'wall', 'doorway', 'ceiling'
        rotationY: 0, // Current Y-axis rotation for the blueprint in radians
        placingStructure: false,
        lookingAtStructure: null,
        toolCupboards: [] // [{pos, radius}]
    }
};

// Building Materials Database
const BUILDING_TIERS = {
    twig: { name: 'Twig', health: 10, color: 0xd7ccc8, cost: {} },
    wood: { name: 'Wood', health: 250, color: 0x8d6e63, cost: { wood: 300 } },
    stone: { name: 'Stone', health: 500, color: 0xb0bec5, cost: { stone: 300 } },
    metal: { name: 'Sheet Metal', health: 1000, color: 0x90a4ae, cost: { frag: 200 } },
    hqm: { name: 'Armored', health: 2000, color: 0xeceff1, cost: { hqm: 50 } },
    door: { name: 'Wooden Door', health: 200, color: 0x5d4037, cost: { wood: 300 } }
};

const BUILDING_TYPES = {
    foundation: { name: 'Foundation', geometry: [3, 0.2, 3], offset: [0, 0.1, 0], requiresSupport: false },
    wall: { name: 'Wall', geometry: [3, 3, 0.2], offset: [0, 1.5, 0], requiresSupport: true },
    doorway: { name: 'Doorway', geometry: [3, 3, 0.2], offset: [0, 1.5, 0], requiresSupport: true },
    ceiling: { name: 'Ceiling', geometry: [3, 0.2, 3], offset: [0, 3, 0], requiresSupport: true },
    tool_cupboard: { name: 'Tool Cupboard', geometry: [1, 1.8, 0.8], offset: [0, 0.9, 0], requiresSupport: true },
    wooden_door: { name: 'Door', geometry: [0.9, 2.1, 0.1], offset: [0, 1.05, 0], isDoor: true }
};

const ITEMS_DATA = {
    // Resources (Natural)
    'wood': { name: 'Wood', category: 'resources', icon: 'fa-tree', color: '#8d6e63', rarity: 'common', desc: 'Harvested from trees. Used for base building and Fuel.' },
    'stone': { name: 'Stone', category: 'resources', icon: 'fa-gem', color: '#b0bec5', rarity: 'common', desc: 'Raw stone for primitive tools and base stabilization.' },
    'iron': { name: 'Metal Ore', category: 'resources', icon: 'fa-mountain', color: '#90a4ae', rarity: 'common', desc: 'Raw iron ore. Smelt this to get metal fragments.' },
    'sulfur': { name: 'Sulfur Ore', category: 'resources', icon: 'fa-flask', color: '#fff176', rarity: 'common', desc: 'Volatile ore used in explosives and gunpowder.' },
    'hqm': { name: 'High Quality Metal', category: 'resources', icon: 'fa-diamond', color: '#eceff1', rarity: 'elite', desc: 'Rare refined metal for modular weapons and armor.' },

    // Processed Resources
    'frag': { name: 'Metal Fragments', category: 'resources', icon: 'fa-cube', color: '#ef5350', rarity: 'rare', desc: 'Refined iron used for most mid-tier items.' },
    'lgf': { name: 'Low Grade Fuel', category: 'resources', icon: 'fa-gas-pump', color: '#e53935', rarity: 'common', desc: 'Tallow and cloth mix. Powering your survival.' },
    'cloth': { name: 'Cloth', category: 'resources', icon: 'fa-scroll', color: '#f5f5f5', rarity: 'common', desc: 'Fibers from hemp plants. Used for clothing and meds.' },
    'leather': { name: 'Leather', category: 'resources', icon: 'fa-hide', color: '#795548', rarity: 'rare', desc: 'High-durability animal skin.' },

    // Components
    'scrap': { name: 'Scrap', category: 'items', icon: 'fa-nut-bolt', color: '#d1c4e9', rarity: 'rare', desc: 'Essential material for unlocking higher technology.' },
    'gear_comp': { name: 'Gears', category: 'items', icon: 'fa-gear', color: '#bdbdbd', rarity: 'rare', desc: 'Rusty mechanical parts for machinery.' },
    'pipe': { name: 'Metal Pipe', category: 'items', icon: 'fa-water', color: '#90a4ae', rarity: 'rare', desc: 'Sturdy pipe used for firearms barrels.' },
    'spring': { name: 'Spring', category: 'items', icon: 'fa-coil', color: '#cfd8dc', rarity: 'rare', desc: 'Tension spring for automatic weapons.' },
    'sewing': { name: 'Sewing Kit', category: 'items', icon: 'fa-needle', color: '#bdbdbd', rarity: 'common', desc: 'Required for advanced clothing.' },

    // Tools (Survival)
    'stone_hatchet': { name: 'Stone Hatchet', category: 'tools', icon: 'fa-axe', color: '#bcaae1', rarity: 'common', recipe: { wood: 200, stone: 100 }, desc: 'Primitive tool for wood harvesting.' },
    'stone_pickaxe': { name: 'Stone Pickaxe', category: 'tools', icon: 'fa-hammer-war', color: '#bcaae1', rarity: 'common', recipe: { wood: 200, stone: 100 }, desc: 'Slow but effective for basic mining.' },
    'hammer': { name: 'Building Hammer', category: 'tools', icon: 'fa-hammer', color: '#1e88e5', rarity: 'common', recipe: { wood: 100 }, desc: 'Construct and upgrade your base.' },
    'torch': { name: 'Torch', category: 'tools', icon: 'fa-fire', color: '#fb8c00', rarity: 'common', recipe: { wood: 50, lgf: 1 }, desc: 'Provides light and subtle heat.' },

    // Weapons (Defense)
    'spear': { name: 'Wooden Spear', category: 'weapons', icon: 'fa-pencil', color: '#8d6e63', rarity: 'common', recipe: { wood: 300 }, desc: 'Cheap long-range melee option.' },
    'machete': { name: 'Machete', category: 'weapons', icon: 'fa-knife', color: '#90a4ae', rarity: 'rare', recipe: { iron: 100 }, desc: 'Standard industrial blade.' },
    'bow': { name: 'Hunting Bow', category: 'weapons', icon: 'fa-bow-arrow', color: '#8d6e63', rarity: 'common', recipe: { wood: 200, cloth: 50 }, desc: 'Silent and deadly ranged tool.' },
    'pistol': { name: 'Semi-Pistol', category: 'weapons', icon: 'fa-gun', color: '#546e7a', rarity: 'rare', recipe: { iron: 150, pipe: 1 }, desc: 'P250 clone. Fast firing sidearm.' },
    'ak47': { name: 'Assault Rifle', category: 'weapons', icon: 'fa-gun', color: '#6d4c41', rarity: 'elite', recipe: { hqm: 50, wood: 200, scrap: 50, pipe: 1 }, desc: 'The king of Rust weapons. High recoil, high reward.' },

    // Industrial
    'furnace': { name: 'Furnace', category: 'items', icon: 'fa-fire-burner', color: '#ff7043', rarity: 'rare', recipe: { stone: 200, wood: 100, lgf: 10 }, desc: 'Smelts ores into metal/sulfur using wood.' },
    'campfire': { name: 'Campfire', category: 'items', icon: 'fa-fire', color: '#ffab40', rarity: 'common', recipe: { wood: 100 }, desc: 'Useful for light and cooking meat.' },

    // Construction
    'building_plan': { name: 'Building Plan', category: 'tools', icon: 'fa-scroll', color: '#64b5f6', rarity: 'common', recipe: { wood: 20 }, desc: 'Select building pieces to place.' },
    'hammer': { name: 'Building Hammer', category: 'tools', icon: 'fa-hammer', color: '#1e88e5', rarity: 'common', recipe: { wood: 100 }, desc: 'Construct and upgrade your base.' },
    'door': { name: 'Wood Door', category: 'construction', icon: 'fa-door-closed', color: '#8d6e63', rarity: 'common', recipe: { wood: 300 }, desc: 'Access point with minimal security.' },
    'lock': { name: 'Key Lock', category: 'construction', icon: 'fa-lock', color: '#546e7a', rarity: 'common', recipe: { iron: 100 }, desc: 'Basic protection for your base.' },

    // Medical
    'bandage': { name: 'Bandage', category: 'medical', icon: 'fa-band-aid', color: '#e57373', rarity: 'common', recipe: { cloth: 2 }, desc: 'Stops bleeding immediately.' },
    'syringe': { name: 'Medical Syringe', category: 'medical', icon: 'fa-syringe', color: '#ef5350', rarity: 'rare', recipe: { iron: 20, scrap: 5, cloth: 10 }, desc: 'Instant adrenaline-boosted recovery.' },
    'wooden_door': { name: 'Wooden Door', category: 'construction', icon: 'fa-door-closed', color: '#5d4037', rarity: 'common', recipe: { wood: 300 }, desc: 'Fits into doorways.' },
    'codelock': { name: 'Code Lock', category: 'items', icon: 'fa-calculator', color: '#78909c', rarity: 'rare', recipe: { frag: 100 }, desc: 'Secure your doors with a 4-digit code.' }
};

// ==================== GLOBAL HELPERS ====================
function showNotification(msg, color = '#4caf50') {
    let note = document.getElementById('game-notification');
    if (!note) {
        note = document.createElement('div');
        note.id = 'game-notification';
        note.style.cssText = "position:fixed; top:20px; right:20px; background:rgba(0,0,0,0.7); color:#4caf50; padding:10px 20px; border-radius:5px; font-weight:bold; z-index:2000; display:none;";
        document.body.appendChild(note);
    }
    note.textContent = msg;
    note.style.color = color;
    note.style.display = 'block';
    setTimeout(() => note.style.display = 'none', 2000);
}






let playerMesh;



const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();

// ==================== CORE FUNCTIONS ====================
// ==================== TERRAIN GENERATION ====================
// Simple pseudo-noise for terrain
function hash(x, z) {
    let h = x * 374761393 + z * 668265263;
    h = (h ^ (h >> 13)) * 1274126177;
    return (h ^ (h >> 16)) / 2147483647;
}

function smoothNoise(x, z) {
    const ix = Math.floor(x);
    const iz = Math.floor(z);
    const fx = x - ix;
    const fz = z - iz;
    const sx = fx * fx * (3 - 2 * fx);
    const sz = fz * fz * (3 - 2 * fz);
    const v00 = hash(ix, iz);
    const v10 = hash(ix + 1, iz);
    const v01 = hash(ix, iz + 1);
    const v11 = hash(ix + 1, iz + 1);
    const v0 = v00 + (v10 - v00) * sx;
    const v1 = v01 + (v11 - v01) * sx;
    return v0 + (v1 - v0) * sz;
}

function fbm(x, z, octaves = 4) {
    let value = 0;
    let amplitude = 1;
    let frequency = 1;
    let maxVal = 0;
    for (let i = 0; i < octaves; i++) {
        value += amplitude * smoothNoise(x * frequency, z * frequency);
        maxVal += amplitude;
        amplitude *= 0.5;
        frequency *= 2;
    }
    return value / maxVal;
}

function getTerrainHeight(x, z) {
    // Multi-octave noise for varied terrain
    const h1 = fbm(x * 0.015, z * 0.015, 4) * 8;  // Large hills
    const h2 = fbm(x * 0.04, z * 0.04, 3) * 3;    // Medium detail
    const h3 = Math.sin(x * 0.02) * Math.cos(z * 0.025) * 1.5; // Ridge effect
    const baseHeight = h1 + h2 + h3;

    // Flatten near origin (spawn area)
    const distFromOrigin = Math.sqrt(x * x + z * z);
    const flattenRadius = 15;
    const blend = Math.min(1, distFromOrigin / flattenRadius);
    const spawnHeight = 0;
    return spawnHeight + (baseHeight - spawnHeight) * Math.max(0, blend * blend * (3 - 2 * blend));
}

function getItemCount(id) {
    const item = state.inventory.find(i => i.id === id);
    return item ? item.count : 0;
}

function addItem(id, count) {
    let item = state.inventory.find(i => i.id === id);
    if (item) item.count += count;
    else state.inventory.push({ id, count });
    updateHUD();
}

function updateHUD() {
    const woodSpan = document.getElementById('wood-count');
    const stoneSpan = document.getElementById('stone-count');
    const ironSpan = document.getElementById('iron-count');
    if (woodSpan) woodSpan.innerText = getItemCount('wood');
    if (stoneSpan) stoneSpan.innerText = getItemCount('stone');
    if (ironSpan) ironSpan.innerText = getItemCount('iron');
    updateHUDSimulation();
}

function updateHUDSimulation() {
    document.getElementById('health-fill').style.width = `${state.stats.health}%`;
    document.getElementById('hunger-fill').style.width = `${state.stats.hunger}%`;
    document.getElementById('thirst-fill').style.width = `${state.stats.thirst}%`;
    document.getElementById('rad-fill').style.width = `${state.stats.radiation}%`;

    const overlay = document.getElementById('rad-overlay');
    if (overlay) overlay.style.opacity = state.stats.radiation / 200;

    // HitMarker fade
    const hm = document.getElementById('hitmarker');
    if (hm && parseFloat(hm.style.opacity) > 0) {
        hm.style.opacity = parseFloat(hm.style.opacity) - 0.05;
    }
}

function showHitMarker() {
    let hm = document.getElementById('hitmarker');
    if (!hm) {
        hm = document.createElement('div');
        hm.id = 'hitmarker';
        hm.style.cssText = 'position:fixed; top:50%; left:50%; width:20px; height:20px; border:2px solid #fff; transform:translate(-50%,-50%) rotate(45deg); pointer-events:none; z-index:100; opacity:0; transition:none;';
        document.body.appendChild(hm);
    }
    hm.style.opacity = '1';
}

function screenFlash(color = 'rgba(255,0,0,0.3)') {
    const flash = document.createElement('div');
    flash.style.cssText = `position:fixed; top:0; left:0; width:100%; height:100%; background:${color}; pointer-events:none; z-index:1000; animation: fadeOut 0.3s forwards;`;
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 300);
}

function createPlayer(scene) {
    const group = new THREE.Group();
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.8, 0.3), new THREE.MeshStandardMaterial({ color: 0x8b322c }));
    torso.position.y = 1.25; torso.castShadow = true; group.add(torso);
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.35, 0.3), new THREE.MeshStandardMaterial({ color: 0xffdbac }));
    head.position.y = 1.85; head.castShadow = true; group.add(head);
    const legGeo = new THREE.BoxGeometry(0.25, 0.8, 0.25);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
    const lLeg = new THREE.Mesh(legGeo, legMat); lLeg.position.set(-0.15, 0.4, 0); lLeg.castShadow = true; group.add(lLeg);
    const rLeg = new THREE.Mesh(legGeo, legMat); rLeg.position.set(0.15, 0.4, 0); rLeg.castShadow = true; group.add(rLeg);
    scene.add(group);
    return group;
}

// ==================== SYSTEMS ====================
class NPC {
    constructor(scene, type, position) {
        this.type = type;
        this.mesh = new THREE.Group();
        const color = type === 'wolf' ? 0x5d4037 : (type === 'bear' ? 0x3e2723 : 0x01579b);
        const body = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.4, 0.4), new THREE.MeshStandardMaterial({ color }));
        body.position.y = 0.7; this.mesh.add(body);

        if (type === 'scientist') {
            const gun = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.6), new THREE.MeshStandardMaterial({ color: 0x212121 }));
            gun.position.set(0.4, 1.0, 0.4); this.mesh.add(gun);
        }

        this.mesh.position.copy(position);
        scene.add(this.mesh);
        this.velocity = new THREE.Vector3();
        this.health = type === 'bear' ? 120 : (type === 'scientist' ? 80 : 50);
        this.lastAttack = 0;
    }
    update(delta, playerPos) {
        const dist = this.mesh.position.distanceTo(playerPos);
        const agroRange = this.type === 'scientist' ? 30 : 18;
        const attackRange = this.type === 'scientist' ? 12 : 2.5;

        if (dist < agroRange) {
            this.mesh.lookAt(playerPos.x, this.mesh.position.y, playerPos.z);
            if (dist > attackRange - 1) {
                const dir = new THREE.Vector3().subVectors(playerPos, this.mesh.position).normalize();
                this.mesh.position.addScaledVector(dir, (this.type === 'bear' ? 3 : 5) * delta);
            }
            if (dist < attackRange && performance.now() - this.lastAttack > (this.type === 'scientist' ? 800 : 1200)) {
                state.stats.health -= (this.type === 'bear' ? 20 : (this.type === 'scientist' ? 8 : 12));
                updateHUD(); this.lastAttack = performance.now();
                if (this.type === 'scientist') console.log("SHOT FIRED BY SCIENTIST!");
            }
        }
    }
}

const radZones = [];
const npcs = [];

function createMonument(scene, x, z) {
    const tower = new THREE.Group();
    const base = new THREE.Mesh(new THREE.CylinderGeometry(4, 5, 20, 8), new THREE.MeshStandardMaterial({ color: 0x455a64 }));
    base.position.y = 10; tower.add(base);
    tower.position.set(x, getTerrainHeight(x, z), z);
    scene.add(tower);
    radZones.push({ x, z, r: CONFIG.RAD_ZONE_RADIUS });
    const loot = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1, 1.2), new THREE.MeshStandardMaterial({ color: 0xffa000 }));
    loot.position.set(x + 2, getTerrainHeight(x + 2, z) + 0.5, z);
    loot.userData = { type: 'crate', health: 1 };
    scene.add(loot);
}

// ==================== ENGINE START ====================
try {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    scene.fog = new THREE.FogExp2(0x87ceeb, 0.005);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, logarithmicDepthBuffer: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    document.body.appendChild(renderer.domElement);

    const pointerControls = new PointerLockControls(camera, document.body);
    playerMesh = createPlayer(scene);

    // Light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0x87ceeb, 0x3d5c2e, 0.6);
    scene.add(hemiLight);

    const sun = new THREE.DirectionalLight(0xffffff, 1.5);
    sun.position.set(100, 200, 50);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -200;
    sun.shadow.camera.right = 200;
    sun.shadow.camera.top = 200;
    sun.shadow.camera.bottom = -200;
    sun.shadow.camera.far = 500;
    scene.add(sun);

    // World Detail
    const groundGeo = new THREE.PlaneGeometry(CONFIG.WORLD_SIZE, CONFIG.WORLD_SIZE, 120, 120);
    groundGeo.rotateX(-Math.PI / 2);
    const groundPos = groundGeo.attributes.position;
    const colors = new Float32Array(groundPos.count * 3);
    for (let i = 0; i < groundPos.count; i++) {
        const x = groundPos.getX(i);
        const z = groundPos.getZ(i);
        const y = getTerrainHeight(x, z);
        groundPos.setY(i, y);
        // Vertex color based on height
        const normY = (y + 4) / 16; // normalize roughly
        let r, g, b;
        if (y < 0.5) {
            // Low: sandy/dirt
            r = 0.6; g = 0.5 + normY * 0.2; b = 0.2;
        } else if (y < 3) {
            // Mid: grass
            const t = (y - 0.5) / 2.5;
            r = 0.2 + t * 0.3;
            g = 0.5 + t * 0.15;
            b = 0.1 + t * 0.1;
        } else {
            // High: rocky
            const t = Math.min(1, (y - 3) / 5);
            r = 0.4 + t * 0.3;
            g = 0.35 + t * 0.25;
            b = 0.2 + t * 0.2;
        }
        colors[i * 3] = r;
        colors[i * 3 + 1] = g;
        colors[i * 3 + 2] = b;
    }
    groundGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    groundGeo.computeVertexNormals();
    const ground = new THREE.Mesh(groundGeo, new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.9,
        metalness: 0.05
    }));
    ground.receiveShadow = true;
    scene.add(ground);

    const interactables = [];
    const collisionObjects = [];
    const builtStructures = [];

    // ==================== BUILDING SYSTEM ====================
    function initBlueprintSelector() {
        const blueprintItems = document.querySelectorAll('.blueprint-item');
        blueprintItems.forEach(item => {
            item.onclick = () => {
                selectBlueprintPiece(item.dataset.type);
            };
        });
        initRadialMenu();
    }

    function selectBlueprintPiece(type) {
        state.building.selectedBlueprint = type;
        state.building.blueprintOpen = false;
        document.getElementById('blueprint-selector').style.display = 'none';
        document.getElementById('radial-menu').style.display = 'none';

        updateBlueprintIndicator();
        console.log(`✅ Blueprint selected: ${type}`);

        // Lock controls back if we came from radial/blueprint menu
        pointerControls.lock();
    }

    function initRadialMenu() {
        const container = document.getElementById('radial-pieces-container');
        if (!container) return;
        container.innerHTML = '';

        const pieces = [
            { type: 'foundation', icon: 'fa-square' },
            { type: 'wall', icon: 'fa-border-all' },
            { type: 'doorway', icon: 'fa-door-open' },
            { type: 'ceiling', icon: 'fa-th-large' },
            { type: 'tool_cupboard', icon: 'fa-box-archive' },
            { type: 'wooden_door', icon: 'fa-door-closed' }
        ];

        const radius = 160;
        pieces.forEach((p, i) => {
            const angle = (i / pieces.length) * Math.PI * 2 - Math.PI / 2;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;

            const el = document.createElement('div');
            el.className = 'radial-piece';
            el.style.left = `calc(50% + ${x}px - 42px)`;
            el.style.top = `calc(50% + ${y}px - 42px)`;
            el.innerHTML = `<i class="fas ${p.icon}"></i><span>${p.type.replace('_', ' ')}</span>`;
            el.onclick = (e) => {
                e.stopPropagation();
                selectBlueprintPiece(p.type);
            };
            container.appendChild(el);
        });
    }

    function updateBlueprintIndicator() {
        let indicator = document.getElementById('blueprint-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'blueprint-indicator';
            indicator.style.cssText = 'position:fixed; top:100px; left:50%; transform:translateX(-50%); background:rgba(205,92,44,0.95); color:white; padding:12px 25px; border-radius:6px; font-weight:900; font-size:1rem; z-index:200; box-shadow:0 4px 12px rgba(0,0,0,0.5);';
            document.body.appendChild(indicator);
        }

        if (state.building.selectedBlueprint) {
            const name = BUILDING_TYPES[state.building.selectedBlueprint].name;
            indicator.innerHTML = `📐 Selected: <span style="color:#ffd700;">${name}</span> | Angle: ${Math.round(state.building.rotationY * 180 / Math.PI)}° (Press R to rotate, G to cancel)`;
            indicator.style.display = 'block';
        } else {
            indicator.style.display = 'none';
        }
    }

    function canBuildHere(position, type) {
        const buildData = BUILDING_TYPES[type];

        // 1. TC Overlap Check
        if (type === 'tool_cupboard') {
            for (let tc of state.building.toolCupboards) {
                const dist = Math.sqrt((position.x - tc.pos.x) ** 2 + (position.z - tc.pos.z) ** 2);
                if (dist < CONFIG.TC_RADIUS) return false;
            }
        }

        // 2. Stability / Support Check
        if (buildData.requiresSupport) {
            let hasFoundation = false;
            for (let s of builtStructures) {
                const dist = s.position.distanceTo(new THREE.Vector3(position.x, s.position.y, position.z));
                if (dist < 0.5 && (s.userData.buildType === 'foundation' || s.userData.buildType === 'ceiling')) {
                    hasFoundation = true;
                    break;
                }
            }
            if (!hasFoundation && type !== 'foundation') return false;
        }

        // 3. Door placement check
        if (type === 'wooden_door') {
            let onDoorway = false;
            for (let s of builtStructures) {
                const dist = s.position.distanceTo(new THREE.Vector3(position.x, s.position.y, position.z));
                if (dist < 0.5 && s.userData.buildType === 'doorway') {
                    onDoorway = true;
                    break;
                }
            }
            if (!onDoorway) return false;
        }

        return true;
    }

    function placeStructure() {
        if (!state.building.selectedBlueprint) return;
        const blueprint = state.building.selectedBlueprint;
        const buildData = BUILDING_TYPES[blueprint];

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
        const hits = raycaster.intersectObjects([ground, ...builtStructures], true);

        if (hits.length > 0 && hits[0].distance < 10) {
            const point = hits[0].point;

            const snapX = Math.round(point.x / 3) * 3;
            const snapY = buildData.offset[1];
            const snapZ = Math.round(point.z / 3) * 3;

            // Offset for ceiling/walls if placing on existing structures
            let targetY = snapY;
            if (hits[0].object.userData.type === 'structure') {
                if (blueprint === 'ceiling') targetY = hits[0].object.position.y + 3;
                if (blueprint === 'wall' || blueprint === 'doorway') targetY = hits[0].object.position.y;
            }

            if (!canBuildHere({ x: snapX, z: snapZ }, blueprint)) {
                showNotification("Cannot build here: Invalid Support");
                return;
            }

            const geometry = new THREE.BoxGeometry(...buildData.geometry);
            const material = new THREE.MeshStandardMaterial({
                color: BUILDING_TIERS.twig.color,
                roughness: 0.8
            });
            const structure = new THREE.Mesh(geometry, material);
            structure.position.set(snapX, targetY, snapZ);
            structure.rotation.y = state.building.rotationY;
            structure.castShadow = true;
            structure.receiveShadow = true;

            structure.userData = {
                type: buildData.isDoor ? 'door' : 'structure',
                buildType: blueprint,
                tier: 'twig',
                health: BUILDING_TIERS.twig.health,
                maxHealth: BUILDING_TIERS.twig.health,
                isOpen: false,
                isDoor: buildData.isDoor
            };

            if (blueprint === 'tool_cupboard') {
                structure.userData.type = 'tool_cupboard';
                state.building.toolCupboards.push({ pos: { x: snapX, z: snapZ }, radius: CONFIG.TC_RADIUS });
            }

            scene.add(structure);
            builtStructures.push(structure);
            collisionObjects.push(structure);

            // Build Animation
            structure.scale.set(0.1, 0.1, 0.1);
            let sc = 0.1;
            const ani = setInterval(() => {
                sc += 0.2;
                structure.scale.set(sc, sc, sc);
                if (sc >= 1) {
                    structure.scale.set(1, 1, 1);
                    clearInterval(ani);
                }
            }, 20);

            // Build Sound/VFX
            screenFlash('rgba(255,255,255,0.1)');
            console.log(`Placed ${blueprint}`);
        }
    }

    function upgradeStructure(structure) {
        const currentTier = structure.userData.tier;
        const tierOrder = ['twig', 'wood', 'stone', 'metal', 'hqm'];
        const currentIndex = tierOrder.indexOf(currentTier);

        if (currentIndex >= tierOrder.length - 1) {
            console.log('Structure already at max tier');
            return;
        }

        const nextTier = tierOrder[currentIndex + 1];
        const cost = BUILDING_TIERS[nextTier].cost;

        // Check resources
        let canAfford = true;
        for (let [res, amt] of Object.entries(cost)) {
            if (getItemCount(res) < amt) {
                canAfford = false;
                break;
            }
        }

        if (!canAfford) {
            console.log('Not enough resources for upgrade');
            return;
        }

        // Consume resources
        for (let [res, amt] of Object.entries(cost)) {
            const inv = state.inventory.find(i => i.id === res);
            if (inv) inv.count -= amt;
        }

        // Apply upgrade
        structure.userData.tier = nextTier;
        structure.userData.maxHealth = BUILDING_TIERS[nextTier].health;
        structure.userData.health = BUILDING_TIERS[nextTier].health;
        structure.material.color.setHex(BUILDING_TIERS[nextTier].color);

        updateHUD();
        console.log(`Upgraded to ${nextTier}`);
    }

    function repairStructure(structure) {
        if (structure.userData.health >= structure.userData.maxHealth) {
            console.log('Structure at full health');
            return;
        }

        const tier = structure.userData.tier;
        const cost = BUILDING_TIERS[tier].cost;
        const repairAmount = structure.userData.maxHealth * 0.1; // 10% per repair

        // Check resources (uses same cost as upgrade)
        if (tier !== 'twig') {
            let canAfford = true;
            for (let [res, amt] of Object.entries(cost)) {
                const needed = Math.ceil(amt * 0.1); // 10% of upgrade cost
                if (getItemCount(res) < needed) {
                    canAfford = false;
                    break;
                }
            }

            if (!canAfford) {
                console.log('Not enough resources for repair');
                return;
            }

            // Consume resources
            for (let [res, amt] of Object.entries(cost)) {
                const needed = Math.ceil(amt * 0.1);
                const inv = state.inventory.find(i => i.id === res);
                if (inv) inv.count -= needed;
            }
        }

        structure.userData.health = Math.min(structure.userData.maxHealth, structure.userData.health + repairAmount);
        updateHUD();
        console.log(`Repaired structure to ${structure.userData.health}/${structure.userData.maxHealth}`);
    }

    function updateBuildInfo(structure) {
        const panel = document.getElementById('build-info');
        if (!structure || (structure.userData.type !== 'structure' && structure.userData.type !== 'door')) {
            panel.style.display = 'none';
            return;
        }

        const tier = structure.userData.tier;
        const tierOrder = ['twig', 'wood', 'stone', 'metal', 'hqm'];
        const currentIndex = tierOrder.indexOf(tier);
        const nextTier = currentIndex < tierOrder.length - 1 ? tierOrder[currentIndex + 1] : null;

        // Calculate simple stability based on height (Y)
        // Foundations (Y=0.1) have 100%, higher levels reduce stability
        const stability = Math.max(20, 100 - Math.floor((structure.position.y - 0.1) * 10));

        document.getElementById('build-tier').innerHTML = `<i class="fas fa-layer-group"></i> ${BUILDING_TIERS[tier].name} (${stability}%)`;
        document.getElementById('build-health').textContent = `${Math.round(structure.userData.health)}/${structure.userData.maxHealth}`;

        if (nextTier) {
            const cost = BUILDING_TIERS[nextTier].cost;
            const costStr = Object.entries(cost).map(([res, amt]) => `${res} (${amt})`).join(', ');
            document.getElementById('build-upgrade').innerHTML = `<i class="fas fa-arrow-up"></i> ${BUILDING_TIERS[nextTier].name}: ${costStr}`;
        } else {
            document.getElementById('build-upgrade').textContent = 'MAX TIER';
        }

        panel.style.display = 'block';
        state.building.lookingAtStructure = structure;
    }

    // Realistic Procedural Trees
    for (let i = 0; i < CONFIG.TREE_COUNT; i++) {
        const x = (Math.random() - 0.5) * (CONFIG.WORLD_SIZE - 40);
        const z = (Math.random() - 0.5) * (CONFIG.WORLD_SIZE - 40);
        const y = getTerrainHeight(x, z);

        const tree = new THREE.Group();
        // Trunk
        const trunk = new THREE.Mesh(
            new THREE.CylinderGeometry(0.15, 0.4, 3, 8),
            new THREE.MeshStandardMaterial({ color: 0x4e342e, roughness: 0.9 })
        );
        trunk.position.y = 1.5;
        trunk.castShadow = true;
        tree.add(trunk);

        // Leaves in clusters
        const leafMat = new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.8 });
        for (let j = 0; j < 3; j++) {
            const cluster = new THREE.Mesh(new THREE.DodecahedronGeometry(1.2 - j * 0.2, 1), leafMat);
            cluster.position.y = 2.5 + j * 0.8;
            cluster.position.x = (Math.random() - 0.5) * 0.5;
            cluster.position.z = (Math.random() - 0.5) * 0.5;
            cluster.castShadow = true;
            tree.add(cluster);
        }

        tree.position.set(x, y, z);
        tree.userData = { type: 'tree', health: 4, radius: 0.5 };
        scene.add(tree);
        interactables.push(tree);
        collisionObjects.push(tree);
    }

    // Realistic Rocks
    const rockMat = new THREE.MeshStandardMaterial({ color: 0x757575, roughness: 1.0 });
    const sulfurMat = new THREE.MeshStandardMaterial({ color: 0xfdd835, roughness: 0.9, emissive: 0x444400, emissiveIntensity: 0.1 });
    const ironMat = new THREE.MeshStandardMaterial({ color: 0x90a4ae, metalness: 0.4, roughness: 0.7 });

    for (let i = 0; i < CONFIG.ROCK_COUNT + CONFIG.SULFUR_COUNT; i++) {
        const x = (Math.random() - 0.5) * (CONFIG.WORLD_SIZE - 40);
        const z = (Math.random() - 0.5) * (CONFIG.WORLD_SIZE - 40);
        const isSulfur = i >= CONFIG.ROCK_COUNT;
        const isIron = !isSulfur && Math.random() > 0.7;

        const rock = new THREE.Mesh(
            new THREE.DodecahedronGeometry(1.2, 0),
            isSulfur ? sulfurMat : (isIron ? ironMat : rockMat)
        );
        const y = getTerrainHeight(x, z);
        rock.position.set(x, y + 0.3, z);
        const scale = 0.6 + Math.random();
        rock.scale.set(scale, scale * 0.8, scale);
        rock.rotation.set(Math.random(), Math.random(), Math.random());
        rock.castShadow = true;
        rock.userData = { type: isSulfur ? 'sulfur' : (isIron ? 'iron' : 'rock'), health: 5, radius: scale };
        scene.add(rock);
        interactables.push(rock);
        collisionObjects.push(rock);
    }

    // Industrial Barrels
    const barrelGeo = new THREE.CylinderGeometry(0.4, 0.4, 1.2, 12);
    const barrelMat = new THREE.MeshStandardMaterial({ color: 0x0277bd, metalness: 0.6, roughness: 0.4 });
    for (let i = 0; i < CONFIG.BARREL_COUNT; i++) {
        const x = (Math.random() - 0.5) * (CONFIG.WORLD_SIZE - 60);
        const z = (Math.random() - 0.5) * (CONFIG.WORLD_SIZE - 60);
        const barrel = new THREE.Mesh(barrelGeo, barrelMat);
        barrel.position.set(x, getTerrainHeight(x, z) + 0.6, z);
        barrel.castShadow = true;
        barrel.userData = { type: 'barrel', health: 3, radius: 0.5 };
        scene.add(barrel);
        interactables.push(barrel);
        collisionObjects.push(barrel);
    }

    // Monuments & Rad Zones
    createMonument(scene, 40, -40);
    createMonument(scene, -60, 50);

    // Spawn NPCs
    for (let i = 0; i < 5; i++) {
        const x = (Math.random() - 0.5) * CONFIG.WORLD_SIZE;
        const z = (Math.random() - 0.5) * CONFIG.WORLD_SIZE;
        const type = Math.random() > 0.3 ? 'wolf' : 'bear';
        npcs.push(new NPC(scene, type, new THREE.Vector3(x, getTerrainHeight(x, z), z)));
    }

    const builtObjects = [];


    // Animation & Logic Functions
    let ghostMesh = null;

    function updateGhost() {
        const activeTool = state.belt[state.selectedBeltSlot || 0];

        // Only show ghost if Building Plan is active
        if (activeTool !== 'building_plan' || !state.building.selectedBlueprint) {
            if (ghostMesh) ghostMesh.visible = false;
            return;
        }

        const blueprint = state.building.selectedBlueprint;
        const buildData = BUILDING_TYPES[blueprint];

        // Create ghost if doesn't exist
        if (!ghostMesh) {
            const geometry = new THREE.BoxGeometry(...buildData.geometry);
            const material = new THREE.MeshBasicMaterial({
                color: 0x00ff00,
                transparent: true,
                opacity: 0.4,
                wireframe: false
            });
            ghostMesh = new THREE.Mesh(geometry, material);
            scene.add(ghostMesh);
        }

        const r = new THREE.Raycaster();
        r.setFromCamera(new THREE.Vector2(0, 0), camera);
        const hit = r.intersectObjects([ground, ...builtStructures]);

        if (hit.length > 0 && hit[0].distance < 10) {
            const p = hit[0].point;

            // Snap to grid
            const snapX = Math.round(p.x / 3) * 3;
            const snapY = buildData.offset[1];
            const snapZ = Math.round(p.z / 3) * 3;

            let targetY = snapY;
            if (hit[0].object.userData.type === 'structure') {
                if (blueprint === 'ceiling') targetY = hit[0].object.position.y + 3;
                if (blueprint === 'wall' || blueprint === 'doorway') targetY = hit[0].object.position.y;
            }

            ghostMesh.position.set(snapX, targetY, snapZ);
            ghostMesh.rotation.y = state.building.rotationY;
            ghostMesh.visible = true;

            const canBuild = canBuildHere({ x: snapX, z: snapZ }, blueprint);
            ghostMesh.material.color.setHex(canBuild ? 0x00ff00 : 0xff0000);
        } else {
            if (ghostMesh) ghostMesh.visible = false;
        }
    }

    function checkCollisions(newPos) {
        for (let obj of [...collisionObjects, ...builtObjects]) {
            const dx = newPos.x - obj.position.x;
            const dz = newPos.z - obj.position.z;
            const distance = Math.sqrt(dx * dx + dz * dz);
            const minDistance = CONFIG.PLAYER_RADIUS + (obj.userData.radius || 0.5);
            if (distance < minDistance) {
                const angle = Math.atan2(dz, dx);
                newPos.x = obj.position.x + Math.cos(angle) * minDistance;
                newPos.z = obj.position.z + Math.sin(angle) * minDistance;
                return true;
            }
        }
        return false;
    }

    const raycaster = new THREE.Raycaster();
    function performAction() {
        // Rust Tools Logic
        const activeToolId = state.belt[state.selectedBeltSlot || 0];

        // 1. Building Plan (Paper)
        if (activeToolId === 'building_plan') {
            if (state.building.selectedBlueprint) {
                placeStructure();
            } else {
                showNotification("Right Click to select piece", "#ffa000");
            }
            return;
        }

        raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
        const hits = raycaster.intersectObjects([...interactables, ...builtStructures], true);

        if (hits.length > 0 && hits[0].distance < CONFIG.INTERACT_DISTANCE) {
            let obj = hits[0].object;
            while (obj.parent && obj.parent !== scene) obj = obj.parent;

            // Door Logic
            if (obj.userData.type === 'door') {
                obj.userData.isOpen = !obj.userData.isOpen;
                obj.rotation.y = obj.userData.isOpen ? Math.PI / 2 : 0;
                showHitMarker();
                return;
            }

            // Hammer Upgrade (H is fallback, but LMB also works if tool is active)
            if (activeToolId === 'hammer' && obj.userData.tier) {
                if (obj.userData.health < obj.userData.maxHealth) {
                    repairStructure(obj);
                } else {
                    upgradeStructure(obj);
                }
                showHitMarker();
                return;
            }

            if (!obj.userData.type) return;

            // Combat / Gathering
            showHitMarker();
            screenFlash('rgba(255,255,255,0.05)');

            camera.position.x += (Math.random() - 0.5) * 0.05;
            camera.position.z += (Math.random() - 0.5) * 0.05;

            obj.userData.health -= 1;
            obj.position.y += 0.05; setTimeout(() => obj.position.y -= 0.05, 50);

            const type = obj.userData.type;
            if (type === 'tree') addItem('wood', 12);
            else if (type === 'rock') addItem('stone', 10);
            else if (type === 'iron') addItem('iron', 8);
            else if (type === 'sulfur') addItem('sulfur', 8);
            else if (type === 'barrel') { addItem('scrap', 3); addItem('lgf', 2); }

            if (obj.userData.health <= 0) {
                scene.remove(obj);
                if (interactables.includes(obj)) interactables.splice(interactables.indexOf(obj), 1);
                if (builtStructures.includes(obj)) builtStructures.splice(builtStructures.indexOf(obj), 1);
                if (collisionObjects.includes(obj)) collisionObjects.splice(collisionObjects.indexOf(obj), 1);
            }
            updateHUD();
        }
    }

    // UI Logic
    function renderCraftingGrid() {
        const grid = document.getElementById('crafting-item-grid');
        const searchTerm = document.getElementById('item-search')?.value.toLowerCase() || "";
        if (!grid) return;
        grid.innerHTML = '';
        Object.keys(ITEMS_DATA).forEach(id => {
            const item = ITEMS_DATA[id];
            if (!item.recipe) return;
            const matchCat = state.selectedCategory === 'common' || item.category === state.selectedCategory;
            const matchSearch = item.name.toLowerCase().includes(searchTerm);
            if (matchCat && matchSearch) {
                const slot = document.createElement('div');
                slot.className = `craft-slot rarity-${item.rarity || 'common'}${state.selectedItem === id ? ' active' : ''}`;
                slot.innerHTML = `<i class="fas ${item.icon}" style="color:${item.color}"></i><span class="item-name-label">${item.name}</span>`;
                slot.onclick = () => { state.selectedItem = id; state.craftQty = 1; renderCraftingGrid(); showCraftingDetail(id); };
                grid.appendChild(slot);
            }
        });
    }

    function showCraftingDetail(id) {
        const panel = document.getElementById('crafting-detail-panel');
        const item = ITEMS_DATA[id];
        if (!panel || !item) return;
        let costHTML = ''; let canCraft = true;
        Object.entries(item.recipe).forEach(([res, amt]) => {
            const needed = amt * state.craftQty; const have = getItemCount(res); const missing = have < needed;
            if (missing) canCraft = false;
            costHTML += `<div class="cost-item ${missing ? 'missing' : ''}"><span>${needed}</span><span>${ITEMS_DATA[res]?.name || res}</span><span>${needed}</span><span>${have}</span></div>`;
        });
        panel.innerHTML = `
            <div class="detail-header"><div class="detail-title">${item.name}</div><div class="detail-subtitle">WORKBENCH REQUIRED</div></div>
            <div class="detail-desc">${item.desc}</div>
            <div class="cost-list"><div class="cost-header"><span>AMT</span><span>ITEM</span><span>TOTAL</span><span>HAVE</span></div>${costHTML}</div>
            <div class="action-row">
                <div class="qty-control"><div class="qty-btn" onclick="updateCraftQty(-1)">-</div><div class="qty-val">${state.craftQty}</div><div class="qty-btn" onclick="updateCraftQty(1)">+</div></div>
                <button class="craft-btn" ${canCraft ? '' : 'disabled'} onclick="performCraft('${id}')">CRAFT</button>
            </div>`;
    }

    function initInventoryTabs() {
        const tabs = document.querySelectorAll('.tab-item');
        tabs.forEach(tab => {
            tab.onclick = () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                const target = tab.dataset.tab;
                const cPane = document.getElementById('crafting-pane');
                const iPane = document.getElementById('inventory-pane');
                if (cPane) cPane.classList.toggle('active', target === 'crafting');
                if (iPane) iPane.classList.toggle('active', target === 'inventory');
                if (target === 'inventory') renderInventoryGrid();
                else renderCraftingGrid();
                initPlayerPreview();
            };
        });

        const cats = document.querySelectorAll('.category-item');
        cats.forEach(c => {
            c.onclick = () => {
                cats.forEach(k => k.classList.remove('active'));
                c.classList.add('active');
                state.selectedCategory = c.dataset.category;
                renderCraftingGrid();
            };
        });

        const search = document.getElementById('item-search');
        if (search) search.oninput = () => renderCraftingGrid();
    }

    function renderInventoryGrid() {
        const grid = document.getElementById('player-inventory-grid');
        if (!grid) return;
        grid.innerHTML = '';
        for (let i = 0; i < 30; i++) {
            const slot = document.createElement('div');
            slot.className = 'inv-grid-slot';
            const item = state.inventory[i];
            if (item && item.count > 0) {
                const data = ITEMS_DATA[item.id];
                if (data) {
                    slot.classList.add(`rarity-${data.rarity || 'common'}`);
                    slot.innerHTML = `<i class="fas ${data.icon}" style="color:${data.color}; font-size: 1.2rem;"></i><span style="position:absolute;bottom:2px;right:4px;font-size:0.65rem;font-weight:900;color:#fff;">${item.count}</span>`;
                }
            }
            grid.appendChild(slot);
        }
    }

    window.updateCraftQty = (val) => { state.craftQty = Math.max(1, state.craftQty + val); if (state.selectedItem) showCraftingDetail(state.selectedItem); };
    window.performCraft = (id) => {
        const item = ITEMS_DATA[id];
        for (let [res, amt] of Object.entries(item.recipe)) {
            const needed = amt * state.craftQty;
            const invItem = state.inventory.find(i => i.id === res);
            if (invItem) invItem.count -= needed;
        }
        addItem(id, state.craftQty); updateHUD(); showCraftingDetail(id);
    };

    function renderBelt() {
        const beltGrid = document.getElementById('belt-inventory-grid');
        if (!beltGrid) return;
        beltGrid.innerHTML = '';
        for (let i = 0; i < 6; i++) {
            const slot = document.createElement('div');
            slot.className = `inv-slot ${state.selectedBeltSlot === i ? 'active' : ''}`;
            const itemId = state.belt[i];

            if (itemId) {
                const item = ITEMS_DATA[itemId];
                slot.innerHTML = `<i class="fas ${item.icon}" style="color:${item.color}"></i>`;
            } else {
                // Default placeholders
                if (i === 0) slot.innerHTML = `<i class="fas fa-hand-fist" style="opacity:0.2"></i>`;
                if (i === 1) slot.innerHTML = `<i class="fas fa-axe" style="opacity:0.2"></i>`;
            }

            slot.onclick = () => {
                state.selectedBeltSlot = i;
                renderBelt();
                updateHotbarUI();
            };
            beltGrid.appendChild(slot);
        }
    }

    function updateHotbarUI() {
        const slots = document.querySelectorAll('.hotbar-slot');
        slots.forEach((s, idx) => {
            s.classList.toggle('active', state.selectedBeltSlot === idx);
            const itemId = state.belt[idx];
            if (itemId) {
                const item = ITEMS_DATA[itemId];
                s.innerHTML = `<i class="fas ${item.icon}"></i>`;
            } else {
                s.innerHTML = idx === 0 ? '<i class="fas fa-hand-fist"></i>' : (idx === 1 ? '<i class="fas fa-axe"></i>' : (idx === 2 ? '<i class="fas fa-hammer"></i>' : ''));
            }
        });
    }


    // ==================== KEYBOARD/MOUSE OVERRIDES ====================
    // These handle specific game logic not covered by the generic GameControls layer
    window.addEventListener('keydown', (e) => {
        if (document.activeElement.tagName === 'INPUT') return;

        // Hotbar Slots (1-6)
        if (e.code.startsWith('Digit')) {
            const slot = parseInt(e.code.replace('Digit', '')) - 1;
            if (slot >= 0 && slot < 6) {
                state.selectedBeltSlot = slot;
                updateHotbarUI();
            }
        }

        // Hammer Actions (Upgrade/Repair)
        if (e.code === 'KeyH') {
            const activeTool = state.belt[state.selectedBeltSlot || 0];
            if (activeTool !== 'hammer') {
                showNotification("Requires Hammer", "#e74c3c");
                return;
            }
            if (state.building.lookingAtStructure) {
                const s = state.building.lookingAtStructure;
                if (s.userData.health < s.userData.maxHealth) repairStructure(s);
                else upgradeStructure(s);
            }
        }

        // Rotate blueprint (R key)
        if (e.code === 'KeyR' && state.building.selectedBlueprint) {
            state.building.rotationY = (state.building.rotationY + Math.PI / 2) % (Math.PI * 2);
            showNotification(`Rotated ${Math.round(state.building.rotationY * 180 / Math.PI)}°`, "#ffa000");
            updateBlueprintIndicator();
        }

        // Escape to force lock/close everything
        if (e.code === 'Escape') {
            const inv = document.getElementById('inventory');
            const menu = document.getElementById('radial-menu');
            inv.style.display = 'none';
            menu.style.display = 'none';
            pointerControls.lock();
        }
    });

    window.addEventListener('mousedown', (e) => {
        if (!pointerControls.isLocked) return;
        if (e.button === 0) performAction();
        if (e.button === 2) { // RMB
            const activeTool = state.belt[state.selectedBeltSlot || 0];
            if (activeTool === 'building_plan') {
                document.getElementById('radial-menu').style.display = 'flex';
                pointerControls.unlock();
            }
        }
    });

    // ==================== ADVANCED UNIFIED CONTROLS (v3.0) ====================
    const gameControls = new UnifiedGameControls({
        requireLandscape: true,
        showCameraControls: true, // Rust needs camera control
        mouseSensitivity: 0.002,
        actionButtons: [
            { id: 'attack', label: '⚔️', action: 'attack', key: 'KeyF', color: '#e74c3c' },
            { id: 'build', label: '🏗️', action: 'build', key: 'KeyB', color: '#f39c12' },
            { id: 'jump', label: '⬆️', action: 'jump', key: 'Space', color: '#3498db' },
            { id: 'inventory', label: '🎒', action: 'inventory', key: 'KeyE', color: '#9b59b6' },
            { id: 'crouch', label: '🔽', action: 'crouch', key: 'ControlLeft', color: '#34495e' },
            { id: 'view', label: '👁️', action: 'view', key: 'KeyV', color: '#1abc9c' }
        ],
        onMove: (dx, dy) => {
            state.controls.left = dx < -0.1;
            state.controls.right = dx > 0.1;
            state.controls.forward = dy < -0.1;
            state.controls.backward = dy > 0.1;
        },
        onCamera: (dx, dy) => {
            // Camera look control for touch/gamepad
            const euler = new THREE.Euler(0, 0, 0, 'YXZ');
            euler.setFromQuaternion(camera.quaternion);
            euler.y -= dx * 0.05;
            euler.x -= dy * 0.05;
            euler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, euler.x));
            camera.quaternion.setFromEuler(euler);
        },
        onAction: (action) => {
            switch(action) {
                case 'attack':
                    if (state.building.selectedBlueprint) placeStructure();
                    else performAction();
                    break;
                case 'build':
                    // Toggle building mode
                    const bpMenu = document.getElementById('blueprint-menu');
                    if (bpMenu.style.display === 'flex') {
                        bpMenu.style.display = 'none';
                        state.building.selectedBlueprint = null;
                        if (previewMesh) { scene.remove(previewMesh); previewMesh = null; }
                        if (!isTouchDevice) pointerControls.lock();
                    } else {
                        bpMenu.style.display = 'flex';
                        pointerControls.unlock();
                        renderBlueprintList();
                    }
                    break;
                case 'jump':
                    if (state.controls.canJump) {
                        velocity.y += CONFIG.JUMP_FORCE;
                        state.controls.canJump = false;
                    }
                    break;
                case 'inventory':
                    const inv = document.getElementById('inventory');
                    if (inv.style.display === 'flex') {
                        inv.style.display = 'none';
                        if (!isTouchDevice) pointerControls.lock();
                    } else {
                        inv.style.display = 'flex';
                        pointerControls.unlock();
                        renderCraftingGrid();
                        renderInventoryGrid();
                        renderBelt();
                        initPlayerPreview();
                    }
                    break;
                case 'crouch':
                    state.controls.crouch = !state.controls.crouch;
                    camera.position.y = state.controls.crouch ? 1.2 : 1.8;
                    showNotification(state.controls.crouch ? 'Crouch ON' : 'Crouch OFF', '#34495e');
                    break;
                case 'view':
                    state.viewMode = state.viewMode === 'first' ? 'third' : 'first';
                    if (playerMesh) playerMesh.visible = (state.viewMode === 'third');
                    showNotification(`View: ${state.viewMode.toUpperCase()}`, '#3498db');
                    break;
                case 'sprint':
                    // Sprint is handled in movement logic
                    break;
            }
        },
        debug: false
    });
    
    gameControls.init();

    const startBtn = document.getElementById('start-button');
    if (startBtn) {
        startBtn.onclick = () => {
            const isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
            if (!isTouch) pointerControls.lock();
            else document.getElementById('instructions').style.display = 'none';
        };
    }

    // Initialize Building System
    initBlueprintSelector();

    pointerControls.addEventListener('lock', () => {
        document.getElementById('instructions').style.display = 'none';
        document.getElementById('inventory').style.display = 'none';
    });
    pointerControls.addEventListener('unlock', () => {
        if (document.getElementById('inventory').style.display !== 'flex') {
            document.getElementById('instructions').style.display = 'flex';
        }
    });

    // Main Loop
    let lastTime = performance.now();
    function animate() {
        requestAnimationFrame(animate);
        const time = performance.now();
        const delta = Math.min((time - lastTime) / 1000, 0.1);

        // Simulation Update (Hunger, Thirst, Rad)
        state.time = (state.time + delta) % CONFIG.DAY_LENGTH;
        const dayProgress = state.time / CONFIG.DAY_LENGTH;

        // Day/Night Cycle
        const angle = dayProgress * Math.PI * 2;
        sun.position.set(Math.cos(angle) * 100, Math.sin(angle) * 100, 20);
        sun.intensity = Math.max(0, Math.sin(angle) * 1.5);
        ambientLight.intensity = Math.max(0.1, Math.sin(angle) * 0.4);
        scene.fog = new THREE.FogExp2(dayProgress > 0.5 && dayProgress < 0.9 ? 0x050510 : 0x87ceeb, 0.01);

        const isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
        if (pointerControls.isLocked || isTouch) {
            // Survival Stats logic
            state.stats.hunger = Math.max(0, state.stats.hunger - 0.05 * delta);
            state.stats.thirst = Math.max(0, state.stats.thirst - 0.08 * delta);

            // Radiation logic
            let inRad = false;
            radZones.forEach(z => {
                const d = new THREE.Vector3(camera.position.x, 0, camera.position.z).distanceTo(new THREE.Vector3(z.x, 0, z.z));
                if (d < z.r) inRad = true;
            });
            if (inRad) state.stats.radiation = Math.min(100, state.stats.radiation + 2 * delta);
            else state.stats.radiation = Math.max(0, state.stats.radiation - 1 * delta);

            if (state.stats.hunger <= 0 || state.stats.thirst <= 0 || state.stats.radiation >= 100) {
                state.stats.health -= 2 * delta;
            }

            // Update NPCs
            npcs.forEach(npc => npc.update(delta, camera.position));

            velocity.x -= velocity.x * CONFIG.FRICTION * delta;
            velocity.z -= velocity.z * CONFIG.FRICTION * delta;
            velocity.y -= CONFIG.GRAVITY * delta;
            direction.z = Number(state.controls.forward) - Number(state.controls.backward);
            direction.x = Number(state.controls.right) - Number(state.controls.left);
            direction.normalize();
            if (state.controls.forward || state.controls.backward) velocity.z -= direction.z * CONFIG.PLAYER_SPEED * delta;
            if (state.controls.left || state.controls.right) velocity.x -= direction.x * CONFIG.PLAYER_SPEED * delta;
            pointerControls.moveRight(-velocity.x * delta);
            pointerControls.moveForward(-velocity.z * delta);
            const collisionPoint = { x: camera.position.x, z: camera.position.z };
            checkCollisions(collisionPoint);
            camera.position.x = collisionPoint.x; camera.position.z = collisionPoint.z;
            camera.position.y += (velocity.y * delta);
            const groundY = getTerrainHeight(camera.position.x, camera.position.z) + 1.6;
            if (camera.position.y < groundY) { velocity.y = 0; camera.position.y = groundY; state.controls.canJump = true; }
            if (playerMesh) {
                playerMesh.position.set(camera.position.x, camera.position.y - 1.6, camera.position.z);
                const playerRot = new THREE.Euler().setFromQuaternion(camera.quaternion, 'YXZ');
                playerMesh.rotation.y = playerRot.y + Math.PI;
            }
            updateGhost();
            updateHUDSimulation();

            // Structure Inspection
            const inspectRay = new THREE.Raycaster();
            inspectRay.setFromCamera(new THREE.Vector2(0, 0), camera);
            const structureHits = inspectRay.intersectObjects(builtStructures, true);
            if (structureHits.length > 0 && structureHits[0].distance < 5) {
                updateBuildInfo(structureHits[0].object);
            } else {
                document.getElementById('build-info').style.display = 'none';
                state.building.lookingAtStructure = null;
            }
        }
        // Camera Smoothing Logic
        if (state.viewMode === 'third') {
            const idealCameraOffset = new THREE.Vector3(0, 2, 5).applyQuaternion(camera.quaternion);
            const targetCamPos = camera.position.clone().add(idealCameraOffset);

            const realPos = camera.position.clone();
            camera.position.copy(targetCamPos);
            renderer.render(scene, camera);
            camera.position.copy(realPos);
        } else {
            renderer.render(scene, camera);
        }

        lastTime = time;
    }

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // ==================== PERSISTENCE SYSTEM ====================
    function saveGame() {
        const saveData = {
            version: 1.0,
            timestamp: Date.now(),
            player: {
                position: { x: camera.position.x, y: camera.position.y, z: camera.position.z },
                rotation: { y: camera.rotation.y }, // Camera rotation for yaw
                stats: state.stats,
                inventory: state.inventory,
                belt: state.belt
            },
            time: state.time,
            structures: builtStructures.map(s => ({
                type: s.userData.buildType || 'structure', // Use buildType for structures
                pos: { x: s.position.x, y: s.position.y, z: s.position.z },
                rot: s.rotation.y,
                tier: s.userData.tier,
                health: s.userData.health,
                maxHealth: s.userData.maxHealth,
                isTC: s.userData.type === 'tool_cupboard'
            }))
        };

        localStorage.setItem('rust_survival_save', JSON.stringify(saveData));
        showNotification("Game Saved");
        console.log("💾 Game Saved!", saveData);
    }

    function loadGame() {
        const json = localStorage.getItem('rust_survival_save');
        if (!json) return;

        try {
            const data = JSON.parse(json);
            console.log("📂 Loading Game...", data);

            // Restore Player
            camera.position.set(data.player.position.x, data.player.position.y, data.player.position.z);
            if (playerMesh) playerMesh.position.set(data.player.position.x, data.player.position.y - 1.6, data.player.position.z);

            // Restore State
            state.stats = data.player.stats;
            state.inventory = data.player.inventory;
            state.belt = data.player.belt || state.belt;
            state.time = data.time;

            // Restore Structures
            data.structures.forEach(s => {
                let layout = BUILDING_TYPES[s.type];
                if (!layout && s.isTC) layout = BUILDING_TYPES.tool_cupboard;
                if (!layout) layout = BUILDING_TYPES.foundation; // Fallback

                const geometry = new THREE.BoxGeometry(...layout.geometry);
                const tierData = BUILDING_TIERS[s.tier || 'twig'];
                const material = new THREE.MeshStandardMaterial({
                    color: tierData.color,
                    roughness: 0.8
                });

                const structure = new THREE.Mesh(geometry, material);
                structure.position.set(s.pos.x, s.pos.y, s.pos.z);
                if (s.rot) structure.rotation.y = s.rot;
                structure.castShadow = true;
                structure.receiveShadow = true;

                structure.userData = {
                    type: s.isTC ? 'tool_cupboard' : 'structure',
                    buildType: s.type,
                    tier: s.tier || 'twig',
                    health: s.health,
                    maxHealth: s.maxHealth
                };

                // Re-register TC
                if (s.isTC) {
                    state.building.toolCupboards.push({ pos: { x: s.pos.x, z: s.pos.z }, radius: CONFIG.TC_RADIUS });
                }

                scene.add(structure);
                builtStructures.push(structure);
                collisionObjects.push(structure);
            });

            updateHUD();
            console.log("✅ Game Loaded Successfully");

        } catch (e) {
            console.error("Failed to load save:", e);
        }
    }

    function showNotification(msg, color = '#4caf50') {
        let note = document.getElementById('game-notification');
        if (!note) {
            note = document.createElement('div');
            note.id = 'game-notification';
            note.style.cssText = "position:fixed; top:20px; right:20px; background:rgba(0,0,0,0.7); color:#4caf50; padding:10px 20px; border-radius:5px; font-weight:bold; z-index:1000; display:none;";
            document.body.appendChild(note);
        }
        note.textContent = msg;
        note.style.color = color;
        note.style.display = 'block';
        setTimeout(() => note.style.display = 'none', 2000);
    }

    function updateBuildingPrivilegeUI() {
        let indicator = document.getElementById('privilege-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'privilege-indicator';
            indicator.style.cssText = "position:fixed; bottom:120px; right:20px; background:rgba(46, 204, 113, 0.2); color:#2ecc71; padding:8px 15px; border-radius:4px; font-weight:bold; font-size:0.9rem; border-left: 3px solid #2ecc71; display:none; pointer-events:none;";
            indicator.innerHTML = '<i class="fas fa-hammer"></i> BUILDING PRIVILEGE';
            document.body.appendChild(indicator);
        }

        let hasPrivilege = false;
        // Check if inside any TC range
        state.building.toolCupboards.forEach(tc => {
            const dist = Math.sqrt((camera.position.x - tc.pos.x) ** 2 + (camera.position.z - tc.pos.z) ** 2);
            if (dist < CONFIG.TC_RADIUS) {
                hasPrivilege = true;
            }
        });

        if (hasPrivilege) {
            indicator.style.display = 'block';
        } else {
            indicator.style.display = 'none';
        }
    }

    // Auto-Save every 60 seconds
    setInterval(saveGame, 60000);

    // Initial Load
    loadGame();

    animate();
    // Hook into animate loop without rewriting the whole function
    // We overwrite the existing animate function reference? No, that's messy.
    // Better to insert the call inside existing animate loop if possible, OR just use setInterval for UI check (cheaper).
    setInterval(updateBuildingPrivilegeUI, 500); // Check every 500ms is enough

    initInventoryTabs();
    setTimeout(() => {
        const loader = document.getElementById('loading-screen');
        if (loader) loader.style.display = 'none';
        updateHUD();
    }, 1500);

} catch (err) {
    console.error("Critical Failure:", err);
    const loader = document.getElementById('loading-screen');
    if (loader) loader.style.display = 'none';
    alert("Game Crash: " + err.message);
}

// ==================== INVENTORY 3D PREVIEW ====================
let previewRenderer, previewScene, previewCamera, previewPlayer;

function initPlayerPreview() {
    const container = document.getElementById('player-3d-preview');
    if (!container) return;
    container.innerHTML = '';
    previewScene = new THREE.Scene();
    previewCamera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    previewCamera.position.set(0, 1.2, 3.5);
    previewRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    previewRenderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(previewRenderer.domElement);
    const ambient = new THREE.AmbientLight(0xffffff, 1.5);
    previewScene.add(ambient);
    previewPlayer = new THREE.Group();
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.8, 0.3), new THREE.MeshStandardMaterial({ color: 0x8b322c }));
    torso.position.y = 1.25; previewPlayer.add(torso);
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.35, 0.3), new THREE.MeshStandardMaterial({ color: 0xffdbac }));
    head.position.y = 1.85; previewPlayer.add(head);
    previewScene.add(previewPlayer);
    function animatePreview() {
        if (document.getElementById('inventory').style.display === 'none') return;
        requestAnimationFrame(animatePreview);
        previewPlayer.rotation.y += 0.01;
        previewRenderer.render(previewScene, previewCamera);
    }
    animatePreview();
}



