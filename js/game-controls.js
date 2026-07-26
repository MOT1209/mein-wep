/**
 * GAME CONTROLS SYSTEM v2.1
 * Reusable control system for all games.
 * Supports: Keyboard, Touch Joystick, On-screen Action Buttons.
 * 
 * Usage:
 *   1. Include this script in your game HTML.
 *   2. Call GameControls.init({ onMove, onActionA, onActionB, onJump, onSpecial, requireLandscape: true });
 *   3. Done!
 */

const GameControls = (() => {
    let config = {
        onMove: null,
        onActionA: null,    // Primary (Attack/Interact)
        onActionB: null,    // Secondary (Menu/Inventory)
        onJump: null,       // Jump
        onSpecial: null,    // Build Mode / Special
        requireLandscape: true
    };

    let keysState = { up: false, down: false, left: false, right: false };

    // Internal State
    let joystickActive = false;
    let joystickCenter = { x: 0, y: 0 };
    let overlayEl, joystickZone, joystickStick, btnA, btnB, rotatePrompt;

    // --- INITIALIZATION ---
    function init(options) {
        config = { ...config, ...options };
        createControlsUI();
        setupKeyboardControls();
        setupTouchControls();
        if (config.requireLandscape) setupOrientationCheck();
    }

    // --- CREATE UI ELEMENTS ---
    function createControlsUI() {
        if (document.getElementById('game-controls-overlay')) return;

        overlayEl = document.createElement('div');
        overlayEl.id = 'game-controls-overlay';
        overlayEl.innerHTML = `
            <style>
                #game-controls-overlay {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    pointer-events: none;
                    z-index: 9999;
                    display: none;
                    user-select: none;
                }
                #gc-joystick-zone {
                    position: absolute;
                    bottom: 40px; left: 40px;
                    width: 150px; height: 150px;
                    background: rgba(255,255,255,0.05);
                    border: 2px solid rgba(255,255,255,0.2);
                    border-radius: 50%;
                    pointer-events: all;
                    touch-action: none;
                }
                #gc-joystick-stick {
                    position: absolute;
                    top: 50%; left: 50%;
                    width: 65px; height: 65px;
                    background: radial-gradient(circle, #ff7e5f, #feb47b);
                    border-radius: 50%;
                    transform: translate(-50%, -50%);
                    box-shadow: 0 4px 15px rgba(0,0,0,0.5);
                    border: 2px solid #fff;
                }
                #gc-action-buttons {
                    position: absolute;
                    bottom: 40px; right: 40px;
                    display: grid;
                    grid-template-columns: repeat(2, 80px);
                    gap: 15px;
                    pointer-events: all;
                }
                .gc-btn {
                    width: 75px; height: 75px;
                    border-radius: 50%;
                    border: 2px solid rgba(255,255,255,0.4);
                    font-size: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    background: rgba(0,0,0,0.5);
                    color: white;
                    backdrop-filter: blur(5px);
                    transition: transform 0.1s;
                }
                .gc-btn:active { transform: scale(0.85); background: #e67e22; }
                #gc-btn-jump { background: rgba(52, 152, 219, 0.6); grid-column: 2; }
                #gc-btn-a { background: rgba(46, 204, 113, 0.6); grid-column: 2; }
                #gc-btn-b { background: rgba(231, 76, 60, 0.6); grid-column: 1; }
                #gc-btn-special { background: rgba(155, 89, 182, 0.6); grid-column: 1; }

                #gc-rotate-prompt {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: #000;
                    display: none;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                    color: white;
                    text-align: center;
                }
                @media (max-width: 1024px) {
                    #game-controls-overlay { display: block !important; }
                }
            </style>
            <div id="gc-joystick-zone"><div id="gc-joystick-stick"></div></div>
            <div id="gc-action-buttons">
                <button class="gc-btn" id="gc-btn-special">🛠️</button>
                <button class="gc-btn" id="gc-btn-jump">⬆️</button>
                <button class="gc-btn" id="gc-btn-b">🎒</button>
                <button class="gc-btn" id="gc-btn-a">⚡</button>
            </div>
            <div id="gc-rotate-prompt">
                <div style="font-size: 50px; animation: rotate 2s infinite;">📱</div>
                <h2>يرجى تدوير الهاتف</h2>
                <p>Rotate for the best experience</p>
            </div>
        `;
        document.body.appendChild(overlayEl);

        joystickZone = document.getElementById('gc-joystick-zone');
        joystickStick = document.getElementById('gc-joystick-stick');
        btnA = document.getElementById('gc-btn-a');
        btnB = document.getElementById('gc-btn-b');
        rotatePrompt = document.getElementById('gc-rotate-prompt');
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

        if (isDown) {
            if (code === 'Space') { if (config.onJump) config.onJump(); }
            if (code === 'KeyF') { if (config.onActionA) config.onActionA(); }
            if (code === 'KeyE' || code === 'KeyQ' || code === 'Tab') { if (config.onActionB) config.onActionB(); }
            if (code === 'KeyV' || code === 'KeyG') { if (config.onSpecial) config.onSpecial(); }
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
        if (!joystickZone) return;

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

        btnA.addEventListener('touchstart', (e) => { e.preventDefault(); if (config.onActionA) config.onActionA(); });
        btnB.addEventListener('touchstart', (e) => { e.preventDefault(); if (config.onActionB) config.onActionB(); });

        const btnJump = document.getElementById('gc-btn-jump');
        if (btnJump) btnJump.addEventListener('touchstart', (e) => { e.preventDefault(); if (config.onJump) config.onJump(); });

        const btnSpecial = document.getElementById('gc-btn-special');
        if (btnSpecial) btnSpecial.addEventListener('touchstart', (e) => { e.preventDefault(); if (config.onSpecial) config.onSpecial(); });
    }

    // --- ORIENTATION CHECK ---
    function setupOrientationCheck() {
        function checkOrientation() {
            if (!rotatePrompt) return;
            const isPortrait = window.innerHeight > window.innerWidth;
            const isMobile = window.innerWidth < 1024 && (('ontouchstart' in window) || navigator.maxTouchPoints > 0);
            rotatePrompt.style.display = (isMobile && isPortrait) ? 'flex' : 'none';
        }
        window.addEventListener('resize', checkOrientation);
        window.addEventListener('orientationchange', checkOrientation);
        setTimeout(checkOrientation, 100);
    }

    return { init };
})();
