import * as THREE from 'three'
import * as CANNON from 'cannon-es'

export class World {
  private cannonWorld: CANNON.World

  constructor() {
    this.cannonWorld = new CANNON.World()
    this.cannonWorld.gravity.set(0, -9.82, 0)
    this.cannonWorld.defaultContactMaterial.friction = 0.4
  }

  step(deltaTime: number): void {
    this.cannonWorld.step(1 / 60, deltaTime, 3)
  }

  getCannonWorld(): CANNON.World {
    return this.cannonWorld
  }

  addBody(body: CANNON.Body): void {
    this.cannonWorld.addBody(body)
  }

  removeBody(body: CANNON.Body): void {
    this.cannonWorld.removeBody(body)
  }
}
