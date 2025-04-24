import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

console.log('ThreeApp module loaded!');

export function initModelViewer(modelPath) {
  console.log('Three.js received path:', modelPath);
  // Инициализация сцены
  const canvas = document.querySelector('#webgl-canvas');
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);

  // Освещение
  const light = new THREE.AmbientLight(0xffffff, 0.9);
  scene.add(light);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(0, 10, 10);
  scene.add(directionalLight);

  // Загрузка модели
  const loader = new GLTFLoader();
  loader.load(
    modelPath,
    (gltf) => {
      scene.add(gltf.scene);
    },
    undefined,
    (error) => {
      console.error('Error loading model:', error);
    }
  );

  // Позиция камеры
  camera.position.z = 5;

  // OrbitControls
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;

  // Анимация
  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }
  animate();

  // Реакция на изменение размера окна
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
};

/*
    Включили прозрачность рендерера через параметр alpha: true

    Добавили фоновое изображение как текстуру на плоскость

    Установили прозрачность фона через opacity: 0.5 (можете регулировать от 0.1 до 0.9)

    Отодвинули фон за модель с помощью position.z = -10
    */