import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import { World } from './World'

export class Vehicle {
  private body: CANNON.Body
  private position: THREE.Vector3

  constructor(world: World, initialPosition: THREE.Vector3) {
    this.position = initialPosition.clone()

    // Create physics body
    const shape = new CANNON.Box(new CANNON.Vec3(1, 0.75, 2))
    this.body = new CANNON.Body({ mass: 1500 })
    this.body.addShape(shape)
    this.body.position.set(initialPosition.x, initialPosition.y, initialPosition.z)

    // Add to world
    world.addBody(this.body)
  }

  setPosition(position: THREE.Vector3): void {
    this.position = position.clone()
    this.body.position.set(position.x, position.y, position.z)
  }

  getPosition(): THREE.Vector3 {
    return this.position.clone()
  }

  getCannonBody(): CANNON.Body {
    return this.body
  }
}
