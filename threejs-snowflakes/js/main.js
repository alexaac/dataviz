import * as THREE from './three.module.js';

import { GUI } from './lil-gui.module.min.js';

import { EffectComposer } from './EffectComposer.js';
import { RenderPass } from './RenderPass.js';
import { ShaderPass } from './ShaderPass.js';
import { UnrealBloomPass } from './UnrealBloomPass.js';

let params;

const ENTIRE_SCENE = 0,
  BLOOM_SCENE = 1;

const bloomLayer = new THREE.Layers();
bloomLayer.set(BLOOM_SCENE);

const bloomParams = {
  exposure: 1,
  bloomStrength: 1.5,
  bloomThreshold: 0,
  bloomRadius: 0,
  scene: 'Scene with Glow',
};

const container = document.getElementById('canvas');

const materials = [];

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ReinhardToneMapping;
container.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const gui = new GUI({ title: '' });

gui.add(bloomParams, 'exposure', 0.1, 2).onChange(function (value) {
  renderer.toneMappingExposure = Math.pow(value, 4.0);
  render();
});

gui.add(bloomParams, 'bloomThreshold', 0.0, 1.0).onChange(function (value) {
  bloomPass.threshold = Number(value);
  render();
});

gui.add(bloomParams, 'bloomStrength', 0.0, 10.0).onChange(function (value) {
  bloomPass.strength = Number(value);
  render();
});

gui
  .add(bloomParams, 'bloomRadius', 0.0, 1.0)
  .step(0.01)
  .onChange(function (value) {
    bloomPass.radius = Number(value);
    render();
  });

gui.close();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  1,
  2000
);
camera.position.z = 1000;

const renderScene = new RenderPass(scene, camera);

const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.5,
  0.4,
  0.85
);
bloomPass.exposure = Math.pow(bloomParams.exposure, 4.0);
bloomPass.threshold = bloomParams.bloomThreshold;
bloomPass.strength = bloomParams.bloomStrength;
bloomPass.radius = bloomParams.bloomRadius;

const bloomComposer = new EffectComposer(renderer);
bloomComposer.renderToScreen = false;
bloomComposer.addPass(renderScene);
bloomComposer.addPass(bloomPass);

const finalPass = new ShaderPass(
  new THREE.ShaderMaterial({
    uniforms: {
      baseTexture: { value: null },
      bloomTexture: { value: bloomComposer.renderTarget2.texture },
    },
    vertexShader: document.getElementById('vertexshader').textContent,
    fragmentShader: document.getElementById('fragmentshader').textContent,
    defines: {},
  }),
  'baseTexture'
);
finalPass.needsSwap = true;

const finalComposer = new EffectComposer(renderer);
finalComposer.addPass(renderScene);
finalComposer.addPass(finalPass);

//

scene.fog = new THREE.FogExp2(0x000000, 0.0008);

//

setupScene();
animate();

window.onresize = function () {
  const width = window.innerWidth;
  const height = window.innerHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);

  bloomComposer.setSize(width, height);
  finalComposer.setSize(width, height);

  render();
};

function setupScene() {
  scene.traverse(disposeMaterial);
  scene.children.length = 0;

  const geometry = new THREE.BufferGeometry();
  const vertices = [];

  const textureLoader = new THREE.TextureLoader();

  const sprite1 = textureLoader.load('assets/textures/snowflake1.png');
  const sprite2 = textureLoader.load('assets/textures/snowflake2.png');
  const sprite3 = textureLoader.load('assets/textures/snowflake2.png');
  const sprite4 = textureLoader.load('assets/textures/snowflake4.png');
  const sprite5 = textureLoader.load('assets/textures/snowflake5.png');

  for (let i = 0; i < 10000; i++) {
    const x = Math.random() * 2000 - 1000;
    const y = Math.random() * 2000 - 1000;
    const z = Math.random() * 2000 - 1000;

    vertices.push(x, y, z);
  }

  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(vertices, 3)
  );

  params = [
    [[186, 0.9, 0.85], sprite2, 20],
    [[184, 0.82, 0.5], sprite1, 10],
    [[262, 0.11, 0.8], sprite3, 10],
    [[196, 0.74, 0.51], sprite5, 8],
    [[225, 0.79, 0.84], sprite4, 5],
  ];

  for (let i = 0; i < params.length; i++) {
    const color = params[i][0];
    const sprite = params[i][1];
    const size = params[i][2];

    // materials[i] = new THREE.ParticleBasicMaterial({
    //   size: size,
    //   map: sprite,
    //   sizeAttenuation: true,
    //   depthTest: false,
    //   blending: THREE.AdditiveBlending,
    // });

    materials[i] = new THREE.PointsMaterial({
      size: size,
      map: sprite,
      depthTest: false,
      transparent: true,
      blending: THREE.AdditiveBlending,
    });

    materials[i].color.setHSL(color[0], color[1], color[2]);

    const particles = new THREE.Points(geometry, materials[i]);

    particles.rotation.x = Math.random() * 5;
    particles.rotation.y = Math.random() * 6;
    particles.rotation.z = Math.random() * 7;

    particles.layers.enable(BLOOM_SCENE);

    scene.add(particles);
  }

  render();
}

function disposeMaterial(obj) {
  if (obj.material) {
    obj.material.dispose();
  }
}

function animate() {
  requestAnimationFrame(animate);

  render();
}

function render() {
  renderer.toneMappingExposure = Math.pow(bloomParams.exposure, 4.0);
  bloomPass.exposure = bloomParams.exposure;
  bloomPass.threshold = bloomParams.bloomThreshold;
  bloomPass.strength = bloomParams.bloomStrength;
  bloomPass.radius = bloomParams.bloomRadius;

  const time = Date.now() * 0.00001;

  for (let i = 0; i < scene.children.length; i++) {
    const object = scene.children[i];

    if (object instanceof THREE.Points) {
      object.rotation.y = time * (i < 4 ? i + 1 : -(i + 1));

      // if (Math.round(time) % 2 === 0) {
      //   object.layers.toggle(BLOOM_SCENE);
      // }
    }
  }

  for (let i = 0; i < materials.length; i++) {
    const color = params[i][0];

    const h = ((360 * (color[0] + time)) % 360) / 90;
    materials[i].color.setHSL(h, color[1], color[2]);
  }

  // render scene with bloom
  renderBloom(true);

  // render the entire scene, then render bloom scene on top
  finalComposer.render();
}

function renderBloom() {
  camera.layers.set(BLOOM_SCENE);
  bloomComposer.render();
  camera.layers.set(ENTIRE_SCENE);
}
