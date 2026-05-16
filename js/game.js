// game.js — Game state machine and main loop

import { VIRTUAL_WIDTH, VIRTUAL_HEIGHT, getCtx } from './canvas.js';
import { playCastSound, playCatchSound, playReelSound, playBombSound, playErrorSound, playWinSound } from './audio.js';
import { createLevelItems, level3Slots, principles } from './levels.js';
import { drawBackground, drawWaves, drawLightRays, drawBubbles, drawItems, drawBoat, drawHook, drawFloatingTexts, drawFinalScreen } from './renderer.js';
import * as ui from './ui.js';

// --- Constants ---
const HOOK_ORIGIN = { x: VIRTUAL_WIDTH / 2, y: 220 };
const SWING_SPEED = 0.025;
const DROP_SPEED = 8;
const MAX_ANGLE = Math.PI / 2.5;

// --- Speed ---
let gameSpeed = 1.0; // multiplier, 0.5 – 3.0

export function setGameSpeed(v) { gameSpeed = v; }
export function getGameSpeed()  { return gameSpeed; }

// --- State ---
let currentLevel = 1;
let score = 0;
let hookState = 'IDLE';
let hookAngle = -MAX_ANGLE;
let hookAngleDir = 1;
let hookLength = 50;
let caughtItem = null;
let items = [];
let bubbles = [];
let floatingTexts = [];
let animationFrameId = null;
let chestsCollected = 0;
let frameCount = 0;
let level3CollectedCount = 0;

// --- Public API ---

export function start() {
    ui.hideScreen('start-screen');
    ui.showGameUI();
    score = 0;
    updateScore(0);
    initLevel(1);
    if (!animationFrameId) gameLoop();
}

export function handleDrop(e) {
    if (hookState === 'SWINGING') {
        hookState = 'DROPPING';
        playCastSound();
    }
}

export function startCurrentLevel() {
    initLevel(currentLevel);
}

export function renderCurrentFrame() {
    if (!animationFrameId) {
        gameLoop();
        return;
    }
    renderGame();
}

export function onSubmitSurvey1() {
    currentLevel = 2;
    ui.showLevelIntro(2);
    ui.updateLevelDisplay('שלב 2');
    ui.updateMessageDisplay('היכונו...');
    hookState = 'IDLE';
}

export function onCloseCard() {
    caughtItem = null;
    chestsCollected++;
    ui.updateLevelDisplay(`שלב 2: ידע (${chestsCollected}/4)`);

    if (chestsCollected >= principles.length) {
        currentLevel = 3;
        ui.showLevelIntro(3);
        ui.updateLevelDisplay('שלב 3');
        ui.updateMessageDisplay('היכונו...');
        hookState = 'IDLE';
    } else {
        hookState = 'SWINGING';
    }
}

export function onSubmitSurvey2() {
    hookState = 'SHOW_FINAL_ANSWERS';
    ui.hideGameUI();

    // 2×2 grid for final showcase
    const finalTargets = [
        { x: 250, y: 300, scale: 1.4 },
        { x: 550, y: 300, scale: 1.4 },
        { x: 250, y: 500, scale: 1.4 },
        { x: 550, y: 500, scale: 1.4 }
    ];

    let idx = 0;
    items.forEach(item => {
        if (item.collected) {
            item.targetX = finalTargets[idx].x;
            item.targetY = finalTargets[idx].y;
            item.targetScale = finalTargets[idx].scale;
            idx++;
        }
    });
}

// --- Internal ---

function updateScore(pts) {
    score += pts;
    ui.updateScoreDisplay(score);
}

function addFloatingText(text, x, y, color = "#ff0000") {
    floatingTexts.push({ text, x, y, color, alpha: 1.0 });
}

function initLevel(level) {
    currentLevel = level;
    chestsCollected = 0;
    caughtItem = null;
    hookLength = 50;
    hookState = 'SWINGING';
    floatingTexts = [];
    level3CollectedCount = 0;

    items = createLevelItems(level);

    if (level === 1) {
        ui.updateLevelDisplay('שלב 1: חימום');
        ui.updateMessageDisplay('אספו את תיבות האוצר, היזהרו מהפצצות!');
    } else if (level === 2) {
        ui.updateLevelDisplay('שלב 2: ידע (0/4)');
        ui.updateMessageDisplay('אספו את התיבות כדי ללמוד על עקרונות ההוק');
    } else if (level === 3) {
        ui.updateLevelDisplay('שלב 3: אתגר');
        ui.updateMessageDisplay('אספו את כל המשפטים הנכונים (קראו היטב את התשובות!)');
    }

    // Generate bubbles once
    if (bubbles.length === 0) {
        for (let i = 0; i < 40; i++) {
            bubbles.push({
                x: Math.random() * VIRTUAL_WIDTH,
                y: Math.random() * VIRTUAL_HEIGHT,
                radius: Math.random() * 4 + 1,
                speed: Math.random() * 1.5 + 0.5
            });
        }
    }
}

function checkCollision(hx, hy) {
    for (let item of items) {
        if (item.caught || item.collected) continue;
        let hit = false;
        if (item.type === 'bomb') {
            hit = Math.hypot(item.x - hx, item.y - hy) < item.radius + 10;
        } else {
            hit = hx > item.x - item.width / 2 && hx < item.x + item.width / 2 &&
                  hy > item.y - item.height && hy < item.y + item.height / 2;
        }
        if (hit) return item;
    }
    return null;
}

function processCatch(item) {
    if (item.type === 'bomb') {
        playBombSound();
        updateScore(-50);
        addFloatingText("-50", item.x, item.y, "#ef4444");
        item.caught = true;
        hookState = 'REELING';
        caughtItem = null;
    } else {
        caughtItem = item;
        caughtItem.caught = true;
        hookState = 'REELING';
        playCatchSound();
    }
}

function onReelInComplete() {
    hookLength = 50;

    if (!caughtItem) {
        hookState = 'SWINGING';
        return;
    }

    const floatX = caughtItem.x;
    const floatY = caughtItem.y;

    if (currentLevel === 1) {
        updateScore(100);
        addFloatingText("+100", floatX, floatY, "#4ade80");
        caughtItem = null;
        chestsCollected++;
        if (chestsCollected >= 2) {
            hookState = 'IDLE';
            ui.showScreen('survey-1-screen');
        } else {
            hookState = 'SWINGING';
        }
    }
    else if (currentLevel === 2) {
        updateScore(1000);
        addFloatingText("+1000", floatX, floatY, "#4ade80");
        ui.showChestAnimation(caughtItem.title, caughtItem.text);
        hookState = 'IDLE';
    }
    else if (currentLevel === 3) {
        if (caughtItem.isCorrectStatement) {
            updateScore(1000);
            addFloatingText("+1000", floatX, floatY, "#4ade80");
            playCatchSound();

            caughtItem.collected = true;
            caughtItem.targetX = level3Slots[level3CollectedCount].x;
            caughtItem.targetY = level3Slots[level3CollectedCount].y;
            caughtItem.targetScale = 0.9;

            level3CollectedCount++;
            caughtItem = null;

            if (level3CollectedCount >= 4) {
                playWinSound();
                hookState = 'LEVEL3_END';
                setTimeout(() => ui.showScreen('survey-2-screen'), 2000);
            } else {
                hookState = 'SWINGING';
            }
        } else {
            playErrorSound();
            updateScore(-100);
            addFloatingText("-100", floatX, floatY, "#ff0000");

            ui.updateMessageDisplay("לא נורא, לומדים מפספוס");
            ui.flashMessageError();

            setTimeout(() => {
                if (currentLevel === 3 && hookState !== 'LEVEL3_END' && hookState !== 'SHOW_FINAL_ANSWERS') {
                    ui.updateMessageDisplay('אספו את כל המשפטים הנכונים (קראו היטב את התשובות!)');
                }
            }, 2500);

            caughtItem.x = caughtItem.originalX;
            caughtItem.y = caughtItem.originalY;
            caughtItem.caught = false;
            caughtItem = null;
            hookState = 'SWINGING';
        }
    }
}

function getHookEnd() {
    return {
        x: Math.round(HOOK_ORIGIN.x + Math.sin(hookAngle) * hookLength),
        y: Math.round(HOOK_ORIGIN.y + Math.cos(hookAngle) * hookLength)
    };
}

function renderGameToText() {
    const visibleScreens = Array.from(document.querySelectorAll('#ui-layer > div:not(.hidden)'))
        .map(screen => screen.id);
    return JSON.stringify({
        coordinateSystem: 'virtual 800 by 800 canvas, origin top-left, x right, y down',
        level: currentLevel,
        mode: hookState,
        score,
        hook: {
            origin: HOOK_ORIGIN,
            end: getHookEnd(),
            angle: Number(hookAngle.toFixed(3)),
            length: Math.round(hookLength)
        },
        progress: {
            chestsCollected,
            level3CollectedCount
        },
        visibleScreens,
        items: items.map(item => ({
            id: item.id,
            type: item.type,
            x: Math.round(item.x),
            y: Math.round(item.y),
            caught: Boolean(item.caught),
            collected: Boolean(item.collected),
            correct: item.isCorrectStatement
        }))
    });
}

function stepGame() {
    frameCount++;

    // --- Update ---
    if (hookState === 'SWINGING') {
        hookAngle += SWING_SPEED * hookAngleDir * gameSpeed;
        if (hookAngle > MAX_ANGLE || hookAngle < -MAX_ANGLE) {
            hookAngleDir *= -1;
        }
    }
    else if (hookState === 'DROPPING') {
        const currentHx = HOOK_ORIGIN.x + Math.sin(hookAngle) * hookLength;
        const currentHy = HOOK_ORIGIN.y + Math.cos(hookAngle) * hookLength;

        // Homing toward nearest non-bomb item
        let nearestChest = null;
        let minDist = Infinity;
        for (let item of items) {
            if (!item.caught && !item.collected && item.type !== 'bomb') {
                const dist = Math.hypot(item.x - currentHx, item.y - currentHy);
                if (dist < 120 && dist < minDist) {
                    minDist = dist;
                    nearestChest = item;
                }
            }
        }
        if (nearestChest) {
            const targetAngle = Math.atan2(nearestChest.x - HOOK_ORIGIN.x, nearestChest.y - HOOK_ORIGIN.y);
            hookAngle += (targetAngle - hookAngle) * 0.08;
        }

        hookLength += DROP_SPEED * gameSpeed;
        const hx = HOOK_ORIGIN.x + Math.sin(hookAngle) * hookLength;
        const hy = HOOK_ORIGIN.y + Math.cos(hookAngle) * hookLength;

        let hit = checkCollision(hx, hy);
        if (hit) {
            processCatch(hit);
        } else if (hx < 0 || hx > VIRTUAL_WIDTH || hy > VIRTUAL_HEIGHT) {
            hookState = 'REELING';
        }
    }
    else if (hookState === 'REELING') {
        if (frameCount % 10 === 0 && caughtItem) playReelSound();

        hookLength -= DROP_SPEED * gameSpeed;
        if (caughtItem) {
            caughtItem.x = HOOK_ORIGIN.x + Math.sin(hookAngle) * hookLength;
            if (caughtItem.type === 'text_box') {
                caughtItem.y = HOOK_ORIGIN.y + Math.cos(hookAngle) * hookLength + caughtItem.height / 2 + 10;
            } else {
                caughtItem.y = HOOK_ORIGIN.y + Math.cos(hookAngle) * hookLength + caughtItem.height / 2;
            }
        }
        if (hookLength <= 50) {
            onReelInComplete();
        }
    }

    // Animate collected items sliding to targets
    if (currentLevel === 3) {
        items.forEach(item => {
            if (item.collected) {
                item.x += (item.targetX - item.x) * 0.1;
                item.y += (item.targetY - item.y) * 0.1;
                if (item.targetScale) item.scale += (item.targetScale - item.scale) * 0.1;
            }
        });
    }

}

function renderGame() {
    const ctx = getCtx();
    if (!ctx) return;

    drawBackground(ctx, frameCount);
    // drawLightRays(ctx);
    // drawBubbles(ctx, bubbles);
    drawItems(ctx, items, caughtItem, hookState, frameCount);

    if (hookState !== 'SHOW_FINAL_ANSWERS') {
        drawBoat(ctx);
        drawWaves(ctx, frameCount);
        if (hookState !== 'LEVEL3_END') {
            drawHook(ctx, HOOK_ORIGIN, hookAngle, hookLength);
        }
    }

    if (hookState === 'SHOW_FINAL_ANSWERS') {
        drawFinalScreen(ctx, score);
    }

    drawFloatingTexts(ctx, floatingTexts);
}

// --- Game Loop ---

function gameLoop() {
    stepGame();
    renderGame();

    animationFrameId = requestAnimationFrame(gameLoop);
}

if (typeof window !== 'undefined') {
    window.render_game_to_text = renderGameToText;
    window.advanceTime = (ms = 16.67) => {
        const steps = Math.max(1, Math.round(ms / (1000 / 60)));
        for (let i = 0; i < steps; i++) {
            stepGame();
        }
        renderGame();
        return renderGameToText();
    };
}
