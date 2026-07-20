/**
 * نظام المهام - Quest System
 * يدير المهام اليومية والأسبوعية ومهام القصة
 */

GAME.QuestSystem = {
  activeQuests: [],
  completedQuests: [],
  claimedRewards: [],
  maxActiveQuests: 5,
  lastDailyReset: null,
  lastWeeklyReset: null,
  
  // قوالب المهام اليومية
  dailyQuestTemplates: [
    { 
      id: 'harvest_wheat', 
      type: 'daily', 
      description: 'حصد 10 قطعة قمح',
      descriptionEn: 'Harvest 10 wheat',
      target: {crop: 'wheat', amount: 10}, 
      rewards: {money: 50, xp: 20} 
    },
    { 
      id: 'harvest_corn', 
      type: 'daily', 
      description: 'حصد 8 قطعة ذرة',
      descriptionEn: 'Harvest 8 corn',
      target: {crop: 'corn', amount: 8}, 
      rewards: {money: 45, xp: 18} 
    },
    { 
      id: 'water_plants', 
      type: 'daily', 
      description: 'اسقِ 15 نبتة',
      descriptionEn: 'Water 15 plants',
      target: {action: 'water', amount: 15}, 
      rewards: {money: 30, xp: 15} 
    },
    { 
      id: 'feed_chickens', 
      type: 'daily', 
      description: 'أطعم 5 دجاجات',
      descriptionEn: 'Feed 5 chickens',
      target: {animal: 'chicken', action: 'feed', amount: 5}, 
      rewards: {money: 40, xp: 15} 
    },
    { 
      id: 'sell_items', 
      type: 'daily', 
      description: 'بيع 20 منتج',
      descriptionEn: 'Sell 20 items',
      target: {action: 'sell', amount: 20}, 
      rewards: {money: 60, xp: 25} 
    },
    { 
      id: 'catch_fish', 
      type: 'daily', 
      description: 'اصطد 3 أسماك',
      descriptionEn: 'Catch 3 fish',
      target: {action: 'fish', amount: 3}, 
      rewards: {money: 45, xp: 20} 
    },
    { 
      id: 'cook_dishes', 
      type: 'daily', 
      description: 'اطبخ 2 وجبة',
      descriptionEn: 'Cook 2 dishes',
      target: {action: 'cook', amount: 2}, 
      rewards: {money: 55, xp: 25} 
    },
    { 
      id: 'plow_land', 
      type: 'daily', 
      description: 'حرث 10 مربعات أرض',
      descriptionEn: 'Plow 10 land tiles',
      target: {action: 'plow', amount: 10}, 
      rewards: {money: 35, xp: 15} 
    },
    { 
      id: 'plant_seeds', 
      type: 'daily', 
      description: 'ازرع 8 بذور',
      descriptionEn: 'Plant 8 seeds',
      target: {action: 'plant', amount: 8}, 
      rewards: {money: 40, xp: 18} 
    },
    { 
      id: 'collect_eggs', 
      type: 'daily', 
      description: 'اجمع 5 بيضات',
      descriptionEn: 'Collect 5 eggs',
      target: {action: 'collect_egg', amount: 5}, 
      rewards: {money: 35, xp: 15} 
    },
    { 
      id: 'milk_cows', 
      type: 'daily', 
      description: 'حلب 3 أبقار',
      descriptionEn: 'Milk 3 cows',
      target: {action: 'milk', amount: 3}, 
      rewards: {money: 50, xp: 20} 
    },
    { 
      id: 'harvest_vegetables', 
      type: 'daily', 
      description: 'حصد 6 خضروات',
      descriptionEn: 'Harvest 6 vegetables',
      target: {category: 'vegetable', amount: 6}, 
      rewards: {money: 45, xp: 20} 
    }
  ],
  
  // قوالب المهام الأسبوعية
  weeklyQuestTemplates: [
    { 
      id: 'earn_money', 
      type: 'weekly', 
      description: 'اجمع 500 عملة ذهبية',
      descriptionEn: 'Earn 500 gold',
      target: {action: 'earn', amount: 500}, 
      rewards: {money: 150, xp: 60, item: 'rare_seed'} 
    },
    { 
      id: 'friendship', 
      type: 'weekly', 
      description: 'ارتقِ بصداقة 2 شخصيات',
      descriptionEn: 'Increase friendship with 2 NPCs',
      target: {action: 'friendship', amount: 2}, 
      rewards: {money: 100, xp: 40, item: 'gift_box'} 
    },
    { 
      id: 'harvest_variety', 
      type: 'weekly', 
      description: 'حصد 5 أنواع مختلفة من المحاصيل',
      descriptionEn: 'Harvest 5 different crop types',
      target: {action: 'harvest_variety', amount: 5}, 
      rewards: {money: 120, xp: 50, item: 'golden_hoe'} 
    },
    { 
      id: 'complete_dailies', 
      type: 'weekly', 
      description: 'أكمل 5 مهام يومية',
      descriptionEn: 'Complete 5 daily quests',
      target: {action: 'complete_quest', amount: 5}, 
      rewards: {money: 100, xp: 45, item: 'mystery_box'} 
    },
    { 
      id: 'cook_variety', 
      type: 'weekly', 
      description: 'اطبخ 3 وجبات مختلفة',
      descriptionEn: 'Cook 3 different dishes',
      target: {action: 'cook_variety', amount: 3}, 
      rewards: {money: 80, xp: 35, item: 'recipe_book'} 
    },
    { 
      id: 'explore_world', 
      type: 'weekly', 
      description: 'استكشف 3 مناطق مختلفة',
      descriptionEn: 'Explore 3 different areas',
      target: {action: 'explore', amount: 3}, 
      rewards: {money: 90, xp: 40, item: 'compass'} 
    }
  ],
  
  // مهام القصة الرئيسية
  storyQuests: [
    { 
      id: 'story_1', 
      type: 'story', 
      chapter: 1,
      title: 'بداية جديدة',
      titleEn: 'A New Beginning',
      description: 'تحدث مع جميع سكان القرية',
      descriptionEn: 'Meet all NPCs in the village',
      prerequisites: [], 
      target: {action: 'meet_npc', amount: 5},
      rewards: {money: 100, xp: 50},
      dialogue: 'مرحباً بك في مزرعتك الجديدة! تعرف على جيرانك أولاً.'
    },
    { 
      id: 'story_2', 
      type: 'story', 
      chapter: 1,
      title: 'الدجاجة الأولى',
      titleEn: 'First Chicken',
      description: 'ابنِ أول ديكمة دجاج',
      descriptionEn: 'Build your first coop',
      prerequisites: ['story_1'], 
      target: {action: 'build', building: 'coop', amount: 1},
      rewards: {money: 200, item: 'chicken'},
      dialogue: 'أحسنت! الآن يمكنك تربية الدجاج.'
    },
    { 
      id: 'story_3', 
      type: 'story', 
      chapter: 2,
      title: 'صداقة حقيقية',
      titleEn: 'True Friendship',
      description: 'اجمع مستوى صداقة 5 مع أي شخصية',
      descriptionEn: 'Reach friendship level 5 with any NPC',
      prerequisites: ['story_2'], 
      target: {action: 'friendship_level', amount: 5},
      rewards: {money: 300, item: 'rare_tool'},
      dialogue: 'الصداقة مفتاح النجاح في هذه القرية!'
    },
    { 
      id: 'story_4', 
      type: 'story', 
      chapter: 2,
      title: 'مزارع محترف',
      titleEn: 'Professional Farmer',
      description: 'ازرع واحصد 50 نبتة',
      descriptionEn: 'Plant and harvest 50 plants',
      prerequisites: ['story_3'], 
      target: {action: 'total_harvest', amount: 50},
      rewards: {money: 400, item: 'golden_watering_can'},
      dialogue: 'أنت تتقن الزراعة الآن!'
    },
    { 
      id: 'story_5', 
      type: 'story', 
      chapter: 3,
      title: 'صياد ماهر',
      titleEn: 'Skilled Fisherman',
      description: 'اصطد 20 سمكة',
      descriptionEn: 'Catch 20 fish',
      prerequisites: ['story_4'], 
      target: {action: 'total_fish', amount: 20},
      rewards: {money: 500, item: 'golden_fishing_rod'},
      dialogue: 'أنت صياد حقيقي الآن!'
    },
    { 
      id: 'story_6', 
      type: 'story', 
      chapter: 3,
      title: 'طباخ الشيف',
      titleEn: 'Chef Master',
      description: 'اطبخ 15 وجبة مختلفة',
      descriptionEn: 'Cook 15 different dishes',
      prerequisites: ['story_5'], 
      target: {action: 'cook_variety', amount: 15},
      rewards: {money: 600, item: 'chef_hat'},
      dialogue: 'أنت طباخ ماهر! المزارعة ملكك.'
    },
    { 
      id: 'story_7', 
      type: 'story', 
      chapter: 4,
      title: 'الحارس الشجاع',
      titleEn: 'Brave Guardian',
      description: 'هزيم 10 وحوش',
      descriptionEn: 'Defeat 10 monsters',
      prerequisites: ['story_6'], 
      target: {action: 'defeat_monster', amount: 10},
      rewards: {money: 700, item: 'legendary_sword'},
      dialogue: 'القرية آمنة بفضل شجاعتك!'
    },
    { 
      id: 'story_8', 
      type: 'story', 
      chapter: 4,
      title: 'مالك الأراضي',
      titleEn: 'Land Baron',
      description: 'افتح 3 مناطق جديدة',
      descriptionEn: 'Unlock 3 new areas',
      prerequisites: ['story_7'], 
      target: {action: 'unlock_area', amount: 3},
      rewards: {money: 1000, item: 'golden_crown'},
      dialogue: 'أنت الآن مالك أكبر مزرعة في القرية!'
    }
  ],
  
  // مهام الإنجازات
  achievements: [
    { id: 'first_harvest', title: 'أول حصاد', titleEn: 'First Harvest', description: 'احصد أول محصول', target: 1, current: 0, reward: 50 },
    { id: 'hundred_harvests', title: 'محاصيل كثيرة', titleEn: 'Harvest Master', description: 'احصد 100 محصول', target: 100, current: 0, reward: 500 },
    { id: 'rich_farmer', title: 'مزارع ثري', titleEn: 'Rich Farmer', description: 'اجمع 10000 عملة', target: 10000, current: 0, reward: 1000 },
    { id: 'social_butterfly', title: 'فراشة اجتماعية', titleEn: 'Social Butterfly', description: 'ارتقِ بصداقة 5 شخصيات', target: 5, current: 0, reward: 300 },
    { id: 'master_cook', title: 'طباخ محترف', titleEn: 'Master Chef', description: 'اطبخ 50 وجبة', target: 50, current: 0, reward: 400 },
    { id: 'fish_king', title: 'ملك الأسماك', titleEn: 'Fish King', description: 'اصطد 100 سمكة', target: 100, current: 0, reward: 600 },
    { id: 'monster_slayer', title: 'قاتل الوحوش', titleEn: 'Monster Slayer', description: 'هزيم 50 وحش', target: 50, current: 0, reward: 800 },
    { id: 'builder', title: 'الباني', titleEn: 'The Builder', description: 'ابنِ 20 مبنى', target: 20, current: 0, reward: 500 }
  ],
  
  // ========================
  // دوال التهيئة والتحديث
  // ========================
  
  init: function(game) {
    this.game = game;
    this.activeQuests = [];
    this.completedQuests = [];
    this.claimedRewards = [];
    
    // تحميل البيانات المحفوظة
    this.loadQuestData();
    
    // فحص إعادة تعيين المهام
    this.checkResets();
    
    // توليد مهام يومية إذا لم تكن موجودة
    if (this.activeQuests.length === 0) {
      this.generateDailyQuests();
    }
    
    // فحص مهام القصة المتاحة
    this.checkStoryQuests();
    
    console.log('📋 QuestSystem initialized');
  },
  
  update: function(dt) {
    // فحص إعادة تعيين المهام كل دقيقة
    this.checkResets();
    
    // تحديث الإنجازات
    this.updateAchievements();
  },
  
  // ========================
  // إدارة المهام اليومية
  // ========================
  
  generateDailyQuests: function() {
    this.activeQuests = [];
    
    // خلط القوالب واختيار 3-4 مهام عشوائية
    var shuffled = this.dailyQuestTemplates.slice().sort(function() { 
      return 0.5 - Math.random(); 
    });
    
    var questCount = Math.min(3 + Math.floor(Math.random() * 2), shuffled.length);
    
    for (var i = 0; i < questCount; i++) {
      var template = shuffled[i];
      this.activeQuests.push({
        id: template.id + '_' + Date.now(),
        templateId: template.id,
        type: 'daily',
        description: template.description,
        descriptionEn: template.descriptionEn,
        target: { ...template.target },
        rewards: { ...template.rewards },
        progress: 0,
        completed: false,
        claimed: false
      });
    }
    
    this.lastDailyReset = new Date().toDateString();
    this.saveQuestData();
    
    return this.activeQuests;
  },
  
  // ========================
  // إدارة المهام الأسبوعية
  // ========================
  
  generateWeeklyQuests: function() {
    var shuffled = this.weeklyQuestTemplates.slice().sort(function() { 
      return 0.5 - Math.random(); 
    });
    
    var questCount = Math.min(2, shuffled.length);
    
    for (var i = 0; i < questCount; i++) {
      var template = shuffled[i];
      this.activeQuests.push({
        id: template.id + '_' + Date.now(),
        templateId: template.id,
        type: 'weekly',
        description: template.description,
        descriptionEn: template.descriptionEn,
        target: { ...template.target },
        rewards: { ...template.rewards },
        progress: 0,
        completed: false,
        claimed: false
      });
    }
    
    this.lastWeeklyReset = new Date().toDateString();
    this.saveQuestData();
  },
  
  // ========================
  // إدارة مهام القصة
  // ========================
  
  checkStoryQuests: function() {
    for (var i = 0; i < this.storyQuests.length; i++) {
      var storyQuest = this.storyQuests[i];
      
      // تخطي المهام المكتملة
      if (this.completedQuests.indexOf(storyQuest.id) !== -1) {
        continue;
      }
      
      // فحص المتطلبات
      var prerequisitesMet = true;
      for (var j = 0; j < storyQuest.prerequisites.length; j++) {
        if (this.completedQuests.indexOf(storyQuest.prerequisites[j]) === -1) {
          prerequisitesMet = false;
          break;
        }
      }
      
      // إضافة المهمة إذا تحقق المتطلبات
      if (prerequisitesMet) {
        var exists = false;
        for (var k = 0; k < this.activeQuests.length; k++) {
          if (this.activeQuests[k].id === storyQuest.id) {
            exists = true;
            break;
          }
        }
        
        if (!exists) {
          this.activeQuests.push({
            id: storyQuest.id,
            templateId: storyQuest.id,
            type: 'story',
            chapter: storyQuest.chapter,
            title: storyQuest.title,
            titleEn: storyQuest.titleEn,
            description: storyQuest.description,
            descriptionEn: storyQuest.descriptionEn,
            target: { ...storyQuest.target },
            rewards: { ...storyQuest.rewards },
            dialogue: storyQuest.dialogue,
            progress: 0,
            completed: false,
            claimed: false
          });
          
          // عرض إشعار مهم جديدة
          if (this.game && this.game.showNotification) {
            this.game.showNotification('📜 مهمة جديدة: ' + storyQuest.title);
          }
        }
      }
    }
  },
  
  // ========================
  // تحديث تقدم المهام
  // ========================
  
  updateQuestProgress: function(type, data) {
    data = data || {};
    var amount = data.amount || 1;
    var updated = false;
    
    for (var i = 0; i < this.activeQuests.length; i++) {
      var quest = this.activeQuests[i];
      if (quest.completed) continue;
      
      var match = false;
      
      // فحص حسب نوع المهمة
      switch (quest.target.action || quest.target.crop || quest.target.animal) {
        case type:
          match = true;
          break;
        case 'harvest':
          if (quest.target.crop && data.crop === quest.target.crop) match = true;
          if (quest.target.category && data.category === quest.target.category) match = true;
          break;
        case 'water':
        case 'plow':
        case 'plant':
        case 'sell':
        case 'fish':
        case 'cook':
        case 'build':
        case 'explore':
        case 'earn':
        case 'friendship':
        case 'meet_npc':
        case 'harvest_variety':
        case 'cook_variety':
        case 'collect_egg':
        case 'milk':
        case 'defeat_monster':
        case 'unlock_area':
        case 'total_harvest':
        case 'total_fish':
        case 'friendship_level':
        case 'complete_quest':
          if (type === quest.target.action || type === quest.target.crop || type === quest.target.animal) {
            match = true;
          }
          break;
      }
      
      // فحص خاص بالحيوانات
      if (quest.target.animal && type === quest.target.action && data.animal === quest.target.animal) {
        match = true;
      }
      
      if (match) {
        quest.progress = Math.min(quest.progress + amount, quest.target.amount);
        updated = true;
        
        // فحص إكمال المهمة
        if (quest.progress >= quest.target.amount) {
          this.completeQuest(i);
        }
      }
    }
    
    if (updated) {
      this.saveQuestData();
    }
    
    return updated;
  },
  
  // ========================
  // إكمال المهمة
  // ========================
  
  completeQuest: function(index) {
    var quest = this.activeQuests[index];
    if (!quest || quest.completed) return false;
    
    quest.completed = true;
    this.completedQuests.push(quest.id);
    
    // عرض إشعار الإكمال
    if (this.game && this.game.showNotification) {
      var title = quest.title || quest.description;
      this.game.showNotification('✅ تم إكمال المهمة: ' + title);
    }
    
    this.saveQuestData();
    
    return true;
  },
  
  // ========================
  // المطالبة بالمكافآت
  // ========================
  
  claimReward: function(questId) {
    for (var i = 0; i < this.activeQuests.length; i++) {
      var quest = this.activeQuests[i];
      
      if (quest.id === questId && quest.completed && !quest.claimed) {
        quest.claimed = true;
        this.claimedRewards.push(questId);
        
        // منح المكافآت
        this.giveRewards(quest.rewards);
        
        // عرض إشعار المكافأة
        if (this.game && this.game.showNotification) {
          var rewardText = this.formatRewards(quest.rewards);
          this.game.showNotification('🎁 مكافأة: ' + rewardText);
        }
        
        this.saveQuestData();
        return true;
      }
    }
    
    return false;
  },
  
  giveRewards: function(rewards) {
    if (!this.game) return;
    
    // إضافة المال
    if (rewards.money && GAME.state) {
      GAME.state.money = (GAME.state.money || 0) + rewards.money;
    }
    
    // إضافة نقاط الخبرة
    if (rewards.xp && GAME.EconomySystem && GAME.EconomySystem.addXP) {
      GAME.EconomySystem.addXP(rewards.xp);
    }
    
    // إضافة الأغراض
    if (rewards.item && GAME.Inventory && GAME.Inventory.add) {
      GAME.Inventory.add(rewards.item, 1);
    }
  },
  
  formatRewards: function(rewards) {
    var parts = [];
    if (rewards.money) parts.push(rewards.money + ' 💰');
    if (rewards.xp) parts.push(rewards.xp + ' ✨');
    if (rewards.item) parts.push(rewards.item + ' 🎁');
    return parts.join(' + ');
  },
  
  // ========================
  // الإنجازات
  // ========================
  
  updateAchievementProgress: function(achievementId, progress) {
    for (var i = 0; i < this.achievements.length; i++) {
      var achievement = this.achievements[i];
      if (achievement.id === achievementId) {
        achievement.current = Math.min(achievement.current + progress, achievement.target);
        
        // فحص إكمال الإنجاز
        if (achievement.current >= achievement.target && achievement.claimed !== true) {
          achievement.claimed = true;
          
          if (this.game && this.game.showNotification) {
            this.game.showNotification('🏆 إنجاز جديد: ' + achievement.title);
          }
          
          // منح مكافأة الإنجاز
          if (GAME.state) {
            GAME.state.money = (GAME.state.money || 0) + achievement.reward;
          }
        }
        
        this.saveQuestData();
        break;
      }
    }
  },
  
  updateAchievements: function() {
    if (!GAME.state) return;
    
    // تحديث إنجاز المال
    if (GAME.state.money) {
      this.updateAchievementProgress('rich_farmer', 0);
      var richAchievement = this.achievements.find(function(a) { return a.id === 'rich_farmer'; });
      if (richAchievement) richAchievement.current = GAME.state.money;
    }
  },
  
  // ========================
  // إعادة التعيين
  // ========================
  
  checkResets: function() {
    var today = new Date().toDateString();
    var now = new Date();
    
    // إعادة تعيين يومية
    if (this.lastDailyReset !== today) {
      // نقل المهام اليومية غير المكتملة إلى المكتملة
      for (var i = this.activeQuests.length - 1; i >= 0; i--) {
        if (this.activeQuests[i].type === 'daily') {
          this.activeQuests.splice(i, 1);
        }
      }
      
      this.generateDailyQuests();
    }
    
    // إعادة تعيين أسبوعية (كل أحد)
    var weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    
    if (this.lastWeeklyReset && new Date(this.lastWeeklyReset) < weekStart) {
      for (var j = this.activeQuests.length - 1; j >= 0; j--) {
        if (this.activeQuests[j].type === 'weekly') {
          this.activeQuests.splice(j, 1);
        }
      }
      
      this.generateWeeklyQuests();
    }
  },
  
  // ========================
  // الحصول على المهام
  // ========================
  
  getActiveQuests: function(type) {
    if (!type) return this.activeQuests;
    
    return this.activeQuests.filter(function(quest) {
      return quest.type === type;
    });
  },
  
  getQuestById: function(id) {
    for (var i = 0; i < this.activeQuests.length; i++) {
      if (this.activeQuests[i].id === id) {
        return this.activeQuests[i];
      }
    }
    return null;
  },
  
  getStoryProgress: function() {
    var completed = 0;
    var total = this.storyQuests.length;
    
    for (var i = 0; i < this.storyQuests.length; i++) {
      if (this.completedQuests.indexOf(this.storyQuests[i].id) !== -1) {
        completed++;
      }
    }
    
    return {
      completed: completed,
      total: total,
      percentage: Math.round((completed / total) * 100)
    };
  },
  
  getAchievements: function() {
    return this.achievements;
  },
  
  getUnclaimedRewards: function() {
    return this.activeQuests.filter(function(quest) {
      return quest.completed && !quest.claimed;
    });
  },
  
  // ========================
  // الحفظ والتحميل
  // ========================
  
  saveQuestData: function() {
    var data = {
      activeQuests: this.activeQuests,
      completedQuests: this.completedQuests,
      claimedRewards: this.claimedRewards,
      achievements: this.achievements,
      lastDailyReset: this.lastDailyReset,
      lastWeeklyReset: this.lastWeeklyReset
    };
    
    localStorage.setItem('questSystem', JSON.stringify(data));
  },
  
  loadQuestData: function() {
    var saved = localStorage.getItem('questSystem');
    if (saved) {
      try {
        var data = JSON.parse(saved);
        this.activeQuests = data.activeQuests || [];
        this.completedQuests = data.completedQuests || [];
        this.claimedRewards = data.claimedRewards || [];
        this.lastDailyReset = data.lastDailyReset || null;
        this.lastWeeklyReset = data.lastWeeklyReset || null;
        
        // استعادة الإنجازات
        if (data.achievements) {
          for (var i = 0; i < data.achievements.length; i++) {
            for (var j = 0; j < this.achievements.length; j++) {
              if (this.achievements[j].id === data.achievements[i].id) {
                this.achievements[j].current = data.achievements[i].current;
                this.achievements[j].claimed = data.achievements[i].claimed;
                break;
              }
            }
          }
        }
      } catch (e) {
        console.warn('Error loading quest data:', e);
      }
    }
  },
  
  // ========================
  // إعادة تعيين يدوية
  // ========================
  
  resetDailyQuests: function() {
    for (var i = this.activeQuests.length - 1; i >= 0; i--) {
      if (this.activeQuests[i].type === 'daily') {
        this.activeQuests.splice(i, 1);
      }
    }
    this.generateDailyQuests();
  },
  
  resetAllQuests: function() {
    this.activeQuests = [];
    this.completedQuests = [];
    this.claimedRewards = [];
    this.lastDailyReset = null;
    this.lastWeeklyReset = null;
    
    // إعادة تعيين الإنجازات
    for (var i = 0; i < this.achievements.length; i++) {
      this.achievements[i].current = 0;
      this.achievements[i].claimed = false;
    }
    
    localStorage.removeItem('questSystem');
    
    this.generateDailyQuests();
    this.checkStoryQuests();
  },
  
  // ========================
  // إحصائيات
  // ========================
  
  getStats: function() {
    var dailyCompleted = 0;
    var weeklyCompleted = 0;
    var storyCompleted = 0;
    
    for (var i = 0; i < this.completedQuests.length; i++) {
      var id = this.completedQuests[i];
      if (id.indexOf('story_') === 0) {
        storyCompleted++;
      } else if (id.indexOf('_' ) !== -1) {
        // التحقق من النوع من القالب
        var isWeekly = false;
        for (var j = 0; j < this.weeklyQuestTemplates.length; j++) {
          if (id.indexOf(this.weeklyQuestTemplates[j].id) === 0) {
            isWeekly = true;
            break;
          }
        }
        if (isWeekly) {
          weeklyCompleted++;
        } else {
          dailyCompleted++;
        }
      }
    }
    
    var achievementsCompleted = 0;
    for (var k = 0; k < this.achievements.length; k++) {
      if (this.achievements[k].claimed) {
        achievementsCompleted++;
      }
    }
    
    return {
      activeQuests: this.activeQuests.length,
      dailyCompleted: dailyCompleted,
      weeklyCompleted: weeklyCompleted,
      storyCompleted: storyCompleted,
      achievementsCompleted: achievementsCompleted,
      totalAchievements: this.achievements.length
    };
  }
};

// تصدير النظام
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GAME.QuestSystem;
}
