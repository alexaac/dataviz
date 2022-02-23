// https://codepen.io/prisoner849/pen/oNopjyb

import * as THREE from 'https://cdn.skypack.dev/three@0.136.0';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/controls/OrbitControls';
import { CSS2DRenderer } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/renderers/CSS2DRenderer.js';

let scene,
  camera,
  renderer,
  clock = new THREE.Clock(),
  controls,
  labelRenderer;
let globalUniforms = {
  time: { value: 0 },
};

const backgroundMap = () => {
  const textureLoader = new THREE.TextureLoader();
  // https://svs.gsfc.nasa.gov/3895
  const stars = './assets/textures/starmap_4k.jpg';

  const backgroundMap = textureLoader.load(stars);
  backgroundMap.mapping = THREE.EquirectangularReflectionMapping;
  backgroundMap.encoding = THREE.sRGBEncoding;

  return backgroundMap;
};

init();

function init() {
  // Get a reference to the container element
  const container = document.getElementById('chart');

  scene = new THREE.Scene();
  scene.background = backgroundMap();
  camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 1, 2000);
  camera.position.set(0.5, 0.5, 1).setLength(14);

  const ambient = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
  scene.add(ambient);
  const light = new THREE.DirectionalLight(0xffffff, 0);
  light.position.set(0, 1, 10);
  scene.add(light);

  renderer = new THREE.WebGLRenderer({
    antialias: true,
  });
  renderer.setSize(innerWidth, innerHeight);
  renderer.setClearColor(0x000);
  container.append(renderer.domElement);

  labelRenderer = new CSS2DRenderer();
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.domElement.style.position = 'absolute';
  labelRenderer.domElement.style.top = '0px';
  document.body.appendChild(labelRenderer.domElement);

  window.addEventListener('resize', onWindowResize);

  controls = new OrbitControls(camera, labelRenderer.domElement);
  controls.enablePan = false;
  controls.minDistance = 6;
  controls.maxDistance = 15;
  controls.enableDamping = true;
  controls.autoRotate = true;
  controls.autoRotateSpeed *= 0.25;

  // <GLOBE>
  let rad = 5;

  const globeRadius = rad;

  const textureLoader = new THREE.TextureLoader();

  const earthGeometry = new THREE.SphereGeometry(globeRadius, 32, 32);

  const earthMap = textureLoader.load(
    './assets/textures/Earth.png'
    // './assets/textures/BlackMarble_2016_01deg.jpg' // https://svs.gsfc.nasa.gov/3895
  );

  const earthMaterial = new THREE.MeshPhongMaterial({
    map: earthMap,
    bumpMap: textureLoader.load('./assets/textures/earthbump1k.jpg'), // http://planetpixelemporium.com/earth.html
    bumpScale: 0.6,
    specularMap: textureLoader.load('./assets/textures/earthspec1k.jpg'),
    specular: new THREE.Color('grey'),
    shininess: 0.5,
    normalMap: textureLoader.load('./assets/textures/EarthNormal.png'),
    normalScale: new THREE.Vector2(6, 6),
  });

  const globeMesh = new THREE.Mesh(earthGeometry, earthMaterial);
  globeMesh.position.set(0, 0, 0);
  scene.add(globeMesh);

  // Clouds
  const cloudsGeometry = new THREE.SphereGeometry(globeRadius + 0.1, 32, 32);

  const cloudsMaterial = new THREE.MeshPhongMaterial({
    // color: 0x148fd6,
    opacity: 0.2,
    transparent: true,
    map: textureLoader.load('./assets/textures/earthcloudmap.jpg'),
    side: THREE.DoubleSide,
    depthWrite: false,
    shininess: 1,
  });

  const cloudMesh = new THREE.Mesh(cloudsGeometry, cloudsMaterial);
  cloudMesh.rotation.y = -(1 / 6) * Math.PI;

  const earthMesh = new THREE.Mesh(cloudsGeometry, earthMaterial);
  // earthMesh.add(cloudMesh);
  // earthMesh.position.set(0, 0, 0);
  scene.add(cloudMesh);

  // </GLOBE>

  // <Markers>
  const markerCount = 30;
  let markerInfo = []; // information on markers
  let gMarker = new THREE.PlaneGeometry();
  let mMarker = new THREE.MeshBasicMaterial({
    color: 0xff3232,
    onBeforeCompile: (shader) => {
      shader.uniforms.time = globalUniforms.time;
      shader.vertexShader = `
    	attribute float phase;
      varying float vPhase;
      ${shader.vertexShader}
    `.replace(
        `#include <begin_vertex>`,
        `#include <begin_vertex>
      	vPhase = phase; // de-synch of ripples
      `
      );
      //console.log(shader.vertexShader);
      shader.fragmentShader = `
    	uniform float time;
      varying float vPhase;
    	${shader.fragmentShader}
    `.replace(
        `vec4 diffuseColor = vec4( diffuse, opacity );`,
        `
      vec2 lUv = (vUv - 0.5) * 2.;
      float val = 0.;
      float lenUv = length(lUv);
      val = max(val, 1. - step(0.25, lenUv)); // central circle
      val = max(val, step(0.4, lenUv) - step(0.5, lenUv)); // outer circle
      
      float tShift = fract(time * 0.5 + vPhase);
      val = max(val, step(0.4 + (tShift * 0.6), lenUv) - step(0.5 + (tShift * 0.5), lenUv)); // ripple
      
      if (val < 0.5) discard;
      
      vec4 diffuseColor = vec4( diffuse, opacity );`
      );
      //console.log(shader.fragmentShader)
    },
  });
  mMarker.defines = { USE_UV: ' ' }; // needed to be set to be able to work with UVs
  let markers = new THREE.InstancedMesh(gMarker, mMarker, markerCount);

  let dummy = new THREE.Object3D();
  let phase = [];
  for (let i = 0; i < markerCount; i++) {
    dummy.position.randomDirection().setLength(rad + 0.1);
    dummy.lookAt(dummy.position.clone().setLength(rad + 1));
    dummy.updateMatrix();
    markers.setMatrixAt(i, dummy.matrix);
    phase.push(Math.random());

    markerInfo.push({
      id: i + 1,
      mag: THREE.MathUtils.randInt(1, 10),
      crd: dummy.position.clone(),
    });
  }
  gMarker.setAttribute(
    'phase',
    new THREE.InstancedBufferAttribute(new Float32Array(phase), 1)
  );

  scene.add(markers);
  // </Markers>

  update();
}

function update() {
  requestAnimationFrame(update);

  let t = clock.getElapsedTime();
  globalUniforms.time.value = t;
  controls.update();
  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);
}

function onWindowResize() {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(innerWidth, innerHeight);
  labelRenderer.setSize(innerWidth, innerHeight);
}
