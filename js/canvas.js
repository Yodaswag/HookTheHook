// canvas.js - Canvas setup, scaling, and coordinate transforms.

const VIRTUAL_WIDTH = 800;
const VIRTUAL_HEIGHT = 800;
const BORDER_RADIUS = 24;

let canvas;
let ctx;
let scaleFactor = 1;
let offsetX = 0;
let offsetY = 0;

export function initCanvas(canvasId) {
    canvas = document.getElementById(canvasId);
    ctx = canvas.getContext('2d');

    canvas.width = VIRTUAL_WIDTH;
    canvas.height = VIRTUAL_HEIGHT;

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('orientationchange', () => {
        setTimeout(resizeCanvas, 100);
    });

    return { canvas, ctx };
}

function resizeCanvas() {
    const padding = 16;
    const availW = window.innerWidth - padding * 2;
    const availH = window.innerHeight - padding * 2;
    const size = Math.min(availW, availH);

    scaleFactor = size / VIRTUAL_WIDTH;
    offsetX = (window.innerWidth - size) / 2;
    offsetY = (window.innerHeight - size) / 2;

    const borderRadiusPx = BORDER_RADIUS * scaleFactor;

    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    canvas.style.position = 'absolute';
    canvas.style.left = offsetX + 'px';
    canvas.style.top = offsetY + 'px';
    canvas.style.borderRadius = borderRadiusPx + 'px';

    positionOverlay('ui-layer', size, borderRadiusPx);
    positionOverlay('game-ui', size, borderRadiusPx);

    const muteBtn = document.getElementById('mute-btn');
    if (muteBtn) {
        muteBtn.style.position = 'absolute';
        muteBtn.style.left = (offsetX + 12) + 'px';
        muteBtn.style.top = (offsetY + size - 60) + 'px';
    }

    const speedBtn = document.getElementById('speed-btn');
    if (speedBtn) {
        speedBtn.style.position = 'absolute';
        speedBtn.style.left = (offsetX + 70) + 'px';
        speedBtn.style.top = (offsetY + size - 60) + 'px';
    }

    const speedPanel = document.getElementById('speed-panel');
    if (speedPanel) {
        speedPanel.style.position = 'absolute';
        speedPanel.style.left = (offsetX + 126) + 'px';
        speedPanel.style.top = (offsetY + size - 58) + 'px';
    }

    const dpr = window.devicePixelRatio || 1;
    canvas.width = VIRTUAL_WIDTH * dpr;
    canvas.height = VIRTUAL_HEIGHT * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function positionOverlay(id, size, borderRadiusPx) {
    const el = document.getElementById(id);
    if (!el) return;

    el.style.position = 'absolute';
    el.style.left = offsetX + 'px';
    el.style.top = offsetY + 'px';
    el.style.width = size + 'px';
    el.style.height = size + 'px';
    el.style.borderRadius = borderRadiusPx + 'px';
    el.style.overflow = 'hidden';
}

export function screenToGame(screenX, screenY) {
    const rect = canvas.getBoundingClientRect();
    const x = ((screenX - rect.left) / rect.width) * VIRTUAL_WIDTH;
    const y = ((screenY - rect.top) / rect.height) * VIRTUAL_HEIGHT;
    return { x, y };
}

export function getScaleFactor() {
    return scaleFactor;
}

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
