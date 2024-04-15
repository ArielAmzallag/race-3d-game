import * as THREE from 'three';

export const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);
scene.fog = new THREE.Fog(0x660094, 0, 750);

export const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

export const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(0, 10, -5);
scene.add(directionalLight);

export const roadWidth = 40;
export const roadLength = 200;
export const road = new THREE.Mesh(
    new THREE.PlaneGeometry(roadWidth, roadLength),
    new THREE.MeshLambertMaterial({ color: 0x555555 })
);
road.rotation.x = -Math.PI / 2;
road.position.y = -0.5;
scene.add(road);

export const finishLine = new THREE.Mesh(
    new THREE.PlaneGeometry(roadWidth, 1),
    new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide })
);
finishLine.position.z = -roadLength / 2 + 10;
finishLine.rotation.x = Math.PI / 2;
scene.add(finishLine);

export function initScene() {
    console.log("Scene initialized");
    scene.add(ambientLight, directionalLight, road, finishLine);
}

export function addModelToScene(modelName, gltf) {
    const model = gltf.scene;

    if (!(model instanceof THREE.Object3D)) {
        console.error(`${modelName} is not an instance of THREE.Object3D.`);
        return;
    }

    scene.add(model);
    console.log(`${modelName} added to scene`);
}
