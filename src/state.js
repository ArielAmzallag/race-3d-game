import { carVelocity } from "./car";
import { handleKeyDown, handleKeyUp, handleInvertedKeyDown, handleInvertedKeyUp } from "./controls";

export let score = {
    current: 0,
    maxScore: 1000,
    reset: function() { this.current = 0; },
    finalize: function(stTime) {
        this.current = this.maxScore - ((Date.now() - stTime) / 1000) * 100;
        this.current = Math.max(this.current, 0);
    }
};

export const effects = [
    { type: 'wall', action: () => { carVelocity.set(0, 0, 0); }},
    { type: 'hole', action: () => { car.position.set(car.position.x, car.position.y, 100); }},
    { type: 'general', name: '-50 Points', action: () => { score.current = Math.max(score.current - 50, 0); }},
    { type: 'general', name: 'Temporary Immobilization', action: () => setTimeout(() => carVelocity.set(0, 0, 0), 1000) }
];

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
