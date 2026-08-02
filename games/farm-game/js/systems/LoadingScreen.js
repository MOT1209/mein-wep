/**
 * LoadingScreen.js — شاشة تحميل أنيقة مع شريط تقدم
 * Creates an overlay loading screen with animated progress bar and messages.
 * 
 * Usage:
 *   GAME.LoadingScreen.init();
 *   GAME.LoadingScreen.update(30, 'Loading assets...');
 *   GAME.LoadingScreen.update(100, 'Ready!');
 *   GAME.LoadingScreen.hide();
 */

const GAME = window.GAME || {};

GAME.LoadingScreen = {
  screen: null,
  title: null,
  bar: null,
  fill: null,
  text: null,
  particles: null,
  tips: [
    'Plant wheat in spring for best yields!',
    'Water your crops daily for faster growth.',
    'Visit the shop to buy seeds and tools.',
    'Upgrade your tools to work faster.',
    'Fish in the river for rare catches.',
    'Build relationships with NPCs for quests.',
    'Use fertilizer to boost crop quality.',
    'Check the weather forecast each morning.',
    'Harvest before storms damage your crops.',
    'Cook recipes to earn extra coins.'
  ],
  tipIndex: 0,
  tipTimer: null,

  /**
   * Initialize the loading screen
   */
  init: function() {
    this.createScreen();
    this.startTipRotation();
    return this;
  },

  /**
   * Build the loading screen DOM and inject CSS
   */
  createScreen: function() {
    // Inject loading screen styles
    if (!document.getElementById('loading-screen-css')) {
      const style = document.createElement('style');
      style.id = 'loading-screen-css';
      style.textContent = `
        .loading-screen {
          position: fixed;
          inset: 0;
          z-index: 99999;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%);
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          color: #fff;
          transition: opacity 0.6s ease, visibility 0.6s ease;
          overflow: hidden;
        }
        .loading-screen.hidden {
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
        }

        /* Animated background particles */
        .loading-particles {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
        }
        .loading-particle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          animation: float-particle linear infinite;
        }
        @keyframes float-particle {
          0% { transform: translateY(100vh) scale(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-10vh) scale(1); opacity: 0; }
        }

        /* Title */
        .loading-title {
          font-size: 3rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          text-shadow: 0 0 20px rgba(76, 175, 80, 0.5);
          animation: pulse-glow 2s ease-in-out infinite;
        }
        .loading-title .emoji {
          font-size: 3.5rem;
          display: inline-block;
          animation: bounce 1s ease-in-out infinite;
        }
        @keyframes pulse-glow {
          0%, 100% { text-shadow: 0 0 20px rgba(76, 175, 80, 0.3); }
          50% { text-shadow: 0 0 40px rgba(76, 175, 80, 0.7); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        /* Subtitle */
        .loading-subtitle {
          font-size: 1rem;
          color: rgba(255, 255, 255, 0.6);
          margin-bottom: 2rem;
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        /* Progress bar container */
        .loading-bar-container {
          width: min(80vw, 500px);
          position: relative;
          margin-bottom: 1.5rem;
        }
        .loading-bar {
          width: 100%;
          height: 8px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.3), inset 0 1px 3px rgba(0, 0, 0, 0.2);
        }
        .loading-fill {
          height: 100%;
          width: 0%;
          background: linear-gradient(90deg, #4CAF50, #66BB6A, #81C784);
          border-radius: 10px;
          transition: width 0.3s ease;
          position: relative;
          box-shadow: 0 0 12px rgba(76, 175, 80, 0.6);
        }
        .loading-fill::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          animation: shimmer 1.5s ease-in-out infinite;
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        /* Percentage display */
        .loading-percentage {
          font-size: 1.8rem;
          font-weight: 700;
          color: #4CAF50;
          margin-bottom: 1rem;
          font-variant-numeric: tabular-nums;
        }

        /* Status message */
        .loading-text {
          font-size: 0.95rem;
          color: rgba(255, 255, 255, 0.7);
          min-height: 1.5em;
          text-align: center;
          max-width: 80vw;
          overflow: hidden;
        }

        /* Tip */
        .loading-tip {
          position: absolute;
          bottom: 2rem;
          left: 50%;
          transform: translateX(-50%);
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.45);
          text-align: center;
          max-width: 80vw;
          transition: opacity 0.4s ease;
        }
        .loading-tip::before {
          content: '💡 ';
        }

        /* Spinner */
        .loading-spinner {
          width: 40px;
          height: 40px;
          margin-bottom: 1.5rem;
          border: 3px solid rgba(255, 255, 255, 0.1);
          border-top-color: #4CAF50;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Mobile adjustments */
        @media (max-width: 600px) {
          .loading-title { font-size: 2rem; }
          .loading-title .emoji { font-size: 2.5rem; }
          .loading-percentage { font-size: 1.4rem; }
          .loading-bar-container { width: 85vw; }
        }
      `;
      document.head.appendChild(style);
    }

    // Create loading screen element
    this.screen = document.createElement('div');
    this.screen.className = 'loading-screen';
    this.screen.innerHTML = `
      <div class="loading-particles" id="loading-particles"></div>
      <div class="loading-spinner"></div>
      <div class="loading-title"><span class="emoji">🌾</span> Farm Game</div>
      <div class="loading-subtitle">A farming adventure</div>
      <div class="loading-bar-container">
        <div class="loading-bar">
          <div class="loading-fill"></div>
        </div>
      </div>
      <div class="loading-percentage">0%</div>
      <div class="loading-text">Initializing...</div>
      <div class="loading-tip">${this.tips[0]}</div>
    `;

    document.body.appendChild(this.screen);

    // Cache DOM references
    this.title = this.screen.querySelector('.loading-title');
    this.bar = this.screen.querySelector('.loading-bar');
    this.fill = this.screen.querySelector('.loading-fill');
    this.text = this.screen.querySelector('.loading-text');
    this.particles = this.screen.querySelector('#loading-particles');
    this.percentage = this.screen.querySelector('.loading-percentage');
    this.tip = this.screen.querySelector('.loading-tip');

    // Create floating particles
    this.createParticles();
  },

  /**
   * Create floating background particles
   */
  createParticles: function() {
    if (!this.particles) return;
    for (let i = 0; i < 30; i++) {
      const p = document.createElement('div');
      p.className = 'loading-particle';
      p.style.left = Math.random() * 100 + '%';
      p.style.width = (Math.random() * 4 + 2) + 'px';
      p.style.height = p.style.width;
      p.style.animationDuration = (Math.random() * 6 + 4) + 's';
      p.style.animationDelay = (Math.random() * 5) + 's';
      this.particles.appendChild(p);
    }
  },

  /**
   * Rotate through game tips
   */
  startTipRotation: function() {
    const self = this;
    this.tipTimer = setInterval(function() {
      self.tipIndex = (self.tipIndex + 1) % self.tips.length;
      if (self.tip) {
        self.tip.style.opacity = '0';
        setTimeout(function() {
          if (self.tip) {
            self.tip.textContent = self.tips[self.tipIndex];
            self.tip.style.opacity = '1';
          }
        }, 400);
      }
    }, 4000);
  },

  /**
   * Update the progress bar and status message
   * @param {number} progress - 0 to 100
   * @param {string} [message] - Status message to display
   */
  update: function(progress, message) {
    if (this.fill) {
      this.fill.style.width = Math.min(100, Math.max(0, progress)) + '%';
    }
    if (this.percentage) {
      this.percentage.textContent = Math.round(progress) + '%';
    }
    if (this.text && message) {
      this.text.textContent = message;
    }
  },

  /**
   * Hide the loading screen with fade-out
   * @param {number} [delay=0] - Delay before hiding (ms)
   */
  hide: function(delay) {
    const self = this;
    delay = delay || 0;

    // Stop tip rotation
    if (this.tipTimer) {
      clearInterval(this.tipTimer);
      this.tipTimer = null;
    }

    setTimeout(function() {
      if (self.screen) {
        self.screen.classList.add('hidden');
        // Remove from DOM after transition
        setTimeout(function() {
          if (self.screen && self.screen.parentNode) {
            self.screen.parentNode.removeChild(self.screen);
            self.screen = null;
          }
        }, 700);
      }
    }, delay);
  },

  /**
   * Show the loading screen (if hidden)
   */
  show: function() {
    if (this.screen) {
      this.screen.classList.remove('hidden');
      this.screen.style.display = 'flex';
    }
  },

  /**
   * Simulate a loading sequence with auto-progress
   * @param {Array} steps - Array of { progress, message, duration }
   * @param {Function} [onComplete] - Callback when done
   */
  simulate: function(steps, onComplete) {
    const self = this;
    let i = 0;

    function nextStep() {
      if (i >= steps.length) {
        if (onComplete) onComplete();
        return;
      }
      const step = steps[i];
      self.update(step.progress, step.message);
      i++;
      setTimeout(nextStep, step.duration || 300);
    }

    nextStep();
  },

  /**
   * Clean up resources
   */
  destroy: function() {
    if (this.tipTimer) {
      clearInterval(this.tipTimer);
      this.tipTimer = null;
    }
    if (this.screen && this.screen.parentNode) {
      this.screen.parentNode.removeChild(this.screen);
    }
    this.screen = null;
    this.fill = null;
    this.text = null;
    this.percentage = null;
    this.tip = null;
  }
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GAME.LoadingScreen;
}

window.GAME = GAME;
