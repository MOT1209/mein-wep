import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { assets } from './assets.js';

class FarmEngine {
    constructor() {
        this.container = document.getElementById('game-container');
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, logarithmicDepthBuffer: true });

        // Time System
        this.gameTime = 0;
        this.dayDuration = 120000; // 2 minutes day/night cycle
        this.lastTime = Date.now();

        // Control State
        this.keys = { w: false, a: false, s: false, d: false };
        this.plots = [];

        this.init();
    }

    init() {
        console.log("FarmEngine: Initializing...");
        try {
            // Renderer Setup
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.setPixelRatio(window.devicePixelRatio);
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
            this.renderer.toneMappingExposure = 1.0;
            this.container.appendChild(this.renderer.domElement);

            // Scene Background & Fog
            this.scene.background = new THREE.Color(0x87CEEB);
            this.scene.fog = new THREE.Fog(0x87CEEB, 20, 100);

            // Camera & OrbitControls
            this.camera.position.set(12, 12, 12);
            this.controls = new OrbitControls(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.05;
            this.controls.maxPolarAngle = Math.PI / 2.1;
            this.controls.minDistance = 5;
            this.controls.maxDistance = 50;

            this.setupLighting();
            this.addBaseGround();
            this.addEnvironment();
            this.spawnPlayer();
            this.spawnTractor();

            // Event Listeners
            window.addEventListener('resize', () => this.onWindowResize());
            window.addEventListener('keydown', (e) => this.onKeyDown(e));
            window.addEventListener('keyup', (e) => this.onKeyUp(e));

            // Ensure focus for controls (especially in iframes)
            window.addEventListener('mousedown', () => window.focus());
            this.container.addEventListener('mousedown', () => window.focus());

            // Start Animation
            this.animate();
            console.log("FarmEngine: Ready.");

            // UI Cleanup
            const loader = document.getElementById('loading-screen');
            if (loader) {
                setTimeout(() => {
                    loader.style.opacity = '0';
                    setTimeout(() => loader.style.display = 'none', 500);
                }, 1000);
            }

        } catch (e) {
            console.error("FarmEngine Init Error:", e);
            alert("Initialization Failed: " + e.message);
        }
    }

    setupLighting() {
        this.ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(this.ambientLight);

        this.sunLight = new THREE.DirectionalLight(0xfffaed, 2);
        this.sunLight.position.set(50, 50, 50);
        this.sunLight.castShadow = true;
        this.sunLight.shadow.mapSize.width = 2048;
        this.sunLight.shadow.mapSize.height = 2048;

        const d = 100;
        this.sunLight.shadow.camera.left = -d;
        this.sunLight.shadow.camera.right = d;
        this.sunLight.shadow.camera.top = d;
        this.sunLight.shadow.camera.bottom = -d;
        this.scene.add(this.sunLight);

        this.hemiLight = new THREE.HemisphereLight(0x87CEEB, 0x444444, 0.6);
        this.scene.add(this.hemiLight);
    }

    addBaseGround() {
        const size = 500;
        const groundGeo = new THREE.PlaneGeometry(size, size);
        const texture = assets.createGrassTexture();
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(50, 50);

        const groundMat = new THREE.MeshStandardMaterial({
            map: texture,
            roughness: 0.8,
            metalness: 0.1
        });

        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        ground.userData = { type: 'ground' };
        this.scene.add(ground);
    }

    addEnvironment() {
        // Barn
        const barn = assets.createDetailedBarn();
        barn.position.set(-10, 0, -15);
        barn.rotation.y = Math.PI / 4;
        this.scene.add(barn);

        // Shop
        this.addShop();

        // Fences
        this.addFences();

        // Random Trees
        for (let i = 0; i < 200; i++) {
            const x = (Math.random() - 0.5) * 450;
            const z = (Math.random() - 0.5) * 450;
            if (Math.abs(x) < 25 && Math.abs(z) < 25) continue;

            const tree = assets.createRealisticTree();
            tree.position.set(x, 0, z);
            tree.rotation.y = Math.random() * Math.PI;
            const s = 0.7 + Math.random() * 0.8;
            tree.scale.set(s, s, s);
            this.scene.add(tree);
        }
    }

    addShop() {
        const shop = new THREE.Group();
        const base = new THREE.Mesh(
            new THREE.BoxGeometry(6, 4, 6),
            new THREE.MeshStandardMaterial({ map: assets.createWoodTexture(), color: 0xdeb887 })
        );
        base.position.y = 2;
        base.castShadow = base.receiveShadow = true;
        shop.add(base);

        const roof = new THREE.Mesh(
            new THREE.ConeGeometry(5, 3, 4),
            new THREE.MeshStandardMaterial({ color: 0x990000 })
        );
        roof.position.y = 5.5;
        roof.rotation.y = Math.PI / 4;
        shop.add(roof);

        shop.position.set(15, 0, -10);
        shop.userData = { type: 'shop' };
        shop.traverse(c => { if (c.isMesh) c.userData = { type: 'shop' }; });
        this.scene.add(shop);
    }

    addFences() {
        const fenceMat = new THREE.MeshStandardMaterial({ color: 0x5d4037 });
        const postGeo = new THREE.BoxGeometry(0.2, 1.2, 0.2);
        const railGeo = new THREE.BoxGeometry(0.1, 0.15, 2.1);
        const limit = 15;

        for (let i = -limit; i <= limit; i += 2) {
            // Horizontal and Vertical perimeter
            this.createFencePost(i, -limit, postGeo, fenceMat);
            this.createFencePost(i, limit, postGeo, fenceMat);
            this.createFencePost(-limit, i, postGeo, fenceMat);
            this.createFencePost(limit, i, postGeo, fenceMat);

            if (i < limit) {
                this.createFenceRail(i + 1, -limit, railGeo, fenceMat, false);
                this.createFenceRail(i + 1, limit, railGeo, fenceMat, false);
                this.createFenceRail(-limit, i + 1, railGeo, fenceMat, true);
                this.createFenceRail(limit, i + 1, railGeo, fenceMat, true);
            }
        }
    }

    createFencePost(x, z, geo, mat) {
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(x, 0.6, z);
        mesh.castShadow = true;
        this.scene.add(mesh);
    }

    createFenceRail(x, z, geo, mat, rotated) {
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(x, 0.9, z);
        if (rotated) mesh.rotation.y = Math.PI / 2;
        mesh.castShadow = true;
        this.scene.add(mesh);
    }

    spawnPlayer() {
        this.player = assets.createFarmer();
        this.player.position.set(0, 0, 0);
        this.scene.add(this.player);

        // Initial Camera Setup for 3rd Person
        this.camera.position.set(0, 8, 12);
        this.controls.target.set(0, 0, 0);
        this.controls.update();
    }

    spawnTractor() {
        this.tractor = assets.createTractor();
        this.tractor.position.set(5, 0, 5);
        this.scene.add(this.tractor);

        this.vehicle = {
            speed: 0, maxSpeed: 0.4, turnSpeed: 0.05,
            friction: 0.95, acceleration: 0.012, isDriving: false
        };
    }

    onKeyDown(e) {
        const k = e.key.toLowerCase();
        if (this.keys.hasOwnProperty(k)) {
            this.keys[k] = true;
        } else if (k === 'arrowup') this.keys.w = true;
        else if (k === 'arrowdown') this.keys.s = true;
        else if (k === 'arrowleft') this.keys.a = true;
        else if (k === 'arrowright') this.keys.d = true;
    }

    onKeyUp(e) {
        const k = e.key.toLowerCase();
        if (this.keys.hasOwnProperty(k)) {
            this.keys[k] = false;
        } else if (k === 'arrowup') this.keys.w = false;
        else if (k === 'arrowdown') this.keys.s = false;
        else if (k === 'arrowleft') this.keys.a = false;
        else if (k === 'arrowright') this.keys.d = false;
    }

    updatePlayer(dt) {
        if (!this.player || this.vehicle.isDriving) return;

        const speed = 0.15;
        const move = new THREE.Vector3(0, 0, 0);
        const forward = new THREE.Vector3();

        // Safety: ensure forward vector exists
        this.camera.getWorldDirection(forward);
        forward.y = 0;

        if (forward.lengthSq() < 0.001) {
            forward.set(0, 0, -1); // Default forward if looking straight down
        } else {
            forward.normalize();
        }

        const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

        if (this.keys.w) move.add(forward);
        if (this.keys.s) move.sub(forward);
        if (this.keys.a) move.sub(right);
        if (this.keys.d) move.add(right);

        if (move.lengthSq() > 0.001) {
            move.normalize().multiplyScalar(speed);
            this.player.position.add(move);
            const targetRot = Math.atan2(move.x, move.z);
            let diff = targetRot - this.player.rotation.y;
            while (diff < -Math.PI) diff += Math.PI * 2;
            while (diff > Math.PI) diff -= Math.PI * 2;
            this.player.rotation.y += diff * 0.15;
            this.player.position.y = Math.sin(Date.now() * 0.01) * 0.05;
        } else {
            this.player.position.y = 0;
        }

        this.controls.target.lerp(this.player.position, 0.1);
    }

    updateVehicle() {
        if (!this.vehicle.isDriving || !this.tractor) return;

        if (this.keys.w) this.vehicle.speed += this.vehicle.acceleration;
        if (this.keys.s) this.vehicle.speed -= this.vehicle.acceleration;
        this.vehicle.speed *= this.vehicle.friction;
        this.tractor.translateZ(this.vehicle.speed);

        if (Math.abs(this.vehicle.speed) > 0.005) {
            if (this.keys.a) this.tractor.rotation.y += this.vehicle.turnSpeed;
            if (this.keys.d) this.tractor.rotation.y -= this.vehicle.turnSpeed;
        }

        const offset = new THREE.Vector3(0, 5, -10).applyMatrix4(this.tractor.matrixWorld);
        this.camera.position.lerp(offset, 0.1);
        this.camera.lookAt(this.tractor.position);
    }

    updateDayNightCycle(dt) {
        this.gameTime = (Date.now() % this.dayDuration) / this.dayDuration;
        const angle = this.gameTime * Math.PI * 2;
        this.sunLight.position.set(Math.cos(angle) * 100, Math.sin(angle) * 100, 50);
        const intensity = Math.max(0, Math.sin(angle) * 2);
        this.sunLight.intensity = intensity;
        this.ambientLight.intensity = 0.2 + (intensity * 0.2);
    }

    createPlotAt(x, z) {
        for (let p of this.plots) {
            if (Math.sqrt((p.position.x - x) ** 2 + (p.position.z - z) ** 2) < 2.5) return null;
        }
        const geo = new THREE.BoxGeometry(2.5, 0.1, 2.5);
        const mat = new THREE.MeshStandardMaterial({ map: assets.createDirtTexture(), color: 0x4a3728 });
        const plot = new THREE.Mesh(geo, mat);
        plot.position.set(x, 0.05, z);
        plot.receiveShadow = true;
        plot.userData = { type: 'plot', state: 'plowed', isWatered: false };
        this.scene.add(plot);
        this.plots.push(plot);
        return plot;
    }

    toggleDriving(isDriving) {
        this.vehicle.isDriving = isDriving;
        this.player.visible = !isDriving;
        this.controls.enabled = !isDriving;
        if (!isDriving) {
            this.player.position.copy(this.tractor.position).add(new THREE.Vector3(3, 0, 0));
            this.camera.position.copy(this.player.position).add(new THREE.Vector3(0, 10, 10));
            this.controls.target.copy(this.player.position);
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        const dt = Date.now() - this.lastTime;
        this.lastTime = Date.now();
        this.updateDayNightCycle(dt);
        if (this.vehicle.isDriving) this.updateVehicle();
        else this.updatePlayer(dt);
        if (this.controls.enabled) this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

export const engine = new FarmEngine();
