/**
 * AI Agent System for Farm Game
 * Provides intelligent NPCs that can perform farming tasks autonomously
 */

var GAME = GAME || {};

GAME.AIAgent = {
  // Agent types
  TYPES: {
    FARMER: 'farmer',
    ANIMAL_HANDLER: 'animalHandler',
    COLLECTOR: 'collector',
    CRAFTER: 'crafter'
  },
  
  // Agent states
  STATES: {
    IDLE: 'idle',
    MOVING: 'moving',
    WORKING: 'working',
    RESTING: 'resting',
    SEEKING: 'seeking'
  },
  
  // List of all active agents
  agents: [],
  
  // Initialize the AI agent system
  init: function(scene) {
    this.scene = scene;
    this._initDefaultAgents();
  },
  
  // Initialize some default agents for demonstration
  _initDefaultAgents: function() {
    // Create a farmer agent
    this.createAgent(this.TYPES.FARMER, {
      x: 0, z: 0,
      name: 'Farmer John',
      skills: { farming: 0.8, harvesting: 0.7, planting: 0.9 }
    });
    
    // Create an animal handler
    this.createAgent(this.TYPES.ANIMAL_HANDLER, {
      x: 5, z: 5,
      name: 'Jane the Shepherd',
      skills: { animalCare: 0.9, feeding: 0.8 }
    });
  },
  
  // Create a new AI agent
  createAgent: function(type, params) {
    var STATES = this.STATES;
    var agent = {
      id: Date.now() + Math.floor(Math.random() * 10000),
      type: type,
      STATES: STATES,
      state: STATES.IDLE,
      position: { x: params.x || 0, z: params.z || 0 },
      targetPosition: null,
      name: params.name || 'Agent ' + this.agents.length,
      skills: params.skills || {},
      energy: 100,
      maxEnergy: 100,
      happiness: 100,
      maxHappiness: 100,
      hunger: 0,
      maxHunger: 100,
      money: 50,
      inventory: {},
      currentTask: null,
      taskQueue: [],
      lastActionTime: 0,
      actionCooldown: 2000, // 2 seconds between actions
      mesh: null, // 3D model reference
      visionRange: 10, // How far the agent can see
      workRange: 3, // How close to work to perform task
      
      // AI Decision Making
      decideAction: function() {
        // This would be implemented by specific agent types
        return GAME.AIAgent._defaultDecision(this);
      },
      
      // Execute the current action
      executeAction: function(deltaTime) {
        if (Date.now() - this.lastActionTime < this.actionCooldown) {
          return false;
        }
        
        this.lastActionTime = Date.now();
        
        switch(this.state) {
          case this.STATES.MOVING:
            return this._moveTowardsTarget();
          case this.STATES.WORKING:
            return this._performWork();
          case this.STATES.RESTING:
            return this._rest();
          case this.STATES.SEEKING:
            return this._seekTarget();
          default:
            return this._idleBehavior();
        }
      },
      
      // Move towards target position
      _moveTowardsTarget: function() {
        if (!this.targetPosition) {
          this.state = this.STATES.IDLE;
          return false;
        }
        
        var dx = this.targetPosition.x - this.position.x;
        var dz = this.targetPosition.z - this.position.z;
        var distance = Math.sqrt(dx * dx + dz * dz);
        
        if (distance < 0.1) {
          // Arrived at destination
          this.position.x = this.targetPosition.x;
          this.position.z = this.targetPosition.z;
          this.targetPosition = null;
          this.state = this.STATES.IDLE;
          return true;
        }
        
        // Move towards target
        var speed = 0.05; // units per frame
        this.position.x += (dx / distance) * speed;
        this.position.z += (dz / distance) * speed;
        
        // Update mesh position if exists
        if (this.mesh) {
          this.mesh.position.set(this.position.x, 0, this.position.z);
          // Rotate to face direction of movement
          this.mesh.rotation.y = Math.atan2(dx, dz);
        }
        
        return true;
      },
      
      // Perform work based on current task
      _performWork: function() {
        if (!this.currentTask) {
          this.state = this.STATES.IDLE;
          return false;
        }
        
        // Simulate work progress
        this.currentTask.progress += 0.01;
        
        // Consume energy
        this.energy = Math.max(0, this.energy - 0.1);
        
        // Check if work is complete
        if (this.currentTask.progress >= 1.0) {
          this._completeTask();
          return true;
        }
        
        return true;
      },
      
      // Rest to recover energy
      _rest: function() {
        this.energy = Math.min(this.maxEnergy, this.energy + 0.5);
        this.happiness = Math.min(this.maxHappiness, this.happiness + 0.2);
        
        // If fully rested, go back to idle
        if (this.energy >= this.maxEnergy * 0.8) {
          this.state = this.STATES.IDLE;
        }
        
        return true;
      },
      
      // Seek a target (resource, object, etc.)
      _seekTarget: function() {
        // This would be implemented based on what we're seeking
        // For now, just wander randomly
        if (Math.random() < 0.02) { // 2% chance to change direction
          this._setRandomTarget();
        }
        return this._moveTowardsTarget();
      },
      
      // Idle behavior - wander or look for work
      _idleBehavior: function() {
        // Occasionally look for work to do
        if (Math.random() < 0.005) { // 0.5% chance per frame
          var work = this._findNearbyWork();
          if (work) {
            this._assignWork(work);
            return true;
          }
        }
        
        // Sometimes wander around
        if (Math.random() < 0.001) { // 0.1% chance per frame
          this._setRandomTarget();
          this.state = this.STATES.MOVING;
          return true;
        }
        
        return true;
      },
      
      // Set a random target position within bounds
      _setRandomTarget: function() {
        var bounds = GAME.world ? 
          { x: -15, z: -15, width: 30, depth: 30 } : 
          { x: -10, z: -10, width: 20, depth: 20 };
        
        this.targetPosition = {
          x: bounds.x + Math.random() * bounds.width,
          z: bounds.z + Math.random() * bounds.depth
        };
        this.state = this.STATES.MOVING;
      },
      
      // Find nearby work to do
      _findNearbyWork: function() {
        // Check for unplowed fields that need plowing
        if (this.type === this.TYPES.FARMER && GAME.game && GAME.game.state) {
          for (var i = 0; i < GAME.game.state.plots.length; i++) {
            var plot = GAME.game.state.plots[i];
            if (plot.state === 'empty') {
              var distance = Math.sqrt(
                Math.pow(this.position.x - plot.x, 2) + 
                Math.pow(this.position.z - plot.z, 2)
              );
              if (distance < this.visionRange) {
                return { 
                  type: 'plow', 
                  plotIndex: i, 
                  position: { x: plot.x, z: plot.z } 
                };
              }
            }
          }
        }
        
        // Check for crops that need watering
        if (this.type === this.TYPES.FARMER && GAME.game && GAME.game.state) {
          for (var i = 0; i < GAME.game.state.plots.length; i++) {
            var plot = GAME.game.state.plots[i];
            if (plot.state === 'planted' && !plot.watered) {
              var distance = Math.sqrt(
                Math.pow(this.position.x - plot.x, 2) + 
                Math.pow(this.position.z - plot.z, 2)
              );
              if (distance < this.visionRange) {
                return { 
                  type: 'water', 
                  plotIndex: i, 
                  position: { x: plot.x, z: plot.z } 
                };
              }
            }
          }
        }
        
        // Check for ready crops to harvest
        if (this.type === this.TYPES.FARMER && GAME.game && GAME.game.state) {
          for (var i = 0; i < GAME.game.state.plots.length; i++) {
            var plot = GAME.game.state.plots[i];
            if (plot.state === 'ready') {
              var distance = Math.sqrt(
                Math.pow(this.position.x - plot.x, 2) + 
                Math.pow(this.position.z - plot.z, 2)
              );
              if (distance < this.visionRange) {
                return { 
                  type: 'harvest', 
                  plotIndex: i, 
                  position: { x: plot.x, z: plot.z } 
                };
              }
            }
          }
        }
        
        // Check for animals that need feeding
        if (this.type === this.TYPES.ANIMAL_HANDLER && GAME.animals && GAME.animals.list) {
          for (var i = 0; i < GAME.animals.list.length; i++) {
            var animal = GAME.animals.list[i];
            if (animal.hunger > 50) { // Hungry
              var distance = Math.sqrt(
                Math.pow(this.position.x - animal.x, 2) + 
                Math.pow(this.position.z - animal.z, 2)
              );
              if (distance < this.visionRange) {
                return { 
                  type: 'feedAnimal', 
                  animalIndex: i, 
                  position: { x: animal.x, z: animal.z } 
                };
              }
            }
          }
        }
        
        return null;
      },
      
      // Assign a work task to this agent
      _assignWork: function(work) {
        this.currentTask = {
          type: work.type,
          progress: 0,
          target: work
        };
        this.targetPosition = work.position;
        this.state = this.STATES.MOVING;
      },
      
      // Complete the current task
      _completeTask: function() {
        if (!this.currentTask) return;
        
        var success = false;
        var reward = 0;
        var xp = 0;
        
        switch(this.currentTask.type) {
          case 'plow':
            if (GAME.game && GAME.game.plowClosest) {
              // Simulate plowing at the specific plot
              var plot = GAME.game.state.plots[this.currentTask.target.plotIndex];
              if (plot && plot.state === 'empty') {
                plot.state = 'plowed';
                plot.crop = null;
                plot.growth = 0;
                plot.watered = false;
                plot.fertilized = false;
                
                // Remove any existing mesh and add dirt
                if (plot.mesh) {
                  GAME.game._disposePlotMesh(plot);
                }
                var dirtMat = new THREE.MeshLambertMaterial({ color: 0x4a2a0a });
                var mesh = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.12, 2.2), dirtMat);
                mesh.position.set(plot.x, 0.08, plot.z);
                mesh.receiveShadow = true;
                GAME.game.scene.add(mesh);
                plot.mesh = mesh;
                
                success = true;
                reward = 10;
                xp = 5;
                GAME.ui.showNotification('🌾 Field plowed by ' + this.name, 'success');
              }
            }
            break;
            
          case 'water':
            if (GAME.game && GAME.game.waterClosest) {
              var plot = GAME.game.state.plots[this.currentTask.target.plotIndex];
              if (plot && plot.state === 'planted') {
                plot.watered = true;
                
                // Update water marker if exists
                if (plot.waterMarker) {
                  plot.waterMarker.material.opacity = 0.6;
                }
                
                success = true;
                reward = 5;
                xp = 3;
                GAME.ui.showNotification('💧 Crops watered by ' + this.name, 'success');
              }
            }
            break;
            
          case 'harvest':
            if (GAME.game && GAME.game.harvestClosest) {
              var plot = GAME.game.state.plots[this.currentTask.target.plotIndex];
              if (plot && plot.state === 'ready') {
                // Simulate harvesting
                var cropType = plot.crop;
                var prices = { wheat: 25, tomato: 40, carrot: 35, apple: 80 };
                var bonus = GAME.game.getSellPriceBonus ? GAME.game.getSellPriceBonus() : 1;
                var salePrice = Math.floor((prices[cropType] || 25) * bonus);
                
                GAME.game.state.money += salePrice;
                
                if (cropType === 'apple') {
                  // Tree reset logic
                  plot.state = 'planted';
                  plot.growth = 0;
                  plot.growthStage = 0;
                  plot.watered = false;
                  plot.fertilized = false;
                  
                  // Update plant visual
                  if (GAME.game.updatePlantVisual) {
                    GAME.game.updatePlantVisual(plot);
                  }
                  
                  GAME.ui.showNotification('🍎 Apple harvested by ' + this.name + '! +$' + salePrice, 'success');
                } else {
                  // Remove crop and add to inventory
                  GAME.game._disposePlotMesh(plot);
                  
                  // Remove growth markers
                  GAME.game._disposePlotMarker(plot, 'waterMarker');
                  GAME.game._disposePlotMarker(plot, 'fertilizerMarker');
                  
                  var dirtMat = new THREE.MeshLambertMaterial({ color: 0x4a2a0a });
                  var mesh = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.12, 2.2), dirtMat);
                  mesh.position.set(plot.x, 0.08, plot.z);
                  mesh.receiveShadow = true;
                  GAME.game.scene.add(mesh);
                  plot.mesh = mesh;
                  
                  plot.state = 'plowed';
                  plot.crop = null;
                  plot.growth = 0;
                  plot.growthStage = 0;
                  plot.watered = false;
                  plot.fertilized = false;
                  
                  // Add to agent inventory or game inventory
                  this.inventory[cropType] = (this.inventory[cropType] || 0) + 1;
                  
                  GAME.ui.showNotification('💰 ' + cropType + ' harvested by ' + this.name + '! +$' + salePrice, 'success');
                }
                
                success = true;
                reward = salePrice * 0.1; // Agent gets 10% of sale value
                xp = 15;
              }
            }
            break;
            
          case 'feedAnimal':
            if (GAME.animals && GAME.animals.feed) {
              var animal = GAME.animals.list[this.currentTask.target.animalIndex];
              if (animal) {
                var fed = GAME.animals.feed(animal.x, animal.z);
                if (fed) {
                  animal.hunger = Math.max(0, animal.hunger - 30);
                  
                  success = true;
                  reward = 15;
                  xp = 10;
                  GAME.ui.showNotification('🐔 Animal fed by ' + this.name, 'success');
                }
              }
            }
            break;
        }
        
        // Apply rewards
        if (success) {
          this.money += reward;
          if (GAME.game && GAME.game.addXP) {
            GAME.game.addXP(xp);
          }
          
          // Increase happiness from completing work
          this.happiness = Math.min(this.maxHappiness, this.happiness + 10);
        } else {
          // Failed task decreases happiness slightly
          this.happiness = Math.max(0, this.happiness - 5);
        }
        
        // Reset task
        this.currentTask = null;
        this.targetPosition = null;
        this.state = this.STATES.IDLE;
        
        // Look for next task
        this._findAndAssignNextTask();
      },
      
      // Find and assign the next task automatically
      _findAndAssignNextTask: function() {
        var nextWork = this._findNearbyWork();
        if (nextWork) {
          this._assignWork(nextWork);
        }
      },
      
      // Update agent state (called each frame)
      update: function(delta) {
        // Update basic needs
        this.hunger = Math.min(this.maxHunger, this.hunger + 0.02 * delta);
        this.happiness = Math.max(0, this.happiness - 0.01 * delta); // Slight decay over time
        
        // If too hungry, seek food
        if (this.hunger > this.maxHunger * 0.8) {
          this.state = this.STATES.SEEKING;
          // In a full implementation, we'd seek food specifically
        }
        
        // If too unhappy, rest
        if (this.happiness < this.maxHappiness * 0.3) {
          this.state = this.STATES.RESTING;
        }
        
        // If out of energy, rest
        if (this.energy < 20) {
          this.state = this.STATES.RESTING;
        }
        
        // Execute current state behavior
        this.executeAction(16); // Assuming ~60fps
        
        // Update 3D model position if exists
        if (this.mesh) {
          this.mesh.position.set(this.position.x, 0, this.position.z);
        }
      }
    };
    
    // Initialize agent's 3D representation
    agent._initMesh = function() {
      // Create a simple representation based on agent type
      var geometry, material;
      
      switch(this.type) {
        case GAME.AIAgent.TYPES.FARMER:
          geometry = new THREE.CylinderGeometry(0.3, 0.3, 1.5, 8);
          material = new THREE.MeshLambertMaterial({ color: 0x8B4513 }); // Saddle brown
          break;
        case GAME.AIAgent.TYPES.ANIMAL_HANDLER:
          geometry = new THREE.CylinderGeometry(0.3, 0.3, 1.5, 8);
          material = new THREE.MeshLambertMaterial({ color: 0x228B22 }); // Forest green
          break;
        case GAME.AIAgent.TYPES.COLLECTOR:
          geometry = new THREE.CylinderGeometry(0.3, 0.3, 1.5, 8);
          material = new THREE.MeshLambertMaterial({ color: 0x4169E1 }); // Royal blue
          break;
        case GAME.AIAgent.TYPES.CRAFTER:
          geometry = new THREE.CylinderGeometry(0.3, 0.3, 1.5, 8);
          material = new THREE.MeshLambertMaterial({ color: 0x9370DB }); // Medium purple
          break;
        default:
          geometry = new THREE.CylinderGeometry(0.3, 0.3, 1.5, 8);
          material = new THREE.MeshLambertMaterial({ color: 0x808080 }); // Gray
      }
      
      // Create the mesh
      var mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(this.position.x, 0.75, this.position.z); // Y offset to sit on ground
      mesh.castShadow = true;
      
      // Add a name tag
      var canvas = document.createElement('canvas');
      canvas.width = 256; canvas.height = 64;
      var ctx = canvas.getContext('2d');
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(0, 0, 256, 64);
      ctx.fillStyle = 'white';
      ctx.font = '24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(this.name, 128, 36);
      
      var nameTexture = new THREE.CanvasTexture(canvas);
      var nameMaterial = new THREE.SpriteMaterial({ 
        map: nameTexture, 
        transparent: true,
        depthTest: false
      });
      var nameSprite = new THREE.Sprite(nameMaterial);
      nameSprite.position.set(0, 2, 0);
      nameSprite.scale.set(1.5, 0.5, 1);
      mesh.add(nameSprite);
      
      this.mesh = mesh;
      if (GAME.AIAgent.scene) {
        GAME.AIAgent.scene.add(mesh);
      }
    };
    
    // Initialize the mesh
    agent._initMesh();
    
    // Add to agents list
    this.agents.push(agent);
    
    return agent;
  },
  
  // Default decision making for agents
  _defaultDecision: function(agent) {
    // Simple state machine based on needs
    if (agent.energy < 20) {
      return 'rest';
    } else if (agent.happiness < 30) {
      return 'rest';
    } else if (agent.hunger > 80) {
      return 'seekFood';
    } else {
      // Look for work
      var work = agent._findNearbyWork();
      if (work) {
        return 'work';
      } else {
        return 'idle';
      }
    }
  },
  
  // Update all agents (called each frame)
  update: function(delta) {
    for (var i = 0; i < this.agents.length; i++) {
      var agent = this.agents[i];
      
      // Update decision making periodically
      if (Date.now() - agent.lastDecisionTime > 5000) { // Every 5 seconds
        agent.lastDecisionTime = Date.now();
        var decision = agent.decideAction();
        
        // Change state based on decision
        switch(decision) {
          case 'rest':
            agent.state = agent.STATES.RESTING;
            break;
          case 'work':
            if (agent.currentTask) {
              agent.state = agent.STATES.WORKING;
            } else {
              var work = agent._findNearbyWork();
              if (work) {
                agent._assignWork(work);
                agent.state = agent.STATES.MOVING;
              }
            }
            break;
          case 'seekFood':
            agent.state = agent.STATES.SEEKING;
            break;
          case 'idle':
          default:
            agent.state = agent.STATES.IDLE;
            break;
        }
      }
      
      // Update the agent
      agent.update(delta);
    }
  },
  
  // Render any debug info (optional)
  renderDebug: function() {
    // Could add debug visualization here
  },
  
  // Clean up when shutting down
  dispose: function() {
    for (var i = 0; i < this.agents.length; i++) {
      var agent = this.agents[i];
      if (agent.mesh && this.scene) {
        this.scene.remove(agent.mesh);
        agent.mesh.geometry.dispose();
        agent.mesh.material.dispose();
      }
    }
    this.agents = [];
  }
};
