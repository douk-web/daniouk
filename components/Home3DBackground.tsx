'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

type DragState = {
  yaw: number;
  pitch: number;
};

type HoverState = {
  active: boolean;
  targetYaw: number;
  targetPitch: number;
  currentYaw: number;
  currentPitch: number;
};

type SceneController = {
  update?: (delta: number, elapsed: number, scroll: number, drag: DragState) => void;
  dispose?: () => void;
};

type SceneFactory = {
  name: string;
  create: (params: {
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    root: THREE.Group;
  }) => SceneController;
};

function createCircleTexture(color: string) {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, color);
  gradient.addColorStop(0.6, color);
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(32, 32, 30, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function createGlowTexture(color: string) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  gradient.addColorStop(0, color);
  gradient.addColorStop(0.4, color);
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 256);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function createPlanetTexture(baseColor: string, accentColor: string) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < 7; i += 1) {
    ctx.fillStyle = accentColor;
    ctx.globalAlpha = 0.2 + Math.random() * 0.35;
    ctx.beginPath();
    const y = Math.random() * canvas.height;
    const height = 6 + Math.random() * 20;
    ctx.ellipse(canvas.width / 2, y, canvas.width / 2, height, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.globalAlpha = 0.08;
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 900; i += 1) {
    ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 1, 1);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 1);
  return texture;
}

function createStars(
  scene: THREE.Scene,
  count: number,
  spread: number,
  color = 0xffffff,
  size = 2.2
) {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i += 1) {
    const i3 = i * 3;
    positions[i3] = (Math.random() - 0.5) * spread;
    positions[i3 + 1] = (Math.random() - 0.5) * spread;
    positions[i3 + 2] = (Math.random() - 0.5) * spread;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const texture = createCircleTexture('rgba(255, 255, 255, 1)');
  const material = new THREE.PointsMaterial({
    color,
    size,
    sizeAttenuation: true,
    map: texture,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
    alphaTest: 0.2,
  });
  const points = new THREE.Points(geometry, material);
  scene.add(points);

  return points;
}

function applyDragLookAt(
  camera: THREE.PerspectiveCamera,
  target: THREE.Vector3,
  drag: DragState
) {
  const direction = new THREE.Vector3().subVectors(target, camera.position);
  const distance = direction.length();
  direction.normalize();
  const euler = new THREE.Euler(drag.pitch, drag.yaw, 0, 'YXZ');
  direction.applyEuler(euler).multiplyScalar(distance);
  const rotatedTarget = new THREE.Vector3().addVectors(camera.position, direction);
  camera.lookAt(rotatedTarget);
}

function disposeObject(object: THREE.Object3D) {
  object.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.geometry.dispose();
      if (Array.isArray(child.material)) {
        child.material.forEach((material) => material.dispose());
      } else {
        child.material.dispose();
      }
    }

    if (child instanceof THREE.Points || child instanceof THREE.Line) {
      child.geometry.dispose();
      if (Array.isArray(child.material)) {
        child.material.forEach((material) => material.dispose());
      } else {
        child.material.dispose();
      }
    }
  });
}

// Add new background scenes here. Each entry defines the setup and animation for a scene.
const sceneFactories: SceneFactory[] = [
  {
    name: 'Solar System',
    create: ({ scene, camera, root }) => {
      scene.background = new THREE.Color(0x000000);

      camera.position.set(0, 70, 240);
      camera.lookAt(0, 0, 0);

      const ambient = new THREE.AmbientLight(0x888888, 0.35);
      const hemi = new THREE.HemisphereLight(0xcccccc, 0x111111, 0.35);
      const sunLight = new THREE.PointLight(0xffffff, 4.5, 1600, 2);
      sunLight.position.set(0, 0, 0);
      const rimLight = new THREE.DirectionalLight(0xaaaaaa, 0.5);
      rimLight.position.set(-120, 140, 80);
      scene.add(ambient, hemi, sunLight, rimLight);

      const stars = createStars(scene, 2600, 1400, 0xffffff, 2.4);
      const starsFar = createStars(scene, 1400, 2200, 0xcccccc, 1.6);

      const sunGeometry = new THREE.SphereGeometry(18, 48, 48);
      const sunMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        emissive: 0xdddddd,
        emissiveIntensity: 1.9,
        roughness: 0.2,
        metalness: 0.1,
        clearcoat: 0.4,
        clearcoatRoughness: 0.2,
      });
      const sun = new THREE.Mesh(sunGeometry, sunMaterial);
      root.add(sun);

      const sunGlow = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: createGlowTexture('rgba(255, 255, 255, 0.85)'),
          transparent: true,
          depthWrite: false,
        })
      );
      sunGlow.scale.set(140, 140, 1);
      root.add(sunGlow);

      const planetData = [
        {
          size: 2.6,
          distance: 28,
          orbitSeconds: 5,
          color: 0xb5b5b5,
          emissive: 0x222222,
          base: '#9fa0a5',
          accent: '#4e4f58',
        },
        {
          size: 3.8,
          distance: 40,
          orbitSeconds: 10,
          color: 0xaaaaaa,
          emissive: 0x1a1a1a,
          base: '#aaaaaa',
          accent: '#666666',
        },
        {
          size: 4.4,
          distance: 55,
          orbitSeconds: 15,
          color: 0x888888,
          emissive: 0x151515,
          base: '#888888',
          accent: '#444444',
        },
        {
          size: 4.6,
          distance: 70,
          orbitSeconds: 28,
          color: 0xcccccc,
          emissive: 0x1a1a1a,
          base: '#cccccc',
          accent: '#777777',
        },
        {
          size: 7.8,
          distance: 95,
          orbitSeconds: 60,
          color: 0x999999,
          emissive: 0x222222,
          base: '#999999',
          accent: '#555555',
        },
        {
          size: 6.8,
          distance: 120,
          orbitSeconds: 90,
          color: 0xbbbbbb,
          emissive: 0x1a1a1a,
          ring: true,
          base: '#bbbbbb',
          accent: '#666666',
        },
        {
          size: 5.6,
          distance: 145,
          orbitSeconds: 105,
          color: 0x777777,
          emissive: 0x151515,
          base: '#777777',
          accent: '#333333',
        },
        {
          size: 5.2,
          distance: 170,
          orbitSeconds: 120,
          color: 0x666666,
          emissive: 0x111111,
          base: '#666666',
          accent: '#2a2a2a',
        },
      ];

      const orbitGroup = new THREE.Group();
      root.add(orbitGroup);

      const planetTextures: THREE.Texture[] = [];
      const planets = planetData.map((planet, index) => {
        const pivot = new THREE.Group();
        orbitGroup.add(pivot);

        const startAngle = Math.random() * Math.PI * 2;
        pivot.rotation.y = startAngle;

        const texture = createPlanetTexture(planet.base ?? '#888888', planet.accent ?? '#444444');
        planetTextures.push(texture);
        const geometry = new THREE.SphereGeometry(planet.size, 32, 32);
        const material = new THREE.MeshPhysicalMaterial({
          color: planet.color,
          map: texture,
          roughness: 0.35,
          metalness: 0.25,
          clearcoat: 0.25,
          clearcoatRoughness: 0.35,
          emissive: planet.emissive ?? 0x000000,
          emissiveIntensity: 0.35,
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.x = planet.distance;
        mesh.rotation.z = (index % 2 === 0 ? 1 : -1) * 0.2;
        pivot.add(mesh);

        if (planet.ring) {
          const ringGeometry = new THREE.RingGeometry(planet.size * 1.4, planet.size * 2.4, 64);
          const ringMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xcccccc,
            transparent: true,
            opacity: 0.6,
            side: THREE.DoubleSide,
            roughness: 0.4,
          });
          const ring = new THREE.Mesh(ringGeometry, ringMaterial);
          ring.rotation.x = Math.PI / 2.2;
          ring.rotation.z = Math.PI / 10;
          mesh.add(ring);
        }

        const orbitGeometry = new THREE.RingGeometry(planet.distance - 0.25, planet.distance + 0.25, 120);
        const orbitMaterial = new THREE.MeshBasicMaterial({
          color: 0x444444,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.35,
        });
        const orbitMesh = new THREE.Mesh(orbitGeometry, orbitMaterial);
        orbitMesh.rotation.x = Math.PI / 2;
        root.add(orbitMesh);

        const speed = (Math.PI * 2) / planet.orbitSeconds;
        return { pivot, mesh, speed, startAngle };
      });

      const asteroidGeometry = new THREE.SphereGeometry(0.8, 8, 8);
      const asteroidMaterial = new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.9 });
      const asteroids: THREE.Mesh[] = [];
      for (let i = 0; i < 120; i += 1) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 82 + Math.random() * 12;
        const asteroid = new THREE.Mesh(asteroidGeometry, asteroidMaterial);
        asteroid.position.set(Math.cos(angle) * radius, (Math.random() - 0.5) * 6, Math.sin(angle) * radius);
        root.add(asteroid);
        asteroids.push(asteroid);
      }

      let sunPulse = 0;

      return {
        update: (delta, elapsed, scroll, drag) => {
          sunPulse += delta;
          sun.scale.setScalar(1 + Math.sin(sunPulse * 2) * 0.03);
          sunGlow.scale.setScalar(1.05 + Math.sin(sunPulse * 2) * 0.06);
          planets.forEach((planet) => {
            planet.pivot.rotation.y += delta * planet.speed;
            planet.mesh.rotation.y += delta * 0.4;
          });
          asteroids.forEach((asteroid) => {
            asteroid.rotation.x += delta * 0.4;
            asteroid.rotation.y += delta * 0.3;
          });
          const orbitRadius = THREE.MathUtils.lerp(260, 140, scroll);
          const angle = scroll * Math.PI * 2;
          camera.position.set(Math.sin(angle) * orbitRadius, 70 + scroll * 30, Math.cos(angle) * orbitRadius);
          root.rotation.y = scroll * Math.PI * 0.35;
          applyDragLookAt(camera, new THREE.Vector3(0, 0, 0), drag);
        },
        dispose: () => {
          scene.remove(stars);
          scene.remove(starsFar);
          stars.geometry.dispose();
          if (Array.isArray(stars.material)) {
            stars.material.forEach((material) => material.dispose());
          } else {
            stars.material.map?.dispose();
            stars.material.dispose();
          }
          starsFar.geometry.dispose();
          if (Array.isArray(starsFar.material)) {
            starsFar.material.forEach((material) => material.dispose());
          } else {
            starsFar.material.map?.dispose();
            starsFar.material.dispose();
          }
          planetTextures.forEach((texture) => texture.dispose());
          if (sunGlow.material instanceof THREE.Material) {
            (sunGlow.material as THREE.SpriteMaterial).map?.dispose();
            sunGlow.material.dispose();
          }
          asteroidGeometry.dispose();
          asteroidMaterial.dispose();
          disposeObject(root);
        },
      };
    },
  },
];

export default function Home3DBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<SceneController | null>(null);
  const animationRef = useRef<number | null>(null);
  const scrollRef = useRef(0);
  const dragRef = useRef<DragState>({ yaw: 0, pitch: 0 });
  // const hoverRef = useRef<HoverState>({
  //   active: false,
  //   targetYaw: 0,
  //   targetPitch: 0,
  //   currentYaw: 0,
  //   currentPitch: 0,
  // });
  const isDraggingRef = useRef(false);
  const lastPointerRef = useRef({ x: 0, y: 0 });

  const selectedScene = sceneFactories[0];

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 2000);
    const root = new THREE.Group();
    scene.add(root);

    controllerRef.current = selectedScene.create({ scene, camera, renderer, root });

    const clock = new THREE.Clock();

    const handleResize = () => {
      const { innerWidth, innerHeight } = window;
      renderer.setSize(innerWidth, innerHeight);
      camera.aspect = innerWidth / innerHeight;
      camera.updateProjectionMatrix();
    };

    const updateScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      scrollRef.current = maxScroll > 0 ? window.scrollY / maxScroll : 0;
    };

    const dragSurface = document.getElementById('home-drag-surface');

    const handlePointerDown = (event: PointerEvent) => {
      if (!dragSurface || event.button !== 0) return;
      isDraggingRef.current = true;
      lastPointerRef.current = { x: event.clientX, y: event.clientY };
      dragSurface.setPointerCapture(event.pointerId);
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!isDraggingRef.current) return;
      const deltaX = event.clientX - lastPointerRef.current.x;
      const deltaY = event.clientY - lastPointerRef.current.y;
      lastPointerRef.current = { x: event.clientX, y: event.clientY };

      dragRef.current.yaw += deltaX * 0.003;
      dragRef.current.pitch += deltaY * 0.003;
      dragRef.current.pitch = THREE.MathUtils.clamp(dragRef.current.pitch, -0.6, 0.6);
    };

    const handlePointerUp = (event: PointerEvent) => {
      if (!dragSurface) return;
      isDraggingRef.current = false;
      dragSurface.releasePointerCapture(event.pointerId);
    };

    // const panZone = document.getElementById('home-pan-zone');

    // const updateHoverTarget = (event: PointerEvent) => {
    //   const element = document.elementFromPoint(event.clientX, event.clientY) as HTMLElement | null;
    //   const isBlocked = Boolean(element?.closest('[data-pan-block="true"]'));

    //   if (!panZone) {
    //     hoverRef.current.active = false;
    //   } else {
    //     const rect = panZone.getBoundingClientRect();
    //     const inZone =
    //       event.clientX >= rect.left &&
    //       event.clientX <= rect.right &&
    //       event.clientY >= rect.top &&
    //       event.clientY <= rect.bottom;
    //     hoverRef.current.active = inZone && !isBlocked;
    //   }

    //   if (!hoverRef.current.active || isDraggingRef.current) return;

    //   const maxYaw = 0.35;
    //   const maxPitch = 0.22;
    //   const normalizedX = event.clientX / window.innerWidth - 0.5;
    //   const normalizedY = event.clientY / window.innerHeight - 0.5;
    //   hoverRef.current.targetYaw = normalizedX * maxYaw;
    //   hoverRef.current.targetPitch = -normalizedY * maxPitch;
    // };

    updateScroll();

    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.elapsedTime;
      const scroll = scrollRef.current;
      // const smoothingActive = 0.06;
      // const smoothingReturn = 0.015;
      // const targetYaw = hoverRef.current.active ? hoverRef.current.targetYaw : 0;
      // const targetPitch = hoverRef.current.active ? hoverRef.current.targetPitch : 0;
      // const smoothing = hoverRef.current.active ? smoothingActive : smoothingReturn;
      // hoverRef.current.currentYaw = THREE.MathUtils.lerp(
      //   hoverRef.current.currentYaw,
      //   targetYaw,
      //   smoothing
      // );
      // hoverRef.current.currentPitch = THREE.MathUtils.lerp(
      //   hoverRef.current.currentPitch,
      //   targetPitch,
      //   smoothing
      // );

      // const combinedDrag: DragState = {
      //   yaw: dragRef.current.yaw + hoverRef.current.currentYaw,
      //   pitch: dragRef.current.pitch + hoverRef.current.currentPitch,
      // };

      // controllerRef.current?.update?.(delta, elapsed, scroll, combinedDrag);
      controllerRef.current?.update?.(delta, elapsed, scroll, dragRef.current);
      renderer.render(scene, camera);
    };

    animate();

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', updateScroll, { passive: true });
    dragSurface?.addEventListener('pointerdown', handlePointerDown);
    dragSurface?.addEventListener('pointermove', handlePointerMove);
    dragSurface?.addEventListener('pointerup', handlePointerUp);
    dragSurface?.addEventListener('pointerleave', handlePointerUp);
    // window.addEventListener('pointermove', updateHoverTarget);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', updateScroll);
      dragSurface?.removeEventListener('pointerdown', handlePointerDown);
      dragSurface?.removeEventListener('pointermove', handlePointerMove);
      dragSurface?.removeEventListener('pointerup', handlePointerUp);
      dragSurface?.removeEventListener('pointerleave', handlePointerUp);
      // window.removeEventListener('pointermove', updateHoverTarget);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      controllerRef.current?.dispose?.();
      renderer.dispose();
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [selectedScene]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 -z-10 h-full w-full"
      style={{ pointerEvents: 'none' }}
    />
  );
}
