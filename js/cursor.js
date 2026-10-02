/**
 * VALKYRIE // TACTICAL LERP CURSOR
 * Cursor cinemático con retraso suave (lerp) y reacción magnética a interactivos.
 */

export class CyberCursor {
  constructor() {
    this.dot = document.getElementById('cursor-dot');
    this.ring = document.getElementById('cursor-ring');

    this.mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    this.ringPos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    this.lerpSpeed = 0.18; // Inercia cinemática

    this.init();
  }

  init() {
    if (!this.dot || !this.ring) return;

    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;

      // El punto central se mueve al instante
      this.dot.style.transform = `translate(${this.mouse.x}px, ${this.mouse.y}px)`;
    });

    // Detectar elementos interactivos para expandir la retícula
    const interactiveElements = document.querySelectorAll('button, a, .hud-card, .brand-badge');
    interactiveElements.forEach((el) => {
      el.addEventListener('mouseenter', () => this.ring.classList.add('hover'));
      el.addEventListener('mouseleave', () => this.ring.classList.remove('hover'));
    });

    this.render();
  }

  render() {
    // Lerp hacia la posición del mouse
    this.ringPos.x += (this.mouse.x - this.ringPos.x) * this.lerpSpeed;
    this.ringPos.y += (this.mouse.y - this.ringPos.y) * this.lerpSpeed;

    this.ring.style.transform = `translate(${this.ringPos.x}px, ${this.ringPos.y}px)`;

    requestAnimationFrame(() => this.render());
  }
}
