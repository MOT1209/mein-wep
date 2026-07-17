import * as THREE from 'three';

export class AssetGenerator {
    constructor() {
        this.textureCache = {};
    }

    // --- Texture Generation ---

    createGrassTexture() {
        if (this.textureCache['grass']) return this.textureCache['grass'];
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        // Base
        ctx.fillStyle = '#1a3a16';
        ctx.fillRect(0, 0, 512, 512);

        // Noise
        for (let i = 0; i < 50000; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            const w = 1 + Math.random() * 2;
            const h = 1 + Math.random() * 2;
            ctx.fillStyle = Math.random() > 0.5 ? '#2e7d32' : '#1b5e20';
            ctx.globalAlpha = 0.1 + Math.random() * 0.2;
            ctx.fillRect(x, y, w, h);
        }

        const tex = new THREE.CanvasTexture(canvas);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(4, 4);
        this.textureCache['grass'] = tex;
        return tex;
    }

    createSoilTexture() {
        if (this.textureCache['soil']) return this.textureCache['soil'];
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        // Base
        ctx.fillStyle = '#3e2723';
        ctx.fillRect(0, 0, 512, 512);

        // Clods/Noise
        for (let i = 0; i < 20000; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            const r = 1 + Math.random() * 3;
            ctx.fillStyle = Math.random() > 0.5 ? '#4e342e' : '#2d1b18';
            ctx.globalAlpha = 0.3;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
        }

        const tex = new THREE.CanvasTexture(canvas);
        this.textureCache['soil'] = tex;
        return tex;
    }

    createWoodTexture() {
        if (this.textureCache['wood']) return this.textureCache['wood'];
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        // Base
        ctx.fillStyle = '#5d4037';
        ctx.fillRect(0, 0, 512, 512);

        // Grain
        ctx.strokeStyle = '#3e2723';
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.4;
        for (let i = 0; i < 512; i += 4) {
            ctx.beginPath();
            ctx.moveTo(0, i + Math.random() * 10);
            ctx.bezierCurveTo(
                170, i + Math.random() * 20,
                340, i - Math.random() * 20,
                512, i + Math.random() * 10
            );
            ctx.stroke();
        }

        const tex = new THREE.CanvasTexture(canvas);
        this.textureCache['wood'] = tex;
        return tex;
    }

    // --- Model Generation ---

    createRealisticTree() {
        const group = new THREE.Group();

        // Trunk
        const trunkGeo = new THREE.CylinderGeometry(0.3, 0.5, 3, 6);
        const trunkMat = new THREE.MeshStandardMaterial({
            map: this.createWoodTexture(),
            roughness: 0.9
        });
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.y = 1.5;
        trunk.castShadow = true;
        trunk.receiveShadow = true;
        group.add(trunk);

        // Foliage Layers
        const foliageMat = new THREE.MeshStandardMaterial({
            color: 0x2e7d32,
            roughness: 0.8,
            flatShading: true
        });

        const layer1 = new THREE.Mesh(new THREE.ConeGeometry(2.5, 3, 8), foliageMat);
        layer1.position.y = 3;
        layer1.castShadow = true;
        group.add(layer1);

        const layer2 = new THREE.Mesh(new THREE.ConeGeometry(2, 2.5, 8), foliageMat);
        layer2.position.y = 4.5;
        layer2.castShadow = true;
        group.add(layer2);

        const layer3 = new THREE.Mesh(new THREE.ConeGeometry(1.5, 2, 8), foliageMat);
        layer3.position.y = 5.8;
        layer3.castShadow = true;
        group.add(layer3);

        return group;
    }

    createDetailedBarn() {
        const group = new THREE.Group();
        const woodMat = new THREE.MeshStandardMaterial({
            map: this.createWoodTexture(),
            roughness: 0.8
        });
        const roofMat = new THREE.MeshStandardMaterial({
            color: 0x8b0000,
            roughness: 0.5
        });

        // Main Frame (Columns)
        const postGeo = new THREE.BoxGeometry(0.5, 6, 0.5);
        const positions = [
            [-3, 0, -4], [3, 0, -4],
            [-3, 0, 4], [3, 0, 4]
        ];

        positions.forEach(pos => {
            const post = new THREE.Mesh(postGeo, woodMat);
            post.position.set(pos[0], 3, pos[1]);
            post.castShadow = true;
            group.add(post);
        });

        // Walls (Planks)
        const plankGeo = new THREE.BoxGeometry(6.5, 0.4, 0.2);
        for (let y = 0.5; y < 6; y += 0.5) {
            // Front/Back
            const plankF = new THREE.Mesh(plankGeo, woodMat);
            plankF.position.set(0, y, 4);
            group.add(plankF);

            const plankB = new THREE.Mesh(plankGeo, woodMat);
            plankB.position.set(0, y, -4);
            group.add(plankB);
        }

        const sidePlankGeo = new THREE.BoxGeometry(0.2, 0.4, 8.5);
        for (let y = 0.5; y < 6; y += 0.5) {
            // Sides
            const plankL = new THREE.Mesh(sidePlankGeo, woodMat);
            plankL.position.set(-3, y, 0);
            group.add(plankL);

            const plankR = new THREE.Mesh(sidePlankGeo, woodMat);
            plankR.position.set(3, y, 0);
            group.add(plankR);
        }

        // Roof
        const roofGeo = new THREE.ConeGeometry(5.5, 3, 4);
        const roof = new THREE.Mesh(roofGeo, roofMat);
        roof.position.y = 7.5;
        roof.rotation.y = Math.PI / 4;
        roof.scale.z = 1.3;
        roof.castShadow = true;
        group.add(roof);

        // Door
        const doorGeo = new THREE.BoxGeometry(2, 3.5, 0.3);
        const door = new THREE.Mesh(doorGeo, new THREE.MeshStandardMaterial({ color: 0x3e2723 }));
        door.position.set(0, 1.75, 4.1);
        group.add(door);

        return group;
    }

    createDetailedCrop(type, stage) {
        const group = new THREE.Group();
        // Stage 1: Sprout, 2: Growing, 3: Mature

        const stemColor = 0x4caf50;
        const stemMat = new THREE.MeshStandardMaterial({ color: stemColor, roughness: 0.6 });

        let height = stage * 0.3;
        if (stage === 3) height = 0.8; // Mature height

        // Count depends on crop type
        const count = type === 'wheat' ? 8 : (type === 'carrot' ? 1 : 1);

        for (let i = 0; i < count; i++) {
            const stemGeo = new THREE.CylinderGeometry(0.02, 0.03, height);
            const stem = new THREE.Mesh(stemGeo, stemMat);

            // Randomize position slightly
            const angle = Math.random() * Math.PI * 2;
            const r = Math.random() * 0.2;
            const x = Math.cos(angle) * r;
            const z = Math.sin(angle) * r;

            stem.position.set(x, height / 2, z);

            // Random tilt
            stem.rotation.x = (Math.random() - 0.5) * 0.5;
            stem.rotation.z = (Math.random() - 0.5) * 0.5;

            stem.castShadow = true;
            group.add(stem);

            // Add Fruits/Heads if mature
            if (stage === 3) {
                let fruit;
                if (type === 'wheat') {
                    // Wheat head
                    const headGeo = new THREE.BoxGeometry(0.06, 0.3, 0.06);
                    const headMat = new THREE.MeshStandardMaterial({ color: 0xffd700 });
                    fruit = new THREE.Mesh(headGeo, headMat);
                    fruit.position.y = height / 2 + 0.15;
                } else if (type === 'tomato') {
                    // Tomato fruit
                    const fruitGeo = new THREE.SphereGeometry(0.12);
                    const fruitMat = new THREE.MeshStandardMaterial({ color: 0xf44336 });
                    fruit = new THREE.Mesh(fruitGeo, fruitMat);
                    fruit.position.y = height / 2 - 0.2 + Math.random() * 0.3;
                } else if (type === 'carrot') {
                    // Carrot top (bushy leaves)
                    const topGeo = new THREE.ConeGeometry(0.15, 0.3, 4);
                    fruit = new THREE.Mesh(topGeo, stemMat);
                    fruit.position.y = height / 2;
                }

                if (fruit) {
                    fruit.castShadow = true;
                    stem.add(fruit);
                }
            }
        }

        return group;
    }

    createTractor() {
        const group = new THREE.Group();

        // Materials
        const redMat = new THREE.MeshStandardMaterial({ color: 0xd32f2f, roughness: 0.4, metalness: 0.6 });
        const blackMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.9 });
        const greyMat = new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.5, metalness: 0.8 });
        const windowMat = new THREE.MeshStandardMaterial({ color: 0x87CEEB, roughness: 0.2, metalness: 0.9, transparent: true, opacity: 0.7 });

        // Chassis Main
        const chassisGeo = new THREE.BoxGeometry(1.2, 0.8, 2.5);
        const chassis = new THREE.Mesh(chassisGeo, redMat);
        chassis.position.y = 1;
        chassis.castShadow = true;
        group.add(chassis);

        // Cabin
        const cabinGeo = new THREE.BoxGeometry(1, 1.2, 1.2);
        const cabin = new THREE.Mesh(cabinGeo, windowMat); // Simplified with window mat for now
        cabin.position.set(0, 2, -0.4);
        cabin.castShadow = true;
        group.add(cabin);

        // Roof
        const roofGeo = new THREE.BoxGeometry(1.1, 0.1, 1.3);
        const roof = new THREE.Mesh(roofGeo, redMat);
        roof.position.set(0, 2.65, -0.4);
        group.add(roof);

        // Big Wheels (Back)
        const wheelGeoBig = new THREE.CylinderGeometry(0.8, 0.8, 0.5, 16);
        wheelGeoBig.rotateZ(Math.PI / 2);

        const wheelBL = new THREE.Mesh(wheelGeoBig, blackMat);
        wheelBL.position.set(-0.9, 0.8, -0.8);
        wheelBL.castShadow = true;
        group.add(wheelBL);

        const wheelBR = new THREE.Mesh(wheelGeoBig, blackMat);
        wheelBR.position.set(0.9, 0.8, -0.8);
        wheelBR.castShadow = true;
        group.add(wheelBR);

        // Small Wheels (Front)
        const wheelGeoSmall = new THREE.CylinderGeometry(0.5, 0.5, 0.4, 16);
        wheelGeoSmall.rotateZ(Math.PI / 2);

        const wheelFL = new THREE.Mesh(wheelGeoSmall, blackMat);
        wheelFL.position.set(-0.8, 0.5, 1);
        wheelFL.castShadow = true;
        group.add(wheelFL);

        const wheelFR = new THREE.Mesh(wheelGeoSmall, blackMat);
        wheelFR.position.set(0.8, 0.5, 1);
        wheelFR.castShadow = true;
        group.add(wheelFR);

        // Chimney
        const chimneyGeo = new THREE.CylinderGeometry(0.1, 0.1, 1);
        const chimney = new THREE.Mesh(chimneyGeo, greyMat);
        chimney.position.set(0.4, 1.8, 1);
        group.add(chimney);

        return group;
    }
    createFarmer() {
        const group = new THREE.Group();

        // Colors
        const skinColor = 0xffdbac;
        const shirtColor = 0xe53935; // Red plaid shirt vibe
        const pantsColor = 0x1e88e5; // Blue jeans
        const hatColor = 0xd32f2f;

        const skinMat = new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.5 });
        const shirtMat = new THREE.MeshStandardMaterial({ color: shirtColor, roughness: 0.8 });
        const pantsMat = new THREE.MeshStandardMaterial({ color: pantsColor, roughness: 0.8 });
        const hatMat = new THREE.MeshStandardMaterial({ color: hatColor });

        // Body
        const bodyGeo = new THREE.BoxGeometry(0.5, 0.7, 0.3);
        const body = new THREE.Mesh(bodyGeo, shirtMat);
        body.position.y = 0.75;
        body.castShadow = true;
        group.add(body);

        // Head
        const headGeo = new THREE.BoxGeometry(0.3, 0.3, 0.3);
        const head = new THREE.Mesh(headGeo, skinMat);
        head.position.y = 1.25;
        head.castShadow = true;
        group.add(head);

        // Hat
        const hatGeo = new THREE.BoxGeometry(0.35, 0.1, 0.4);
        const hat = new THREE.Mesh(hatGeo, hatMat);
        hat.position.y = 1.42;
        group.add(hat);

        // Legs
        const legGeo = new THREE.BoxGeometry(0.18, 0.7, 0.18);

        const legL = new THREE.Mesh(legGeo, pantsMat);
        legL.position.set(-0.13, 0.35, 0);
        legL.castShadow = true;
        group.add(legL);

        const legR = new THREE.Mesh(legGeo, pantsMat);
        legR.position.set(0.13, 0.35, 0);
        legR.castShadow = true;
        group.add(legR);

        // Arms
        const armGeo = new THREE.BoxGeometry(0.15, 0.6, 0.15);

        const armL = new THREE.Mesh(armGeo, skinMat);
        armL.position.set(-0.33, 0.8, 0);
        armL.castShadow = true;
        group.add(armL);

        const armR = new THREE.Mesh(armGeo, skinMat);
        armR.position.set(0.33, 0.8, 0);
        armR.castShadow = true;
        group.add(armR);

        return group;
    }
}

export const assets = new AssetGenerator();
