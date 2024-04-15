import * as THREE from 'three';
import { scene, roadWidth, finishLine } from './scene';
import { car } from './car';
import { loadedModels } from './loader';

export let obstacles = [];
const obstacleStartZ = car.position.z - 20;
const obstacleEndZ = finishLine.position.z + 30;
const numObstacles = 10;

export function createWallsAndHoles() {
    for (let i = 0; i < numObstacles; i++) {
        let xPosition = (Math.random() - 0.5) * roadWidth;
        let zPosition = Math.random() * (obstacleEndZ - obstacleStartZ) + obstacleStartZ;
        if (i % 2 === 0 && loadedModels.wall) {
            createObstacle('wall', loadedModels.wall, { x: xPosition, y: 0, z: zPosition });
        } else if (loadedModels.hole) {
            createObstacle('hole', loadedModels.hole, { x: xPosition, y: 0, z: zPosition });
        }
    }
}

function createObstacle(type, model, position) {
    const obstacle = new THREE.Object3D();
    obstacle.position.set(position.x, position.y, position.z);
    obstacle.type = type;

    if (model) {
        const modelClone = model.clone();
        modelClone.scale.set(1, 1, 1); // Make sure the scale is correct
        obstacle.add(modelClone);
    }

    scene.add(obstacle);
    obstacles.push(obstacle);
}

export function checkCollisions() {
    const carBoundingBox = new THREE.Box3().setFromObject(car);
    obstacles.forEach(obstacle => {
        const obstacleBoundingBox = new THREE.Box3().setFromObject(obstacle);
        if (carBoundingBox.intersectsBox(obstacleBoundingBox) && !obstacle.hasCollided) {
            obstacle.hasCollided = true;
            setTimeout(() => obstacle.hasCollided = false, 1000); // Reset collision state
        }
    });
}

export function resetObstacles() {
    obstacles.forEach(obstacle => scene.remove(obstacle));
    obstacles = [];
    createWallsAndHoles();
}
