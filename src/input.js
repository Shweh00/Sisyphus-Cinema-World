export class Input {
  constructor(canvas) {
    this.left = false;
    this.right = false;
    this.up = false;
    this.jumpPressed = false;
    this.anyPressed = false;
    this.pointerDown = false;
    this.pointerSide = 0;
    this.canvas = canvas;
    this.bind();
  }

  bind() {
    window.addEventListener("keydown", (e) => {
      if (e.repeat) return;
      if (["ArrowLeft", "a", "A"].includes(e.key)) this.left = true;
      if (["ArrowRight", "d", "D"].includes(e.key)) this.right = true;
      if (["ArrowUp", "w", "W"].includes(e.key)) this.up = true;
      if (e.key === " " || e.key === "ArrowUp" || e.key === "w" || e.key === "W") this.pressJump();
    });

    window.addEventListener("keyup", (e) => {
      if (["ArrowLeft", "a", "A"].includes(e.key)) this.left = false;
      if (["ArrowRight", "d", "D"].includes(e.key)) this.right = false;
      if (["ArrowUp", "w", "W"].includes(e.key)) this.up = false;
    });

    this.canvas.addEventListener("pointerdown", (e) => {
      this.pointerDown = true;
      this.anyPressed = true;
      this.updatePointer(e);
      this.pressJump();
      this.canvas.setPointerCapture(e.pointerId);
    });
    this.canvas.addEventListener("pointermove", (e) => this.updatePointer(e));
    this.canvas.addEventListener("pointerup", (e) => {
      this.pointerDown = false;
      this.pointerSide = 0;
      this.left = false;
      this.right = false;
      this.canvas.releasePointerCapture(e.pointerId);
    });
    this.canvas.addEventListener("pointercancel", () => {
      this.pointerDown = false;
      this.pointerSide = 0;
      this.left = false;
      this.right = false;
    });
  }

  updatePointer(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const deadZone = rect.width * 0.16;
    this.pointerSide = x < rect.width / 2 - deadZone ? -1 : x > rect.width / 2 + deadZone ? 1 : 0;
    this.left = this.pointerDown && this.pointerSide < 0;
    this.right = this.pointerDown && this.pointerSide > 0;
  }

  pressJump() {
    this.jumpPressed = true;
    this.anyPressed = true;
  }

  consumeJump() {
    const wasPressed = this.jumpPressed;
    this.jumpPressed = false;
    return wasPressed;
  }

  direction() {
    return (this.right ? 1 : 0) - (this.left ? 1 : 0);
  }
}
