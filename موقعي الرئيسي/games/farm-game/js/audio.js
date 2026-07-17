var GAME = GAME || {};
GAME.audio = {
  ctx: null,
  masterGain: null,
  muted: false,
  sfxGain: null,
  masterVol: 0.3,
  sfxVol: 0.8,

  init: function() {
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();
      this.masterGain.connect(this.sfxGain);
      this.sfxGain.connect(this.ctx.destination);
      this.loadSettings();
      this.applyVolume();
    } catch(e) { console.warn('Audio not available:', e); }
  },

  loadSettings: function() {
    try {
      var s = JSON.parse(localStorage.getItem('farmSettings') || '{}');
      this.masterVol = (s.masterVol !== undefined ? s.masterVol : 50) / 100;
      this.sfxVol = (s.sfxVol !== undefined ? s.sfxVol : 80) / 100;
    } catch(e) {}
  },

  applyVolume: function() {
    if (this.masterGain) this.masterGain.gain.value = this.muted ? 0 : this.masterVol;
    if (this.sfxGain) this.sfxGain.gain.value = this.sfxVol;
  },

  _ensureResumed: function() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  },

  play: function(type) {
    if (!this.ctx || !this.masterGain || this.muted) return;
    this._ensureResumed();
    switch(type) {
      case 'chime': this._chime(); break;
      case 'error': this._error(); break;
      case 'coin': this._coin(); break;
      case 'step': this._step(); break;
      case 'water': this._water(); break;
      case 'harvest': this._harvest(); break;
    }
  },

  _chime: function() {
    var osc = this.ctx.createOscillator();
    var gain = this.ctx.createGain();
    osc.frequency.setValueAtTime(523, this.ctx.currentTime);
    osc.frequency.setValueAtTime(659, this.ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.25);
    osc.connect(gain); gain.connect(this.sfxGain);
    osc.start(); osc.stop(this.ctx.currentTime + 0.25);
  },

  _error: function() {
    var osc = this.ctx.createOscillator();
    var gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);
    osc.connect(gain); gain.connect(this.sfxGain);
    osc.start(); osc.stop(this.ctx.currentTime + 0.2);
  },

  _coin: function() {
    var osc = this.ctx.createOscillator();
    var gain = this.ctx.createGain();
    osc.frequency.setValueAtTime(880, this.ctx.currentTime);
    osc.frequency.setValueAtTime(1108, this.ctx.currentTime + 0.05);
    osc.frequency.setValueAtTime(1318, this.ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);
    osc.connect(gain); gain.connect(this.sfxGain);
    osc.start(); osc.stop(this.ctx.currentTime + 0.3);
  },

  _step: function() {
    var osc = this.ctx.createOscillator();
    var gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(80, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.06);
    osc.connect(gain); gain.connect(this.sfxGain);
    osc.start(); osc.stop(this.ctx.currentTime + 0.06);
  },

  _water: function() {
    var bufferSize = this.ctx.sampleRate * 0.15;
    var buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    var data = buffer.getChannelData(0);
    for (var i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / bufferSize * 3);
    }
    var source = this.ctx.createBufferSource();
    source.buffer = buffer;
    var gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
    source.connect(gain); gain.connect(this.sfxGain);
    source.start();
  },

  _harvest: function() {
    var osc = this.ctx.createOscillator();
    var gain = this.ctx.createGain();
    osc.frequency.setValueAtTime(440, this.ctx.currentTime);
    osc.frequency.setValueAtTime(554, this.ctx.currentTime + 0.06);
    osc.frequency.setValueAtTime(659, this.ctx.currentTime + 0.12);
    osc.frequency.setValueAtTime(880, this.ctx.currentTime + 0.18);
    gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.4);
    osc.connect(gain); gain.connect(this.sfxGain);
    osc.start(); osc.stop(this.ctx.currentTime + 0.4);
  },

  toggle: function() {
    this.muted = !this.muted;
    this.applyVolume();
    return !this.muted;
  },

  setMasterVol: function(val) {
    this.masterVol = val / 100;
    this.applyVolume();
  },

  setSfxVol: function(val) {
    this.sfxVol = val / 100;
    this.applyVolume();
  }
};
