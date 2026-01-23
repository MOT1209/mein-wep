import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

console.log("Rust Survival Engine v2.5: Initializing with Collision Physics...");

// ==================== CONFIGURATION ====================
const CONFIG = {
    WORLD_SIZE: 300,
    TREE_COUNT: 55,
    ROCK_COUNT: 30,
    SULFUR_COUNT: 20,
    BARREL_COUNT: 25,
    BUILD_DISTANCE: 7,
    INTERACT_DISTANCE: 4.5,
    PLAYER_SPEED: 80,
    FRICTION: 10.0,
    GRAVITY: 24.0,
    JUMP_FORCE: 9.0,
    PLAYER_RADIUS: 0.8,
    DAY_LENGTH: 600,
    RAD_ZONE_RADIUS: 18,
    TC_RADIUS: 20
};

// ==================== STATE ====================
const state = {
    inventory: [
        { id: 'wood', count: 1000 },
        { id: 'stone', count: 500 },
        { id: 'frag', count: 300 },
        { id: 'hqm', count: 100 }
    ],
    gear: { head: null, chest: null, legs: null, feet: null },
    belt: Array(6).fill(null),
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
    hqm: { name: 'Armored', health: 2000, color: 0xeceff1, cost: { hqm: 50 } }
};

const BUILDING_TYPES = {
    foundation: { name: 'Foundation', geometry: [3, 0.2, 3], offset: [0, 0.1, 0] },
    wall: { name: 'Wall', geometry: [3, 3, 0.2], offset: [0, 1.5, 0] },
    doorway: { name: 'Doorway', geometry: [3, 3, 0.2], offset: [0, 1.5, 0], hasDoor: true },
    ceiling: { name: 'Ceiling', geometry: [3, 0.2, 3], offset: [0, 3, 0] },
    tool_cupboard: { name: 'Tool Cupboard', geometry: [1, 2, 1], offset: [0, 1, 0] }
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
    'ak47': { name: 'Assault Rifle', category: 'weapons', icon: 'fa-jet-fighter', color: '#6d4c41', rarity: 'elite', recipe: { hqm: 50, wood: 200, spring: 2, pipe: 1 }, desc: 'The king of Rust weapons. High recoil, high reward.' },

    // Construction
    'foundation': { name: 'Foundation', category: 'construction', icon: 'fa-square', color: '#8d6e63', rarity: 'common', recipe: { wood: 200 }, desc: 'The heart of your sanctuary.' },
    'wall': { name: 'Wall', category: 'construction', icon: 'fa-border-all', color: '#8d6e63', rarity: 'common', recipe: { wood: 100 }, desc: 'Standard structural blockade.' },
    'stone_wall': { name: 'Stone Wall', category: 'construction', icon: 'fa-border-none', color: '#b0bec5', rarity: 'rare', recipe: { stone: 300 }, desc: 'Higher durability stone structure.' },
    'metal_wall': { name: 'Sheet Metal Wall', category: 'construction', icon: 'fa-shield-halved', color: '#90a4ae', rarity: 'rare', recipe: { frag: 200 }, desc: 'Heavy industrial protection.' },
    'door': { name: 'Wood Door', category: 'construction', icon: 'fa-door-closed', color: '#8d6e63', rarity: 'common', recipe: { wood: 300 }, desc: 'Access point with minimal security.' },
    'lock': { name: 'Key Lock', category: 'construction', icon: 'fa-lock', color: '#546e7a', rarity: 'common', recipe: { iron: 100 }, desc: 'Basic protection for your base.' },

    // Medical
    'bandage': { name: 'Bandage', category: 'medical', icon: 'fa-band-aid', color: '#e57373', rarity: 'common', recipe: { cloth: 2 }, desc: 'Stops bleeding immediately.' },
    'syringe': { name: 'Medical Syringe', category: 'medical', icon: 'fa-syringe', color: '#ef5350', rarity: 'rare', recipe: { iron: 20, scrap: 5, cloth: 10 }, desc: 'Instant adrenaline-boosted recovery.' }
};






let playerMesh;



const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();

// ==================== CORE FUNCTIONS ====================
function getTerrainHeight(x, z) {
    return Math.sin(x * 0.05) * Math.cos(z * 0.05) * 2.5;
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
    const healthFill = document.getElementById('health-fill');
    const hungerFill = document.getElementById('hunger-fill');
    const thirstFill = document.getElementById('thirst-fill');
    const radFill = document.getElementById('rad-fill');
    const radOverlay = document.getElementById('rad-overlay');

    if (healthFill) healthFill.style.width = state.stats.health + '%';
    if (hungerFill) hungerFill.style.width = state.stats.hunger + '%';
    if (thirstFill) thirstFill.style.width = state.stats.thirst + '%';
    if (radFill) radFill.style.width = state.stats.radiation + '%';
    if (radOverlay) radOverlay.style.opacity = state.stats.radiation / 100;
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
    scene.background = new THREE.Color(0xa3d1ff);
    scene.fog = new THREE.FogExp2(0xa3d1ff, 0.008);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(renderer.domElement);

    const pointerControls = new PointerLockControls(camera, document.body);
    playerMesh = createPlayer(scene);

    // Light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    const sun = new THREE.DirectionalLight(0xffffff, 1.2);
    sun.position.set(50, 100, 20);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    scene.add(sun);

    // World Detail
    const groundGeo = new THREE.PlaneGeometry(CONFIG.WORLD_SIZE, CONFIG.WORLD_SIZE, 60, 60);
    groundGeo.rotateX(-Math.PI / 2);
    const groundPos = groundGeo.attributes.position;
    for (let i = 0; i < groundPos.count; i++) {
        const x = groundPos.getX(i);
        const z = groundPos.getZ(i);
        groundPos.setY(i, getTerrainHeight(x, z));
    }
    groundGeo.computeVertexNormals();
    const ground = new THREE.Mesh(groundGeo, new THREE.MeshStandardMaterial({ color: 0x3d5c2e, roughness: 1.0, metalness: 0.0 }));
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
                // Remove active class from all items
                blueprintItems.forEach(i => i.classList.remove('selected'));

                const type = item.dataset.type;
                state.building.selectedBlueprint = type;
                state.building.blueprintOpen = false;

                // Add active class to selected item
                item.classList.add('selected');

                // Hide blueprint selector
                document.getElementById('blueprint-selector').style.display = 'none';

                // Show selected blueprint indicator
                updateBlueprintIndicator();

                console.log(`✅ Blueprint selected: ${type}`);
            };
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
            indicator.innerHTML = `📐 Selected: <span style="color:#ffd700;">${name}</span> (Press G to cancel)`;
            indicator.style.display = 'block';
        } else {
            indicator.style.display = 'none';
        }
    }

    function canBuildHere(position) {
        // Check Tool Cupboard privilege
        // Simple Logic: If inside ANY TC radius, we assume "Building Privilege" (Authorized)
        // If we wanted to block strangers, we would check if we are authorized on that specific TC.
        // For single player, placing a TC just creates a "Safe Zone".
        // Let's visualize it: If near a TC, show "Building Privilege".

        let hasPrivilege = false;
        let blocked = false;

        // In a real multiplayer game, we would check:
        // if (inside_tc_range && !authorized) return false; (Blocked)
        // if (inside_tc_range && authorized) return true; (Privilege)

        // Current implementation: Just checking distance to prevent overlapping TCs slightly or just logic placeholder
        // New Logic:
        // 1. Cannot place TC too close to another TC
        // 2. Can build anywhere else (unless blocked by map bounds etc)

        if (state.building.selectedBlueprint === 'tool_cupboard') {
            for (let tc of state.building.toolCupboards) {
                const dist = Math.sqrt((position.x - tc.pos.x) ** 2 + (position.z - tc.pos.z) ** 2);
                if (dist < CONFIG.TC_RADIUS) return false; // Cannot place TC inside another TC range
            }
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

            // Snap to grid
            const snapX = Math.round(point.x / 3) * 3;
            const snapY = buildData.offset[1];
            const snapZ = Math.round(point.z / 3) * 3;

            if (!canBuildHere({ x: snapX, z: snapZ })) {
                document.getElementById('tc-status').style.display = 'block';
                setTimeout(() => document.getElementById('tc-status').style.display = 'none', 2000);
                return;
            }

            // Create structure (starts as Twig)
            const geometry = new THREE.BoxGeometry(...buildData.geometry);
            const material = new THREE.MeshStandardMaterial({
                color: BUILDING_TIERS.twig.color,
                roughness: 0.8
            });
            const structure = new THREE.Mesh(geometry, material);
            structure.position.set(snapX, snapY, snapZ);
            structure.castShadow = true;
            structure.receiveShadow = true;

            structure.userData = {
                type: 'structure',
                buildType: blueprint,
                tier: 'twig',
                health: BUILDING_TIERS.twig.health,
                maxHealth: BUILDING_TIERS.twig.health
            };

            // TC Logic
            if (blueprint === 'tool_cupboard') {
                structure.userData.type = 'tool_cupboard';
                state.building.toolCupboards.push({ pos: { x: snapX, z: snapZ }, radius: CONFIG.TC_RADIUS });
                console.log("TC Placed! Building Privilege Area Established.");
            }

            scene.add(structure);
            builtStructures.push(structure);
            collisionObjects.push(structure);

            console.log(`Placed ${blueprint} at (${snapX}, ${snapY}, ${snapZ})`);
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
        if (!structure || structure.userData.type !== 'structure') {
            panel.style.display = 'none';
            return;
        }

        const tier = structure.userData.tier;
        const tierOrder = ['twig', 'wood', 'stone', 'metal', 'hqm'];
        const currentIndex = tierOrder.indexOf(tier);
        const nextTier = currentIndex < tierOrder.length - 1 ? tierOrder[currentIndex + 1] : null;

        document.getElementById('build-tier').textContent = BUILDING_TIERS[tier].name;
        document.getElementById('build-health').textContent = `${Math.round(structure.userData.health)}/${structure.userData.maxHealth}`;

        if (nextTier) {
            const cost = BUILDING_TIERS[nextTier].cost;
            const costStr = Object.entries(cost).map(([res, amt]) => `${res} (${amt})`).join(', ');
            document.getElementById('build-upgrade').textContent = `${BUILDING_TIERS[nextTier].name}: ${costStr}`;
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
        // Remove old ghost if blueprint changed
        if (ghostMesh && state.building.selectedBlueprint) {
            const currentType = state.building.selectedBlueprint;
            const currentGeo = BUILDING_TYPES[currentType].geometry;
            const currentGeoStr = currentGeo.join(',');
            const ghostGeoStr = [ghostMesh.geometry.parameters.width, ghostMesh.geometry.parameters.height, ghostMesh.geometry.parameters.depth].join(',');

            if (currentGeoStr !== ghostGeoStr) {
                scene.remove(ghostMesh);
                ghostMesh = null;
            }
        }

        if (!state.building.selectedBlueprint) {
            if (ghostMesh) {
                ghostMesh.visible = false;
            }
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

            ghostMesh.position.set(snapX, snapY, snapZ);
            ghostMesh.visible = true;

            // Check if can build here
            const canBuild = canBuildHere({ x: snapX, z: snapZ });
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
        if (state.buildMode) {
            if (ghost.visible && getItemCount('wood') >= 200) {
                const b = new THREE.Mesh(buildGeo, new THREE.MeshStandardMaterial({ color: 0x8d6e63 }));
                b.position.copy(ghost.position); b.castShadow = true; b.receiveShadow = true;
                b.userData = { type: 'wall_wood', health: 10, tier: 1 };
                scene.add(b); builtObjects.push(b);
                const wood = state.inventory.find(i => i.id === 'wood'); if (wood) wood.count -= 200;
                updateHUD();
            }
            return;
        }
        raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
        const hits = raycaster.intersectObjects([...interactables, ...builtObjects], true);
        if (hits.length > 0 && hits[0].distance < CONFIG.INTERACT_DISTANCE) {
            let obj = hits[0].object;
            while (obj.parent && obj.parent !== scene) obj = obj.parent;
            if (!obj.userData.type) return;

            // Hammer Upgrade logic MOVED TO 'H' KEY
            // Legacy code removed to prevent conflicts
            if (state.belt[0] === 'hammer' && obj.userData.tier) {
                // Do nothing on click, use H to upgrade
                return;
            }

            obj.userData.health -= 1;
            obj.position.y += 0.05; setTimeout(() => obj.position.y -= 0.05, 50);

            const type = obj.userData.type;
            if (type === 'tree') addItem('wood', 12);
            else if (type === 'rock') addItem('stone', 10);
            else if (type === 'iron') addItem('iron', 8);
            else if (type === 'sulfur') addItem('sulfur', 8);
            else if (type === 'barrel') { addItem('scrap', 3); addItem('lgf', 2); }
            else if (type === 'crate') { addItem('scrap', 15); addItem('frag', 80); if (Math.random() > 0.6) addItem('pistol', 1); }

            if (obj.userData.health <= 0) {
                scene.remove(obj);
                if (interactables.includes(obj)) interactables.splice(interactables.indexOf(obj), 1);
                if (builtObjects.includes(obj)) builtObjects.splice(builtObjects.indexOf(obj), 1);
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
            const slot = document.createElement('div'); slot.className = 'inv-slot';
            if (i === 0) slot.innerHTML = `<i class="fas fa-hand-fist"></i>`;
            if (i === 1) slot.innerHTML = `<i class="fas fa-axe"></i>`;
            beltGrid.appendChild(slot);
        }
    }


    // Input Listeners
    window.addEventListener('keydown', (e) => {
        if (document.activeElement.tagName === 'INPUT') return;
        if (e.code === 'KeyW') state.controls.forward = true;
        if (e.code === 'KeyS') state.controls.backward = true;
        if (e.code === 'KeyA') state.controls.left = true;
        if (e.code === 'KeyD') state.controls.right = true;
        if (e.code === 'Space' && state.controls.canJump) { velocity.y += CONFIG.JUMP_FORCE; state.controls.canJump = false; }
        if (e.code === 'KeyV') { state.viewMode = state.viewMode === 'first' ? 'third' : 'first'; if (playerMesh) playerMesh.visible = (state.viewMode === 'third'); }

        if (e.code === 'KeyQ') {
            state.building.blueprintOpen = !state.building.blueprintOpen;
            document.getElementById('blueprint-selector').style.display = state.building.blueprintOpen ? 'block' : 'none';
        }
        if (e.code === 'KeyG') {
            state.building.selectedBlueprint = null;
            document.getElementById('build-info').style.display = 'none';
            updateBlueprintIndicator(); // Update indicator
            console.log('❌ Blueprint cancelled');
        }
        if (e.code === 'KeyH') {
            const currentItem = state.belt[state.selectedBeltSlot || 0];
            if (currentItem !== 'hammer') {
                showNotification("Requires Hammer");
                return;
            }
            if (state.building.lookingAtStructure) {
                if (state.building.lookingAtStructure.userData.health < state.building.lookingAtStructure.userData.maxHealth) {
                    repairStructure(state.building.lookingAtStructure);
                } else {
                    upgradeStructure(state.building.lookingAtStructure);
                }
            }
        }

        if (e.code === 'KeyE' || e.code === 'Escape') {
            const inv = document.getElementById('inventory');
            if (inv.style.display === 'flex') { inv.style.display = 'none'; pointerControls.lock(); }
            else {
                inv.style.display = 'flex';
                pointerControls.unlock();
                renderCraftingGrid();
                renderInventoryGrid();
                renderBelt();
                initPlayerPreview();
            }
        }
    });

    window.addEventListener('keyup', (e) => {
        if (e.code === 'KeyW') state.controls.forward = false;
        if (e.code === 'KeyS') state.controls.backward = false;
        if (e.code === 'KeyA') state.controls.left = false;
        if (e.code === 'KeyD') state.controls.right = false;
    });

    window.addEventListener('mousedown', (e) => {
        if (!pointerControls.isLocked) return;
        if (e.button === 0) {
            // Left Click: Place structure or perform action
            if (state.building.selectedBlueprint) {
                placeStructure();
            } else {
                performAction();
            }
        }
        if (e.button === 2) { state.buildMode = !state.buildMode; const hint = document.getElementById('build-mode-hint'); if (hint) hint.style.display = state.buildMode ? 'block' : 'none'; }
    });

    // ==================== MOBILE CONTROLS LOGIC ====================
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
    if (isMobile) {
        document.getElementById('mobile-controls').style.display = 'block';

        // Joystick Logic
        const joystickZone = document.getElementById('joystick-zone');
        const stick = document.getElementById('joystick-stick');
        let stickActive = false;
        let startX, startY;

        joystickZone.addEventListener('touchstart', (e) => {
            stickActive = true;
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });

        joystickZone.addEventListener('touchmove', (e) => {
            if (!stickActive) return;
            const x = e.touches[0].clientX;
            const y = e.touches[0].clientY;
            const dx = x - startX;
            const dy = y - startY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const maxDist = 50;
            const angle = Math.atan2(dy, dx);

            const limitedDist = Math.min(dist, maxDist);
            const moveX = Math.cos(angle) * limitedDist;
            const moveY = Math.sin(angle) * limitedDist;

            stick.style.transform = `translate(calc(-50% + ${moveX}px), calc(-50% + ${moveY}px))`;

            // Map to movement
            state.controls.forward = moveY < -10;
            state.controls.backward = moveY > 10;
            state.controls.left = moveX < -10;
            state.controls.right = moveX > 10;
        });

        joystickZone.addEventListener('touchend', () => {
            stickActive = false;
            stick.style.transform = `translate(-50%, -50%)`;
            state.controls.forward = false;
            state.controls.backward = false;
            state.controls.left = false;
            state.controls.right = false;
        });

        // Action Buttons
        document.getElementById('btn-jump').ontouchstart = () => {
            if (state.controls.canJump) { velocity.y += CONFIG.JUMP_FORCE; state.controls.canJump = false; }
        };

        document.getElementById('btn-interact').ontouchstart = () => {
            if (state.building.selectedBlueprint) placeStructure();
            else performAction();
        };

        document.getElementById('btn-build').ontouchstart = () => {
            state.building.blueprintOpen = !state.building.blueprintOpen;
            document.getElementById('blueprint-selector').style.display = state.building.blueprintOpen ? 'block' : 'none';
        };
    }

    const startBtn = document.getElementById('start-button');
    if (startBtn) startBtn.onclick = () => pointerControls.lock();

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

        if (pointerControls.isLocked) {
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
        const originalCamPos = camera.position.clone();
        if (state.viewMode === 'third') {
            const offset = new THREE.Vector3(0, 1.5, 4).applyQuaternion(camera.quaternion);
            camera.position.add(offset);
        }
        renderer.render(scene, camera);
        camera.position.copy(originalCamPos);
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

    function showNotification(msg) {
        let note = document.getElementById('game-notification');
        if (!note) {
            note = document.createElement('div');
            note.id = 'game-notification';
            note.style.cssText = "position:fixed; top:20px; right:20px; background:rgba(0,0,0,0.7); color:#4caf50; padding:10px 20px; border-radius:5px; font-weight:bold; z-index:1000; display:none;";
            document.body.appendChild(note);
        }
        note.textContent = msg;
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



