/**
 * DatabaseService - خدمة قاعدة البيانات للمزرعة
 * تتعامل مع Supabase لحفظ وتحميل بيانات اللعبة
 */

var GAME = GAME || {};

GAME.DatabaseService = {
  client: null,
  user: null,
  isConnected: false,
  
  /**
   * تهيئة خدمة قاعدة البيانات
   */
  init: function() {
    try {
      if (typeof supabase === 'undefined') {
        console.warn('[DatabaseService] Supabase library not loaded');
        return false;
      }
      
      var config = GAME.config || window.GAME_CONFIG;
      if (!config || !config.supabaseUrl || config.supabaseUrl.includes('YOUR_')) {
        console.warn('[DatabaseService] Supabase not configured. Using localStorage fallback.');
        this.useLocalStorage = true;
        return true;
      }
      
      this.client = supabase.createClient(config.supabaseUrl, config.supabaseAnonKey);
      this.isConnected = true;
      console.log('[DatabaseService] ✅ Connected to Supabase');
      
      // مراقبة حالة المصادقة
      this._watchAuth();
      
      return true;
    } catch (e) {
      console.error('[DatabaseService] ❌ Init error:', e.message);
      this.useLocalStorage = true;
      return true; // نستمر مع localStorage
    }
  },
  
  /**
   * مراقبة حالة المصادقة
   */
  _watchAuth: function() {
    var self = this;
    if (!this.client) return;
    
    this.client.auth.onAuthStateChange(function(event, session) {
      if (session && session.user) {
        self.user = session.user;
        console.log('[DatabaseService] 👤 User logged in:', session.user.email);
      } else {
        self.user = null;
        console.log('[DatabaseService] 👋 User logged out');
      }
    });
  },
  
  /**
   * تسجيل الدخول بالبريد وكلمة المرور
   */
  signIn: async function(email, password) {
    if (this.useLocalStorage) {
      return { user: { id: 'local_user', email: email }, error: null };
    }
    
    if (!this.client) {
      return { user: null, error: 'Database not connected' };
    }
    
    try {
      var result = await this.client.auth.signInWithPassword({
        email: email,
        password: password
      });
      
      if (result.error) {
        return { user: null, error: result.error.message };
      }
      
      this.user = result.data.user;
      return { user: this.user, error: null };
    } catch (e) {
      return { user: null, error: e.message };
    }
  },
  
  /**
   * إنشاء حساب جديد
   */
  signUp: async function(email, password, username) {
    if (this.useLocalStorage) {
      return { user: { id: 'local_user', email: email }, error: null };
    }
    
    if (!this.client) {
      return { user: null, error: 'Database not connected' };
    }
    
    try {
      var result = await this.client.auth.signUp({
        email: email,
        password: password,
        options: {
          data: { username: username }
        }
      });
      
      if (result.error) {
        return { user: null, error: result.error.message };
      }
      
      this.user = result.data.user;
      return { user: this.user, error: null };
    } catch (e) {
      return { user: null, error: e.message };
    }
  },
  
  /**
   * تسجيل الخروج
   */
  signOut: async function() {
    if (this.useLocalStorage) {
      this.user = null;
      return { error: null };
    }
    
    if (!this.client) {
      return { error: 'Database not connected' };
    }
    
    try {
      await this.client.auth.signOut();
      this.user = null;
      return { error: null };
    } catch (e) {
      return { error: e.message };
    }
  },
  
  /**
   * حفظ بيانات اللعبة
   */
  saveGame: async function(slotId, gameState) {
    var saveData = {
      slot_id: slotId,
      game_state: gameState,
      saved_at: new Date().toISOString(),
      version: '3.0.0'
    };
    
    // حفظ محلي دائماً كنسخة احتياطية
    this._saveToLocal(slotId, saveData);
    
    if (this.useLocalStorage || !this.isConnected || !this.user) {
      return { success: true, error: null, storage: 'local' };
    }
    
    try {
      var result = await this.client
        .from('game_saves')
        .upsert({
          user_id: this.user.id,
          slot_id: slotId,
          game_state: saveData,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id,slot_id' });
      
      if (result.error) {
        console.error('[DatabaseService] Save error:', result.error);
        return { success: false, error: result.error.message, storage: 'local' };
      }
      
      console.log('[DatabaseService] 💾 Game saved to cloud:', slotId);
      return { success: true, error: null, storage: 'cloud' };
    } catch (e) {
      console.error('[DatabaseService] Save error:', e.message);
      return { success: false, error: e.message, storage: 'local' };
    }
  },
  
  /**
   * تحميل بيانات اللعبة
   */
  loadGame: async function(slotId) {
    // محاولة التحميل من السحابة أولاً
    if (!this.useLocalStorage && this.isConnected && this.user) {
      try {
        var result = await this.client
          .from('game_saves')
          .select('game_state')
          .eq('user_id', this.user.id)
          .eq('slot_id', slotId)
          .single();
        
        if (result.data && result.data.game_state) {
          console.log('[DatabaseService] ☁️ Game loaded from cloud:', slotId);
          return { data: result.data.game_state, error: null, storage: 'cloud' };
        }
      } catch (e) {
        console.warn('[DatabaseService] Cloud load failed, trying local:', e.message);
      }
    }
    
    // التحميل من التخزين المحلي
    var localData = this._loadFromLocal(slotId);
    if (localData) {
      console.log('[DatabaseService] 💾 Game loaded from local:', slotId);
      return { data: localData, error: null, storage: 'local' };
    }
    
    return { data: null, error: 'No save found', storage: null };
  },
  
  /**
   * قائمة حفظات اللعبة
   */
  listSaves: async function() {
    var saves = [];
    
    // الحفظات المحلية
    var localSaves = this._listLocalSaves();
    saves = saves.concat(localSaves);
    
    // الحفظات السحابية
    if (!this.useLocalStorage && this.isConnected && this.user) {
      try {
        var result = await this.client
          .from('game_saves')
          .select('slot_id, game_state, updated_at')
          .eq('user_id', this.user.id)
          .order('updated_at', { ascending: false });
        
        if (result.data) {
          for (var i = 0; i < result.data.length; i++) {
            var cloudSave = result.data[i];
            // تجنب التكرار إذا existed محلياً
            var exists = saves.some(function(s) { return s.slotId === cloudSave.slot_id; });
            if (!exists) {
              saves.push({
                slotId: cloudSave.slot_id,
                data: cloudSave.game_state,
                updatedAt: cloudSave.updated_at,
                storage: 'cloud'
              });
            }
          }
        }
      } catch (e) {
        console.warn('[DatabaseService] List saves error:', e.message);
      }
    }
    
    return saves;
  },
  
  /**
   * حذف حفظة
   */
  deleteSave: async function(slotId) {
    // حذف محلي
    this._deleteLocal(slotId);
    
    // حذف سحابي
    if (!this.useLocalStorage && this.isConnected && this.user) {
      try {
        await this.client
          .from('game_saves')
          .delete()
          .eq('user_id', this.user.id)
          .eq('slot_id', slotId);
      } catch (e) {
        console.warn('[DatabaseService] Delete error:', e.message);
      }
    }
    
    return { success: true };
  },
  
  /**
   * حفظ إحصائيات اللاعب
   */
  saveStats: async function(stats) {
    if (this.useLocalStorage || !this.isConnected || !this.user) {
      this._saveStatsToLocal(stats);
      return { success: true };
    }
    
    try {
      await this.client
        .from('player_stats')
        .upsert({
          user_id: this.user.id,
          stats: stats,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
      
      return { success: true };
    } catch (e) {
      this._saveStatsToLocal(stats);
      return { success: false, error: e.message };
    }
  },
  
  /**
   * تحميل إحصائيات اللاعب
   */
  loadStats: async function() {
    if (this.useLocalStorage || !this.isConnected || !this.user) {
      return this._loadStatsFromLocal();
    }
    
    try {
      var result = await this.client
        .from('player_stats')
        .select('stats')
        .eq('user_id', this.user.id)
        .single();
      
      return result.data ? result.data.stats : null;
    } catch (e) {
      return this._loadStatsFromLocal();
    }
  },
  
  /**
   * حفظ الإنجازات
   */
  saveAchievements: async function(achievements) {
    if (this.useLocalStorage || !this.isConnected || !this.user) {
      localStorage.setItem('farm_achievements', JSON.stringify(achievements));
      return { success: true };
    }
    
    try {
      await this.client
        .from('player_achievements')
        .upsert({
          user_id: this.user.id,
          achievements: achievements,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
      
      return { success: true };
    } catch (e) {
      localStorage.setItem('farm_achievements', JSON.stringify(achievements));
      return { success: false, error: e.message };
    }
  },
  
  /**
   * تحميل الإنجازات
   */
  loadAchievements: async function() {
    if (this.useLocalStorage || !this.isConnected || !this.user) {
      var local = localStorage.getItem('farm_achievements');
      return local ? JSON.parse(local) : [];
    }
    
    try {
      var result = await this.client
        .from('player_achievements')
        .select('achievements')
        .eq('user_id', this.user.id)
        .single();
      
      return result.data ? result.data.achievements : [];
    } catch (e) {
      var local = localStorage.getItem('farm_achievements');
      return local ? JSON.parse(local) : [];
    }
  },
  
  // ===== الدوال المحلية (localStorage) =====
  
  _saveToLocal: function(slotId, data) {
    try {
      var saves = JSON.parse(localStorage.getItem('farm_saves') || '{}');
      saves['slot_' + slotId] = data;
      localStorage.setItem('farm_saves', JSON.stringify(saves));
    } catch (e) {
      console.error('[DatabaseService] Local save error:', e);
    }
  },
  
  _loadFromLocal: function(slotId) {
    try {
      var saves = JSON.parse(localStorage.getItem('farm_saves') || '{}');
      return saves['slot_' + slotId] || null;
    } catch (e) {
      return null;
    }
  },
  
  _listLocalSaves: function() {
    try {
      var saves = JSON.parse(localStorage.getItem('farm_saves') || '{}');
      var list = [];
      for (var key in saves) {
        if (saves.hasOwnProperty(key)) {
          var slotId = key.replace('slot_', '');
          list.push({
            slotId: slotId,
            data: saves[key],
            updatedAt: saves[key].saved_at,
            storage: 'local'
          });
        }
      }
      return list;
    } catch (e) {
      return [];
    }
  },
  
  _deleteLocal: function(slotId) {
    try {
      var saves = JSON.parse(localStorage.getItem('farm_saves') || '{}');
      delete saves['slot_' + slotId];
      localStorage.setItem('farm_saves', JSON.stringify(saves));
    } catch (e) {
      console.error('[DatabaseService] Local delete error:', e);
    }
  },
  
  _saveStatsToLocal: function(stats) {
    try {
      localStorage.setItem('farm_stats', JSON.stringify(stats));
    } catch (e) {
      console.error('[DatabaseService] Local stats save error:', e);
    }
  },
  
  _loadStatsFromLocal: function() {
    try {
      var stats = localStorage.getItem('farm_stats');
      return stats ? JSON.parse(stats) : null;
    } catch (e) {
      return null;
    }
  }
};

console.log('[DatabaseService] 📦 Loaded');
