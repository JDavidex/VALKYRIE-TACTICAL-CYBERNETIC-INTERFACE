/**
 * VALKYRIE // CORE ORCHESTRATION SCRIPT
 */

import { CyberCursor } from './cursor.js';
import { CyberScene } from './three-scene.js';
import { cyberAudio } from './audio.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Iniciar Cursor Cibernético
  const cursor = new CyberCursor();

  // 2. Iniciar Escena Three.js
  const cyberScene = new CyberScene('webgl-canvas');

  // 3. Configurar Reloj UTC y Telemetría en Vivo
  initLiveTelemetry();

  // 4. Configurar Efecto 3D Tilt en Tarjetas Glassmorphism
  initCardTilt();

  // 5. Vincular Eventos de Audio y Botones
  setupInteractiveControls(cyberScene);
});

/* ==========================================================
   TELEMETRÍA EN VIVO (JITTER REALISTA SCI-FI)
   ========================================================== */
function initLiveTelemetry() {
  const clockEl = document.getElementById('hud-clock');
  const syncEl = document.getElementById('core-sync-val');
  const latencyEl = document.getElementById('latency-val');
  const plasmaPct = document.getElementById('plasma-pct');

  // Reloj
  setInterval(() => {
    const now = new Date();
    if (clockEl) {
      clockEl.textContent = now.toTimeString().split(' ')[0] + ' UTC';
    }
  }, 1000);

  // Micro-fluctuaciones de latencia y sincronización
  setInterval(() => {
    if (syncEl) {
      const sync = (99.7 + Math.random() * 0.28).toFixed(2);
      syncEl.textContent = `${sync}%`;
    }
    if (latencyEl) {
      const lat = (1.0 + Math.random() * 0.5).toFixed(1);
      latencyEl.textContent = `${lat}ms`;
    }
  }, 2500);
}

/* ==========================================================
   EFECTO TILT 3D INTERACTIVO EN TARJETAS
   ========================================================== */
function initCardTilt() {
  const cards = document.querySelectorAll('[data-tilt]');

  cards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Calcular rotación basada en la distancia al centro
      const rotateX = ((y - centerY) / centerY) * -12;
      const rotateY = ((x - centerX) / centerX) * 12;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
    });
  });
}

/* ==========================================================
   CONTROLES INTERACTIVOS, AUDIO Y INSPECCIÓN 3D
   ========================================================== */
function setupInteractiveControls(scene) {
  // Audio Toggle
  const audioBtn = document.getElementById('audio-toggle');
  if (audioBtn) {
    audioBtn.addEventListener('click', () => {
      const isActive = cyberAudio.toggle();
      const text = audioBtn.querySelector('.btn-text');
      if (text) {
        text.textContent = isActive ? 'AUDIO: ONLINE' : 'AUDIO: OFF';
      }
      if (isActive) {
        audioBtn.style.borderColor = 'var(--cyan-glow)';
        audioBtn.style.boxShadow = '0 0 15px var(--cyan-glow)';
      } else {
        audioBtn.style.borderColor = 'var(--cyan-dim)';
        audioBtn.style.boxShadow = 'none';
      }
      cyberAudio.playClick();
    });
  }

  // Sonidos de hover para interactivos
  const hoverables = document.querySelectorAll('button, .hud-card, .brand-badge');
  hoverables.forEach((el) => {
    el.addEventListener('mouseenter', () => cyberAudio.playHover());
  });

  // Inspección de módulos al hacer clic en las tarjetas
  const hudCards = document.querySelectorAll('.hud-card');
  hudCards.forEach((card) => {
    card.addEventListener('click', () => {
      const moduleType = card.getAttribute('data-inspect');
      scene.inspectModule(moduleType);
      cyberAudio.playScan();

      // Feedback visual de selección
      hudCards.forEach((c) => (c.style.borderLeftColor = ''));
      card.style.borderLeftColor = 'var(--cyan-glow)';
    });
  });

  // Botón Diagnóstico Total (Efecto de rotación 360 y escaneo de plasma)
  const diagBtn = document.getElementById('btn-diagnostics');
  if (diagBtn) {
    diagBtn.addEventListener('click', () => {
      cyberAudio.playScan();

      const fill = document.querySelector('.energy-fill');
      const pct = document.getElementById('plasma-pct');
      if (fill && pct) {
        fill.style.width = '100%';
        pct.textContent = '100% OVERDRIVE';
        setTimeout(() => {
          fill.style.width = '87%';
          pct.textContent = '87%';
        }, 3000);
      }

      // Animación de rotación de escaneo en el modelo
      if (scene.modelGroup) {
        scene.targetRotation.y += Math.PI * 2;
      }
    });
  }

  // Botón Resetear Vista
  const resetBtn = document.getElementById('btn-reset-view');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      cyberAudio.playClick();
      scene.resetView();
      hudCards.forEach((c) => (c.style.borderLeftColor = ''));
    });
  }
}
