export class InputManager {
  private keys: { [key: string]: boolean } = {}

  constructor() {
    window.addEventListener('keydown', (event) => {
      this.keys[event.key.toLowerCase()] = true
    })

    window.addEventListener('keyup', (event) => {
      this.keys[event.key.toLowerCase()] = false
    })
  }

  isKeyPressed(key: string): boolean {
    return this.keys[key.toLowerCase()] || false
  }

  getDirection(): { forward: number; backward: number; left: number; right: number } {
    return {
      forward: this.isKeyPressed('arrowup') || this.isKeyPressed('w') ? 1 : 0,
      backward: this.isKeyPressed('arrowdown') || this.isKeyPressed('s') ? 1 : 0,
      left: this.isKeyPressed('arrowleft') || this.isKeyPressed('a') ? 1 : 0,
      right: this.isKeyPressed('arrowright') || this.isKeyPressed('d') ? 1 : 0,
    }
  }

  isBrakingPressed(): boolean {
    return this.isKeyPressed(' ') // Space bar
  }

  update(): void {
    // Input is handled in keydown/keyup listeners
  }
}
