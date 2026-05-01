// input.js — Mouse and touch input handling

import { initAudio } from './audio.js';

let onDropCallback = null;

/**
 * Register the callback for when the player taps/clicks to drop the hook.
 */
export function initInput(callback) {
    onDropCallback = callback;
    window.addEventListener('mousedown', handleDrop);
    window.addEventListener('touchstart', handleDrop);
}

function handleDrop(e) {
    if (e.target.id === 'mute-btn') return;
    if (e.target.closest && e.target.closest('.ui-overlay')) return;
    if (onDropCallback) {
        initAudio();
        onDropCallback(e);
    }
}
