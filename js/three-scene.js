import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class CyberScene {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.modelGroup = null;
    this.particles = null;
    this.particleCount = 1500;

    // Luces dinámicas
    this.cyanLight = null;
    this.magentaLight = null;

    // Coordenadas normalizadas del mouse (-1 a 1)
    this.mouse = { x: 0, y: 0 };
    this.targetRotation = { x: 0, y: 0 };
    this.currentRotation = { x: 0, y: 0 };

    // Estado de inspección
    this.inspectMode = 'default';
    this.isLoaded = false;

    this.init();
  }

  init() {
    // 1. Escena & Niebla
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x05070c, 0.05);

    // 2. Cámara
    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    this.camera.position.set(0, 0, 7.5);

    // 3. Renderer cinematográfico
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.35;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    // 4. Grupo contenedor para el modelo
    this.modelGroup = new THREE.Group();
    // Centrar ligeramente a la derecha en pantallas grandes para dar espacio a la UI
    if (window.innerWidth > 1024) {
      this.modelGroup.position.x = 0.6;
    }
    this.scene.add(this.modelGroup);

    // 5. Configurar Iluminación Neón PBR
    this.setupLighting();

    // 6. Campo de Partículas de Datos
    this.setupParticles();

    // 7. Cargar el Asset 3D GLB
    this.loadModel();

    // 8. Eventos de Mouse & Resize
    this.setupEvents();

    // 9. Loop de render
    this.animate();
  }

  setupLighting() {
    // Luz ambiental fría
    const ambientLight = new THREE.AmbientLight(0x0c1322, 2.0);
    this.scene.add(ambientLight);

    // Luz Direccional de recorte (Rim light)
    const rimLight = new THREE.DirectionalLight(0xffffff, 2.5);
    rimLight.position.set(0, 5, -5);
    this.scene.add(rimLight);

    // Luz Neón Cyan frontal
    this.cyanLight = new THREE.PointLight(0x00f3ff, 6.0, 15);
    this.cyanLight.position.set(-3, 1, 3);
    this.scene.add(this.cyanLight);

    // Luz Neón Magenta trasera/lateral
    this.magentaLight = new THREE.PointLight(0xff0055, 6.5, 15);
    this.magentaLight.position.set(3.5, -1, 2);
    this.scene.add(this.magentaLight);
  }

  setupParticles() {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.particleCount * 3);
    const colors = new Float32Array(this.particleCount * 3);

    const cyanColor = new THREE.Color(0x00f3ff);
    const magentaColor = new THREE.Color(0xff0055);
    const whiteColor = new THREE.Color(0xffffff);

    for (let i = 0; i < this.particleCount; i++) {
      // Distribución en volumen cilíndrico/esférico
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 16;
      positions[i3 + 1] = (Math.random() - 0.5) * 12;
      positions[i3 + 2] = (Math.random() - 0.5) * 12;

      // Color aleatorio entre Cyan, Magenta y Blanco
      const rand = Math.random();
      let chosen = cyanColor;
      if (rand > 0.6) chosen = magentaColor;
      else if (rand > 0.4) chosen = whiteColor;

      colors[i3] = chosen.r;
      colors[i3 + 1] = chosen.g;
      colors[i3 + 2] = chosen.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.035,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }

  loadModel() {
    const loader = new GLTFLoader();
    const progressEl = document.getElementById('loader-progress');
    const statusEl = document.getElementById('loader-status');
    const preloader = document.getElementById('preloader');

    loader.load(
      'assets/scifi-helmet.glb',
      (gltf) => {
        const model = gltf.scene;

        // Escala y centrado
        model.scale.set(2.4, 2.4, 2.4);
        model.position.set(0, -0.2, 0);

        // Optimizar sombras y materiales PBR
        model.traverse((child) => {
          if (child.isMesh && child.material) {
            child.material.roughness = Math.max(child.material.roughness, 0.2);
            child.material.metalness = Math.min(child.material.metalness + 0.1, 1.0);
          }
        });

        this.modelGroup.add(model);
        this.isLoaded = true;

        // Ocultar preloader con transición suave
        if (progressEl) progressEl.style.width = '100%';
        if (statusEl) statusEl.textContent = '¡SISTEMA EN LÍNEA!';

        setTimeout(() => {
          if (preloader) preloader.classList.add('hidden');
        }, 600);
      },
      (xhr) => {
        if (xhr.lengthComputable && progressEl) {
          const pct = Math.round((xhr.loaded / xhr.total) * 100);
          progressEl.style.width = `${pct}%`;
          if (statusEl) statusEl.textContent = `DESCARGANDO MODELO PBR: ${pct}%`;
        }
      },
      (error) => {
        console.error('Error cargando modelo GLB:', error);
        if (statusEl) statusEl.textContent = 'ERROR CARGANDO ASSET 3D';
      }
    );
  }

  setupEvents() {
    window.addEventListener('mousemove', (e) => {
      // Normalizar mouse de -1 a 1
      this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

      // Movimiento parallax del modelo
      if (this.inspectMode === 'default') {
        this.targetRotation.y = this.mouse.x * 0.65;
        this.targetRotation.x = -this.mouse.y * 0.35;
      }

      // Desplazar luces sutilmente según el ratón para brillo reactivo
      if (this.cyanLight) {
        this.cyanLight.position.x = -3 + this.mouse.x * 1.5;
        this.cyanLight.position.y = 1 + this.mouse.y * 1.5;
      }

      // Actualizar coordenadas en el footer HUD
      const coordsEl = document.getElementById('footer-coords');
      if (coordsEl) {
        const degX = (this.currentRotation.x * 57.3).toFixed(1);
        const degY = (this.currentRotation.y * 57.3).toFixed(1);
        coordsEl.textContent = `ROT_X: ${degX}° // ROT_Y: ${degY}° // PARTICLES: 1,500`;
      }
    });

    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);

      if (window.innerWidth > 1024) {
        this.modelGroup.position.x = 0.6;
      } else {
        this.modelGroup.position.x = 0;
      }
    });
  }

  // Métodos de inspección cuando el usuario hace clic en los módulos HUD
  inspectModule(moduleType) {
    this.inspectMode = moduleType;

    switch (moduleType) {
      case 'optics':
        // Vista frontal directa y acercamiento
        this.targetRotation = { x: 0.05, y: 0.0 };
        break;
      case 'neural':
        // Giro lateral para ver el conector cerebral
        this.targetRotation = { x: -0.1, y: 1.25 };
        break;
      case 'armor':
        // Vista en ángulo de tres cuartos superior
        this.targetRotation = { x: 0.3, y: -0.85 };
        break;
      default:
        this.targetRotation = { x: 0, y: 0 };
    }
  }

  resetView() {
    this.inspectMode = 'default';
    this.targetRotation = { x: 0, y: 0 };
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const time = performance.now() * 0.001;

    // 1. Suavizado inercial (lerp) de la rotación del modelo
    const lerpFactor = this.inspectMode === 'default' ? 0.05 : 0.08;
    this.currentRotation.x += (this.targetRotation.x - this.currentRotation.x) * lerpFactor;
    this.currentRotation.y += (this.targetRotation.y - this.currentRotation.y) * lerpFactor;

    if (this.modelGroup) {
      // Rotación combinada con leve oscilación de respiración/flotación idle
      this.modelGroup.rotation.x = this.currentRotation.x + Math.sin(time * 1.2) * 0.03;
      this.modelGroup.rotation.y = this.currentRotation.y;
      this.modelGroup.position.y = Math.cos(time * 1.5) * 0.08;
    }

    // 2. Animación de las partículas flotantes
    if (this.particles) {
      this.particles.rotation.y = time * 0.02;
      this.particles.rotation.x = Math.sin(time * 0.015) * 0.1;
    }

    // 3. Render
    this.renderer.render(this.scene, this.camera);
  }
}
