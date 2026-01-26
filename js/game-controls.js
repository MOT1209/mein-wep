/**
 * GAME CONTROLS SYSTEM v1.0
 * Reusable control system for all games.
 * Supports: Keyboard, Touch Joystick, On-screen Action Buttons.
 * 
 * Usage:
 *   1. Include this script in your game HTML.
 *   2. Call GameControls.init({ onMove, onActionA, onActionB, requireLandscape: true });
 *   3. Done!
 */

const GameControls = (() => {
    let config = {
        onMove: null,       // Callback: (dx, dy) => {} where dx/dy are -1, 0, or 1
        onActionA: null,    // Callback for primary action button (e.g., interact)
        onActionB: null,    // Callback for secondary action button (e.g., menu/inventory)
        requireLandscape: true  // Show rotate prompt on portrait mode
    };

    let keysState = { up: false, down: false, left: false, right: false };

    // Joystick State
    let joystickActive = false;
    let joystickCenter = { x: 0, y: 0 };

    // DOM Elements (created dynamically)
    let overlayEl, joystickZone, joystickStick, btnA, btnB, rotatePrompt;

    // --- INITIALIZATION ---
    function init(options) {
        config = { ...config, ...options };
        createControlsUI();
        setupKeyboardControls();
        setupTouchControls();
        if (config.requireLandscape) {
            setupOrientationCheck();
        }
    }

    // --- CREATE UI ELEMENTS ---
    function createControlsUI() {
        // Main overlay container
        overlayEl = document.createElement('div');
        overlayEl.id = 'game-controls-overlay';
        overlayEl.innerHTML = `
            <style>
                #game-controls-overlay {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    pointer-events: none;
                    z-index: 5000;
                    display: none; /* Hidden on desktop by default */
                }
                #gc-joystick-zone {
                    position: absolute;
                    bottom: 30px; left: 30px;
                    width: 140px; height: 140px;
                    background: rgba(255,255,255,0.1);
                    border: 2px solid rgba(255,255,255,0.3);
                    border-radius: 50%;
                    pointer-events: all;
                }
                #gc-joystick-stick {
                    position: absolute;
                    top: 50%; left: 50%;
                    width: 60px; height: 60px;
                    background: linear-gradient(135deg, #e67e22, #d35400);
                    border-radius: 50%;
                    transform: translate(-50%, -50%);
                    border: 3px solid #fff;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.4);
                }
                #gc-action-buttons {
                    position: absolute;
                    bottom: 30px; right: 30px;
                    display: flex;
                    gap: 15px;
                    pointer-events: all;
                }
                .gc-btn {
                    width: 70px; height: 70px;
                    border-radius: 50%;
                    border: 3px solid rgba(255,255,255,0.5);
                    font-size: 28px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: transform 0.1s, box-shadow 0.1s;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.3);
                }
                .gc-btn:active {
                    transform: scale(0.9);
                }
                #gc-btn-a {
                    background: linear-gradient(135deg, #2ecc71, #27ae60);
                }
                #gc-btn-b {
                    background: linear-gradient(135deg, #3498db, #2980b9);
                }
                /* Rotate Phone Prompt */
                #gc-rotate-prompt {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0,0,0,0.95);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    z-index: 9999;
                    color: white;
                    font-family: 'Segoe UI', sans-serif;
                    text-align: center;
                    pointer-events: all;
                }
                #gc-rotate-prompt .icon {
                    font-size: 80px;
                    margin-bottom: 20px;
                    animation: gc-rotate-anim 1.5s ease-in-out infinite;
                }
                @keyframes gc-rotate-anim {
                    0%, 100% { transform: rotate(0deg); }
                    50% { transform: rotate(90deg); }
                }
                #gc-rotate-prompt h2 {
                    font-size: 24px;
                    margin: 0 0 10px;
                }
                #gc-rotate-prompt p {
                    font-size: 16px;
                    opacity: 0.7;
                }
                /* Show controls on mobile */
                @media (max-width: 1024px) and (pointer: coarse) {
                    #game-controls-overlay {
                        display: block !important;
                    }
                }
            </style>
            <div id="gc-joystick-zone">
                <div id="gc-joystick-stick"></div>
            </div>
            <div id="gc-action-buttons">
                <button class="gc-btn" id="gc-btn-a">⚡</button>
                <button class="gc-btn" id="gc-btn-b">📦</button>
            </div>
        `;
        document.body.appendChild(overlayEl);

        // Get references
        joystickZone = document.getElementById('gc-joystick-zone');
        joystickStick = document.getElementById('gc-joystick-stick');
        btnA = document.getElementById('gc-btn-a');
        btnB = document.getElementById('gc-btn-b');

        // Rotate Prompt (created separately, hidden by default)
        rotatePrompt = document.createElement('div');
        rotatePrompt.id = 'gc-rotate-prompt';
        rotatePrompt.style.display = 'none';
        rotatePrompt.innerHTML = `
            <div class="icon">📱</div>
            <h2>قم بتدوير هاتفك</h2>
            <p>Rotate your phone to landscape for the best experience!</p>
        `;
        document.body.appendChild(rotatePrompt);
    }

    // --- KEYBOARD CONTROLS ---
    function setupKeyboardControls() {
        window.addEventListener('keydown', (e) => {
            if (handleKey(e.code, true)) updateMoveCallback();
        });
        window.addEventListener('keyup', (e) => {
            if (handleKey(e.code, false)) updateMoveCallback();
        });
    }

    function handleKey(code, isDown) {
        let changed = false;
        if (code === 'KeyW' || code === 'ArrowUp') { keysState.up = isDown; changed = true; }
        if (code === 'KeyS' || code === 'ArrowDown') { keysState.down = isDown; changed = true; }
        if (code === 'KeyA' || code === 'ArrowLeft') { keysState.left = isDown; changed = true; }
        if (code === 'KeyD' || code === 'ArrowRight') { keysState.right = isDown; changed = true; }
        // Actions on keydown only
        if (isDown) {
            if (code === 'Space' || code === 'KeyE') { if (config.onActionA) config.onActionA(); }
            if (code === 'KeyQ' || code === 'Tab') { if (config.onActionB) config.onActionB(); e.preventDefault(); }
        }
        return changed;
    }

    function updateMoveCallback() {
        if (config.onMove) {
            const dx = (keysState.right ? 1 : 0) - (keysState.left ? 1 : 0);
            const dy = (keysState.down ? 1 : 0) - (keysState.up ? 1 : 0);
            config.onMove(dx, dy);
        }
    }

    // --- TOUCH / JOYSTICK CONTROLS ---
    function setupTouchControls() {
        joystickZone.addEventListener('touchstart', (e) => {
            e.preventDefault();
            joystickActive = true;
            const rect = joystickZone.getBoundingClientRect();
            joystickCenter = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
        });

        joystickZone.addEventListener('touchmove', (e) => {
            if (!joystickActive) return;
            e.preventDefault();
            const touch = e.touches[0];
            const dx = touch.clientX - joystickCenter.x;
            const dy = touch.clientY - joystickCenter.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const maxDist = 50;
            const clampedDist = Math.min(dist, maxDist);
            const angle = Math.atan2(dy, dx);
            const moveX = Math.cos(angle) * clampedDist;
            const moveY = Math.sin(angle) * clampedDist;

            joystickStick.style.transform = `translate(calc(-50% + ${moveX}px), calc(-50% + ${moveY}px))`;

            // Calculate direction (-1, 0, 1) for each axis
            const threshold = 15;
            const normDx = moveX > threshold ? 1 : (moveX < -threshold ? -1 : 0);
            const normDy = moveY > threshold ? 1 : (moveY < -threshold ? -1 : 0);

            if (config.onMove) config.onMove(normDx, normDy);
        });

        const endJoystick = () => {
            joystickActive = false;
            joystickStick.style.transform = 'translate(-50%, -50%)';
            if (config.onMove) config.onMove(0, 0);
        };
        joystickZone.addEventListener('touchend', endJoystick);
        joystickZone.addEventListener('touchcancel', endJoystick);

        // Action Buttons
        btnA.addEventListener('touchstart', (e) => { e.preventDefault(); if (config.onActionA) config.onActionA(); });
        btnB.addEventListener('touchstart', (e) => { e.preventDefault(); if (config.onActionB) config.onActionB(); });
    }

    // --- ORIENTATION CHECK ---
    function setupOrientationCheck() {
        function checkOrientation() {
            const isPortrait = window.innerHeight > window.innerWidth;
            const isMobile = window.innerWidth < 1024 && ('ontouchstart' in window);
            rotatePrompt.style.display = (isMobile && isPortrait) ? 'flex' : 'none';
        }
        window.addEventListener('resize', checkOrientation);
        window.addEventListener('orientationchange', checkOrientation);
        // Initial check
        setTimeout(checkOrientation, 100);
    }

    // --- PUBLIC API ---
    return { init };
})();
