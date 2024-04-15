import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { addModelToScene } from './scene';

export let loadedModels = {};
let totalModels = 0;
let loadedCount = 0;
let redirectionDone = false;
const loader = new GLTFLoader();

const modelsToLoad = {
    car: 'src/assets/rocketlowpoly/scene.gltf',
    wall: 'src/assets/space_rock/scene.gltf',
    hole: 'src/assets/blackhole/scene.gltf',
};

totalModels = Object.keys(modelsToLoad).length;

Object.entries(modelsToLoad).forEach(([key, path]) => {
    if (!path) {
        console.error(`Model path for ${key} is undefined.`);
        return;
    }
    loader.load(path, (gltf) => {
        addModelToScene(key, gltf);
        loadedModels[key] = gltf.scene;
        loadedCount++;
        if (loadedCount === totalModels && !redirectionDone) {
            alert("Models are loaded. Click OK to start the game.");
            const startGameButton = document.createElement('button');
            startGameButton.textContent = 'Start Game';
            startGameButton.addEventListener('click', () => {
                window.location.href = 'index.html';
            });
            document.body.appendChild(startGameButton);
            redirectionDone = true;
        }
    }, undefined, (error) => {
        console.error(`Error loading model for ${key}:`, error);
        loadedCount++;
        if (loadedCount === totalModels && !redirectionDone) {
            alert('Failed to load models. Please check the console for details.');
            redirectionDone = true;
        }
    });
});
