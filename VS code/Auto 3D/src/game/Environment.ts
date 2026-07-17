import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import { World } from '../physics/World'

export class Environment {
  private scene: THREE.Scene
  private world: World

  constructor(scene: THREE.Scene, world: World) {
    this.scene = scene
    this.world = world
    this.createTerrain()
    this.createBuildings()
  }

  private createTerrain(): void {
    // Ground plane
    const groundGeometry = new THREE.PlaneGeometry(500, 500)
    const groundMaterial = new THREE.MeshPhongMaterial({ color: 0x228b22 })
    const ground = new THREE.Mesh(groundGeometry, groundMaterial)
    ground.rotation.x = -Math.PI / 2
    ground.receiveShadow = true
    ground.castShadow = false
    this.scene.add(ground)

    // Physics ground
    const groundBody = new CANNON.Body({
      mass: 0,
      shape: new CANNON.Plane(),
    })
    groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
    this.world.addBody(groundBody)
  }

  private createBuildings(): void {
    const buildingPositions = [
      { x: 50, z: 50, color: 0x8b4513 },
      { x: -50, z: 50, color: 0x8b4513 },
      { x: 50, z: -50, color: 0x8b4513 },
      { x: -50, z: -50, color: 0x8b4513 },
      { x: 100, z: 0, color: 0x696969 },
      { x: -100, z: 0, color: 0x696969 },
      { x: 0, z: 100, color: 0x696969 },
      { x: 0, z: -100, color: 0x696969 },
    ]

    buildingPositions.forEach((pos) => {
      const buildingGeometry = new THREE.BoxGeometry(30, 30, 30)
      const buildingMaterial = new THREE.MeshPhongMaterial({ color: pos.color })
      const building = new THREE.Mesh(buildingGeometry, buildingMaterial)
      building.position.set(pos.x, 15, pos.z)
      building.castShadow = true
      building.receiveShadow = true
      this.scene.add(building)
    })
  }
}
