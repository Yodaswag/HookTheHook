// audio.js — Web Audio API sound system

let audioCtx;
let masterGain;
let isMuted = false;

/**
 * Initialize the audio context (must be called from a user gesture).
 */
export function initAudio() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!audioCtx) {
        audioCtx = new AC();
        masterGain = audioCtx.createGain();
        masterGain.connect(audioCtx.destination);
        masterGain.gain.value = 0.3;
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

/**
 * Toggle mute state. Returns new mute state.
 */
export function toggleMute() {
    isMuted = !isMuted;
    if (masterGain) masterGain.gain.value = isMuted ? 0 : 0.3;
    return isMuted;
}

export function getIsMuted() {
    return isMuted;
}

/**
 * Play a tone with the given parameters.
 */
function playTone(freq, type, duration, vol = 1, startTimeOffset = 0) {
    if (!audioCtx || isMuted) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;

    if (Array.isArray(freq)) {
        osc.frequency.setValueAtTime(freq[0], audioCtx.currentTime + startTimeOffset);
        osc.frequency.exponentialRampToValueAtTime(freq[1], audioCtx.currentTime + startTimeOffset + duration);
    } else {
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime + startTimeOffset);
    }

    gain.gain.setValueAtTime(vol, audioCtx.currentTime + startTimeOffset);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + startTimeOffset + duration);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start(audioCtx.currentTime + startTimeOffset);
    osc.stop(audioCtx.currentTime + startTimeOffset + duration);
}

// --- Sound Effects ---

export function playCastSound() {
    playTone([600, 100], 'sine', 0.4, 0.5);
}

export function playCatchSound() {
    playTone(880, 'square', 0.1, 0.3);
    playTone(1108, 'square', 0.1, 0.3, 0.05);
}

export function playReelSound() {
    playTone(150, 'sawtooth', 0.05, 0.1);
}

export function playBombSound() {
    playTone([100, 40], 'sawtooth', 0.5, 0.8);
}

export function playErrorSound() {
    playTone(150, 'sawtooth', 0.3, 0.5);
    playTone(100, 'sawtooth', 0.4, 0.5, 0.15);
}

export function playChestOpenSound() {
    playTone(261.63, 'sine', 0.3, 0.5, 0);
    playTone(329.63, 'sine', 0.3, 0.5, 0.1);
    playTone(392.00, 'sine', 0.4, 0.5, 0.2);
    playTone(523.25, 'sine', 0.6, 0.5, 0.3);
}

export function playWinSound() {
    playTone(440, 'square', 0.15, 0.4, 0);
    playTone(440, 'square', 0.15, 0.4, 0.2);
    playTone(440, 'square', 0.15, 0.4, 0.4);
    playTone(587.33, 'square', 0.6, 0.4, 0.6);
}
