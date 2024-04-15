import * as THREE from 'three';
import { scene, road, finishLine, roadWidth, roadLength } from './scene';
import { camera } from './camera';
import { renderer } from './renderer';
import { car, carWidth, carLength, carVelocity, currentSpeed, carAcceleration, minSpeed, maxSpeed } from './car';
import { obstacles, checkCollisions } from './obstacles';
import { score } from './state.js';

export function animate() {
    requestAnimationFrame(animate);
    gameLogic();
    if (!renderer) return;
    renderer.render(scene, camera);
}

function gameLogic() {
    if (!playerFinished) {
        carVelocity.add(carAcceleration);
        carVelocity.z = -currentSpeed;
        carVelocity.multiplyScalar(0.8);

        car.position.add(carVelocity);
        car.rotation.z = carAcceleration.x !== 0 ? -carAcceleration.x * 0.5 : car.rotation.z * 0.95;
        car.position.x = THREE.MathUtils.clamp(car.position.x, -roadWidth / 2 + carWidth / 2, roadWidth / 2 - carWidth / 2);
        car.position.z = THREE.MathUtils.clamp(car.position.z, -roadLength / 2 + carLength / 2, 100);

        updateScore();
        checkCollisions();
        updateCameraPosition();
    }

    if (!raceStarted && carVelocity.length() > 0) {
        raceStarted = true;
    }

    checkIfFinished();
}

let raceStarted = false;
let playerFinished = false;

function updateScore() {
    obstacles.forEach(obstacle => {
        if (!obstacle.hasBeenCounted && car.position.z < obstacle.position.z) {
            score.current += 50;
            obstacle.hasBeenCounted = true;
        }
    });

    if (carVelocity.length() > 0.1) {
        score.current += 0.5;
    }

    if (Math.abs(car.position.x) < 1) {
        score.current += 0.2;
    }
}

function checkIfFinished() {
    if (!playerFinished && car.position.z <= finishLine.position.z) {
        playerFinished = true;
        console.log(`Player finished! Final Score: ${score.current}`);
    }
}

function updateCameraPosition() {
    camera.position.x = car.position.x;
    camera.position.z = car.position.z + 10;
    camera.lookAt(car.position);
}

export function resetGame() {
    playerFinished = false;
    raceStarted = false;
    score.reset();
    obstacles.forEach(obstacle => obstacle.hasBeenCounted = false);
}
