import * as THREE from 'three'
import { World } from '../physics/World'
import { Car } from './Car'
import { InputManager } from './InputManager'
import { Environment } from './Environment'

export class Game {
  private scene: THREE.Scene
  private camera: THREE.PerspectiveCamera
  private renderer: THREE.WebGLRenderer
  private world: World
  private car: Car
  private inputManager: InputManager
  private clock: THREE.Clock
  private speedDisplay: HTMLElement

  constructor() {
    // Scene setup
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0x87ceeb)
    this.scene.fog = new THREE.Fog(0x87ceeb, 1000, 2000)

    // Camera setup
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      2000
    )
    this.camera.position.set(0, 15, 30)
    this.camera.lookAt(0, 0, 0)

    // Renderer setup
    this.renderer = new THREE.WebGLRenderer({ antialias: true })
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFShadowShadowMap
    document.getElementById('canvas-container')?.appendChild(this.renderer.domElement)

    // Lighting
    this.setupLighting()

    // Physics world
    this.world = new World()

    // Environment
    new Environment(this.scene, this.world)

    // Car
    this.car = new Car(this.scene, this.world)

    // Input manager
    this.inputManager = new InputManager()

    // Clock
    this.clock = new THREE.Clock()

    // Speed display
    this.speedDisplay = document.getElementById('speed-display') || document.createElement('div')

    // Handle window resize
    window.addEventListener('resize', () => this.onWindowResize())
  }

  private setupLighting(): void {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    this.scene.add(ambientLight)

    // Directional light (sun)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(100, 100, 50)
    directionalLight.shadow.mapSize.width = 2048
    directionalLight.shadow.mapSize.height = 2048
    directionalLight.shadow.camera.left = -100
    directionalLight.shadow.camera.right = 100
    directionalLight.shadow.camera.top = 100
    directionalLight.shadow.camera.bottom = -100
    directionalLight.shadow.camera.near = 0.1
    directionalLight.shadow.camera.far = 500
    directionalLight.castShadow = true
    this.scene.add(directionalLight)
  }

  start(): void {
    this.animate()
  }

  private animate = (): void => {
    requestAnimationFrame(this.animate)

    const deltaTime = Math.min(this.clock.getDelta(), 0.016) // Max 60 FPS

    // Update input
    this.inputManager.update()

    // Update car
    this.car.update(deltaTime, this.inputManager)

    // Update physics
    this.world.step(deltaTime)

    // Update camera to follow car
    this.updateCamera()

    // Update speed display
    const speed = this.car.getSpeed()
    this.speedDisplay.textContent = `السرعة / Speed: ${Math.abs(speed).toFixed(1)} km/h`

    // Render
    this.renderer.render(this.scene, this.camera)
  }

  private updateCamera(): void {
    const carPosition = this.car.getPosition()
    const targetX = carPosition.x - Math.sin(this.car.getRotation()) * 30
    const targetY = carPosition.y + 15
    const targetZ = carPosition.z + Math.cos(this.car.getRotation()) * 30

    this.camera.position.lerp(new THREE.Vector3(targetX, targetY, targetZ), 0.1)
    this.camera.lookAt(carPosition.x, carPosition.y + 5, carPosition.z)
  }

  private onWindowResize(): void {
    const width = window.innerWidth
    const height = window.innerHeight

    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()

    this.renderer.setSize(width, height)
  }
}
