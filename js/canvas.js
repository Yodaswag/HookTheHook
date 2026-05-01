// canvas.js — Canvas setup, scaling, and coordinate transforms
// Maintains a 1:1 square canvas that scales to fit any viewport

const VIRTUAL_WIDTH = 800;
const VIRTUAL_HEIGHT = 800;
const BORDER_RADIUS = 24; // CSS border-radius in virtual px

let canvas, ctx;
let scaleFactor = 1;
let offsetX = 0;
let offsetY = 0;

/**
 * Initialize the canvas element and attach resize handling.
 * @param {string} canvasId - The id of the <canvas> element.
 * @returns {{ canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D }}
 */
export function initCanvas(canvasId) {
    canvas = document.getElementById(canvasId);
    ctx = canvas.getContext('2d');

    // Set the internal resolution (virtual coordinate space)
    canvas.width = VIRTUAL_WIDTH;
    canvas.height = VIRTUAL_HEIGHT;

    // Initial sizing
    resizeCanvas();

    // Re-scale on window resize, orientation change, and zoom
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('orientationchange', () => {
        setTimeout(resizeCanvas, 100);
    });

    return { canvas, ctx };
}

/**
 * Recalculate the canvas display size to be the largest 1:1 square
 * that fits in the viewport, with some padding.
 */
function resizeCanvas() {
    const padding = 16; // px of breathing room around the square
    const availW = window.innerWidth - padding * 2;
    const availH = window.innerHeight - padding * 2;

    // Largest square that fits
    const size = Math.min(availW, availH);
    scaleFactor = size / VIRTUAL_WIDTH;

    // Calculate offset for centering
    offsetX = (window.innerWidth - size) / 2;
    offsetY = (window.innerHeight - size) / 2;

    const borderRadiusPx = BORDER_RADIUS * scaleFactor;

    // Apply CSS sizing (the internal resolution stays at VIRTUAL_WIDTH×VIRTUAL_HEIGHT)
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    canvas.style.position = 'absolute';
    canvas.style.left = offsetX + 'px';
    canvas.style.top = offsetY + 'px';
    canvas.style.borderRadius = borderRadiusPx + 'px';

    // Position the UI layer to exactly match the canvas
    const uiLayer = document.getElementById('ui-layer');
    if (uiLayer) {
        uiLayer.style.position = 'absolute';
        uiLayer.style.left = offsetX + 'px';
        uiLayer.style.top = offsetY + 'px';
        uiLayer.style.width = size + 'px';
        uiLayer.style.height = size + 'px';
        uiLayer.style.borderRadius = borderRadiusPx + 'px';
        uiLayer.style.overflow = 'hidden';
    }

    // Position the HUD to match the canvas
    const gameUI = document.getElementById('game-ui');
    if (gameUI) {
        gameUI.style.position = 'absolute';
        gameUI.style.left = offsetX + 'px';
        gameUI.style.top = offsetY + 'px';
        gameUI.style.width = size + 'px';
        gameUI.style.height = size + 'px';
        gameUI.style.borderRadius = borderRadiusPx + 'px';
        gameUI.style.overflow = 'hidden';
    }

    // Position the mute button relative to the canvas
    const muteBtn = document.getElementById('mute-btn');
    if (muteBtn) {
        muteBtn.style.position = 'absolute';
        muteBtn.style.left = (offsetX + 12) + 'px';
        muteBtn.style.top = (offsetY + 12) + 'px';
    }

    // HiDPI: increase internal resolution for sharp rendering
    const dpr = window.devicePixelRatio || 1;
    canvas.width = VIRTUAL_WIDTH * dpr;
    canvas.height = VIRTUAL_HEIGHT * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

/**
 * Convert screen (mouse/touch) coordinates to virtual game coordinates.
 */
export function screenToGame(screenX, screenY) {
    const rect = canvas.getBoundingClientRect();
    const x = ((screenX - rect.left) / rect.width) * VIRTUAL_WIDTH;
    const y = ((screenY - rect.top) / rect.height) * VIRTUAL_HEIGHT;
    return { x, y };
}

/**
 * Get the current scale factor.
 */
export function getScaleFactor() {
    return scaleFactor;
}

/**
 * Get canvas offset.
 */
export function getCanvasOffset() {
    return { x: offsetX, y: offsetY };
}

export function getCanvas() {
    return canvas;
}

export function getCtx() {
    return ctx;
}

export { VIRTUAL_WIDTH, VIRTUAL_HEIGHT };
