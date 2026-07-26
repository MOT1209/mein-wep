/**
 * UNIFIED GAME CONTROLS SYSTEM v3.0
 * Advanced control system for all games
 * Supports: Keyboard, Touch, Gamepad, Mouse
 * 
 * Usage:
 *   const controls = new UnifiedGameControls({
 *       onMove: (dx, dy) => { // Movement },
 *       onAction: (action) => { // Actions: 'attack', 'jump', 'interact', 'inventory', 'build', 'crouch', 'sprint' },
 *       config: { keyboard: true, touch: true, gamepad: true }
 *   });
 *   controls.init();
 */

class UnifiedGameControls {
    constructor(options = {}) {
        this.config = {
            // Actions
            onMove: options.onMove || (() => {}),
            onAction: options.onAction || (() => {}),
            onActionEnd: options.onActionEnd || (() => {}), // Fires on release, for hold-style actions (e.g. mining)
            onCamera: options.onCamera || (() => {}), // For camera/look control
            
            // Control types
            enableKeyboard: options.keyboard !== false,
            enableTouch: options.touch !== false,
            enableGamepad: options.gamepad !== false,
            enableMouse: options.mouse !== false,
            
            // Layout
            requireLandscape: options.requireLandscape !== false,
            showActionButtons: options.showActionButtons !== false,
            showCameraControls: options.showCameraControls || false,
            
            // Custom buttons
            actionButtons: options.actionButtons || [
                { id: 'actionA', label: '⚡', action: 'attack', key: 'KeyF', color: '#2ecc71' },
                { id: 'actionB', label: '🎒', action: 'inventory', key: 'KeyE', color: '#e74c3c' },
                { id: 'actionC', label: '⬆️', action: 'jump', key: 'Space', color: '#3498db' },
                { id: 'actionD', label: '🛠️', action: 'build', key: 'KeyV', color: '#9b59b6' }
            ],
            
            // Sensitivity
            joystickSensitivity: options.joystickSensitivity || 1.0,
            mouseSensitivity: options.mouseSensitivity || 0.002,
            
            // Debug
            debug: options.debug || false
        };
        
        this.state = {
            // Keyboard
            keys: {},
            
            // Touch
            touch: { active: false, joystick: { x: 0, y: 0 }, camera: { x: 0, y: 0 } },
            
            // Gamepad
            gamepad: null,
            
            // Mouse
            mouse: { locked: false, x: 0, y: 0 },
            
            // Movement
            movement: { x: 0, y: 0 },
            
            // Active
            isActive: false
        };
        
        this.elements = {};
        this.animationFrame = null;
    }
    
    init() {
        if (this.state.isActive) return;
        this.state.isActive = true;
        
        this.log('Initializing Unified Game Controls v3.0');
        
        // Setup based on device
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        const isMobile = window.innerWidth < 1024 && isTouchDevice;
        
        if (this.config.enableKeyboard) this.setupKeyboard();
        if (this.config.enableTouch && isTouchDevice) this.setupTouch();
        if (this.config.enableGamepad) this.setupGamepad();
        if (this.config.enableMouse && !isMobile) this.setupMouse();
        
        // Start update loop
        this.startUpdateLoop();
        
        // Setup orientation check
        if (this.config.requireLandscape && isMobile) {
            this.setupOrientationCheck();
        }
        
        this.log('Controls initialized successfully');
    }
    
    // ==================== KEYBOARD ====================
    setupKeyboard() {
        this.log('Setting up keyboard controls');
        
        document.addEventListener('keydown', (e) => {
            if (!this.state.keys[e.code]) {
                this.state.keys[e.code] = true;
                this.handleKeyDown(e.code);
            }
            this.updateMovementFromKeys();
        });
        
        document.addEventListener('keyup', (e) => {
            this.state.keys[e.code] = false;
            this.updateMovementFromKeys();
        });
        
        // Prevent default for game keys
        document.addEventListener('keydown', (e) => {
            if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
                e.preventDefault();
            }
        });
    }
    
    handleKeyDown(code) {
        // Find action button with matching key
        const button = this.config.actionButtons.find(btn => btn.key === code);
        if (button) {
            this.triggerAction(button.action);
        }
        
        // Special keys
        switch (code) {
            case 'ShiftLeft':
            case 'ShiftRight':
                this.triggerAction('sprint');
                break;
            case 'ControlLeft':
            case 'ControlRight':
                this.triggerAction('crouch');
                break;
            case 'Escape':
                this.triggerAction('pause');
                break;
        }
    }
    
    updateMovementFromKeys() {
        const k = this.state.keys;
        let dx = 0, dy = 0;
        
        if (k['KeyW'] || k['ArrowUp']) dy -= 1;
        if (k['KeyS'] || k['ArrowDown']) dy += 1;
        if (k['KeyA'] || k['ArrowLeft']) dx -= 1;
        if (k['KeyD'] || k['ArrowRight']) dx += 1;
        
        // Normalize diagonal movement
        if (dx !== 0 && dy !== 0) {
            const len = Math.sqrt(dx * dx + dy * dy);
            dx /= len;
            dy /= len;
        }
        
        this.state.movement.x = dx;
        this.state.movement.y = dy;
    }
    
    // ==================== TOUCH ====================
    setupTouch() {
        this.log('Setting up touch controls');
        this.createTouchUI();
        this.setupJoystick();
        this.setupActionButtons();
        if (this.config.showCameraControls) this.setupCameraTouch();
    }
    
    createTouchUI() {
        // Remove existing
        const existing = document.getElementById('unified-game-controls');
        if (existing) existing.remove();
        
        // Create container
        const container = document.createElement('div');
        container.id = 'unified-game-controls';
        container.innerHTML = `
            <style>
                #unified-game-controls {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    pointer-events: none;
                    z-index: 9999;
                    user-select: none;
                    -webkit-user-select: none;
                    touch-action: none;
                }
                
                /* Joystick */
                #ugc-joystick {
                    position: absolute;
                    bottom: 40px;
                    left: 40px;
                    width: 160px;
                    height: 160px;
                    pointer-events: all;
                }
                
                #ugc-joystick-base {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    background: rgba(255, 255, 255, 0.1);
                    border: 3px solid rgba(255, 255, 255, 0.3);
                    border-radius: 50%;
                }
                
                #ugc-joystick-stick {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    width: 70px;
                    height: 70px;
                    background: linear-gradient(135deg, #ff7e5f, #feb47b);
                    border-radius: 50%;
                    transform: translate(-50%, -50%);
                    box-shadow: 0 4px 20px rgba(0,0,0,0.5);
                    border: 3px solid #fff;
                    transition: transform 0.05s;
                }
                
                #ugc-joystick-stick.active {
                    background: linear-gradient(135deg, #feb47b, #ff7e5f);
                    transform: translate(-50%, -50%) scale(0.9);
                }
                
                /* Action Buttons */
                #ugc-actions {
                    position: absolute;
                    bottom: 40px;
                    right: 40px;
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                    pointer-events: all;
                }
                
                .ugc-action-row {
                    display: flex;
                    gap: 15px;
                    justify-content: flex-end;
                }
                
                .ugc-btn {
                    width: 80px;
                    height: 80px;
                    border-radius: 50%;
                    border: 3px solid rgba(255,255,255,0.4);
                    font-size: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    background: rgba(0,0,0,0.6);
                    color: white;
                    backdrop-filter: blur(10px);
                    -webkit-backdrop-filter: blur(10px);
                    transition: all 0.1s ease;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.3);
                }
                
                .ugc-btn:active {
                    transform: scale(0.85);
                    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                }
                
                .ugc-btn-label {
                    position: absolute;
                    bottom: -20px;
                    font-size: 11px;
                    color: rgba(255,255,255,0.8);
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
                
                /* Camera Zone */
                #ugc-camera {
                    position: absolute;
                    top: 100px;
                    right: 40px;
                    width: 200px;
                    height: 200px;
                    background: rgba(255,255,255,0.05);
                    border: 2px solid rgba(255,255,255,0.2);
                    border-radius: 20px;
                    pointer-events: all;
                    display: ${this.config.showCameraControls ? 'block' : 'none'};
                }
                
                #ugc-camera::after {
                    content: '👁️';
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    font-size: 40px;
                    opacity: 0.5;
                }
                
                /* Orientation Prompt */
                #ugc-orientation {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: linear-gradient(135deg, #1a1a2e, #16213e);
                    display: none;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                    color: white;
                    text-align: center;
                    padding: 20px;
                }
                
                #ugc-orientation-icon {
                    font-size: 80px;
                    animation: rotatePhone 2s infinite ease-in-out;
                    margin-bottom: 30px;
                }
                
                @keyframes rotatePhone {
                    0%, 100% { transform: rotate(0deg); }
                    50% { transform: rotate(90deg); }
                }
                
                #ugc-orientation h2 {
                    font-size: 28px;
                    margin-bottom: 15px;
                    background: linear-gradient(135deg, #fff, #a0a0a0);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                
                /* Keyboard Hints */
                .ugc-keyboard-hint {
                    position: absolute;
                    bottom: 10px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: rgba(0,0,0,0.7);
                    color: white;
                    padding: 10px 20px;
                    border-radius: 20px;
                    font-size: 12px;
                    display: flex;
                    gap: 20px;
                    opacity: 0.7;
                }
                
                .ugc-key {
                    background: rgba(255,255,255,0.2);
                    padding: 2px 8px;
                    border-radius: 4px;
                    font-family: monospace;
                }
                
                @media (min-width: 1024px) {
                    #ugc-joystick, #ugc-actions {
                        display: none !important;
                    }
                    
                    .ugc-keyboard-hint {
                        display: flex !important;
                    }
                }
                
                @media (max-width: 1023px) {
                    .ugc-keyboard-hint {
                        display: none !important;
                    }
                    
                    #ugc-joystick {
                        left: 20px;
                        bottom: 20px;
                        width: 140px;
                        height: 140px;
                    }
                    
                    #ugc-joystick-stick {
                        width: 60px;
                        height: 60px;
                    }
                    
                    #ugc-actions {
                        right: 20px;
                        bottom: 20px;
                        gap: 10px;
                    }
                    
                    .ugc-btn {
                        width: 65px;
                        height: 65px;
                        font-size: 28px;
                    }
                }
            </style>
            
            <!-- Joystick -->
            <div id="ugc-joystick">
                <div id="ugc-joystick-base"></div>
                <div id="ugc-joystick-stick"></div>
            </div>
            
            <!-- Action Buttons -->
            <div id="ugc-actions">
                ${this.config.actionButtons.map((btn, i) => `
                    <div class="ugc-action-row" style="justify-content: ${i % 2 === 0 ? 'flex-end' : 'center'}">
                        <button class="ugc-btn" id="ugc-btn-${btn.id}" style="background: ${btn.color}80">
                            ${btn.label}
                        </button>
                    </div>
                `).join('')}
            </div>
            
            <!-- Camera Zone -->
            <div id="ugc-camera"></div>
            
            <!-- Orientation Prompt -->
            <div id="ugc-orientation">
                <div id="ugc-orientation-icon">📱</div>
                <h2>يرجى تدوير الجهاز</h2>
                <p>Please rotate your device for the best gaming experience</p>
            </div>
            
            <!-- Keyboard Hints (Desktop only) -->
            <div class="ugc-keyboard-hint">
                <span><span class="ugc-key">WASD</span> Move</span>
                <span><span class="ugc-key">SPACE</span> Jump</span>
                <span><span class="ugc-key">F</span> Action</span>
                <span><span class="ugc-key">E</span> Inventory</span>
                <span><span class="ugc-key">SHIFT</span> Sprint</span>
            </div>
        `;
        
        document.body.appendChild(container);
        this.elements.container = container;
        this.elements.joystick = {
            zone: document.getElementById('ugc-joystick'),
            base: document.getElementById('ugc-joystick-base'),
            stick: document.getElementById('ugc-joystick-stick')
        };
        this.elements.orientation = document.getElementById('ugc-orientation');
    }
    
    setupJoystick() {
        const { zone, stick } = this.elements.joystick;
        let active = false;
        let center = { x: 0, y: 0 };
        const maxDist = 45;
        
        zone.addEventListener('touchstart', (e) => {
            e.preventDefault();
            active = true;
            const rect = zone.getBoundingClientRect();
            center = {
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2
            };
            stick.classList.add('active');
        }, { passive: false });
        
        zone.addEventListener('touchmove', (e) => {
            if (!active) return;
            e.preventDefault();
            
            const touch = e.touches[0];
            let dx = touch.clientX - center.x;
            let dy = touch.clientY - center.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist > maxDist) {
                const angle = Math.atan2(dy, dx);
                dx = Math.cos(angle) * maxDist;
                dy = Math.sin(angle) * maxDist;
            }
            
            stick.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
            
            // Normalize output (-1 to 1)
            this.state.movement.x = dx / maxDist;
            this.state.movement.y = dy / maxDist;
        }, { passive: false });
        
        const endJoystick = () => {
            active = false;
            stick.classList.remove('active');
            stick.style.transform = 'translate(-50%, -50%)';
            this.state.movement.x = 0;
            this.state.movement.y = 0;
        };
        
        zone.addEventListener('touchend', endJoystick);
        zone.addEventListener('touchcancel', endJoystick);
    }
    
    setupCameraTouch() {
        const camera = document.getElementById('ugc-camera');
        let lastTouch = null;
        
        camera.addEventListener('touchstart', (e) => {
            lastTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }, { passive: true });
        
        camera.addEventListener('touchmove', (e) => {
            if (!lastTouch) return;
            
            const touch = e.touches[0];
            const dx = (touch.clientX - lastTouch.x) * this.config.mouseSensitivity * 5;
            const dy = (touch.clientY - lastTouch.y) * this.config.mouseSensitivity * 5;
            
            this.config.onCamera(dx, dy);
            
            lastTouch = { x: touch.clientX, y: touch.clientY };
        }, { passive: true });
        
        camera.addEventListener('touchend', () => {
            lastTouch = null;
        });
    }
    
    setupActionButtons() {
        this.config.actionButtons.forEach(btn => {
            const element = document.getElementById(`ugc-btn-${btn.id}`);
            if (element) {
                // Touch
                element.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    this.triggerAction(btn.action);
                    element.style.transform = 'scale(0.85)';
                }, { passive: false });

                const release = () => {
                    element.style.transform = 'scale(1)';
                    this.config.onActionEnd(btn.action);
                };
                element.addEventListener('touchend', release);
                element.addEventListener('touchcancel', release);

                // Mouse (for testing on desktop)
                element.addEventListener('mousedown', () => {
                    this.triggerAction(btn.action);
                });
                element.addEventListener('mouseup', release);
                element.addEventListener('mouseleave', release);
            }
        });
    }
    
    // ==================== GAMEPAD ====================
    setupGamepad() {
        this.log('Setting up gamepad controls');
        
        window.addEventListener('gamepadconnected', (e) => {
            this.log('Gamepad connected:', e.gamepad.id);
            this.state.gamepad = e.gamepad;
        });
        
        window.addEventListener('gamepaddisconnected', (e) => {
            this.log('Gamepad disconnected');
            this.state.gamepad = null;
        });
    }
    
    updateGamepad() {
        if (!this.state.gamepad) {
            // Try to get gamepad
            const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
            for (let gp of gamepads) {
                if (gp) {
                    this.state.gamepad = gp;
                    break;
                }
            }
            return;
        }
        
        const gp = navigator.getGamepads()[this.state.gamepad.index];
        if (!gp) return;
        
        // Left stick (movement)
        const lx = gp.axes[0];
        const ly = gp.axes[1];
        const deadzone = 0.15;
        
        if (Math.abs(lx) > deadzone || Math.abs(ly) > deadzone) {
            this.state.movement.x = lx;
            this.state.movement.y = ly;
        } else {
            // Check D-pad as fallback
            this.state.movement.x = (gp.buttons[15]?.pressed ? 1 : 0) - (gp.buttons[14]?.pressed ? 1 : 0);
            this.state.movement.y = (gp.buttons[13]?.pressed ? 1 : 0) - (gp.buttons[12]?.pressed ? 1 : 0);
        }
        
        // Right stick (camera)
        if (this.config.showCameraControls) {
            const rx = gp.axes[2];
            const ry = gp.axes[3];
            if (Math.abs(rx) > deadzone || Math.abs(ry) > deadzone) {
                this.config.onCamera(rx * 10, ry * 10);
            }
        }
        
        // Buttons
        const buttons = gp.buttons;
        if (buttons[0]?.pressed) this.triggerAction('jump');      // A
        if (buttons[1]?.pressed) this.triggerAction('inventory'); // B
        if (buttons[2]?.pressed) this.triggerAction('attack');    // X
        if (buttons[3]?.pressed) this.triggerAction('build');     // Y
        if (buttons[4]?.pressed) this.triggerAction('sprint');    // LB
        if (buttons[5]?.pressed) this.triggerAction('crouch');    // RB
    }
    
    // ==================== MOUSE ====================
    setupMouse() {
        this.log('Setting up mouse controls');
        
        document.addEventListener('mousemove', (e) => {
            if (this.state.mouse.locked) {
                this.config.onCamera(e.movementX * this.config.mouseSensitivity, 
                                    e.movementY * this.config.mouseSensitivity);
            }
        });
        
        // Click to lock pointer
        document.addEventListener('click', () => {
            if (!this.state.mouse.locked && this.config.showCameraControls) {
                document.body.requestPointerLock();
            }
        });
        
        document.addEventListener('pointerlockchange', () => {
            this.state.mouse.locked = document.pointerLockElement === document.body;
        });
        
        // Mouse buttons
        document.addEventListener('mousedown', (e) => {
            if (e.button === 0) this.triggerAction('attack');  // Left click
            if (e.button === 2) this.triggerAction('build');   // Right click
        });
        
        document.addEventListener('contextmenu', (e) => e.preventDefault());
    }
    
    // ==================== ORIENTATION ====================
    setupOrientationCheck() {
        const check = () => {
            const isPortrait = window.innerHeight > window.innerWidth;
            const isMobile = window.innerWidth < 1024;
            
            if (this.elements.orientation) {
                this.elements.orientation.style.display = (isMobile && isPortrait) ? 'flex' : 'none';
            }
        };
        
        window.addEventListener('resize', check);
        window.addEventListener('orientationchange', check);
        setTimeout(check, 100);
    }
    
    // ==================== UPDATE LOOP ====================
    startUpdateLoop() {
        const loop = () => {
            // Send movement to callback
            if (this.state.movement.x !== 0 || this.state.movement.y !== 0) {
                this.config.onMove(this.state.movement.x, this.state.movement.y);
            }
            
            // Update gamepad
            if (this.config.enableGamepad) {
                this.updateGamepad();
            }
            
            this.animationFrame = requestAnimationFrame(loop);
        };
        
        loop();
    }
    
    // ==================== UTILITIES ====================
    triggerAction(action) {
        this.log('Action triggered:', action);
        this.config.onAction(action);
    }
    
    log(...args) {
        if (this.config.debug) {
            console.log('[UnifiedGameControls]', ...args);
        }
    }
    
    destroy() {
        this.state.isActive = false;
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        if (this.elements.container) {
            this.elements.container.remove();
        }
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UnifiedGameControls;
}
