import { engine } from './engine.js';
import { assets } from './assets.js';
import * as THREE from 'three';

const CROPS = {
    wheat: { name: 'قمح', seedPrice: 10, sellPrice: 25, growthTime: 5000, xp: 20, color: 0xffd700, icon: '🌾' },
    carrot: { name: 'جزر', seedPrice: 20, sellPrice: 55, growthTime: 8000, xp: 45, color: 0xff9800, icon: '🥕' },
    tomato: { name: 'طماطم', seedPrice: 40, sellPrice: 110, growthTime: 12000, xp: 90, color: 0xf44336, icon: '🍅' }
};

class FarmGame {
    constructor() {
        this.selectedTool = 'hoe';
        this.selectedSeed = 'wheat';
        this.gold = 100;
        this.xp = 0;
        this.level = 1;
        this.xpToNextLevel = 100;
        // Inventory includes crops and now seeds
        this.inventory = {
            wheat: 0, carrot: 0, tomato: 0,
            seeds: { wheat: 2, carrot: 2, tomato: 2 }
        };

        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        this.init();
    }

    init() {
        try {
            // Error Handler
            window.onerror = (msg, url, line) => {
                const status = document.getElementById('status-msg');
                if (status) {
                    status.innerText = `Error: ${msg}`;
                    status.classList.add('show');
                    status.style.backgroundColor = 'red';
                }
                console.error(msg);
            };

            this.loadGame();

            // Tool buttons
            document.querySelectorAll('.tool-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    this.selectedTool = btn.dataset.tool;

                    // Show/hide seed selector
                    const selector = document.getElementById('seed-selector');
                    if (this.selectedTool === 'seeds') {
                        selector.classList.add('show');
                    } else {
                        selector.classList.remove('show');
                    }

                    this.showStatus(`تم اختيار: ${btn.querySelector('.tool-name').innerText}`);
                });
            });

            // Seed options
            document.querySelectorAll('.seed-option').forEach(opt => {
                opt.addEventListener('click', () => {
                    document.querySelectorAll('.seed-option').forEach(o => o.classList.remove('active'));
                    opt.classList.add('active');
                    this.selectedSeed = opt.dataset.seed;
                    this.showStatus(`بذور مختارة: ${CROPS[this.selectedSeed].name}`);
                });
            });

            // Shop Events - Close
            document.getElementById('close-shop').addEventListener('click', () => this.toggleShop(false));

            // Shop Events - Sell
            document.querySelectorAll('.btn-sell').forEach(btn => {
                btn.addEventListener('click', (e) => this.sellCrop(e.target.dataset.crop));
            });

            // Shop Events - Buy
            document.querySelectorAll('.btn-buy').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const amount = parseInt(e.target.dataset.amount || 1);
                    this.buySeed(e.target.dataset.seed, amount);
                });
            });

            // Shop Events - Tabs
            document.querySelectorAll('.shop-tab').forEach(tab => {
                tab.addEventListener('click', () => {
                    // UI Toggle
                    document.querySelectorAll('.shop-tab').forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');

                    // Section Toggle
                    document.querySelectorAll('.shop-section').forEach(s => s.style.display = 'none');
                    document.getElementById(`shop-${tab.dataset.tab}`).style.display = 'block';
                });
            });

            // Click interaction
            window.addEventListener('click', (e) => {
                if (e.target.closest('.hud') || e.target.closest('.seed-selector') || e.target.closest('.modal-content')) return;
                this.onMouseClick(e);
            });

            // Key interaction (driving)
            window.addEventListener('keydown', (e) => {
                if (e.key.toLowerCase() === 'e') this.toggleTractor();
            });

            // Save on unload
            window.addEventListener('beforeunload', () => this.saveGame());

            this.updateStats();
            this.updateInventoryUI();
            this.showStatus('مرحباً بك! اضغط E لركوب الجرار الأحمر.');
            console.log("Game Initialized Successfully");

        } catch (error) {
            console.error("Game Init Failed:", error);
            alert("حدث خطأ في تشغيل اللعبة: " + error.message);
        }
    }

    toggleTractor() {
        if (engine.vehicle.isDriving) {
            // Exit
            engine.toggleDriving(false);
            this.showStatus('تم الخروج من الجرار.');
        } else {
            // Enter (check distance from PLAYER to TRACTOR)
            if (!engine.player) return; // Safety

            const dist = engine.player.position.distanceTo(engine.tractor.position);
            if (dist < 5) {
                engine.toggleDriving(true);
                this.showStatus('🚜 تم تشغيل الجرار! استخدم WASD للتحرك.');
            } else {
                this.showStatus('يجب أن تقترب أكثر من الجرار!');
            }
        }
    }


    showStatus(msg) {
        const el = document.getElementById('status-msg');
        el.innerText = msg;
        el.classList.add('show');
        clearTimeout(this.statusTimeout);
        this.statusTimeout = setTimeout(() => el.classList.remove('show'), 3000);
    }

    onMouseClick(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, engine.camera);

        const intersects = this.raycaster.intersectObjects(engine.scene.children, true);

        if (intersects.length > 0) {
            let target = null;
            let groundHit = null;

            for (let hit of intersects) {
                // Check if it's the ground
                if (hit.object.userData.type === 'ground') {
                    groundHit = hit;
                }

                // Check up the parent chain for functional objects (Plot/Shop)
                let obj = hit.object;
                while (obj) {
                    if (obj.userData && (obj.userData.type === 'plot' || obj.userData.type === 'shop')) {
                        target = obj;
                        break;
                    }
                    obj = obj.parent;
                }
                if (target) break; // Priority to objects over ground
            }

            if (target) {
                if (target.userData.type === 'plot') {
                    this.handlePlotInteraction(target);
                } else if (target.userData.type === 'shop') {
                    this.toggleShop(true);
                }
            } else if (groundHit && this.selectedTool === 'hoe') {
                // Free Farming: Create Plot on Ground
                this.createNewPlot(groundHit.point);
            }
        }
    }

    createNewPlot(point) {
        const plot = engine.createPlotAt(point.x, point.z);
        if (plot) {
            this.addXP(5);
            this.showStatus('✨ تم استصلاح أرض جديدة!');

            // Create dust effect (simple particle placeholder)
            // ...
        } else {
            this.showStatus('🚫 لا يمكنك الزراعة هنا (قريب جداً من قطعة أخرى)');
        }
    }

    handlePlotInteraction(plot) {
        const state = plot.userData.state;

        switch (this.selectedTool) {
            // Hoe logic moved to Ground interaction
            case 'hoe':
                this.showStatus('هذه الأرض محروثة بالفعل!');
                break;

            case 'seeds':
                if (state === 'plowed') {
                    if (this.inventory.seeds[this.selectedSeed] > 0) {
                        this.plantCrop(plot, this.selectedSeed);
                        this.updateStats();
                    } else {
                        this.showStatus('لا تملك بذور! اشترِ من المتجر.');
                    }
                }
                break;

            case 'water':
                if ((state === 'planted' || state === 'growing') && !plot.userData.isWatered) {
                    plot.material.color.set(0x888888);
                    plot.userData.isWatered = true;
                    this.addXP(2);
                    this.showStatus('تم الري!');
                }
                break;

            case 'harvest':
                if (state === 'ready') {
                    this.harvestCrop(plot);
                }
                break;
        }
    }

    addXP(amount) {
        this.xp += amount;
        if (this.xp >= this.xpToNextLevel) {
            this.levelUp();
        }
        this.updateStats();
    }

    levelUp() {
        this.xp -= this.xpToNextLevel;
        this.level++;
        this.xpToNextLevel = Math.floor(this.xpToNextLevel * 1.5);
        this.gold += 50; // Level up bonus
        this.showStatus(`🎉 مبروك! وصلت للمستوى ${this.level}`);
    }

    updateStats() {
        document.getElementById('gold-value').innerText = this.gold;
        document.getElementById('level-value').innerText = this.level;
        document.getElementById('xp-value').innerText = `${this.xp}/${this.xpToNextLevel}`;

        const percent = (this.xp / this.xpToNextLevel) * 100;
        document.getElementById('xp-fill').style.width = `${percent}%`;
    }

    updateInventoryUI() {
        // Crops
        document.getElementById('inv-wheat').innerText = this.inventory.wheat;
        document.getElementById('inv-carrot').innerText = this.inventory.carrot;
        document.getElementById('inv-tomato').innerText = this.inventory.tomato;

        // Seeds
        document.getElementById('seed-wheat').innerText = this.inventory.seeds.wheat;
        document.getElementById('seed-carrot').innerText = this.inventory.seeds.carrot;
        document.getElementById('seed-tomato').innerText = this.inventory.seeds.tomato;
    }

    plantCrop(plot, seedType) {
        const cropInfo = CROPS[seedType];

        // Deduct Seed
        this.inventory.seeds[seedType]--;
        this.updateInventoryUI();

        plot.userData.state = 'planted';
        plot.userData.seedType = seedType;

        // Initial tiny sprout
        const group = assets.createDetailedCrop(seedType, 1);
        plot.add(group);
        plot.userData.cropModel = group;

        this.showStatus(`تم زرع ${cropInfo.name}!`);

        const growthTime = plot.userData.isWatered ? cropInfo.growthTime / 2 : cropInfo.growthTime;
        setTimeout(() => this.growCrop(plot, 2), growthTime / 2);

        this.saveGame();
    }

    growCrop(plot, stage) {
        if (plot.userData.state !== 'planted' && plot.userData.state !== 'growing') return;

        const seedType = plot.userData.seedType;
        const cropInfo = CROPS[seedType];

        plot.userData.state = 'growing';

        // Remove old model
        if (plot.userData.cropModel) plot.remove(plot.userData.cropModel);

        // Add new model based on stage
        const group = assets.createDetailedCrop(seedType, stage);
        plot.add(group);
        plot.userData.cropModel = group;

        if (stage < 3) {
            const growthTime = plot.userData.isWatered ? cropInfo.growthTime / 2 : cropInfo.growthTime;
            setTimeout(() => this.growCrop(plot, stage + 1), growthTime / 2);
        } else {
            plot.userData.state = 'ready';
            this.showStatus(`محصول ${cropInfo.name} جاهز للحصاد! ✨`);
        }
    }

    harvestCrop(plot) {
        const seedType = plot.userData.seedType;
        const cropInfo = CROPS[seedType];

        // Add to inventory instead of gold
        this.inventory[seedType]++;
        this.addXP(cropInfo.xp);

        plot.remove(plot.userData.cropModel);
        plot.userData.state = 'grass';
        plot.userData.isWatered = false;

        // Reset to Grass Texture
        plot.material.map = assets.createGrassTexture();
        plot.material.color.set(0xaaffaa); // Reset tint

        this.showStatus(`جمعت ${cropInfo.name}! (المخزون: ${this.inventory[seedType]})`);
        this.updateStats();
        this.updateInventoryUI();
        this.saveGame();
    }

    saveGame() {
        const data = {
            gold: this.gold,
            xp: this.xp,
            level: this.level,
            xpToNextLevel: this.xpToNextLevel,
            inventory: this.inventory
        };
        localStorage.setItem('farmSave', JSON.stringify(data));
        console.log('Game Saved');
    }

    loadGame() {
        const saved = localStorage.getItem('farmSave');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.gold = data.gold;
                this.xp = data.xp;
                this.level = data.level;
                this.xpToNextLevel = data.xpToNextLevel;
                // Merge inventory to ensure seeds exist if loading from old save
                this.inventory = { ...this.inventory, ...data.inventory };
                if (!this.inventory.seeds) this.inventory.seeds = { wheat: 2, carrot: 2, tomato: 2 };
            } catch (e) {
                console.error('Save file corrupted');
            }
        }
    }
}

new FarmGame();
