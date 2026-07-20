/**
 * WeatherSystem.js - نظام الطقس المحسّن
 * 
 * يدير أنواع الطقس المختلفة وتأثيراتها على اللعبة
 * - 6 أنواع طقس: صافي، غائم، ممطر، عاصف، ثلجي، عاصف رياح
 * - أنماط موسمية
 * - تأثيرات بصرية وجسيمات
 * - تأثيرات على الزراعة والحيوانات
 * - تغيير تدريجي للطقس
 */

GAME.WeatherSystem = {
    // حالة الطقس الحالية
    currentWeather: 'clear',
    previousWeather: null,
    weatherTimer: 0,
    weatherDuration: 300, // بالثواني
    transitionProgress: 0,
    isTransitioning: false,
    transitionSpeed: 0.5,
    
    // بيانات الطقس
    weatherTypes: {
        clear: {
            name: '☀️ صافي',
            nameEn: 'Clear',
            icon: '☀️',
            effects: {
                waterDecay: 1.0,
                animalHappiness: 1.0,
                plantGrowth: 1.0,
                autoWater: false,
                damage: false,
                freeze: false,
                spreadSeeds: false,
                fishingBonus: 0,
                cropYield: 1.0
            },
            particles: null,
            lighting: {
                ambient: 0xffffff,
                intensity: 1.0,
                fogDensity: 0.01,
                fogColor: 0x87ceeb
            },
            sounds: ['birds', 'wind_light'],
            description: 'طقس صافي وجميل'
        },
        
        cloudy: {
            name: '☁️ غائم',
            nameEn: 'Cloudy',
            icon: '☁️',
            effects: {
                waterDecay: 0.8,
                animalHappiness: 0.9,
                plantGrowth: 0.9,
                autoWater: false,
                damage: false,
                freeze: false,
                spreadSeeds: false,
                fishingBonus: 0.2,
                cropYield: 0.95
            },
            particles: null,
            lighting: {
                ambient: 0xcccccc,
                intensity: 0.7,
                fogDensity: 0.02,
                fogColor: 0x999999
            },
            sounds: ['wind_medium'],
            description: 'طقس غائم قليلاً'
        },
        
        rainy: {
            name: '🌧️ ممطر',
            nameEn: 'Rainy',
            icon: '🌧️',
            effects: {
                waterDecay: 0.0,
                animalHappiness: 0.7,
                plantGrowth: 1.2,
                autoWater: true,
                damage: false,
                freeze: false,
                spreadSeeds: false,
                fishingBonus: 0.5,
                cropYield: 1.1
            },
            particles: 'rain',
            lighting: {
                ambient: 0x666666,
                intensity: 0.5,
                fogDensity: 0.03,
                fogColor: 0x778899
            },
            sounds: ['rain_light', 'thunder_distant'],
            description: 'أمطار خفيفة منعشة'
        },
        
        stormy: {
            name: '⛈️ عاصف',
            nameEn: 'Stormy',
            icon: '⛈️',
            effects: {
                waterDecay: 0.0,
                animalHappiness: 0.4,
                plantGrowth: 0.8,
                autoWater: true,
                damage: true,
                damageChance: 0.1,
                damageAmount: 10,
                freeze: false,
                spreadSeeds: true,
                fishingBonus: -0.3,
                cropYield: 0.8
            },
            particles: 'rain_heavy',
            lightning: true,
            lighting: {
                ambient: 0x444444,
                intensity: 0.3,
                fogDensity: 0.04,
                fogColor: 0x555555
            },
            sounds: ['rain_heavy', 'thunder_close', 'wind_strong'],
            description: 'عاصفة رعدية قوية!'
        },
        
        snowy: {
            name: '❄️ ثلجي',
            nameEn: 'Snowy',
            icon: '❄️',
            effects: {
                waterDecay: 0.3,
                animalHappiness: 0.6,
                plantGrowth: 0.5,
                autoWater: false,
                damage: false,
                freeze: true,
                freezeChance: 0.2,
                spreadSeeds: false,
                fishingBonus: -0.5,
                cropYield: 0.7
            },
            particles: 'snow',
            lighting: {
                ambient: 0xeeeeff,
                intensity: 0.9,
                fogDensity: 0.025,
                fogColor: 0xffffff
            },
            sounds: ['wind_cold', 'snow_falling'],
            description: 'تساقط ثلوج خفيفة'
        },
        
        windy: {
            name: '💨 عاصف رياح',
            nameEn: 'Windy',
            icon: '💨',
            effects: {
                waterDecay: 1.3,
                animalHappiness: 0.8,
                plantGrowth: 0.85,
                autoWater: false,
                damage: false,
                freeze: false,
                spreadSeeds: true,
                spreadChance: 0.3,
                fishingBonus: -0.2,
                cropYield: 0.9
            },
            particles: 'wind',
            lighting: {
                ambient: 0xdddddd,
                intensity: 0.8,
                fogDensity: 0.015,
                fogColor: 0xccbbaa
            },
            sounds: ['wind_strong', 'leaves_rustling'],
            description: 'رياح قوية تهب'
        }
    },
    
    // أنماط الطقس الموسمية
    weatherPatterns: {
        spring: {
            weights: {
                clear: 0.3,
                cloudy: 0.25,
                rainy: 0.25,
                windy: 0.15,
                stormy: 0.05,
                snowy: 0.0
            },
            preferredDurations: {
                clear: 350,
                cloudy: 250,
                rainy: 200,
                windy: 280,
                stormy: 150,
                snowy: 0
            },
            transitionChance: 0.15,
            description: 'طقس متغير مع أمطار خفيفة'
        },
        
        summer: {
            weights: {
                clear: 0.45,
                cloudy: 0.15,
                rainy: 0.1,
                windy: 0.1,
                stormy: 0.15,
                snowy: 0.0
            },
            preferredDurations: {
                clear: 400,
                cloudy: 200,
                rainy: 180,
                windy: 220,
                stormy: 120,
                snowy: 0
            },
            transitionChance: 0.1,
            description: 'طقس حار مع عواصف رعدية'
        },
        
        autumn: {
            weights: {
                clear: 0.2,
                cloudy: 0.3,
                rainy: 0.2,
                windy: 0.2,
                stormy: 0.08,
                snowy: 0.02
            },
            preferredDurations: {
                clear: 300,
                cloudy: 280,
                rainy: 220,
                windy: 250,
                stormy: 160,
                snowy: 100
            },
            transitionChance: 0.12,
            description: 'طقس بارد مع رياح'
        },
        
        winter: {
            weights: {
                clear: 0.15,
                cloudy: 0.3,
                rainy: 0.05,
                windy: 0.15,
                stormy: 0.05,
                snowy: 0.3
            },
            preferredDurations: {
                clear: 250,
                cloudy: 300,
                rainy: 150,
                windy: 200,
                stormy: 100,
                snowy: 350
            },
            transitionChance: 0.08,
            description: 'طقس بارد مع ثلوج'
        }
    },
    
    // حالة الجسيمات
    particles: {
        active: [],
        maxParticles: 200,
        emitRate: 10,
        emitTimer: 0
    },
    
    // أحداث الطقس
    weatherEvents: [],
    eventCooldown: 0,
    
    // إحصائيات
    stats: {
        weatherChanges: 0,
        totalTimeByWeather: {},
        stormDamageDealt: 0,
        autoWaterings: 0,
        seedsSpread: 0
    },
    
    /**
     * تهيئة نظام الطقس
     */
    init: function(game) {
        this.game = game;
        this.currentWeather = 'clear';
        this.weatherTimer = this.weatherDuration;
        this.loadState();
        
        // تهيئة إحصائيات الطقس
        for (var weather in this.weatherTypes) {
            this.stats.totalTimeByWeather[weather] = 0;
        }
        
        console.log('[WeatherSystem] تم التهيئة - الطقس الحالي: ' + this.weatherTypes[this.currentWeather].name);
        return this;
    },
    
    /**
     * تحديث نظام الطقس
     */
    update: function(dt) {
        // تحديث المؤقت
        this.weatherTimer -= dt;
        this.stats.totalTimeByWeather[this.currentWeather] += dt;
        
        // التحقق من تغيير الطقس
        if (this.weatherTimer <= 0) {
            this.changeWeather();
        }
        
        // تحديث الانتقال
        if (this.isTransitioning) {
            this.transitionProgress += dt * this.transitionSpeed;
            if (this.transitionProgress >= 1) {
                this.completeTransition();
            }
        }
        
        // تحديث الجسيمات
        this.updateParticles(dt);
        
        // تحديث التأثيرات المستمرة
        this.updateContinuousEffects(dt);
        
        // تحديث الأحداث
        this.updateEvents(dt);
        
        // التحقق من عواصف الصواعق
        this.checkLightning(dt);
    },
    
    /**
     * تغيير الطقس
     */
    changeWeather: function() {
        var season = GAME.TimeSystem ? GAME.TimeSystem.season : 'spring';
        var pattern = this.weatherPatterns[season];
        
        // اختيار طقس جديد بناءً على الأوزان
        var newWeather = this.selectWeatherByWeight(pattern.weights);
        
        // التأكد من أن الطقس مختلف
        if (newWeather === this.currentWeather && Math.random() > 0.3) {
            var weatherKeys = Object.keys(pattern.weights);
            var availableWeather = weatherKeys.filter(function(w) {
                return pattern.weights[w] > 0 && w !== this.currentWeather;
            }.bind(this));
            
            if (availableWeather.length > 0) {
                newWeather = availableWeather[Math.floor(Math.random() * availableWeather.length)];
            }
        }
        
        // بدء الانتقال
        this.startTransition(newWeather);
        
        // تحديد مدة الطقس الجديدة
        this.weatherDuration = pattern.preferredDurations[newWeather] || 300;
        this.weatherTimer = this.weatherDuration;
        
        // تحديث الإحصائيات
        this.stats.weatherChanges++;
        
        console.log('[WeatherSystem] تغيير الطقس إلى: ' + this.weatherTypes[newWeather].name);
    },
    
    /**
     * اختيار طقس بناءً على الأوزان
     */
    selectWeatherByWeight: function(weights) {
        var totalWeight = 0;
        for (var weather in weights) {
            totalWeight += weights[weather];
        }
        
        var random = Math.random() * totalWeight;
        var currentWeight = 0;
        
        for (var weather in weights) {
            currentWeight += weights[weather];
            if (random <= currentWeight) {
                return weather;
            }
        }
        
        return 'clear';
    },
    
    /**
     * بدء انتقال الطقس
     */
    startTransition: function(newWeather) {
        this.previousWeather = this.currentWeather;
        this.currentWeather = newWeather;
        this.isTransitioning = true;
        this.transitionProgress = 0;
        
        // تطبيق التأثيرات الفورية
        this.applyInstantEffects(newWeather);
        
        // إطلاق أحداث التغيير
        this.triggerEvent('weather_change', {
            from: this.previousWeather,
            to: newWeather
        });
    },
    
    /**
     * إكمال الانتقال
     */
    completeTransition: function() {
        this.isTransitioning = false;
        this.transitionProgress = 1;
        
        // تطبيق التأثيرات النهائية
        this.applyWeatherEffects(this.currentWeather);
        
        console.log('[WeatherSystem] اكتمال الانتقال إلى: ' + this.weatherTypes[this.currentWeather].name);
    },
    
    /**
     * تطبيق التأثيرات الفورية
     */
    applyInstantEffects: function(weather) {
        var weatherData = this.weatherTypes[weather];
        
        // تطبيق إضاءة جديدة
        if (this.game && this.game.scene) {
            this.applyLighting(weatherData.lighting);
        }
        
        // تطبيق تأثيرات الصوت
        this.applySoundEffects(weather);
        
        // تطبيق تأثيرات الزراعة الفورية
        if (weatherData.effects.autoWater) {
            this.autoWaterAll();
        }
    },
    
    /**
     * تطبيق تأثيرات الطقس المستمرة
     */
    applyWeatherEffects: function(weather) {
        var weatherData = this.weatherTypes[weather];
        
        // تأثيرات على الحيوانات
        this.applyAnimalEffects(weatherData.effects);
        
        // تأثيرات على النباتات
        this.applyPlantEffects(weatherData.effects);
    },
    
    /**
     * تحديث التأثيرات المستمرة
     */
    updateContinuousEffects: function(dt) {
        var effects = this.weatherTypes[this.currentWeather].effects;
        
        // تأثير تجفيف التربة
        if (effects.waterDecay > 0 && this.game.farm) {
            this.applyWaterDecay(effects.waterDecay, dt);
        }
        
        // تأثير النمو
        if (effects.plantGrowth !== 1.0 && this.game.farm) {
            this.applyGrowthModifier(effects.plantGrowth, dt);
        }
        
        // تأثير الأعاصير على المحاصيل
        if (effects.damage && Math.random() < effects.damageChance * dt) {
            this.applyStormDamage(effects.damageAmount);
        }
        
        // تأثير تجميد المحاصيل
        if (effects.freeze && Math.random() < effects.freezeChance * dt) {
            this.applyFreezeEffect();
        }
        
        // تأثير انتشار البذور
        if (effects.spreadSeeds && Math.random() < effects.spreadChance * dt) {
            this.spreadSeeds();
        }
    },
    
    /**
     * تطبيق تجفيف الماء
     */
    applyWaterDecay: function(rate, dt) {
        if (!this.game.farm) return;
        
        var plots = this.game.farm.plots || [];
        plots.forEach(function(plot) {
            if (plot.moisture > 0) {
                plot.moisture = Math.max(0, plot.moisture - (rate * dt * 0.1));
            }
        });
    },
    
    /**
     * تطبيق معدل النمو
     */
    applyGrowthModifier: function(modifier, dt) {
        if (!this.game.farm) return;
        
        var plots = this.game.farm.plots || [];
        plots.forEach(function(plot) {
            if (plot.crop && plot.watered) {
                plot.growthBonus = modifier;
            }
        });
    },
    
    /**
     * تطبيق أضرار العاصفة
     */
    applyStormDamage: function(damage) {
        if (!this.game.farm) return;
        
        var plots = this.game.farm.plots || [];
        var damaged = false;
        
        plots.forEach(function(plot) {
            if (plot.crop && Math.random() < 0.1) {
                plot.health = Math.max(0, (plot.health || 100) - damage);
                damaged = true;
            }
        });
        
        if (damaged) {
            this.stats.stormDamageDealt++;
            this.triggerEvent('storm_damage', { amount: damage });
        }
    },
    
    /**
     * تطبيق تأثير التجميد
     */
    applyFreezeEffect: function() {
        if (!this.game.farm) return;
        
        var plots = this.game.farm.plots || [];
        plots.forEach(function(plot) {
            if (plot.crop && !plot.frozen) {
                plot.frozen = true;
                plot.growthRate = 0;
            }
        });
        
        this.triggerEvent('freeze', {});
    },
    
    /**
     * انتشار البذور
     */
    spreadSeeds: function() {
        if (!this.game.farm) return;
        
        var plots = this.game.farm.plots || [];
        var spreadable = plots.filter(function(p) {
            return p.crop && p.mature;
        });
        
        if (spreadable.length > 0) {
            var source = spreadable[Math.floor(Math.random() * spreadable.length)];
            var emptyPlots = plots.filter(function(p) {
                return !p.crop;
            });
            
            if (emptyPlots.length > 0) {
                var target = emptyPlots[Math.floor(Math.random() * emptyPlots.length)];
                target.crop = source.crop;
                target.spread = true;
                this.stats.seedsSpread++;
                
                this.triggerEvent('seed_spread', {
                    from: source,
                    to: target
                });
            }
        }
    },
    
    /**
     * ري تلقائي للنباتات
     */
    autoWaterAll: function() {
        if (!this.game.farm) return;
        
        var plots = this.game.farm.plots || [];
        var watered = 0;
        
        plots.forEach(function(plot) {
            if (plot.crop && !plot.watered) {
                plot.watered = true;
                plot.moisture = 100;
                watered++;
            }
        });
        
        if (watered > 0) {
            this.stats.autoWaterings += watered;
            this.triggerEvent('auto_water', { count: watered });
            console.log('[WeatherSystem] ري تلقائي لـ ' + watered + ' نبات');
        }
    },
    
    /**
     * تأثيرات على الحيوانات
     */
    applyAnimalEffects: function(effects) {
        if (!this.game.animals) return;
        
        var animals = this.game.animals.list || [];
        animals.forEach(function(animal) {
            animal.happinessModifier = effects.animalHappiness;
            
            // تأثيرات خاصة
            if (effects.freeze && Math.random() < 0.3) {
                animal.needsShelter = true;
            }
        });
    },
    
    /**
     * تأثيرات على النباتات
     */
    applyPlantEffects: function(effects) {
        if (!this.game.farm) return;
        
        var plots = this.game.farm.plots || [];
        plots.forEach(function(plot) {
            if (plot.crop) {
                plot.weatherModifier = effects.plantGrowth;
            }
        });
    },
    
    /**
     * تطبيق الإضاءة
     */
    applyLighting: function(lighting) {
        if (!this.game.scene) return;
        
        var scene = this.game.scene;
        
        // تحديث إضاءة المحيط
        if (scene.ambientLight) {
            scene.ambientLight.color.setHex(lighting.ambient);
            scene.ambientLight.intensity = lighting.intensity;
        }
        
        // تحديث الضباب
        if (scene.fog) {
            scene.fog.density = lighting.fogDensity;
            scene.fog.color.setHex(lighting.fogColor);
        }
    },
    
    /**
     * تطبيق تأثيرات الصوت
     */
    applySoundEffects: function(weather) {
        var weatherData = this.weatherTypes[weather];
        
        // إيقاف أصوات الطقس السابقة
        this.stopPreviousSounds();
        
        // تشغيل أصوات الطقس الجديدة
        if (this.game.audio && weatherData.sounds) {
            weatherData.sounds.forEach(function(sound) {
                this.game.audio.playWeatherSound(sound);
            }.bind(this));
        }
    },
    
    /**
     * إيقاف الأصوات السابقة
     */
    stopPreviousSounds: function() {
        if (this.game.audio) {
            this.game.audio.stopWeatherSounds();
        }
    },
    
    /**
     * تحديث الجسيمات
     */
    updateParticles: function(dt) {
        var weatherData = this.weatherTypes[this.currentWeather];
        
        if (!weatherData.particles) {
            this.clearParticles();
            return;
        }
        
        // تحديث إصدار الجسيمات
        this.particles.emitTimer += dt;
        var emitInterval = 1 / this.particles.emitRate;
        
        while (this.particles.emitTimer >= emitInterval) {
            this.emitParticle(weatherData.particles);
            this.particles.emitTimer -= emitInterval;
        }
        
        // تحديث الجسيمات الموجودة
        this.updateExistingParticles(dt);
    },
    
    /**
     * إصدار جسيم جديد
     */
    emitParticle: function(type) {
        if (this.particles.active.length >= this.particles.maxParticles) {
            return;
        }
        
        var particle = this.createParticle(type);
        if (particle) {
            this.particles.active.push(particle);
        }
    },
    
    /**
     * إنشاء جسيم
     */
    createParticle: function(type) {
        var particle = {
            type: type,
            x: Math.random() * 100 - 50,
            y: 30 + Math.random() * 10,
            z: Math.random() * 100 - 50,
            vx: 0,
            vy: 0,
            vz: 0,
            life: 1,
            maxLife: 3,
            size: 0.1,
            opacity: 1
        };
        
        switch (type) {
            case 'rain':
                particle.vy = -15 - Math.random() * 5;
                particle.vx = -2;
                particle.size = 0.05;
                particle.maxLife = 2;
                break;
                
            case 'rain_heavy':
                particle.vy = -20 - Math.random() * 10;
                particle.vx = -5;
                particle.size = 0.08;
                particle.maxLife = 1.5;
                break;
                
            case 'snow':
                particle.vy = -3 - Math.random() * 2;
                particle.vx = Math.sin(Date.now() * 0.001) * 0.5;
                particle.size = 0.15;
                particle.maxLife = 5;
                break;
                
            case 'wind':
                particle.vx = 10 + Math.random() * 5;
                particle.vy = Math.sin(Date.now() * 0.002) * 0.3;
                particle.size = 0.02;
                particle.maxLife = 2;
                particle.opacity = 0.5;
                break;
        }
        
        return particle;
    },
    
    /**
     * تحديث الجسيمات الموجودة
     */
    updateExistingParticles: function(dt) {
        var toRemove = [];
        
        this.particles.active.forEach(function(particle, index) {
            // تحديث الموقع
            particle.x += particle.vx * dt;
            particle.y += particle.vy * dt;
            particle.z += particle.vz * dt;
            
            // تحديث العمر
            particle.life -= dt;
            
            // تحديث الشفافية
            particle.opacity = Math.max(0, particle.life / particle.maxLife);
            
            // التحقق من انتهاء العمر
            if (particle.life <= 0 || particle.y < -5) {
                toRemove.push(index);
            }
        });
        
        // إزالة الجسيمات المنتهية
        for (var i = toRemove.length - 1; i >= 0; i--) {
            this.particles.active.splice(toRemove[i], 1);
        }
    },
    
    /**
     * مسح الجسيمات
     */
    clearParticles: function() {
        this.particles.active = [];
    },
    
    /**
     * التحقق من الصواعق
     */
    checkLightning: function(dt) {
        var weatherData = this.weatherTypes[this.currentWeather];
        
        if (weatherData.lightning && Math.random() < 0.001) {
            this.createLightning();
        }
    },
    
    /**
     * إنشاء صاعقة
     */
    createLightning: function() {
        var lightning = {
            x: Math.random() * 80 - 40,
            z: Math.random() * 80 - 40,
            duration: 0.2,
            intensity: 2
        };
        
        // تأثير بصري
        this.flashLightning(lightning.intensity);
        
        // صوت الصاعقة
        if (this.game.audio) {
            this.game.audio.playSFX('thunder');
        }
        
        this.triggerEvent('lightning', lightning);
        
        console.log('[WeatherSystem] صاعقة!');
    },
    
    /**
     * وميض الصاعقة
     */
    flashLightning: function(intensity) {
        if (!this.game.scene || !this.game.scene.ambientLight) return;
        
        var originalIntensity = this.game.scene.ambientLight.intensity;
        this.game.scene.ambientLight.intensity = intensity;
        
        setTimeout(function() {
            this.game.scene.ambientLight.intensity = originalIntensity;
        }.bind(this), 100);
    },
    
    /**
     * تحديث الأحداث
     */
    updateEvents: function(dt) {
        this.eventCooldown -= dt;
        
        // تحقق من أحداث الطقس الخاصة
        if (this.currentWeather === 'stormy' && this.eventCooldown <= 0) {
            if (Math.random() < 0.1) {
                this.triggerEvent('storm_intensity_change', {
                    intensity: 0.5 + Math.random() * 0.5
                });
                this.eventCooldown = 30;
            }
        }
    },
    
    /**
     * إطلاق حدث
     */
    triggerEvent: function(eventName, data) {
        var event = {
            name: eventName,
            data: data,
            timestamp: Date.now()
        };
        
        this.weatherEvents.push(event);
        
        // حدث أقصى
        if (this.weatherEvents.length > 50) {
            this.weatherEvents.shift();
        }
        
        // إرسال الحدث
        if (this.game.events) {
            this.game.events.emit('weather_' + eventName, data);
        }
    },
    
    /**
     * الحصول على معلومات الطقس
     */
    getWeatherInfo: function() {
        return {
            current: this.currentWeather,
            name: this.weatherTypes[this.currentWeather].name,
            icon: this.weatherTypes[this.currentWeather].icon,
            description: this.weatherTypes[this.currentWeather].description,
            effects: this.weatherTypes[this.currentWeather].effects,
            timeRemaining: Math.ceil(this.weatherTimer),
            isTransitioning: this.isTransitioning,
            season: GAME.TimeSystem ? GAME.TimeSystem.season : 'spring'
        };
    },
    
    /**
     * الحصول على تأثيرات الطقس الحالية
     */
    getWeatherEffects: function() {
        return this.weatherTypes[this.currentWeather].effects;
    },
    
    /**
     * التحقق من وجود طقس معين
     */
    isWeather: function(weather) {
        return this.currentWeather === weather;
    },
    
    /**
     * التحقق من وجود تأثير معين
     */
    hasEffect: function(effectName) {
        var effects = this.getWeatherEffects();
        return effects[effectName] === true;
    },
    
    /**
     * الحصول على معدل التأثير
     */
    getEffectRate: function(effectName) {
        var effects = this.getWeatherEffects();
        return effects[effectName] || 0;
    },
    
    /**
     * تغيير الطقس يدوياً
     */
    setWeather: function(weather) {
        if (this.weatherTypes[weather]) {
            this.startTransition(weather);
            this.weatherDuration = this.weatherPatterns[GAME.TimeSystem ? GAME.TimeSystem.season : 'spring'].preferredDurations[weather] || 300;
            this.weatherTimer = this.weatherDuration;
            
            console.log('[WeatherSystem] تم تغيير الطقس يدوياً إلى: ' + this.weatherTypes[weather].name);
        }
    },
    
    /**
     * حفظ حالة الطقس
     */
    saveState: function() {
        var state = {
            currentWeather: this.currentWeather,
            weatherTimer: this.weatherTimer,
            stats: this.stats
        };
        
        try {
            localStorage.setItem('farmgame_weather', JSON.stringify(state));
        } catch (e) {
            console.warn('[WeatherSystem] خطأ في حفظ الحالة:', e);
        }
    },
    
    /**
     * تحميل حالة الطقس
     */
    loadState: function() {
        try {
            var saved = localStorage.getItem('farmgame_weather');
            if (saved) {
                var state = JSON.parse(saved);
                this.currentWeather = state.currentWeather || 'clear';
                this.weatherTimer = state.weatherTimer || this.weatherDuration;
                this.stats = state.stats || this.stats;
                
                console.log('[WeatherSystem] تم تحميل الحالة المحفوظة');
            }
        } catch (e) {
            console.warn('[WeatherSystem] خطأ في تحميل الحالة:', e);
        }
    },
    
    /**
     * إعادة تعيين الإحصائيات
     */
    resetStats: function() {
        this.stats = {
            weatherChanges: 0,
            totalTimeByWeather: {},
            stormDamageDealt: 0,
            autoWaterings: 0,
            seedsSpread: 0
        };
        
        for (var weather in this.weatherTypes) {
            this.stats.totalTimeByWeather[weather] = 0;
        }
    },
    
    /**
     * الحصول على ملخص الطقس
     */
    getWeatherSummary: function() {
        var summary = {
            current: this.weatherTypes[this.currentWeather].name,
            duration: this.weatherDuration,
            remaining: Math.ceil(this.weatherTimer),
            effects: Object.keys(this.getWeatherEffects()).filter(function(key) {
                return this.getWeatherEffects()[key] !== 0;
            }.bind(this)),
            stats: this.stats
        };
        
        return summary;
    },
    
    /**
     * تحديث واجهة المستخدم
     */
    updateUI: function() {
        var ui = this.game.ui;
        if (!ui) return;
        
        var info = this.getWeatherInfo();
        
        // تحديث مؤشر الطقس
        if (ui.updateWeatherDisplay) {
            ui.updateWeatherDisplay(info);
        }
        
        // تحديث تأثيرات الطقس
        if (ui.updateWeatherEffects) {
            ui.updateWeatherEffects(info.effects);
        }
    },
    
    /**
     * تنظيف الموارد
     */
    destroy: function() {
        this.saveState();
        this.clearParticles();
        this.weatherEvents = [];
        
        console.log('[WeatherSystem] تم الإغلاق');
    }
};
