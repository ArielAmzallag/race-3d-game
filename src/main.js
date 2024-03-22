import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 10);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(0, 10, -5);
scene.add(directionalLight);

const roadWidth = 10;
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
const car = new THREE.Mesh(new THREE.ConeGeometry(carWidth / 2, carLength, 32), new THREE.MeshLambertMaterial({ color: 0x0000ff }));
car.rotateX(-(Math.PI / 2));
car.position.z = 100;
car.position.y = 0.5;
scene.add(car);



let carAcceleration = new THREE.Vector3(0, 0, 0);
const carMaxSpeed = 0.1;


const aiCar = new THREE.Mesh(new THREE.ConeGeometry(carWidth / 2, carLength, 32), new THREE.MeshLambertMaterial({ color: 0xff0000 }));
aiCar.rotateX(-(Math.PI / 2));
aiCar.position.z = 100;
aiCar.position.y = 0.5;
aiCar.position.x = 2;
scene.add(aiCar);

let aiCarVelocity = new THREE.Vector3(0, 0, -aiSpeed); 
const aiSpeed = 0.05;
aiCar.position.z -= aiSpeed;


const obstacles = [];
const obstacleGeometry = new THREE.SphereGeometry(1, 16, 16);
const obstacleMaterial = new THREE.MeshBasicMaterial({color: 0x0000ff});
const obstacleStartZ = car.position.z - 20;
const obstacleEndZ = finishLine.position.z + 30; 

for (let i = 0; i < 10; i++) {
    const obstacle = new THREE.Mesh(obstacleGeometry, obstacleMaterial);
    obstacle.position.x = (Math.random() - 0.5) * roadWidth;
    obstacle.position.z = obstacleStartZ + Math.random() * (obstacleEndZ - obstacleStartZ);
    obstacle.position.y = 0.5;
    scene.add(obstacle);
    obstacles.push(obstacle);
}


let startTime = Date.now();
let elapsedTime = 0;
let raceStarted = false;
let score = 0;
const maxScore = 1000;
let scoreSent = false;

function handleKeyDown(event) {
    if (event.key === 'ArrowLeft') carAcceleration.x = -carMaxSpeed;
    if (event.key === 'ArrowRight') carAcceleration.x = carMaxSpeed;
    if (event.key === 'ArrowUp') carAcceleration.z = -carMaxSpeed;
    if (event.key === 'ArrowDown') carAcceleration.z = carMaxSpeed;
}

function handleKeyUp(event) {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') carAcceleration.x = 0;
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') carAcceleration.z = 0;
}

document.addEventListener('keydown', handleKeyDown);
document.addEventListener('keyup', handleKeyUp);

function handleInvertedKeyDown(event) {
    if (event.key === 'ArrowLeft') carAcceleration.x = carMaxSpeed;
    if (event.key === 'ArrowRight') carAcceleration.x = -carMaxSpeed;
    if (event.key === 'ArrowUp') carAcceleration.z = -carMaxSpeed;
    if (event.key === 'ArrowDown') carAcceleration.z = carMaxSpeed;
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

function checkCollisions() {
    const carBoundingBox = new THREE.Box3().setFromObject(car);
    obstacles.forEach((obstacle, index) => {
        const obstacleBoundingBox = new THREE.Box3().setFromObject(obstacle);
        if (carBoundingBox.intersectsBox(obstacleBoundingBox)) {
            // Apply negative effect here
            handleObstacleCollision(index);
        }
    });
}

function handleObstacleCollision(index) {
// Define effects and their associated colors
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

    const randomEffect = effects[Math.floor(Math.random() * effects.length)];
    randomEffect.action();
    obstacles[index].position.set((Math.random() - 0.5) * roadWidth, 0.5, -Math.random() * roadLength / 2);
}

function checkIfFinished() {
    if (car.position.z <= finishLine.position.z && raceStarted && !scoreSent) {
        raceStarted = false;
        score = maxScore - elapsedTime * 100;
        score = Math.max(score, 0);
        console.log(`Finished! Your score: ${score}`);
        scoreSent = true;
    }
}


let aiScore = 1000; // Initialize AI score, adjust logic for decreasing AI score as needed

function checkWinner() {
    if (!raceStarted) {
        let winner = "No one";
        if (score > aiScore) {
            winner = "Player wins!";
        } else if (aiScore > score) {
            winner = "CP wins!";
        } else {
            winner = "It's a tie!";
        }
        console.log(`Race finished! ${winner} Player score: ${score}, CP score: ${aiScore}`);
    }
}

// Call checkWinner() when both cars have finished
if (car.position.z <= finishLine.position.z && aiCar.position.z <= finishLine.position.z) {
    checkWinner();
}


const animate = () => {
    requestAnimationFrame(animate);
    carVelocity.add(carAcceleration);
    car.position.add(carVelocity);
    car.position.x = THREE.MathUtils.clamp(car.position.x, -roadWidth / 2 + carWidth / 2, roadWidth / 2 - carWidth / 2);
    car.position.z = THREE.MathUtils.clamp(car.position.z, -roadLength / 2 + carLength / 2, roadLength / 2 - carLength / 2);

    if (carAcceleration.x !== 0) {
        car.rotation.z = -carAcceleration.x * 0.5;
    } else {
        car.rotation.z *= 0.9;
    }

    if (!raceStarted && carVelocity.length() > 0) {
        startTime = Date.now();
        raceStarted = true;
    }
    if (raceStarted) {
        elapsedTime = ((Date.now() - startTime) / 1000).toFixed(2);
        checkIfFinished();
    }
    
    checkCollisions();

    carVelocity.multiplyScalar(0.9);
    camera.position.x = car.position.x;
    camera.position.z = car.position.z + 10;
    camera.lookAt(car.position);
    renderer.render(scene, camera);
};

animate();