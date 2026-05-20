// renderer.js — All canvas drawing functions
// Pure rendering: receives ctx + state, draws, no side effects

import { VIRTUAL_WIDTH, VIRTUAL_HEIGHT } from './canvas.js';

const seaLevelY = 230;
const waveHeight = 40;

export function drawBackground(ctx, frameCount) {
    if (bgImg.naturalWidth > 0) {
        // Make the background image larger than the canvas
        const bgScale = 1.2;
        const bgW = VIRTUAL_WIDTH * bgScale;
        const bgH = VIRTUAL_HEIGHT * bgScale;
        const bgX = (VIRTUAL_WIDTH - bgW) / 2;
        const bgY = (VIRTUAL_HEIGHT - bgH) / 2;
        ctx.drawImage(bgImg, bgX, bgY, bgW, bgH);
    } else {
        ctx.fillStyle = "#1C66A6";
        ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);
    }

    drawUnderwaterTexture(ctx);
    drawSeabed(ctx);
    // Removed drawFrame as user requested only the new background image
}

export function drawWaves(ctx, frameCount) {
    if (wavesImg.naturalWidth > 0) {
        const speed = 0.2;

        // Waves should be small and positioned just below the boat
        // height smaller than the min length of the hook string (which is 50)
        const waveY = 230;
        const waveWidth = wavesImg.naturalWidth * (waveHeight / wavesImg.naturalHeight);

        // Step with an overlap to reduce gap between waves
        const step = waveWidth * 0.75;
        let xOffsetScaled = (frameCount * speed) % step;

        // Tile the waves across the canvas
        for (let x = -xOffsetScaled; x < VIRTUAL_WIDTH; x += step) {
            ctx.drawImage(wavesImg, x, waveY, waveWidth, waveHeight);
        }
    }
}

function drawUnderwaterTexture(ctx) {
    if (waterImg.naturalWidth <= 0) return;

    const textureY = seaLevelY + waveHeight;
    const sourceY = waterImg.naturalHeight * 0.1;
    const sourceHeight = waterImg.naturalHeight * 0.78;
    const destinationHeight = VIRTUAL_HEIGHT - textureY;
    const destinationRatio = VIRTUAL_WIDTH / destinationHeight;
    const sourceWidth = sourceHeight * destinationRatio;
    const sourceX = (waterImg.naturalWidth - sourceWidth) / 2;

    ctx.save();
    ctx.beginPath();
    ctx.rect(0, textureY, VIRTUAL_WIDTH, destinationHeight);
    ctx.clip();
    ctx.drawImage(
        waterImg,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        0,
        textureY,
        VIRTUAL_WIDTH,
        destinationHeight
    );
    ctx.restore();
}

export function drawSeabed(ctx) {
    ctx.save();
    const sand = ctx.createLinearGradient(0, 660, 0, VIRTUAL_HEIGHT);
    sand.addColorStop(0, "rgba(225, 170, 88, 0.78)");
    sand.addColorStop(1, "rgba(129, 78, 39, 0.96)");
    ctx.fillStyle = sand;
    ctx.beginPath();
    ctx.moveTo(0, VIRTUAL_HEIGHT);
    ctx.lineTo(0, 700);
    ctx.bezierCurveTo(145, 635, 260, 735, 410, 690);
    ctx.bezierCurveTo(570, 642, 680, 718, VIRTUAL_WIDTH, 676);
    ctx.lineTo(VIRTUAL_WIDTH, VIRTUAL_HEIGHT);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "rgba(83, 45, 22, 0.38)";
    ctx.lineWidth = 3;
    for (let x = 50; x < VIRTUAL_WIDTH; x += 140) {
        ctx.beginPath();
        ctx.moveTo(x, 715);
        ctx.quadraticCurveTo(x + 18, 682, x + 42, 718);
        ctx.stroke();
    }
    ctx.restore();
}

function drawFrame(ctx) {
    ctx.save();
    ctx.strokeStyle = "rgba(47, 28, 16, 0.72)";
    ctx.lineWidth = 18;
    ctx.strokeRect(9, 9, VIRTUAL_WIDTH - 18, VIRTUAL_HEIGHT - 18);
    ctx.strokeStyle = "rgba(237, 202, 129, 0.55)";
    ctx.lineWidth = 4;
    ctx.strokeRect(26, 26, VIRTUAL_WIDTH - 52, VIRTUAL_HEIGHT - 52);
    ctx.restore();
}

/**
 * Draw light rays from the surface.
 */
export function drawLightRays(ctx) {
    ctx.save();
    ctx.globalAlpha = 0.16;
    ctx.fillStyle = "#ffffff";

    ctx.beginPath();
    ctx.moveTo(VIRTUAL_WIDTH / 2 - 50, 0);
    ctx.lineTo(VIRTUAL_WIDTH / 2 - 250, VIRTUAL_HEIGHT);
    ctx.lineTo(VIRTUAL_WIDTH / 2 + 100, VIRTUAL_HEIGHT);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(VIRTUAL_WIDTH / 2 + 50, 0);
    ctx.lineTo(VIRTUAL_WIDTH / 2 + 150, VIRTUAL_HEIGHT);
    ctx.lineTo(VIRTUAL_WIDTH / 2 + 350, VIRTUAL_HEIGHT);
    ctx.fill();

    ctx.restore();
}

/**
 * Update and draw bubbles.
 */
export function drawBubbles(ctx, bubbles) {
    for (let b of bubbles) {
        b.y -= b.speed;
        b.x += Math.sin(b.y * 0.05) * 0.5;
        if (b.y < -10) {
            b.y = VIRTUAL_HEIGHT + 10;
            b.x = Math.random() * VIRTUAL_WIDTH;
        }
        ctx.fillStyle = "rgba(220, 248, 255, 0.28)";
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.26)";
        ctx.lineWidth = 1;
        ctx.stroke();
    }
}

/**
 * Draw a treasure chest at (0,0) in local coordinates.
 * Used by both level 1/2 items and the mini-chest inside level 3 text boxes.
 */
export function drawChest(ctx, scale = 1) {
    ctx.save();
    ctx.scale(scale, scale);

    if (chestImg.naturalWidth > 0) {
        ctx.drawImage(chestImg, -22, -24, 44, 44);
        ctx.restore();
        return;
    }

    ctx.fillStyle = "rgba(0, 0, 0, 0.18)";
    ctx.beginPath();
    ctx.ellipse(0, 16, 22, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Chest body
    const body = ctx.createLinearGradient(0, -10, 0, 12);
    body.addColorStop(0, "#a35a22");
    body.addColorStop(1, "#5b2d13");
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.roundRect(-17, -10, 34, 22, 3);
    ctx.fill();

    // Wood panels
    ctx.strokeStyle = "#3d210f";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-15, -3); ctx.lineTo(15, -3); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-15, 4); ctx.lineTo(15, 4); ctx.stroke();

    // Chest lid
    ctx.fillStyle = "#c06b2d";
    ctx.beginPath(); ctx.arc(0, -10, 15, Math.PI, 0); ctx.fill();
    ctx.strokeStyle = "#3d210f";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Gold trims
    ctx.fillStyle = "#f7c948";
    ctx.fillRect(-15, -10, 30, 3);  // Lid edge
    ctx.fillRect(-12, -24, 4, 34);  // Left strap
    ctx.fillRect(8, -24, 4, 34);    // Right strap
    ctx.fillRect(-15, 8, 30, 2);    // Bottom edge

    // Lock
    ctx.fillStyle = "#f7c948";
    ctx.beginPath(); ctx.arc(0, -7, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#333";
    ctx.fillRect(-1, -7, 2, 4);

    ctx.restore();
}

/**
 * Draw a bomb at (0,0) in local coordinates.
 */
export function drawBomb(ctx, radius, frameCount) {
    if (bombImg.naturalWidth > 0) {
        ctx.save();
        const w = radius * 2.5;
        const h = w * (bombImg.naturalHeight / bombImg.naturalWidth);
        ctx.drawImage(bombImg, -w / 2, -h * 0.6, w, h);
        ctx.restore();
        return;
    }

    ctx.save();
    ctx.fillStyle = "rgba(0, 0, 0, 0.18)";
    ctx.beginPath();
    ctx.ellipse(0, radius * 0.8, radius * 0.95, radius * 0.28, 0, 0, Math.PI * 2);
    ctx.fill();

    // Bomb body
    const bomb = ctx.createRadialGradient(-6, -7, 2, 0, 0, radius);
    bomb.addColorStop(0, "#4b5563");
    bomb.addColorStop(1, "#0f172a");
    ctx.fillStyle = bomb;
    ctx.beginPath(); ctx.arc(0, 0, radius, 0, Math.PI * 2); ctx.fill();

    // Highlight
    ctx.fillStyle = "rgba(255,255,255,0.2)";
    ctx.beginPath(); ctx.arc(-5, -5, 6, 0, Math.PI * 2); ctx.fill();

    // Fuse base
    ctx.fillStyle = "#555";
    ctx.fillRect(-4, -radius - 4, 8, 6);

    // Fuse
    ctx.strokeStyle = "#8B4513";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -radius - 4);
    ctx.quadraticCurveTo(10, -radius - 15, 5, -radius - 20);
    ctx.stroke();

    // Spark animation
    if (frameCount % 10 < 5) {
        ctx.fillStyle = "#facc15";
        ctx.beginPath(); ctx.arc(5, -radius - 20, 4, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "#fb7185";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(5, -radius - 27);
        ctx.lineTo(5, -radius - 13);
        ctx.moveTo(-2, -radius - 20);
        ctx.lineTo(12, -radius - 20);
        ctx.stroke();
    }
    ctx.restore();
}

const tatteredPageImg = new Image();
tatteredPageImg.src = 'assets/Hook Game/tattered-page.png';

const anchorImg = new Image();
anchorImg.src = 'assets/Anchor.png';

const bombImg = new Image();
bombImg.src = 'assets/Bomb.png';

const chestImg = new Image();
chestImg.src = 'assets/Treasure chest - closed.png';

const bgImg = new Image();
bgImg.src = 'assets/Hook%20Game/hook-game-background.png';

const waterImg = new Image();
waterImg.src = 'assets/Hook%20Game/Water.png';

const wavesImg = new Image();
wavesImg.src = 'assets/Hook%20Game/hook-game-background-waves.png';

const shipImg = new Image();
shipImg.src = 'assets/Hook%20Game/ship.png';

const arrowImg = new Image();
arrowImg.src = 'assets/Hook Game/arrow.png';

const visualAssets = [
    tatteredPageImg,
    anchorImg,
    bombImg,
    chestImg,
    bgImg,
    waterImg,
    wavesImg,
    shipImg,
    arrowImg
];

export function waitForVisualAssets() {
    return Promise.all(
        visualAssets.map((img) => {
            if (img.complete) return Promise.resolve();
            return new Promise((resolve) => {
                img.addEventListener('load', resolve, { once: true });
                img.addEventListener('error', resolve, { once: true });
            });
        })
    );
}

/**
 * Draw a text box item (level 3) at (0,0) in local coordinates.
 */
export function drawTextBox(ctx, item, frameCount) {
    // Draw the tattered page background instead of a round rect
    // We check if it's loaded by checking naturalWidth
    if (tatteredPageImg.naturalWidth > 0) {
        // Draw the image to fit the item's width and height
        ctx.drawImage(tatteredPageImg, -item.width / 2, -item.height / 2, item.width, item.height);
    } else {
        // Fallback if image not loaded yet
        ctx.fillStyle = "#fff7d6";
        ctx.strokeStyle = "#b7791f";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(-item.width / 2, -item.height / 2, item.width, item.height, 8);
        ctx.fill();
        ctx.stroke();
    }

    // Mini chest in bottom-right corner
    ctx.save();
    ctx.translate(item.width / 2 - 10, item.height / 2 - 10);
    drawChest(ctx, 0.3);
    ctx.restore();

    // Text
    ctx.fillStyle = "#2b1b11";
    ctx.font = "bold 14px Trebuchet MS, Arial, system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    if (item.lines.length === 2) {
        ctx.fillText(item.lines[0], 0, -8);
        ctx.fillText(item.lines[1], 0, 12);
    } else {
        ctx.fillText(item.lines[0], 0, 0);
    }
}

/**
 * Draw all items.
 */
export function drawItems(ctx, items, caughtItem, hookState, frameCount) {
    for (let item of items) {
        // Hide items that have already been reeled in, unless they become collected display cards.
        if (item.caught && item !== caughtItem && !item.collected) continue;
        if (hookState === 'SHOW_FINAL_ANSWERS' && !item.collected) continue;

        ctx.save();
        ctx.translate(item.x, item.y);
        if (item.scale) ctx.scale(item.scale, item.scale);

        if (item.type === 'chest' || item.type === 'principle_chest') {
            drawChest(ctx, 1.8);
        }
        else if (item.type === 'bomb') {
            drawBomb(ctx, item.radius, frameCount);
        }
        else if (item.type === 'text_box') {
            drawTextBox(ctx, item, frameCount);
        }

        ctx.restore();
    }
}

/**
 * Draw the boat at the top of the canvas.
 */
export function drawBoat(ctx, xOverride = null) {
    const cx = xOverride !== null ? xOverride : VIRTUAL_WIDTH / 2;

    ctx.save();

    if (shipImg.naturalWidth > 0) {
        // Boat bottom just below instruction rectangle (Y ~ 100)
        // Let's make the boat smaller, e.g. width = 160px
        const targetWidth = 160;
        const scale = targetWidth / shipImg.naturalWidth;
        const w = targetWidth;
        const h = shipImg.naturalHeight * scale;

        const boatY = 245 - h;

        ctx.drawImage(shipImg, cx - w / 2, boatY, w, h);
    } else {
        // Fallback boat
        ctx.fillStyle = "#4f2a16";
        ctx.fillRect(cx - 60, 45, 120, 30);
    }
    ctx.restore();
}

/**
 * Draw the fishing line and hook.
 */
export function drawHook(ctx, hookOrigin, hookAngle, hookLength) {
    const endX = hookOrigin.x + Math.sin(hookAngle) * hookLength;
    const endY = hookOrigin.y + Math.cos(hookAngle) * hookLength;

    // Fishing line
    ctx.strokeStyle = "#e9d5a1";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(hookOrigin.x, hookOrigin.y);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    if (anchorImg.naturalWidth > 0) {
        ctx.save();
        ctx.translate(endX, endY);
        const w = 40;
        const h = w * (anchorImg.naturalHeight / anchorImg.naturalWidth);
        ctx.drawImage(anchorImg, -w / 2, 0, w, h);
        ctx.restore();
    } else {
        // Hook (arc at bottom of line)
        ctx.strokeStyle = "#d1d5db";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(endX, endY + 10, 10, Math.PI, 0, true);
        ctx.stroke();
        ctx.strokeStyle = "#6b7280";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(endX, endY + 10, 10, Math.PI, 0, true);
        ctx.stroke();
    }
}

/**
 * Draw floating score texts (+100, -50, etc).
 */
export function drawFloatingTexts(ctx, floatingTexts) {
    for (let i = floatingTexts.length - 1; i >= 0; i--) {
        let ft = floatingTexts[i];
        ctx.save();
        ctx.globalAlpha = ft.alpha;
        ctx.fillStyle = ft.color;
        ctx.font = "bold 36px Trebuchet MS, Arial, system-ui";
        ctx.textAlign = "center";
        ctx.fillText(ft.text, ft.x, ft.y);

        // White stroke for visibility
        ctx.strokeStyle = "rgba(255,255,255," + ft.alpha + ")";
        ctx.lineWidth = 1.5;
        ctx.strokeText(ft.text, ft.x, ft.y);

        ctx.restore();

        ft.y -= 1.5;
        ft.alpha -= 0.015;
        if (ft.alpha <= 0) {
            floatingTexts.splice(i, 1);
        }
    }
}

/**
 * Draw the final "congratulations" screen with score.
 */
export function drawFinalScreen(ctx, score) {
    ctx.save();

    if (tatteredPageImg.naturalWidth > 0) {
        const tw = 600;
        const th = 260;
        ctx.drawImage(tatteredPageImg, VIRTUAL_WIDTH / 2 - tw / 2, 10, tw, th);
    }

    ctx.fillStyle = "#1C66A6";
    ctx.font = "bold 42px Trebuchet MS, Arial, system-ui";
    ctx.textAlign = "center";
    ctx.shadowColor = "rgba(0,0,0,0.3)";
    ctx.shadowBlur = 4;
    ctx.fillText("כל הכבוד! סיימתם בהצלחה", VIRTUAL_WIDTH / 2, 80);

    ctx.fillStyle = "#1C66A6";
    ctx.font = "bold 24px Trebuchet MS, Arial, system-ui";
    ctx.shadowBlur = 0;
    ctx.fillText(`הניקוד הסופי שלכם: ${score}`, VIRTUAL_WIDTH / 2, 130);

    ctx.fillStyle = "#1C66A6";
    ctx.font = "bold 24px Trebuchet MS, Arial, system-ui";
    ctx.fillText("מה למדנו? עקרנות הוק בלמידה מבוססת משחק", VIRTUAL_WIDTH / 2, 192);

    ctx.fillStyle = "#e8f5ff";
    ctx.font = "bold 18px Trebuchet MS, Arial, system-ui";
    ctx.fillText("גללו מטה לסיכום העיקרון", VIRTUAL_WIDTH / 2, VIRTUAL_HEIGHT - 65);

    if (arrowImg.naturalWidth > 0) {
        ctx.save();
        const arrowW = 40;
        const arrowH = arrowImg.naturalHeight * (arrowW / arrowImg.naturalWidth);
        ctx.drawImage(arrowImg, VIRTUAL_WIDTH / 2 - arrowW / 2 + 10, VIRTUAL_HEIGHT - 62, arrowW, arrowH);
        ctx.restore();
    } else {
        ctx.save();
        ctx.translate(VIRTUAL_WIDTH / 2, VIRTUAL_HEIGHT - 42);
        ctx.fillStyle = "#78aebf";
        ctx.beginPath();
        ctx.moveTo(0, 15);
        ctx.lineTo(-15, -3);
        ctx.lineTo(-7, -3);
        ctx.lineTo(-7, -21);
        ctx.lineTo(7, -21);
        ctx.lineTo(7, -3);
        ctx.lineTo(15, -3);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    ctx.restore();
}
