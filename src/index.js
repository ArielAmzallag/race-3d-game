import * as THREE from 'three';
import { scene, initScene } from './scene';
import { camera } from './camera';
import { renderer } from './renderer';
import { animate } from './gameLogic';
import './controls';

document.body.appendChild(renderer.domElement);

async function startGame() {
    initScene();
    animate();
}

startGame();
