import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'; // Make sure to have this path correct

const loader = new GLTFLoader();

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 10);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

scene.background = new THREE.Color(0x000000);
scene.fog = new THREE.Fog(0x660094, 0, 750);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(0, 10, -5);
scene.add(directionalLight);

const roadWidth = 40;
const roadLength = 200;
const road = new THREE.Mesh(new THREE.PlaneGeometry(roadWidth, roadLength), new THREE.MeshLambertMaterial({ color: 0x555555 }));
road.rotation.x = -Math.PI / 2;
road.position.y = -0.5;
scene.add(road);

const finishLine = new THREE.Mesh(new THREE.PlaneGeometry(roadWidth, 1), new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide }));
finishLine.position.z = -roadLength / 2 + 10;
finishLine.rotation.x = Math.PI / 2;
scene.add(finishLine);


const carWidth = 2;
const carLength = 4;
let carVelocity = new THREE.Vector3(0, 0, 0);
carVelocity.multiplyScalar(0.5);
carVelocity = new THREE.Vector3(0, 0, -0.5);
let car = new THREE.Mesh(new THREE.ConeGeometry(carWidth / 2, carLength, 32), new THREE.MeshLambertMaterial({ color: 0x0000ff }));
car.rotateX(-(Math.PI / 2));
car.position.z = 100;
car.position.y = 0.5;
scene.add(car);

const initialSpeed = 0.1;
let currentSpeed = initialSpeed;
let speedIncrement = 0.01;
let maxSpeed = 0.3;
let minSpeed = 0.05;
const commonSpeed = 0.1;
let carAcceleration = new THREE.Vector3(0, 0, 0);
const carMaxSpeed = 0.1;

let playerFinished = false;
let raceEndAnnounced = false;

let holeGeometry;
let obstacles = [];
obstacles = obstacles.filter(o => o !== obstacle);
const obstacleGeometry = new THREE.SphereGeometry(1, 16, 16);
const obstacleMaterial = new THREE.MeshBasicMaterial({color: 0x0000ff});
const obstacleStartZ = car.position.z - 20;
const obstacleEndZ = finishLine.position.z + 30; 
for (let i = 0; i < 69; i++) {
    const obstacle = new THREE.Mesh(obstacleGeometry, obstacleMaterial);
    obstacle.position.x = (Math.random() - 0.5) * roadWidth;
    obstacle.position.z = obstacleStartZ + Math.random() * (obstacleEndZ - obstacleStartZ);
    obstacle.position.y = 0.5;
    obstacle.collided = false; // Add this line
    scene.add(obstacle);
    obstacles.push(obstacle);
}

// Positions for rays to the left and right to check for wider avoidance paths
const leftRayPosition = new THREE.Vector3(-1, 0, 0);
const rightRayPosition = new THREE.Vector3(1, 0, 0);

let startTime = Date.now();
let elapsedTime = 0;
let raceStarted = false;
let score = 0;
const maxScore = 1000;
let scoreSent = false;

function handleKeyDown(event) {
    switch(event.key) {
        case 'ArrowLeft':
            carAcceleration.x = -currentSpeed;
            break;
        case 'ArrowRight':
            carAcceleration.x = currentSpeed;
            break;
        case 'ArrowUp':
            // Increase speed with upper limit
            currentSpeed = Math.min(currentSpeed + speedIncrement, maxSpeed);
            break;
        case 'ArrowDown':
            // Decrease speed with lower limit
            currentSpeed = Math.max(currentSpeed - speedIncrement, minSpeed);
            break;
        // You can add more cases if you need other controls
    }
}

function handleKeyUp(event) {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') carAcceleration.x = 0;
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') carAcceleration.z = 0;
}

document.addEventListener('keydown', handleKeyDown);
document.addEventListener('keyup', handleKeyUp);

function handleInvertedKeyDown(event) {
    if (event.key === 'ArrowLeft') carAcceleration.x = currentSpeed;
    if (event.key === 'ArrowRight') carAcceleration.x = -currentSpeed;
}

function handleInvertedKeyUp(event) {
    handleKeyUp(event);
}

function invertControls() {
    document.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('keyup', handleKeyUp);
    document.addEventListener('keydown', handleInvertedKeyDown);
    document.addEventListener('keyup', handleInvertedKeyUp);
    setTimeout(() => {
        document.removeEventListener('keydown', handleInvertedKeyDown);
        document.removeEventListener('keyup', handleInvertedKeyUp);
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);
    }, 5000);
}

const wallWidth = 2;
const wallHeight = 3;
const wallDepth = 1;
const holeRadius = 1.5;
const holeDepth = 0.1;
const numObstacles = 10;

// Materials
const wallMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 }); // Brown color for walls
const holeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 }); // Black color for holes

// Create walls
for (let i = 0; i < numObstacles; i++) {
    // Wall
    const wall = new THREE.Mesh(
        new THREE.BoxGeometry(wallWidth, wallHeight, wallDepth),
        wallMaterial
    );
    wall.position.x = (Math.random() - 0.5) * roadWidth;
    wall.position.z = obstacleStartZ + Math.random() * (obstacleEndZ - obstacleStartZ);
    wall.position.y = wallHeight / 2;
    wall.type = 'wall'; // Add this line
    wall.hasCollided = false; // Add this line
    scene.add(wall);
    obstacles.push(wall);

}

for (let i = 0; i < (numObstacles/2); i++) {
const hole = new THREE.Mesh(
    new THREE.CylinderGeometry(holeRadius, holeRadius, holeDepth, 32),
    holeMaterial
);
hole.position.x = (Math.random() - 0.5) * roadWidth-29;
hole.position.z = obstacleStartZ + Math.random() * (obstacleEndZ - obstacleStartZ);
hole.type = 'hole'; // Add this line
hole.hasCollided = false; // Add this line
scene.add(hole);
obstacles.push(hole);
}

function checkCollisions() {
    const carBoundingBox = new THREE.Box3().setFromObject(car);

    obstacles.forEach(obstacle => {
        const obstacleBoundingBox = new THREE.Box3().setFromObject(obstacle);

        // Check for intersections
        if (carBoundingBox.intersectsBox(obstacleBoundingBox)) {
            if (obstacle.userData.type === 'wall') {
                // Handle collision with a wall
                if (!obstacle.userData.hasCollided) {
                    carVelocity.set(0, 0, 0); // Stop the car
                    const pushBack = 0.9; // Push back amount
                    car.position.z += pushBack; // Apply push back
                    console.log('Player hit a wall!');
                    obstacle.userData.hasCollided = true;
                    setTimeout(() => obstacle.userData.hasCollided = false, 1000);
                }
            } else if (obstacle.userData.type === 'blackhole') {
                // Handle collision with a blackhole
                car.position.set(0, 0.5, 100); // Reset car to start
                console.log('Player fell into a black hole!');
                // Optionally trigger blackhole animation here
            }
        }
    });
}


function loadModel(url) {
    return new Promise((resolve, reject) => {
      loader.load(url, gltf => {
        resolve(gltf.scene);
      }, undefined, reject);
    });
  }
  async function initModels() {
    try {
        // Load Car Model
        const carModel = await loadModel('src/assets/rocketlowpoly/scene.gltf');
        carModel.scale.set(0.5, 0.5, 0.5);
        carModel.position.set(0, 0.5, 100);
        carModel.rotateX(-Math.PI / 2);
        car = carModel;
        scene.add(car);

        // Load and position Black Hole Model
        const holeModel = await loadModel('src/assets/blackhole/scene.gltf');
        holeModel.scale.set(2, 2, 2);
        for (let i = 0; i < numObstacles / 2; i++) {
            let hole = holeModel.clone();
            hole.position.x = (Math.random() - 0.5) * roadWidth;
            hole.position.z = obstacleStartZ + Math.random() * (obstacleEndZ - obstacleStartZ);
            hole.userData = { type: 'blackhole' };
            scene.add(hole);
            obstacles.push(hole);
        }

        // Load and position Space Rock Model
        const wallModel = await loadModel('src/assets/space_rock/scene.gltf');
        wallModel.scale.set(3, 3, 3); // Adjust this scale if necessary
        for (let i = 0; i < numObstacles; i++) {
            let wall = wallModel.clone();
            wall.position.x = (Math.random() - 0.5) * roadWidth;
            wall.position.z = obstacleStartZ + Math.random() * (obstacleEndZ - obstacleStartZ);
            wall.userData = { type: 'wall' };
            scene.add(wall);
            obstacles.push(wall);
        }
    } catch (error) {
        console.error('Failed to load model:', error);
    }
}   

// Initialize all models on startup
initModels();


function carOnGround() {
    return car.position.y <= 0; // Simple check for ground contact
}

const effects = [
    {
        name: 'Reduced Speed',
        action: () => {
            carVelocity.multiplyScalar(0.5);
            console.log('Hit obstacle: Reduced speed!');
        },
        color: 0x0000ff // Blue
    },
    {
        name: '-50 Points',
        action: () => {
            score = Math.max(score - 50, 0);
            console.log('Hit obstacle: -50 points!');
        },
        color: 0xffa500 // Orange
    },
    {
        name: 'Temporary Immobilization',
        action: () => {
            setTimeout(() => carVelocity.set(0, 0, 0), 1000);
            console.log('Hit obstacle: Temporary immobilization!');
        },
        color: 0xff0000 // Red
    },
    {
        name: 'Inversion of Controls',
        action: () => {
            invertControls();
            console.log('Hit obstacle: Inversion of controls!');
        },
        color: 0x800080 // Purple
    }
];



function handleObstacleCollision(collider, obstacle) {
    const effectIndex = obstacles.indexOf(obstacle);
    const effect = effects[effectIndex % effects.length];
    if (collider === 'Player') {
        console.log(`Player hit obstacle with effect: ${effect.name}`);
        effect.action(); // Apply the effect for the player
        score -= 50; // Decrease player score
    } else if (collider === 'AI') {
        console.log(`AI hit obstacle with effect: ${effect.name}`);
        aiScore -= 50; // Decrease AI score
        // Apply specific effects to the AI as needed
    }
    scene.remove(obstacle);
    obstacles = obstacles.filter(o => o !== obstacle);
}




function checkIfFinished() {
    if (car.position.z <= finishLine.position.z && raceStarted && !playerFinished) {
        playerFinished = true;
        score = maxScore - elapsedTime * 100;
        score = Math.max(score, 0); // Ensure score doesn't go negative
        raceStarted = false; // Stop the race for the player
        console.log(`Player finished! Score: ${score}`);
    }

}

// Reset the game to play again or perform other actions as needed
function resetGame() {
    playerFinished = false;
    aiFinished = false;
    raceEndAnnounced = false;
    // Reset other game state as required
}




const animate = () => {
    requestAnimationFrame(animate);

    if (!playerFinished) {
        // Always move forward based on the current speed
        carAcceleration.z = -currentSpeed;
        carVelocity.add(carAcceleration);
        car.position.add(carVelocity);

        // Update the rotation of the car
        if (carAcceleration.x !== 0) {
            car.rotation.z = -carAcceleration.x * 0.5;
        } else {
            car.rotation.z *= 0.9;
        }

        // Clamp the car's position to prevent it from going off the road and past the finish line
        car.position.x = THREE.MathUtils.clamp(
            car.position.x,
            -roadWidth / 2 + carWidth / 2,
            roadWidth / 2 - carWidth / 2
        );

        // Assuming the finish line's position is at the negative end of the z-axis
        car.position.z = THREE.MathUtils.clamp(
            car.position.z,
            -roadLength / 2 + carLength / 2, // Behind the starting line
            100 // Starting line position
        );
    }   


    // Stop the car's movement if finished
    if (playerFinished) {
        carVelocity.set(0, 0, 0);
    }

    // Update the rotation of the car
    if (carAcceleration.x !== 0) {
        car.rotation.z = -carAcceleration.x * 0.5;
    } else {
        car.rotation.z *= 0.9;
    }

    // Check if the race has started
    if (!raceStarted && carVelocity.length() > 0) {
        startTime = Date.now();
        raceStarted = true;
    }

    // Check if the player has finished the race
    if (!playerFinished && car.position.z <= finishLine.position.z) {
        playerFinished = true;
        score = maxScore - ((Date.now() - startTime) / 1000) * 100;
        score = Math.max(score, 0);
        console.log(`Player finished! Score: ${score}`);
    }

    // Check for collisions
    checkCollisions();

    // Slow down the car
    carVelocity.multiplyScalar(0.34);

    // Update camera position
    camera.position.x = car.position.x;
    camera.position.z = car.position.z + 10;
    camera.lookAt(car.position);

    // Render the scene
    renderer.render(scene, camera);
};

animate();