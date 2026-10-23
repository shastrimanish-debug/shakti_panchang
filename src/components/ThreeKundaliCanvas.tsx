import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RASHIS } from '../services/astronomy';
import { triggerHapticSelection } from '../utils/haptics';

export interface ThreeFormattedPlanet {
  name: string;
  degreeStr: string;
  isRetro: boolean;
  isBenefic: boolean;
  english: string;
}

export interface ThreeKundaliCanvasProps {
  chartStyle: 'north' | 'south';
  ascSignIdx: number;
  housePlanets: Record<number, ThreeFormattedPlanet[]>;
  signPlanets: Record<number, ThreeFormattedPlanet[]>;
  showDegrees: boolean;
  fontScale?: 'large' | 'xlarge';
}

interface House3DCoord {
  house: number;
  x: number;
  z: number;
  rashiX: number;
  rashiZ: number;
}

// 3D board spans from -5.0 to +5.0 in X and Z (total width = 10 units)
const NORTH_3D_HOUSES: House3DCoord[] = [
  { house: 1, x: 0, z: -2.35, rashiX: 0, rashiZ: -4.15 },
  { house: 2, x: -2.45, z: -3.65, rashiX: -3.95, rashiZ: -4.35 },
  { house: 3, x: -3.65, z: -2.45, rashiX: -4.35, rashiZ: -1.35 },
  { house: 4, x: -2.35, z: 0, rashiX: -4.15, rashiZ: 0 },
  { house: 5, x: -3.65, z: 2.45, rashiX: -4.35, rashiZ: 1.35 },
  { house: 6, x: -2.45, z: 3.65, rashiX: -3.95, rashiZ: 4.35 },
  { house: 7, x: 0, z: 2.35, rashiX: 0, rashiZ: 4.15 },
  { house: 8, x: 2.45, z: 3.65, rashiX: 3.95, rashiZ: 4.35 },
  { house: 9, x: 3.65, z: 2.45, rashiX: 4.35, rashiZ: 1.35 },
  { house: 10, x: 2.35, z: 0, rashiX: 4.15, rashiZ: 0 },
  { house: 11, x: 3.65, z: -2.45, rashiX: 4.35, rashiZ: -1.35 },
  { house: 12, x: 2.45, z: -3.65, rashiX: 3.95, rashiZ: -4.35 },
];

const SOUTH_3D_CELLS = [
  { signIdx: 11, row: 0, col: 0, name: 'मीन' },
  { signIdx: 0, row: 0, col: 1, name: 'मेष' },
  { signIdx: 1, row: 0, col: 2, name: 'वृषभ' },
  { signIdx: 2, row: 0, col: 3, name: 'मिथुन' },
  { signIdx: 10, row: 1, col: 0, name: 'कुंभ' },
  { signIdx: 3, row: 1, col: 3, name: 'कर्क' },
  { signIdx: 9, row: 2, col: 0, name: 'मकर' },
  { signIdx: 4, row: 2, col: 3, name: 'सिंह' },
  { signIdx: 8, row: 3, col: 0, name: 'धनु' },
  { signIdx: 7, row: 3, col: 1, name: 'वृश्चिक' },
  { signIdx: 6, row: 3, col: 2, name: 'तुला' },
  { signIdx: 5, row: 3, col: 3, name: 'कन्या' },
];

const PLANET_3D_COLORS: Record<string, number> = {
  सूर्य: 0xf97316,
  चंद्र: 0x38bdf8,
  मंगल: 0xef4444,
  बुध: 0x22c55e,
  गुरु: 0xfacc15,
  शुक्र: 0xf472b6,
  शनि: 0x818cf8,
  राहु: 0xa855f7,
  केतु: 0xfb923c,
};

// Pre-allocated math helpers at module scope (zero GC in render loop)
const _camTargetPos = new THREE.Vector3();
const _lookTargetPos = new THREE.Vector3(0, 0, 0);

function detectSoftwareWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param));
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

/**
 * Creates a high-contrast, large-font CanvasTexture for a group of planets in a house/sign
 */
function createPlanetClusterBadgeTexture(
  planets: ThreeFormattedPlanet[],
  showDegrees: boolean,
  fontScale: 'large' | 'xlarge',
  maxAnisotropy: number
): { texture: THREE.CanvasTexture; aspect: number } {
  const canvas = document.createElement('canvas');
  const cols = planets.length > 2 ? 2 : 1;
  const rows = Math.ceil(planets.length / cols);

  const cellW = fontScale === 'xlarge' ? 370 : 330;
  const cellH = fontScale === 'xlarge' ? 112 : 98;
  const padX = 28;
  const padY = 22;

  const W = cols * cellW + padX * 2;
  const H = rows * cellH + padY * 2;
  canvas.width = W;
  canvas.height = H;

  const ctx = canvas.getContext('2d');
  if (ctx) {
    // High-contrast deep obsidian-gold plaque background
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#1C0E07');
    grad.addColorStop(1, '#0F0703');
    ctx.fillStyle = grad;

    ctx.beginPath();
    ctx.roundRect(6, 6, W - 12, H - 12, 26);
    ctx.fill();

    // Bright high-contrast double gold border
    ctx.strokeStyle = '#FBBF24';
    ctx.lineWidth = 6;
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255, 248, 220, 0.35)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(14, 14, W - 28, H - 28, 20);
    ctx.stroke();

    planets.forEach((p, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      const cx = padX + col * cellW + cellW / 2;
      const cy = padY + row * cellH + cellH / 2;

      // High-contrast color coding on dark plaque
      const nameColor = p.isRetro
        ? '#FCA5A5' // Bright Coral Red for Retrograde
        : p.isBenefic
        ? '#86EFAC' // High-contrast Mint Green for Benefic
        : '#FEF08A'; // Radiant Gold-Cream for Surya/Mangal/Shani

      const fontSize = fontScale === 'xlarge' ? 54 : 46;
      const degFontSize = fontScale === 'xlarge' ? 38 : 33;

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const retroTag = p.isRetro ? '(व)' : '';
      const degTag = showDegrees ? ` ${p.degreeStr}` : '';
      const fullLabel = `${p.name}${retroTag}${degTag}`;

      // Strong dark text shadow + outline for maximum contrast
      ctx.font = `900 ${fontSize}px "Tiro Devanagari Hindi", "Noto Sans Devanagari", sans-serif`;
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 7;
      ctx.strokeText(fullLabel, cx, cy - ( degFontSize ? 2 : 0 ));

      ctx.fillStyle = nameColor;
      ctx.fillText(fullLabel, cx, cy - ( degFontSize ? 2 : 0 ));
    });
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = maxAnisotropy;
  texture.needsUpdate = true;
  return { texture, aspect: W / H };
}

/**
 * Creates a high-contrast Zodiac Sign / Rashi number medallion badge texture
 */
function createRashiMedallionTexture(
  signNum: number,
  rashiName: string,
  isLagna: boolean,
  maxAnisotropy: number
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = isLagna ? '#9A3412' : '#FFFBEB';
    ctx.strokeStyle = isLagna ? '#FDE047' : '#78350F';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.roundRect(8, 8, 240, 112, 32);
    ctx.fill();
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = isLagna ? '#FEF08A' : '#291305';
    ctx.font = '900 44px sans-serif';
    ctx.fillText(
      isLagna ? `लग्न ${signNum} • ${rashiName}` : `${signNum} • ${rashiName}`,
      128,
      64
    );
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = maxAnisotropy;
  texture.needsUpdate = true;
  return texture;
}

export const ThreeKundaliCanvas: React.FC<ThreeKundaliCanvasProps> = ({
  chartStyle,
  ascSignIdx,
  housePlanets,
  signPlanets,
  showDegrees,
  fontScale: initialFontScale = 'xlarge',
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [cameraPreset, setCameraPreset] = useState<'perspective' | 'deep' | 'top'>('perspective');
  const [fontScale, setFontScale] = useState<'large' | 'xlarge'>(initialFontScale);
  const [dockCollapsed, setDockCollapsed] = useState(false);

  const triggerPresetRef = useRef<((preset: 'perspective' | 'deep' | 'top') => void) | null>(null);
  const rebuildContentRef = useRef<(() => void) | null>(null);

  const latestPropsRef = useRef({
    chartStyle,
    ascSignIdx,
    housePlanets,
    signPlanets,
    showDegrees,
    fontScale,
  });
  latestPropsRef.current = {
    chartStyle,
    ascSignIdx,
    housePlanets,
    signPlanets,
    showDegrees,
    fontScale,
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = detectSoftwareWebGL();
    const width = container.clientWidth || 360;
    const height = container.clientHeight || 360;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x160c06);
    scene.fog = new THREE.FogExp2(0x160c06, 0.025);

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 11.2, 8.2);
    camera.lookAt(0, 0, 0.3);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Studio Environment Map (RoomEnvironment)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTexture = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTexture;
    pmremGenerator.dispose();

    // 3-Point Warm/Cool Studio Lighting Rig
    const hemiLight = new THREE.HemisphereLight(0xfffbeb, 0x3b1d0b, 0.95);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xffedd5, 2.2);
    keyLight.position.set(6, 14, 8);
    if (!isSoftwareGl) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.set(1024, 1024);
      keyLight.shadow.camera.near = 1;
      keyLight.shadow.camera.far = 30;
      const d = 7.5;
      keyLight.shadow.camera.left = -d;
      keyLight.shadow.camera.right = d;
      keyLight.shadow.camera.top = d;
      keyLight.shadow.camera.bottom = -d;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xf59e0b, 1.1);
    rimLight.position.set(-7, 9, -6);
    scene.add(rimLight);

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.08;
    controls.maxPolarAngle = Math.PI / 2.15;
    controls.minPolarAngle = 0.05;
    controls.minDistance = 7.5;
    controls.maxDistance = 20;
    controls.target.set(0, 0, 0.25);

    // Soft Contact Shadow Grounding Plane
    const contactCanvas = document.createElement('canvas');
    contactCanvas.width = 256;
    contactCanvas.height = 256;
    const cCtx = contactCanvas.getContext('2d');
    if (cCtx) {
      const g = cCtx.createRadialGradient(128, 128, 20, 128, 128, 124);
      g.addColorStop(0, 'rgba(0,0,0,0.65)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      cCtx.fillStyle = g;
      cCtx.fillRect(0, 0, 256, 256);
    }
    const contactTex = new THREE.CanvasTexture(contactCanvas);
    const contactPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(14.5, 14.5),
      new THREE.MeshBasicMaterial({
        map: contactTex,
        transparent: true,
        depthWrite: false,
        opacity: 0.55,
      })
    );
    contactPlane.rotation.x = -Math.PI / 2;
    contactPlane.position.y = -0.58;
    scene.add(contactPlane);

    // Dynamic Content Group (rebuilt when chart props change)
    const chartRootGroup = new THREE.Group();
    scene.add(chartRootGroup);

    const disposableGeometries: THREE.BufferGeometry[] = [];
    const disposableMaterials: THREE.Material[] = [];
    const disposableTextures: THREE.Texture[] = [envTexture, contactTex];

    function clearDynamicGroup() {
      while (chartRootGroup.children.length > 0) {
        chartRootGroup.remove(chartRootGroup.children[0]);
      }
      while (disposableGeometries.length > 0) {
        disposableGeometries.pop()?.dispose();
      }
      while (disposableMaterials.length > 0) {
        disposableMaterials.pop()?.dispose();
      }
      while (disposableTextures.length > 2) {
        disposableTextures.pop()?.dispose();
      }
    }

    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();

    function buildChartScene() {
      clearDynamicGroup();
      const {
        chartStyle: style,
        ascSignIdx: asc,
        housePlanets: hPlanets,
        signPlanets: sPlanets,
        showDegrees: degOn,
        fontScale: fScale,
      } = latestPropsRef.current;

      // Shared PBR Materials for the Composite 3D Yantra Plinth
      const mahoganyMat = new THREE.MeshStandardMaterial({
        color: 0x3e1f0d,
        roughness: 0.55,
        metalness: 0.15,
      });
      const sandalwoodFloorMat = new THREE.MeshStandardMaterial({
        color: 0xfaf0dc,
        roughness: 0.72,
        metalness: 0.05,
      });
      const brushedGoldMat = new THREE.MeshPhysicalMaterial({
        color: 0xd99b26,
        roughness: 0.24,
        metalness: 0.88,
        clearcoat: 0.4,
      });
      const bronzeWallMat = new THREE.MeshStandardMaterial({
        color: 0x6b3e1b,
        roughness: 0.42,
        metalness: 0.55,
      });
      disposableMaterials.push(mahoganyMat, sandalwoodFloorMat, brushedGoldMat, bronzeWallMat);

      // 1. Stepped Temple Plinth Base (Composite Group)
      const lowerPlinthGeo = new THREE.BoxGeometry(11.1, 0.35, 11.1);
      const upperPlinthGeo = new THREE.BoxGeometry(10.5, 0.28, 10.5);
      const floorGeo = new THREE.BoxGeometry(9.8, 0.12, 9.8);
      disposableGeometries.push(lowerPlinthGeo, upperPlinthGeo, floorGeo);

      const lowerPlinth = new THREE.Mesh(lowerPlinthGeo, mahoganyMat);
      lowerPlinth.position.y = -0.38;
      lowerPlinth.receiveShadow = true;
      chartRootGroup.add(lowerPlinth);

      const upperPlinth = new THREE.Mesh(upperPlinthGeo, bronzeWallMat);
      upperPlinth.position.y = -0.14;
      upperPlinth.receiveShadow = true;
      chartRootGroup.add(upperPlinth);

      const sanctumFloor = new THREE.Mesh(floorGeo, sandalwoodFloorMat);
      sanctumFloor.position.y = 0.02;
      sanctumFloor.receiveShadow = true;
      chartRootGroup.add(sanctumFloor);

      // 2. Outer Raised 3D Temple Walls + 4 Corner Kalash Pillars
      const wallThickness = 0.22;
      const wallHeight = 0.42;
      const hWallGeo = new THREE.BoxGeometry(10.04, wallHeight, wallThickness);
      const vWallGeo = new THREE.BoxGeometry(wallThickness, wallHeight, 10.04);
      const cornerPillarGeo = new THREE.CylinderGeometry(0.24, 0.3, 0.68, 16);
      const cornerDomeGeo = new THREE.SphereGeometry(0.22, 16, 12);
      disposableGeometries.push(hWallGeo, vWallGeo, cornerPillarGeo, cornerDomeGeo);

      const northWall = new THREE.Mesh(hWallGeo, brushedGoldMat);
      northWall.position.set(0, wallHeight / 2, -4.92);
      const southWall = new THREE.Mesh(hWallGeo, brushedGoldMat);
      southWall.position.set(0, wallHeight / 2, 4.92);
      const westWall = new THREE.Mesh(vWallGeo, brushedGoldMat);
      westWall.position.set(-4.92, wallHeight / 2, 0);
      const eastWall = new THREE.Mesh(vWallGeo, brushedGoldMat);
      eastWall.position.set(4.92, wallHeight / 2, 0);
      chartRootGroup.add(northWall, southWall, westWall, eastWall);

      [
        [-4.92, -4.92],
        [4.92, -4.92],
        [-4.92, 4.92],
        [4.92, 4.92],
      ].forEach(([cx, cz]) => {
        const pillar = new THREE.Mesh(cornerPillarGeo, bronzeWallMat);
        pillar.position.set(cx, 0.28, cz);
        const dome = new THREE.Mesh(cornerDomeGeo, brushedGoldMat);
        dome.position.set(cx, 0.66, cz);
        chartRootGroup.add(pillar, dome);
      });

      // Helper to add an extruded 3D wall segment between two (x,z) points
      const addWallSegment = (x1: number, z1: number, x2: number, z2: number, height = 0.34, thick = 0.14) => {
        const dx = x2 - x1;
        const dz = z2 - z1;
        const len = Math.hypot(dx, dz);
        const angle = Math.atan2(dx, dz);

        const baseGeo = new THREE.BoxGeometry(thick, height, len);
        const capGeo = new THREE.BoxGeometry(thick * 0.75, 0.06, len);
        disposableGeometries.push(baseGeo, capGeo);

        const wallMesh = new THREE.Mesh(baseGeo, bronzeWallMat);
        wallMesh.position.set((x1 + x2) / 2, height / 2, (z1 + z2) / 2);
        wallMesh.rotation.y = angle;
        wallMesh.castShadow = !isSoftwareGl;
        wallMesh.receiveShadow = true;

        const capMesh = new THREE.Mesh(capGeo, brushedGoldMat);
        capMesh.position.set((x1 + x2) / 2, height + 0.03, (z1 + z2) / 2);
        capMesh.rotation.y = angle;

        chartRootGroup.add(wallMesh, capMesh);
      };

      // Helper to spawn a 3D House Medallion + 3D Planets + High-Contrast Floating Label
      const populateChamber = (
        rx: number,
        rz: number,
        signNum: number,
        rashiName: string,
        isLagna: boolean,
        px: number,
        pz: number,
        pList: ThreeFormattedPlanet[]
      ) => {
        // 3D Rashi Medallion Pedestal
        const medGeo = new THREE.CylinderGeometry(0.42, 0.48, 0.16, 20);
        disposableGeometries.push(medGeo);
        const medMesh = new THREE.Mesh(medGeo, isLagna ? brushedGoldMat : bronzeWallMat);
        medMesh.position.set(rx, 0.14, rz);
        chartRootGroup.add(medMesh);

        // High-Contrast Rashi Sign Label Sprite
        const rashiTex = createRashiMedallionTexture(signNum, rashiName, isLagna, maxAnisotropy);
        disposableTextures.push(rashiTex);
        const rashiSpriteMat = new THREE.SpriteMaterial({
          map: rashiTex,
          depthTest: false,
          transparent: true,
        });
        disposableMaterials.push(rashiSpriteMat);
        const rashiSprite = new THREE.Sprite(rashiSpriteMat);
        rashiSprite.position.set(rx, 0.42, rz);
        rashiSprite.scale.set(isLagna ? 1.55 : 1.35, isLagna ? 0.78 : 0.68, 1);
        rashiSprite.renderOrder = 5;
        chartRootGroup.add(rashiSprite);

        if (pList.length === 0) return;

        // Spawn 3D Planetary Orbs in the Chamber (Composite 3-part Group per planet)
        const sphereGeo = new THREE.SphereGeometry(0.22, 20, 16);
        const ringGeo = new THREE.TorusGeometry(0.3, 0.035, 10, 24);
        const basePedGeo = new THREE.CylinderGeometry(0.18, 0.24, 0.14, 16);
        disposableGeometries.push(sphereGeo, ringGeo, basePedGeo);

        pList.forEach((p, idx) => {
          const n = pList.length;
          const spreadRadius = n === 1 ? 0 : Math.min(0.72, 0.35 + n * 0.07);
          const theta = (idx / Math.max(1, n)) * Math.PI * 2;
          const orbX = px + Math.cos(theta) * spreadRadius;
          const orbZ = pz + Math.sin(theta) * spreadRadius;

          const pColor = PLANET_3D_COLORS[p.name] || 0xfbbf24;
          const planetMat = new THREE.MeshPhysicalMaterial({
            color: pColor,
            roughness: 0.22,
            metalness: 0.35,
            clearcoat: 0.8,
            emissive: pColor,
            emissiveIntensity: 0.18,
          });
          disposableMaterials.push(planetMat);

          const planetGroup = new THREE.Group();
          planetGroup.position.set(orbX, 0.12, orbZ);

          const ped = new THREE.Mesh(basePedGeo, brushedGoldMat);
          ped.position.y = 0.07;
          planetGroup.add(ped);

          const orb = new THREE.Mesh(sphereGeo, planetMat);
          orb.position.y = 0.32;
          orb.castShadow = !isSoftwareGl;
          planetGroup.add(orb);

          const halo = new THREE.Mesh(ringGeo, brushedGoldMat);
          halo.position.y = 0.32;
          halo.rotation.x = Math.PI / 2.4;
          planetGroup.add(halo);

          chartRootGroup.add(planetGroup);
        });

        // High-Contrast, Large-Font Floating 3D Plaque above the Planet Cluster
        const { texture: badgeTex, aspect } = createPlanetClusterBadgeTexture(
          pList,
          degOn,
          fScale,
          maxAnisotropy
        );
        disposableTextures.push(badgeTex);

        const badgeMat = new THREE.SpriteMaterial({
          map: badgeTex,
          depthTest: false,
          transparent: true,
        });
        disposableMaterials.push(badgeMat);

        const badgeSprite = new THREE.Sprite(badgeMat);
        const rows = Math.ceil(pList.length / (pList.length > 2 ? 2 : 1));
        const baseHeight = (fScale === 'xlarge' ? 0.68 : 0.58) * (0.75 + rows * 0.42);
        badgeSprite.scale.set(baseHeight * aspect, baseHeight, 1);
        badgeSprite.position.set(px, 0.92 + (rows > 1 ? 0.12 : 0), pz);
        badgeSprite.renderOrder = 15;
        chartRootGroup.add(badgeSprite);
      };

      if (style === 'north') {
        // North Indian 3D Diamond & Diagonal Walls
        addWallSegment(-4.85, -4.85, 4.85, 4.85, 0.36, 0.15);
        addWallSegment(4.85, -4.85, -4.85, 4.85, 0.36, 0.15);
        addWallSegment(0, -4.85, 4.85, 0, 0.4, 0.16);
        addWallSegment(4.85, 0, 0, 4.85, 0.4, 0.16);
        addWallSegment(0, 4.85, -4.85, 0, 0.4, 0.16);
        addWallSegment(-4.85, 0, 0, -4.85, 0.4, 0.16);

        // Central 3D Bindu Lotus Hub
        const hubGeo = new THREE.CylinderGeometry(0.45, 0.55, 0.48, 24);
        disposableGeometries.push(hubGeo);
        const hubMesh = new THREE.Mesh(hubGeo, brushedGoldMat);
        hubMesh.position.set(0, 0.24, 0);
        chartRootGroup.add(hubMesh);

        NORTH_3D_HOUSES.forEach(({ house, x, z, rashiX, rashiZ }) => {
          const signIdx = (asc + house - 1) % 12;
          const signNum = signIdx + 1;
          const rashiName = RASHIS[signIdx] || '';
          const pList = hPlanets[house] || [];
          populateChamber(rashiX, rashiZ, signNum, rashiName, house === 1, x, z, pList);
        });
      } else {
        // South Indian 4x4 3D Temple Grid Walls
        addWallSegment(-2.45, -4.85, -2.45, 4.85, 0.36, 0.14);
        addWallSegment(2.45, -4.85, 2.45, 4.85, 0.36, 0.14);
        addWallSegment(0, -4.85, 0, -2.45, 0.36, 0.14);
        addWallSegment(0, 2.45, 0, 4.85, 0.36, 0.14);

        addWallSegment(-4.85, -2.45, 4.85, -2.45, 0.36, 0.14);
        addWallSegment(-4.85, 2.45, 4.85, 2.45, 0.36, 0.14);
        addWallSegment(-4.85, 0, -2.45, 0, 0.36, 0.14);
        addWallSegment(2.45, 0, 4.85, 0, 0.36, 0.14);

        // Raised Central Brahmasthan Platform
        const centerAltarGeo = new THREE.BoxGeometry(4.75, 0.26, 4.75);
        disposableGeometries.push(centerAltarGeo);
        const centerAltar = new THREE.Mesh(centerAltarGeo, bronzeWallMat);
        centerAltar.position.set(0, 0.16, 0);
        chartRootGroup.add(centerAltar);

        SOUTH_3D_CELLS.forEach(({ signIdx, row, col, name }) => {
          const cellX = -3.68 + col * 2.45;
          const cellZ = -3.68 + row * 2.45;
          const rashiX = cellX - 0.55;
          const rashiZ = cellZ - 0.68;
          const pList = sPlanets[signIdx] || [];
          populateChamber(
            rashiX,
            rashiZ,
            signIdx + 1,
            name,
            signIdx === asc,
            cellX,
            cellZ + 0.18,
            pList
          );
        });
      }
    }

    buildChartScene();
    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // Smooth Damped Camera Transition State
    let activeTransition = false;
    _camTargetPos.copy(camera.position);
    let lastTime = performance.now();

    let frameId = 0;
    let renderBusy = false;
    let renderDirty = false;

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (!gl || typeof gl.fenceSync !== 'function') {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function requestRender() {
      if (renderBusy) {
        renderDirty = true;
        return;
      }
      renderBusy = true;
      frameId = requestAnimationFrame((now) => {
        renderDirty = false;
        const dt = Math.min(0.1, (now - lastTime) / 1000);
        lastTime = now;

        if (activeTransition) {
          camera.position.x = THREE.MathUtils.damp(camera.position.x, _camTargetPos.x, 7, dt);
          camera.position.y = THREE.MathUtils.damp(camera.position.y, _camTargetPos.y, 7, dt);
          camera.position.z = THREE.MathUtils.damp(camera.position.z, _camTargetPos.z, 7, dt);
          controls.target.x = THREE.MathUtils.damp(controls.target.x, _lookTargetPos.x, 7, dt);
          controls.target.y = THREE.MathUtils.damp(controls.target.y, _lookTargetPos.y, 7, dt);
          controls.target.z = THREE.MathUtils.damp(controls.target.z, _lookTargetPos.z, 7, dt);

          if (camera.position.distanceToSquared(_camTargetPos) < 0.002) {
            camera.position.copy(_camTargetPos);
            activeTransition = false;
          } else {
            renderDirty = true;
          }
        }

        const controlsChanged = controls.update();
        if (controlsChanged && !isSoftwareGl) {
          renderDirty = true;
        }

        renderer.render(scene, camera);

        const done = () => {
          renderBusy = false;
          if (renderDirty) requestRender();
        };
        if (isSoftwareGl) afterDraw(done);
        else done();
      });
    }

    controls.addEventListener('start', () => {
      activeTransition = false;
    });
    controls.addEventListener('change', () => {
      requestRender();
    });

    triggerPresetRef.current = (preset) => {
      lastTime = performance.now();
      activeTransition = true;
      if (preset === 'top') {
        _camTargetPos.set(0, 14.2, 0.8);
        _lookTargetPos.set(0, 0, 0);
      } else if (preset === 'deep') {
        _camTargetPos.set(0, 8.6, 10.6);
        _lookTargetPos.set(0, 0, 0.45);
      } else {
        _camTargetPos.set(0, 11.2, 8.2);
        _lookTargetPos.set(0, 0, 0.3);
      }
      requestRender();
    };

    rebuildContentRef.current = () => {
      buildChartScene();
      requestRender();
    };

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth || 360;
      const h = container.clientHeight || 360;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      requestRender();
    };
    window.addEventListener('resize', onResize);

    requestRender();

    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      controls.dispose();
      clearDynamicGroup();
      while (disposableTextures.length > 0) {
        disposableTextures.pop()?.dispose();
      }
      renderer.dispose();
    };
  }, []);

  // Rebuild 3D meshes & high-contrast labels whenever chart props change
  useEffect(() => {
    rebuildContentRef.current?.();
  }, [chartStyle, ascSignIdx, housePlanets, signPlanets, showDegrees, fontScale]);

  return (
    <div className="relative w-full aspect-square max-w-[440px] rounded-2xl overflow-hidden border-2 border-[#B56A00]/60 shadow-lg bg-[#160C06]">
      {/* Dedicated Empty WebGL Canvas Container */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Minimal Top-Left Spec Badge (Zero Side-Panel Occlusion) */}
      <div className="absolute top-2.5 left-2.5 pointer-events-none px-2.5 py-1 rounded-lg bg-[#1C0E07]/90 border border-[#F59E0B]/45 text-[10px] font-bold text-[#FDE68A] tracking-wide">
        Three.js 3D यंत्र • घुमाएँ व ज़ूम करें
      </div>

      {/* Collapsible Unified Bottom Control Dock */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[94%] max-w-[400px] flex flex-col items-center z-10">
        <button
          type="button"
          onClick={() => {
            triggerHapticSelection();
            setDockCollapsed((prev) => !prev);
          }}
          className="px-3 py-0.5 rounded-t-lg bg-[#231209] border border-b-0 border-[#D97706]/50 text-[10px] font-bold text-[#FDE68A] cursor-pointer"
        >
          {dockCollapsed ? '▴ 3D नियंत्रक दिखाएँ' : '▾ नियंत्रक छिपाएँ'}
        </button>

        {!dockCollapsed && (
          <div className="w-full px-2.5 py-1.5 rounded-xl bg-[#1A0D06]/95 border border-[#D97706]/55 flex flex-wrap items-center justify-between gap-1.5 shadow-md">
            <div className="flex items-center gap-1">
              {[
                { id: 'perspective', label: '3D कोण' },
                { id: 'deep', label: 'गहरा 3D' },
                { id: 'top', label: 'शीर्ष दृश्य' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    triggerHapticSelection();
                    const mode = p.id as 'perspective' | 'deep' | 'top';
                    setCameraPreset(mode);
                    triggerPresetRef.current?.(mode);
                  }}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                    cameraPreset === p.id
                      ? 'bg-[#D97706] text-stone-950 font-black'
                      : 'bg-[#2C180C] text-[#FDE68A] hover:bg-[#3D2212]'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                triggerHapticSelection();
                setFontScale((prev) => (prev === 'xlarge' ? 'large' : 'xlarge'));
              }}
              className="px-2 py-1 rounded-lg text-[10px] font-black bg-[#3D2212] text-[#FEF08A] border border-[#F59E0B]/40 cursor-pointer"
              title="ग्रहों के फ़ॉन्ट का आकार बदलें"
            >
              {fontScale === 'xlarge' ? 'फ़ॉन्ट: अति-बड़ा (XL)' : 'फ़ॉन्ट: बड़ा (L)'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
