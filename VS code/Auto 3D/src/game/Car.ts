import * as THREE from 'three'
import { Vehicle } from '../physics/Vehicle'
import { World } from '../physics/World'
import { InputManager } from './InputManager'

export class Car {
  private mesh: THREE.Group
  private body: Vehicle
  private speed: number = 0
  private rotation: number = 0

  constructor(scene: THREE.Scene, world: World) {
    this.mesh = new THREE.Group()
    scene.add(this.mesh)

    // Create physics body
    this.body = new Vehicle(world, new THREE.Vector3(0, 2, 0))

    // Create car mesh
    this.createCarMesh()

    // Position
    this.mesh.position.copy(this.body.getPosition())
  }

  private createCarMesh(): void {
    // Car body
    const bodyGeometry = new THREE.BoxGeometry(2, 1.5, 4)
    const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 })
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial)
    body.position.y = 0.75
    body.castShadow = true
    body.receiveShadow = true
    this.mesh.add(body)

    // Car cabin
    const cabinGeometry = new THREE.BoxGeometry(1.8, 1, 1.5)
    const cabinMaterial = new THREE.MeshPhongMaterial({ color: 0xcc0000 })
    const cabin = new THREE.Mesh(cabinGeometry, cabinMaterial)
    cabin.position.y = 1.7
    cabin.position.z = -0.3
    cabin.castShadow = true
    cabin.receiveShadow = true
    this.mesh.add(cabin)

    // Wheels
    const wheelPositions = [
      [-1, 0.5, 1],
      [1, 0.5, 1],
      [-1, 0.5, -1],
      [1, 0.5, -1],
    ]

    wheelPositions.forEach((pos) => {
      const wheelGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.4, 16)
      const wheelMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 })
      const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial)
      wheel.rotation.z = Math.PI / 2
      wheel.position.set(pos[0], pos[1], pos[2])
      wheel.castShadow = true
      wheel.receiveShadow = true
      this.mesh.add(wheel)
    })

    // Headlights
    const headlightGeometry = new THREE.SphereGeometry(0.2, 8, 8)
    const headlightMaterial = new THREE.MeshPhongMaterial({ color: 0xffff00, emissive: 0xffff00 })
    const headlightLeft = new THREE.Mesh(headlightGeometry, headlightMaterial)
    const headlightRight = new THREE.Mesh(headlightGeometry, headlightMaterial)
    headlightLeft.position.set(-0.7, 0.8, 2)
    headlightRight.position.set(0.7, 0.8, 2)
    this.mesh.add(headlightLeft)
    this.mesh.add(headlightRight)
  }

  update(deltaTime: number, inputManager: InputManager): void {
    const input = inputManager.getDirection()
    const isBraking = inputManager.isBrakingPressed()

    // Calculate acceleration/deceleration
    const maxSpeed = 150 // km/h
    const acceleration = 100
    const friction = 30
    const brakingFriction = 150

    let targetSpeed = 0

    if (input.forward) {
      targetSpeed = maxSpeed
    } else if (input.backward) {
      targetSpeed = -maxSpeed * 0.5
    }

    // Apply acceleration/deceleration
    if (Math.abs(targetSpeed) > Math.abs(this.speed)) {
      this.speed += (targetSpeed - this.speed) * acceleration * deltaTime
    } else {
      const frictionForce = isBraking ? brakingFriction : friction
      this.speed *= Math.exp(-frictionForce * deltaTime)
    }

    // Limit speed
    this.speed = Math.max(-maxSpeed * 0.7, Math.min(this.speed, maxSpeed))

    // Steering
    const steerSensitivity = 3
    if (Math.abs(this.speed) > 5) {
      if (input.left) {
        this.rotation += steerSensitivity * deltaTime * (this.speed / maxSpeed)
      }
      if (input.right) {
        this.rotation -= steerSensitivity * deltaTime * (this.speed / maxSpeed)
      }
    }

    // Update position based on speed and rotation
    const moveDistance = (this.speed / 3.6) * deltaTime // Convert km/h to m/s
    const newX = this.body.getPosition().x + Math.sin(this.rotation) * moveDistance
    const newZ = this.body.getPosition().z + Math.cos(this.rotation) * moveDistance

    // Keep car on ground (simple height)
    const newY = 1

    this.body.setPosition(new THREE.Vector3(newX, newY, newZ))

    // Update mesh position and rotation
    this.mesh.position.copy(this.body.getPosition())
    this.mesh.rotation.y = this.rotation
  }

  getPosition(): THREE.Vector3 {
    return this.body.getPosition()
  }

  getRotation(): number {
    return this.rotation
  }

  getSpeed(): number {
    return this.speed
  }
}
