import * as THREE from 'three';
import { scene } from './scene';
import { loadedModels } from './loader';


export let carVelocity = new THREE.Vector3(0, 0, -0.5);
export let carAcceleration = new THREE.Vector3(0, 0, 0);
export const initialSpeed = 0.2;
export let currentSpeed = initialSpeed;
export const speedIncrement = 0.01;
export const maxSpeed = 0.3;
export const minSpeed = 0.05;
export const carMaxSpeed = 0.1;

export const carWidth = 2;
export const carLength = 4;
export const car = new THREE.Mesh(new THREE.ConeGeometry(carWidth / 2, carLength, 32), new THREE.MeshLambertMaterial({ color: 0x0000ff }));
car.rotateX(-(Math.PI / 2));
car.position.set(0, 0.5, 100);
scene.add(car);

if (loadedModels.car) {
    const carModel = loadedModels.car.clone();
    carModel.scale.set(0.5, 0.5, 0.5);  // Adjust scale as needed
    car.add(carModel);
}

export function updateCarPosition(deltaTime) {
    carVelocity.add(carAcceleration.clone().multiplyScalar(deltaTime));
    car.position.add(carVelocity.clone().multiplyScalar(deltaTime));
}

export function resetCar() {
    car.position.set(0, 0.5, 100);
    carVelocity.set(0, 0, -0.5);
    carAcceleration.set(0, 0, 0);
}
