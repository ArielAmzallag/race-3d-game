import { car, currentSpeed, carAcceleration, maxSpeed, minSpeed, speedIncrement } from './car';

document.addEventListener('keydown', handleKeyDown);
document.addEventListener('keyup', handleKeyUp);

export function handleKeyDown(event) {
    switch (event.key) {
        case 'ArrowLeft':
            carAcceleration.x = -currentSpeed;
            break;
        case 'ArrowRight':
            carAcceleration.x = currentSpeed;
            break;
        case 'ArrowUp':
            currentSpeed = Math.min(currentSpeed + speedIncrement, maxSpeed);
            carAcceleration.z = -currentSpeed;
            break;
        case 'ArrowDown':
            currentSpeed = Math.max(currentSpeed - speedIncrement, minSpeed);
            carAcceleration.z = -currentSpeed;
            break;
    }
}

export function handleKeyUp(event) {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        carAcceleration.x = 0;
    }
    if (event.key === 'ArrowUp' || 'ArrowDown') {
        carAcceleration.z = 0;
    }
}

export function handleInvertedKeyDown(event) {
    if (event.key === 'ArrowLeft') carAcceleration.x = currentSpeed;
    if (event.key === 'ArrowRight') carAcceleration.x = -currentSpeed;
}
export function handleInvertedKeyUp(event) {
    handleKeyUp(event);
}