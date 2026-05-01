// renderer.js — All canvas drawing functions
// Pure rendering: receives ctx + state, draws, no side effects

import { VIRTUAL_WIDTH, VIRTUAL_HEIGHT } from './canvas.js';

/**
 * Draw the underwater gradient background.
 */
export function drawBackground(ctx) {
    const gradient = ctx.createLinearGradient(0, 0, 0, VIRTUAL_HEIGHT);
    gradient.addColorStop(0, "#4facfe");
    gradient.addColorStop(1, "#020024");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);
}

/**
 * Draw light rays from the surface.
 */
export function drawLightRays(ctx) {
    ctx.save();
    ctx.globalAlpha = 0.1;
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
    ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
    for (let b of bubbles) {
        b.y -= b.speed;
        b.x += Math.sin(b.y * 0.05) * 0.5;
        if (b.y < -10) {
            b.y = VIRTUAL_HEIGHT + 10;
            b.x = Math.random() * VIRTUAL_WIDTH;
        }
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

/**
 * Draw a treasure chest at (0,0) in local coordinates.
 * Used by both level 1/2 items and the mini-chest inside level 3 text boxes.
 */
export function drawChest(ctx, scale = 1) {
    ctx.save();
    ctx.scale(scale, scale);

    // Chest body
    ctx.fillStyle = "#8B4513";
    ctx.fillRect(-15, -10, 30, 20);

    // Wood panels
    ctx.strokeStyle = "#5C4033";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-15, -3); ctx.lineTo(15, -3); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-15, 4); ctx.lineTo(15, 4); ctx.stroke();

    // Chest lid
    ctx.fillStyle = "#A0522D";
    ctx.beginPath(); ctx.arc(0, -10, 15, Math.PI, 0); ctx.fill();

    // Gold trims
    ctx.fillStyle = "#DAA520";
    ctx.fillRect(-15, -10, 30, 3);  // Lid edge
    ctx.fillRect(-12, -24, 4, 34);  // Left strap
    ctx.fillRect(8, -24, 4, 34);    // Right strap
    ctx.fillRect(-15, 8, 30, 2);    // Bottom edge

    // Lock
    ctx.fillStyle = "#DAA520";
    ctx.beginPath(); ctx.arc(0, -7, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#333";
    ctx.fillRect(-1, -7, 2, 4);

    ctx.restore();
}

/**
 * Draw a bomb at (0,0) in local coordinates.
 */
export function drawBomb(ctx, radius, frameCount) {
    // Bomb body
    ctx.fillStyle = "#111";
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
        ctx.fillStyle = "#ffaa00";
        ctx.beginPath(); ctx.arc(5, -radius - 20, 3, 0, Math.PI * 2); ctx.fill();
    }
}

/**
 * Draw a text box item (level 3) at (0,0) in local coordinates.
 */
export function drawTextBox(ctx, item, frameCount) {
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#DAA520";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(-item.width / 2, -item.height / 2, item.width, item.height, 8);
    ctx.fill();
    ctx.stroke();

    // Top loop decoration
    ctx.fillStyle = "#DAA520";
    ctx.beginPath(); ctx.arc(0, -item.height / 2, 6, 0, Math.PI, true); ctx.fill();

    // Mini chest in bottom-right corner
    ctx.save();
    ctx.translate(item.width / 2, item.height / 2);
    drawChest(ctx, 0.3);
    ctx.restore();

    // Text
    ctx.fillStyle = "#333";
    ctx.font = "bold 14px system-ui";
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
        // Skip exploded bombs and non-collected items during final showcase
        if (item.caught && item !== caughtItem && item.type === 'bomb') continue;
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
export function drawBoat(ctx) {
    const cx = VIRTUAL_WIDTH / 2;
    ctx.fillStyle = "#8B4513";
    ctx.beginPath();
    ctx.moveTo(cx - 60, 20);
    ctx.lineTo(cx + 60, 20);
    ctx.lineTo(cx + 40, 50);
    ctx.lineTo(cx - 40, 50);
    ctx.fill();
}

/**
 * Draw the fishing line and hook.
 */
export function drawHook(ctx, hookOrigin, hookAngle, hookLength) {
    const endX = hookOrigin.x + Math.sin(hookAngle) * hookLength;
    const endY = hookOrigin.y + Math.cos(hookAngle) * hookLength;

    // Fishing line
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(hookOrigin.x, hookOrigin.y);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    // Hook (arc at bottom of line)
    ctx.strokeStyle = "#666";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(endX, endY + 10, 10, Math.PI, 0, true);
    ctx.stroke();
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
        ctx.font = "bold 36px system-ui";
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
    ctx.fillStyle = "#FFD700";
    ctx.font = "bold 48px system-ui";
    ctx.textAlign = "center";
    ctx.shadowColor = "rgba(0,0,0,0.5)";
    ctx.shadowBlur = 10;
    ctx.fillText("כל הכבוד! סיימתם בהצלחה", VIRTUAL_WIDTH / 2, 90);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 24px system-ui";
    ctx.fillText(`הניקוד הסופי שלכם: ${score}`, VIRTUAL_WIDTH / 2, 140);
    ctx.restore();
}
